import { controller, httpPost, httpGet, interfaces, requestParam, httpDelete } from "inversify-express-utils";
import express from "express";
import { ContentBaseController } from "./ContentBaseController"
import { Block, Element, Section } from "../models"
import { Permissions } from "../helpers";
import { ArrayHelper } from "../apiBase";

@controller("/blocks")
export class BlockController extends ContentBaseController {

  @httpGet("/:churchId/tree/:id")
  public async getTree(@requestParam("churchId") churchId: string, @requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapperAnon(req, res, async () => {
      const block = await this.repositories.block.load(churchId, id);
      let result = {};
      if (block?.id !== undefined) {
        const sections = await this.repositories.section.loadForBlock(churchId, block.id);
        const allElements: Element[] = await this.repositories.element.loadForBlock(churchId, block.id);
        allElements.forEach(e => {
          try {
            e.answers = JSON.parse(e.answersJSON);
          }
          catch {
            e.answers = [];
          }
        })
        result = this.buildTree(block, sections, allElements);
      }
      return result;
    });
  }

  @httpGet("/:id")
  public async get(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      return await this.repositories.block.load(au.churchId, id);
    });
  }


  @httpGet("/")
  public async loadAll(req: express.Request, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      return await this.repositories.block.loadAll(au.churchId);
    });
  }

  @httpPost("/")
  public async save(req: express.Request<{}, {}, Block[]>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.content.edit)) return this.json({}, 401);
      else {
        const promises: Promise<Block>[] = [];
        req.body.forEach(block => {
          block.churchId = au.churchId;
          promises.push(this.repositories.block.save(block));
        });
        const result = await Promise.all(promises);
        return result;
      }
    });
  }

  @httpDelete("/:id")
  public async delete(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.content.edit)) return this.json({}, 401);
      else {
        await this.repositories.block.delete(au.churchId, id);
      }
    });
  }

  // todo: move to shared helper functions
  private getChildElements(element: Element, allElements: Element[]) {
    const children = ArrayHelper.getAll(allElements, "parentId", element.id);
    if (children.length > 0) {
      element.elements = children;
      element.elements.forEach(e => { this.getChildElements(e, allElements); });
    }
  }

  private buildTree(block: Block, sections: Section[], allElements: Element[]) {
    block.sections = sections;
    block.sections.forEach(s => {
      s.elements = ArrayHelper.getAll(ArrayHelper.getAll(allElements, "sectionId", s.id), "parentId", null);
      s.elements.forEach(e => { this.getChildElements(e, allElements); });
    })
    return block;
  }


}
