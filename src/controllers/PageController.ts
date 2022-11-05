import { controller, httpPost, httpGet, interfaces, requestParam, httpDelete } from "inversify-express-utils";
import express from "express";
import { ContentBaseController } from "./ContentBaseController"
import { Element, Page, Section } from "../models"
import { ArrayHelper } from "../apiBase";


@controller("/pages")
export class PageController2 extends ContentBaseController {

  @httpGet("/:churchId/tree")
  public async getTree(@requestParam("churchId") churchId: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapperAnon(req, res, async () => {
      const url = req.query.url as string;
      const id = req.query.id as string;
      const page = (id)
        ? await this.repositories.page.load(churchId, id)
        : await this.repositories.page.loadByUrl(churchId, url);
      const sections = await this.repositories.section.loadForPage(churchId, page.id);
      const allElements: Element[] = await this.repositories.element.loadForPage(churchId, page.id);
      allElements.forEach(e => {
        try {
          e.answers = JSON.parse(e.answersJSON);
        }
        catch {
          e.answers = [];
        }
      })
      const result = this.buildTree(page, sections, allElements);
      if (url) this.removeTreeFields(result);
      return result;
    });
  }

  @httpGet("/:id")
  public async get(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      return await this.repositories.page.load(au.churchId, id);
    });
  }

  @httpPost("/")
  public async save(req: express.Request<{}, {}, Page[]>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      const promises: Promise<Page>[] = [];
      req.body.forEach(page => {
        page.churchId = au.churchId;
        promises.push(this.repositories.page.save(page));
      });
      const result = await Promise.all(promises);
      return result;
    });
  }

  @httpDelete("/:id")
  public async delete(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      await this.repositories.page.delete(au.churchId, id);
    });
  }

  private buildTree(page: Page, sections: Section[], allElements: Element[]) {
    page.sections = sections;
    page.sections.forEach(s => {
      s.elements = ArrayHelper.getAll(allElements, "sectionId", s.id);
    })
    return page;
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
        delete e.id;
        delete e.churchId;
        delete e.sectionId;
        delete e.sort;
        delete e.answersJSON;
      })

    })
  }

}
