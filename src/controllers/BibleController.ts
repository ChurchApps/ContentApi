import { controller, httpDelete, httpGet, httpPost, interfaces, requestParam } from "inversify-express-utils";
import express from "express";
import { ContentBaseController } from "./ContentBaseController"
import { ApiBibleHelper } from "../helpers/ApiBibleHelper";

@controller("/bibles")
export class BibleController extends ContentBaseController {

  /*
  @httpGet("/:id")
  public async get(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapperAnon(req, res, async () => {
      return await this.repositories.bible.load(id);
    });
  }*/

  @httpGet("/list")
  public async list(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      return await ApiBibleHelper.list();
    });
  }

  @httpGet("/test")
  public async test(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      return await ApiBibleHelper.passages("06125adad2d5898a-01","GEN.1");
    });
  }

  @httpGet("/:abbreviation/full")
  public async full(@requestParam("abbreviation") abbreviation: string,req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapperAnon(req, res, async () => {
      let bible = await this.repositories.bible.loadByAbbreviation(abbreviation);
      if (!bible) {
        await ApiBibleHelper.import(abbreviation);
        bible = await this.repositories.bible.loadByAbbreviation(abbreviation);
      }
      const result = JSON.parse(bible.content);
      return result;
    });
  }

  /*

  @httpGet("/:id")
  public async get(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      return await this.repositories.element.load(au.churchId, id);
    });
  }
*/


}
