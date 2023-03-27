import { controller, httpPost, httpGet, interfaces, requestParam, httpDelete } from "inversify-express-utils";
import express from "express";
import { ContentBaseController } from "./ContentBaseController"
import { Section } from "../models"
import { Permissions } from "../helpers";

@controller("/sections")
export class SectionController extends ContentBaseController {

  @httpGet("/:id")
  public async get(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      return await this.repositories.section.load(au.churchId, id);
    });
  }

  @httpPost("/")
  public async save(req: express.Request<{}, {}, Section[]>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.content.edit)) return this.json({}, 401);
      else {
        const promises: Promise<Section>[] = [];
        req.body.forEach(section => {
          section.churchId = au.churchId;
          promises.push(this.repositories.section.save(section));
        });
        const result = await Promise.all(promises);
        if (req.body.length > 0) {
          if (req.body[0].blockId) await this.repositories.section.updateSortForBlock(req.body[0].churchId, req.body[0].blockId);
          else await this.repositories.section.updateSort(req.body[0].churchId, req.body[0].pageId, req.body[0].zone);
        }
        // result[0]["answers"] = JSON.parse(result[0].answersJSON || "{}")
        result.forEach(e => {
          try {
            e.answers = JSON.parse(e.answersJSON);
          }
          catch {
            e.answers = [];
          }
          if(!e.answers) e.answers = [];
        })
        return result;
      }
    });
  }

  @httpDelete("/:id")
  public async delete(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.content.edit)) return this.json({}, 401);
      else {
        const section = await this.repositories.section.load(au.churchId, id);
        await this.repositories.section.delete(au.churchId, id);
        if (section.blockId) await this.repositories.section.updateSortForBlock(section.churchId, section.blockId);
        else await this.repositories.section.updateSort(section.churchId, section.pageId, section.zone);
      }
    });
  }

}
