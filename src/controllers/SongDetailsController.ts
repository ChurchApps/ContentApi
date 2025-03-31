import { controller, httpGet, httpPost, interfaces, requestParam, } from "inversify-express-utils";
import express from "express";
import { ContentBaseController } from "./ContentBaseController";
import { SongDetail, SongDetailLink } from "../models";
import { PraiseChartsHelper } from "../helpers/PraiseChartsHelper";
import { MusicBrainzHelper } from "../helpers/MusicBrainzHelper";

@controller("/songDetails")
export class SongDetailsController extends ContentBaseController {


  @httpGet("/search")
  public async search(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      const query = req.query.q as string;
      const results = await PraiseChartsHelper.search(query);
      return results;
    })
  }

  @httpGet("/praiseCharts/authUrl")
  public async praiseChartsAuthUrl(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapperAnon(req, res, async () => {
      const returnUrl = req.query.returnUrl as string;
      const { oauthToken, oauthTokenSecret } = await PraiseChartsHelper.getRequestToken(returnUrl);
      const authUrl = PraiseChartsHelper.getAuthorizeUrl(oauthToken);
      return { authUrl };
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