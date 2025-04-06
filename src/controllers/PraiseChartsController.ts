import { controller, httpGet, interfaces, requestParam, } from "inversify-express-utils";
import express from "express";
import { ContentBaseController } from "./ContentBaseController";
import { Setting } from "../models";
import { PraiseChartsHelper } from "../helpers/PraiseChartsHelper";

@controller("/praiseCharts")
export class PraiseChartsController extends ContentBaseController {

  @httpGet("/raw/:id")
  public async raw(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      return PraiseChartsHelper.loadRaw(id);
    })
  }

  @httpGet("/hasAccount")
  public async hasPraiseChartsAccount(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      const { token, secret } = await PraiseChartsHelper.loadUserTokens(au);
      if (token) return { hasAccount: true };
      else return { hasAccount: false };
    })
  }

  @httpGet("/search")
  public async search(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      const query = req.query.q as string;
      const results = await PraiseChartsHelper.search(query);
      return results;
    })
  }

  @httpGet("/products/:id")
  public async products(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      const { token, secret } = await PraiseChartsHelper.loadUserTokens(au);
      const keys = (req.query.keys) ? req.query.keys.toString().split(",") : [];
      const data = (token)
        ? await PraiseChartsHelper.loadSongFromLibrary(id, keys, token, secret)
        : await PraiseChartsHelper.loadSongFromCatalog(id, keys);
      let products = [];
      if (data.in_library?.items?.length > 0) products = data.in_library?.items[0].products;
      else if (data.other_results?.items?.length > 0) products = data.other_results?.items[0].products;
      else if (data.arrangements?.items?.length > 0) products = data.arrangements.items[0].products;
      return products;
    })
  }

  @httpGet("/arrangement/raw/:id")
  public async arrangement(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      const { token, secret } = await PraiseChartsHelper.loadUserTokens(au);
      const keys = (req.query.keys) ? req.query.keys.toString().split(",") : [];
      const result = await PraiseChartsHelper.loadArrangmentRaw(id, keys, token, secret);
      return result;
    })
  }


  @httpGet("/download")
  public async download(req: express.Request<{}, {}, null>, res: express.Response) {
    const au = this.authUser();
    const settings: Setting[] = await this.repositories.setting.loadUser(au.churchId, au.id);
    const token = settings.find(s => s.keyName === "praiseChartsAccessToken")?.value;
    const secret = settings.find(s => s.keyName === "praiseChartsAccessTokenSecret")?.value;
    const fileBuffer: any = await PraiseChartsHelper.download(req.query.skus.toString().split(','), req.query.keys.toString().split(','), token, secret);

    let fileName = "praisecharts.pdf";
    let mimeType = "application/pdf";
    if (req.query.file_name) {
      fileName = req.query.file_name.toString();
    }
    const fileType = fileName.split('.')[1].toLowerCase();
    switch (fileType) {
      case "zip":
        mimeType = "application/zip";
        break;
    }
    console.log("Byte length", fileBuffer.length);


    // Detect if running under AWS Lambda by checking for specific env vars
    const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

    if (isLambda) {
      // Special handling for Lambda/API Gateway
      const base64Data = fileBuffer.toString('base64');

      // @ts-ignore
      res.lambda = {
        statusCode: 200,
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
        isBase64Encoded: true,
        body: base64Data,
      };
      res.end();
    } else {
      // Standard Express (local dev or traditional server)
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      res.send(fileBuffer); // send raw binary
    }


  }

  @httpGet("/authUrl")
  public async praiseChartsAuthUrl(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapperAnon(req, res, async () => {
      const returnUrl = req.query.returnUrl as string;
      const { oauthToken, oauthTokenSecret } = await PraiseChartsHelper.getRequestToken(returnUrl);
      let authUrl = PraiseChartsHelper.getAuthorizeUrl(oauthToken);
      authUrl += "&XID=churchapps";
      return { authUrl, oauthToken, oauthTokenSecret };
    })
  }

  @httpGet("/access")
  public async praiseChartsTest(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      const verifier = req.query.verifier as string;
      const token = req.query.token as string;
      const secret = req.query.secret as string;
      const result = await PraiseChartsHelper.getAccessToken(token, secret, verifier);

      const settings: Setting[] = [
        { keyName: "praiseChartsAccessToken", value: result.accessToken, userId: au.id, churchId: au.churchId },
        { keyName: "praiseChartsAccessTokenSecret", value: result.accessTokenSecret, userId: au.id, churchId: au.churchId }
      ];

      await this.repositories.setting.saveAll(settings);

      return result;
    })
  }

  @httpGet("/library")
  public async praiseChartsCatalog(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {

      const settings: Setting[] = await this.repositories.setting.loadUser(au.churchId, au.id);
      const token = settings.find(s => s.keyName === "praiseChartsAccessToken")?.value;
      const secret = settings.find(s => s.keyName === "praiseChartsAccessTokenSecret")?.value;

      const result = await PraiseChartsHelper.searchLibraryAuth("", token, secret);

      return result;
    })
  }

}