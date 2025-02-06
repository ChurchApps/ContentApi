import { controller, httpGet, httpPost, interfaces, requestParam, } from "inversify-express-utils";
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
      if (!sd.musicBrainzId) return null;
      const existing = await this.repositories.songDetail.loadByMusicBrainzId(sd.musicBrainzId);
      if (existing) return existing;
      else return await this.repositories.songDetail.save(sd);
    })
  }

}