import { controller, httpGet, interfaces, requestParam } from "inversify-express-utils";
import express from "express";
import { ContentBaseController } from "./ContentBaseController"
import { ApiBibleHelper } from "../helpers/ApiBibleHelper";
import { BibleVerseText } from "../models";

@controller("/bibles")
export class BibleController extends ContentBaseController {

  @httpGet("/:translationKey/books")
  public async getBooks(@requestParam("translationKey") translationKey: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapperAnon(req, res, async () => {
      let result = await this.repositories.bibleBook.loadAll(translationKey);
      if (result.length === 0) {
        result = await ApiBibleHelper.getBooks(translationKey);
        await this.repositories.bibleBook.saveAll(result);
      }
      return result;
    });
  }

  @httpGet("/:translationKey/:bookKey/chapters")
  public async getChapters(@requestParam("translationKey") translationKey: string, @requestParam("bookKey") bookKey: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapperAnon(req, res, async () => {
      let result = await this.repositories.bibleChapter.loadAll(translationKey, bookKey);
      if (result.length === 0) {
        result = await ApiBibleHelper.getChapters(translationKey, bookKey);
        await this.repositories.bibleChapter.saveAll(result);
      }
      return result;
    });
  }

  @httpGet("/:translationKey/chapters/:chapterKey/verses")
  public async getVerses(@requestParam("translationKey") translationKey: string, @requestParam("chapterKey") chapterKey: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapperAnon(req, res, async () => {
      let result = await this.repositories.bibleVerse.loadAll(translationKey, chapterKey);
      if (result.length === 0) {
        result = await ApiBibleHelper.getVerses(translationKey, chapterKey);
        await this.repositories.bibleVerse.saveAll(result);
      }
      return result;
    });
  }

  @httpGet("/:translationKey/verses/:startVerseKey-:endVerseKey")
  public async getVerseText(@requestParam("translationKey") translationKey: string, @requestParam("startVerseKey") startVerseKey: string, @requestParam("endVerseKey") endVerseKey: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapperAnon(req, res, async () => {
      const canCache = true;
      let result: BibleVerseText[] = [];
      if (canCache) result = await this.repositories.bibleVerseText.loadRange(translationKey, startVerseKey, endVerseKey);
      console.log(result.length)
      if (result.length === 0) {
        result = await ApiBibleHelper.getVerseText(translationKey, startVerseKey, endVerseKey);
        if (canCache) await this.repositories.bibleVerseText.saveAll(result);
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
