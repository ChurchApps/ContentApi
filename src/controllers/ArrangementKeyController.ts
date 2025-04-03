import { controller, httpPost, httpGet, interfaces, requestParam, httpDelete } from "inversify-express-utils";
import express from "express";
import { ArrangementKey } from "../models";
import { ContentBaseController } from "./ContentBaseController";
import { Permissions } from "../helpers";



@controller("/arrangementKeys")
export class ArrangementKeyController extends ContentBaseController {

  @httpGet("/:id")
  public async get(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      return await this.repositories.arrangementKey.load(au.churchId, id);
    });
  }

  @httpGet("/arrangement/:arrangementId")
  public async getBySong(@requestParam("arrangementId") arrangementId: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.content.edit)) return this.json({}, 401);
      else {
        return await this.repositories.arrangementKey.loadByArrangementId(au.churchId, arrangementId);
      }
    })
  }

  @httpGet("/")
  public async getAll(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.content.edit)) return this.json({}, 401);
      else {
        return await this.repositories.arrangementKey.loadAll(au.churchId);
      }
    })
  }

  @httpPost("/")
  public async post(req: express.Request<{}, {}, ArrangementKey[]>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.content.edit)) return this.json({}, 401);
      else {
        const promises: Promise<ArrangementKey>[] = []
        req.body.forEach(arrangementKey => {
          arrangementKey.churchId = au.churchId;
          promises.push(this.repositories.arrangementKey.save(arrangementKey));
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
        await this.repositories.arrangementKey.delete(au.churchId, id);
        return this.json({});
      }
    });
  }


}