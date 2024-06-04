import { controller, httpPost, httpGet, interfaces, requestParam, httpDelete } from "inversify-express-utils";
import express from "express";
import { ContentBaseController } from "./ContentBaseController"
import { Element, Page, Section } from "../models"
import { Permissions } from "../helpers";
import { TreeHelper } from "../helpers/TreeHelper";

@controller("/pages")
export class PageController2 extends ContentBaseController {

  @httpGet("/:churchId/tree")
  public async getTree(@requestParam("churchId") churchId: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapperAnon(req, res, async () => {
      let url = req.query.url as string;
      if (url && url[0] !== "/") {
        url = "/" + url;
      }
      const id = req.query.id as string;
      const page = (id)
        ? await this.repositories.page.load(churchId, id)
        : await this.repositories.page.loadByUrl(churchId, url);

      let result: Page = {};
      if (page?.id !== undefined) {
        const sections = await this.repositories.section.loadForPage(churchId, page.id);
        const allElements: Element[] = await this.repositories.element.loadForPage(churchId, page.id);
        TreeHelper.populateAnswers(allElements);
        TreeHelper.populateAnswers(sections);
        result = page;
        result.sections = TreeHelper.buildTree(sections, allElements);
        await TreeHelper.insertBlocks(result.sections, allElements, churchId);
        if (url) this.removeTreeFields(result);
      }
      return result;
    });
  }

  @httpGet("/:id")
  public async get(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      return await this.repositories.page.load(au.churchId, id);
    });
  }

  @httpGet("/")
  public async loadAll(req: express.Request, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      return await this.repositories.page.loadAll(au.churchId);
    });
  }

  @httpPost("/duplicate/:id")
  public async duplicate(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.content.edit)) return this.json({}, 401);
      else {
        const page = await this.repositories.page.load(au.churchId, id);
        page.id = undefined;
        page.name += " (copy)";
        page.url += "-copy";
        const newPage = await this.repositories.page.save(page);
        const sections:Section[] = await this.repositories.section.loadForPage(au.churchId, id);
        const allElements: Element[] = await this.repositories.element.loadForPage(au.churchId, id);

        TreeHelper.populateAnswers(allElements);
        TreeHelper.populateAnswers(sections);
        newPage.sections = TreeHelper.buildTree(sections, allElements);

        sections.forEach(s => {
          // s.id = undefined;
          s.pageId = newPage.id;
        });

        const promises: Promise<Section>[] = [];
        newPage.sections.forEach(s => {
          promises.push(TreeHelper.duplicateSection(s));
        });
        await Promise.all(promises);

        return newPage;
      }
    });
  }

  @httpPost("/")
  public async save(req: express.Request<{}, {}, Page[]>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.content.edit)) return this.json({}, 401);
      else {
        const promises: Promise<Page>[] = [];
        req.body.forEach(page => {
          page.churchId = au.churchId;
          promises.push(this.repositories.page.save(page));
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
        await this.repositories.page.delete(au.churchId, id);
      }
    });
  }

  private removeTreeFields(page: Page) {
    delete page.id;
    delete page.churchId;
    page.sections.forEach(s => {
      delete s.id;
      delete s.churchId;
      delete s.pageId;
      delete s.sort;
      s.elements?.forEach(e => {
        // delete e.id;
        delete e.churchId;
        delete e.sectionId;
        delete e.sort;
        delete e.answersJSON;
      })

    })
  }

}
