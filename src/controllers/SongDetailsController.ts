import { controller, httpGet, httpPost, interfaces, requestParam, } from "inversify-express-utils";
import express from "express";
import { ContentBaseController } from "./ContentBaseController";
import { Setting, SongDetail, SongDetailLink } from "../models";
import { PraiseChartsHelper } from "../helpers/PraiseChartsHelper";
import { MusicBrainzHelper } from "../helpers/MusicBrainzHelper";

@controller("/songDetails")
export class SongDetailsController extends ContentBaseController {

  @httpGet("/praiseCharts/hasAccount")
  public async hasPraiseChartsAccount(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      const { token, secret } = await PraiseChartsHelper.loadUserTokens(au);
      if (token) return { hasAccount: true };
      else return { hasAccount: false };
    })
  }

  @httpGet("/praiseCharts/search")
  public async search(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      const query = req.query.q as string;
      const results = await PraiseChartsHelper.search(query);
      return results;
    })
  }

  @httpGet("/praiseCharts/products/:id")
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

  /*
  @httpGet("/praiseCharts/library/:id")
  public async library(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      const { token, secret } = await PraiseChartsHelper.loadUserTokens(au);
      const result = await PraiseChartsHelper.loadSongFromLibrary(id, token, secret);
      return result;
    })
  }

  @httpGet("/praiseCharts/catalog/:id")
  public async catalog(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapperAnon(req, res, async () => {
      const result = await PraiseChartsHelper.loadSongFromCatalog(id);
      return result;
    })
  }*/

  @httpGet("/praiseCharts/arrangement/raw/:id")
  public async arrangement(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      const { token, secret } = await PraiseChartsHelper.loadUserTokens(au);
      const keys = (req.query.keys) ? req.query.keys.toString().split(",") : [];
      const result = await PraiseChartsHelper.loadArrangmentRaw(id, keys, token, secret);
      return result;
    })
  }


  @httpGet("/praiseCharts/download")
  public async download(req: express.Request<{}, {}, null>, res: express.Response) {
    const au = this.authUser();
    const settings: Setting[] = await this.repositories.setting.loadUser(au.churchId, au.id);
    const token = settings.find(s => s.keyName === "praiseChartsAccessToken")?.value;
    const secret = settings.find(s => s.keyName === "praiseChartsAccessTokenSecret")?.value;
    const fileBuffer = await PraiseChartsHelper.download(req.query.skus.toString().split(','), token, secret);

    let fileName = "praisecharts.pdf";
    const mimeType = "application/pdf";
    if (req.query.file_name) {
      fileName = req.query.file_name.toString();
    }

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(fileBuffer); // this safely sends the raw binary
  }

  @httpGet("/praiseCharts/authUrl")
  public async praiseChartsAuthUrl(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapperAnon(req, res, async () => {
      const returnUrl = req.query.returnUrl as string;
      const { oauthToken, oauthTokenSecret } = await PraiseChartsHelper.getRequestToken(returnUrl);
      const authUrl = PraiseChartsHelper.getAuthorizeUrl(oauthToken);
      return { authUrl, oauthToken, oauthTokenSecret };
    })
  }

  @httpGet("/praiseCharts/access")
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

  @httpGet("/praiseCharts/library")
  public async praiseChartsCatalog(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {

      const settings: Setting[] = await this.repositories.setting.loadUser(au.churchId, au.id);
      const token = settings.find(s => s.keyName === "praiseChartsAccessToken")?.value;
      const secret = settings.find(s => s.keyName === "praiseChartsAccessTokenSecret")?.value;

      const result = await PraiseChartsHelper.searchLibraryAuth("", token, secret);

      return result;
    })
  }

  @httpGet("/:id")
  public async get(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      return await this.repositories.songDetail.load(id);
    });
  }


  @httpGet("/")
  public async getAll(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      return await this.repositories.songDetail.loadForChurch(au.churchId);
    })
  }

  @httpPost("/create")
  public async post(req: express.Request<{}, {}, SongDetail>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      const sd = req.body;
      if (!sd.praiseChartsId) return null;
      const existing = await this.repositories.songDetail.loadByPraiseChartsId(sd.praiseChartsId);
      if (existing) return existing;
      else {
        const { songDetails, links } = await PraiseChartsHelper.load(sd.praiseChartsId);
        await MusicBrainzHelper.appendDetails(songDetails, links);


        const result = await this.repositories.songDetail.save(songDetails);
        links.forEach(async link => {
          link.songDetailId = result.id;
          await this.repositories.songDetailLink.save(link);
        });
        return result;
      }
    })
  }

  @httpPost("/")
  public async save(req: express.Request<{}, {}, SongDetail[]>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      const promises: Promise<SongDetail>[] = [];
      req.body.forEach(sd => {
        promises.push(this.repositories.songDetail.save(sd));
      });
      const result = await Promise.all(promises);
      return result;
    });
  }

}