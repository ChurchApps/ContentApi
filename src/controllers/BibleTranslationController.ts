import { controller, httpDelete, httpGet, httpPost, interfaces, requestParam } from "inversify-express-utils";
import express from "express";
import { ContentBaseController } from "./ContentBaseController"
import { ApiBibleHelper } from "../helpers/ApiBibleHelper";
import { BibleTranslation } from "../models";

@controller("/bibleTranslations")
export class BibleTranslationController extends ContentBaseController {

  @httpGet("/:translationKey/books")
  public async getBooks(@requestParam("translationKey") translationKey: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapperAnon(req, res, async () => {

      console.log("MADE IT")
      let result = await this.repositories.bibleBook.loadAll(translationKey);
      if (result.length === 0) {
        result = await ApiBibleHelper.getBooks(translationKey);
        await this.repositories.bibleBook.saveAll(result);
      }
      return result;
    });
  }

  @httpGet("/")
  public async getAll(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapperAnon(req, res, async () => {
      let result = await this.repositories.bibleTranslation.loadAll();
      if (result.length === 0) {
        result = await ApiBibleHelper.getTranslations();
        await this.repositories.bibleTranslation.saveAll(result);
      }
      return result;
    });
  }




  /*Start Old Code*/

  /*
  @httpGet("/:id")
  public async get(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapperAnon(req, res, async () => {
      return await this.repositories.bible.load(id);
    });
  }*/
  /*
    @httpGet("/list")
    public async list(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
      return this.actionWrapper(req, res, async (au) => {
        return await ApiBibleHelper.list();
      });
    }



    @httpGet("/test")
    public async test(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
      return this.actionWrapper(req, res, async (au) => {
        return await ApiBibleHelper.passages("06125adad2d5898a-01", "GEN.1");
      });
    }

    @httpGet("/import/next")
    public async importNext(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
      return this.actionWrapperAnon(req, res, async () => {
        const apiList = await ApiBibleHelper.list();
        const translations = await this.repositories.bibleTranslation.loadAll();
        let abbreviation = "";
        for (const api of apiList) {
          let found = false;
          for (const translation of translations) {
            if (api.abbreviation === translation.abbreviation) {
              found = true;
              break;
            }
          }
          if (!found) {
            abbreviation = api.abbreviation;
            break;
          }
        }
        await ApiBibleHelper.import(abbreviation);
        return { status: "done" };
      });
    }

    @httpGet("/import/:abbreviation")
    public async full(@requestParam("abbreviation") abbreviation: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
      return this.actionWrapperAnon(req, res, async () => {
        await ApiBibleHelper.import(abbreviation);

        return { status: "done" };
      });
    }
    */

  /*

  @httpGet("/:id")
  public async get(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      return await this.repositories.element.load(au.churchId, id);
    });
  }
*/


}
