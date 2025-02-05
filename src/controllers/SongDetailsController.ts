import { controller, httpGet, httpPost, interfaces, } from "inversify-express-utils";
import express from "express";
import { ContentBaseController } from "./ContentBaseController";
import { MusicBrainzHelper } from "../helpers/MusicBrainzHelper";
import { SongDetail } from "../models";


@controller("/songDetails")
export class SongDetailsController extends ContentBaseController {

  @httpGet("/search")
  public async search(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      const query = req.query.q as string;
      const results = await MusicBrainzHelper.search(query);
      return results;
    })
  }

  @httpGet("/")
  public async get(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      return await this.repositories.songDetail.loadForChurch(au.churchId);
    })
  }

  @httpPost("/create")
  public async post(req: express.Request<{}, {}, SongDetail>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      const sd = req.body;
      if (!sd.musicBrainzId) return null;
      const existing = await this.repositories.songDetail.loadByMusicBrainzId(sd.musicBrainzId);
      if (existing) return existing;
      else return await this.repositories.songDetail.save(sd);
    })
  }

}