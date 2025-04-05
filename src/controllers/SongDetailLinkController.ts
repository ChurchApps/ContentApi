import { controller, httpGet, httpPost, interfaces, requestParam, } from "inversify-express-utils";
import express from "express";
import { ContentBaseController } from "./ContentBaseController";
import { SongDetailLink } from "../models";
import { MusicBrainzHelper } from "../helpers/MusicBrainzHelper";


@controller("/songDetailLinks")
export class SongDetailLinkController extends ContentBaseController {

  @httpGet("/:id")
  public async get(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      return await this.repositories.songDetailLink.load(id);
    });
  }


  @httpGet("/songDetail/:songDetailId")
  public async getForSongDetail(@requestParam("songDetailId") songDetailId: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      return await this.repositories.songDetailLink.loadForSongDetail(songDetailId);
    })
  }

  @httpPost("/")
  public async save(req: express.Request<{}, {}, SongDetailLink[]>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      const promises: Promise<SongDetailLink>[] = [];
      req.body.forEach(sd => {
        promises.push(this.repositories.songDetailLink.save(sd));
      });
      const result = await Promise.all(promises);

      if (result[0].service === "MusicBrainz") {
        console.log("APPENDING MUSIC BRAINS")
        const sd = await this.repositories.songDetail.load(result[0].songDetailId);
        if (sd) {
          await MusicBrainzHelper.appendDetailsById(sd, result[0].serviceKey);
          console.log(sd);
          await this.repositories.songDetail.save(sd);
        }
      }

      return result;
    });
  }

}