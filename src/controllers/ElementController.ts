import { controller, httpPost, httpGet, interfaces, requestParam, httpDelete } from "inversify-express-utils";
import express from "express";
import { ContentBaseController } from "./ContentBaseController"
import { Element } from "../models"
import { Permissions } from "../helpers";
import { ArrayHelper } from "../apiBase";
import { child } from "winston";

@controller("/elements")
export class ElementController extends ContentBaseController {

  @httpGet("/:id")
  public async get(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      return await this.repositories.element.load(au.churchId, id);
    });
  }

  @httpPost("/")
  public async save(req: express.Request<{}, {}, Element[]>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.content.edit)) return this.json({}, 401);
      else {
        const promises: Promise<Element>[] = [];
        req.body.forEach(element => {
          element.churchId = au.churchId;
          promises.push(this.repositories.element.save(element));
        });
        const result = await Promise.all(promises);
        if (req.body.length > 0) {
          if (req.body[0].blockId) await this.repositories.element.updateSortForBlock(req.body[0].churchId, req.body[0].blockId, req.body[0].parentId);
          else await this.repositories.element.updateSort(req.body[0].churchId, req.body[0].sectionId, req.body[0].parentId);
        }
        await this.checkRows(result);
        return result;
      }
    });
  }

  @httpDelete("/:id")
  public async delete(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.content.edit)) return this.json({}, 401);
      else {
        await this.repositories.element.delete(au.churchId, id);
      }
    });
  }

  private async checkRows(elements: Element[]) {
    for (const element of elements) {
      if (element.elementType === "row") {
        element.answers = JSON.parse(element.answersJSON);
        const cols: number[] = []
        element.answers.columns.split(',').forEach((c: string) => cols.push(parseInt(c, 0)));
        const allElements: Element[] = await this.repositories.element.loadForSection(element.churchId, element.sectionId);
        const children = ArrayHelper.getAll(allElements, "parentId", element.id);
        await this.checkRow(element, children, cols);
      }
    }
  }

  private async checkRow(row: Element, children: Element[], cols: number[]) {
    // Delete existing columns that should no longer exist
    if (children.length > cols.length) {
      for (let i = cols.length; i < children.length; i++) await this.repositories.element.delete(children[i].churchId, children[i].id);
    }

    // Update existing column sizes
    for (let i = 0; i < children.length && i < cols.length; i++) {
      children[i].answers = JSON.parse(children[i].answersJSON);
      if (children[i].answers.size !== cols[i] || children[i].sort !== i) {
        children[i].answers.size = cols[i];
        children[i].sort = i;
        children[i].answersJSON = JSON.stringify(children[i].answers);
        await this.repositories.element.save(children[i]);
      }
    }

    // Add new columns
    if (cols.length > children.length) {
      for (let i = children.length; i < cols.length; i++) {
        const answers = { size: cols[i] };
        const column: Element = { churchId: row.churchId, sectionId: row.sectionId, blockId: row.blockId, elementType: "column", sort: i, parentId: row.id, answersJSON: JSON.stringify(answers) };
        await this.repositories.element.save(column);
      }
    }
  }

}
