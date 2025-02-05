import { controller, httpPost, httpGet, interfaces } from "inversify-express-utils";
import express from "express";
import { Song } from "../models";
import { ContentBaseController } from "./ContentBaseController";
import { Permissions } from "../helpers";



@controller("/songs")
export class SongController extends ContentBaseController {

  @httpGet("/")
  public async get(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.content.edit)) return this.json({}, 401);
      else {
        return await this.repositories.song.loadAll(au.churchId);
      }
    })
  }

  @httpPost("/create")
  public async create(req: express.Request<{}, {}, Song>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      const song = req.body;
      song.churchId = au.churchId;
      if (!song.songDetailId) return null;
      const existing = await this.repositories.song.loadBySongDetailId(au.churchId, song.songDetailId);
      if (existing) return existing;
      else return await this.repositories.song.save(song);
    })
  }

  @httpPost("/")
  public async post(req: express.Request<{}, {}, Song[]>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.content.edit)) return this.json({}, 401);
      else {
        const promises: Promise<Song>[] = []
        req.body.forEach(song => {
          song.churchId = au.churchId;
          promises.push(this.repositories.song.save(song));
        })
        const result = await Promise.all(promises);
        return result;
      }
    })
  }


}