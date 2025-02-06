import { controller, httpPost, httpGet, interfaces, requestParam, httpDelete } from "inversify-express-utils";
import express from "express";
import { Arrangement } from "../models";
import { ContentBaseController } from "./ContentBaseController";
import { Permissions } from "../helpers";



@controller("/arrangements")
export class ArrangementController extends ContentBaseController {

  @httpGet("/:id")
  public async get(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      return await this.repositories.arrangement.load(au.churchId, id);
    });
  }

  @httpGet("/song/:songId")
  public async getBySong(@requestParam("songId") songId: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.content.edit)) return this.json({}, 401);
      else {
        return await this.repositories.arrangement.loadBySongId(au.churchId, songId);
      }
    })
  }

  @httpGet("/")
  public async getAll(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.content.edit)) return this.json({}, 401);
      else {
        return await this.repositories.arrangement.loadAll(au.churchId);
      }
    })
  }

  @httpPost("/")
  public async post(req: express.Request<{}, {}, Arrangement[]>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.content.edit)) return this.json({}, 401);
      else {
        const promises: Promise<Arrangement>[] = []
        req.body.forEach(arrangement => {
          arrangement.churchId = au.churchId;
          promises.push(this.repositories.arrangement.save(arrangement));
        })
        const result = await Promise.all(promises);
        return result;
      }
    })
  }

  @httpDelete("/:id")
  public async delete(@requestParam("id") id: string, req: express.Request, res: express.Response): Promise<void> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.content.edit)) return this.json({}, 401);
      else {
        await this.repositories.arrangement.delete(au.churchId, id);
        return this.json({});
      }
    });
  }


}