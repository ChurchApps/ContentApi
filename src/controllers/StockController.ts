import { controller, httpGet, httpPost, interfaces, requestParam } from "inversify-express-utils";
import express from "express";
import { ContentBaseController } from "./ContentBaseController"
import Pexels from "pexels";

@controller("/stock")
export class StockController extends ContentBaseController {

  @httpPost("/search")
  public async getUploadUrl(req: express.Request<{}, {}, { term: string }>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapperAnon(req, res, async () => {
      const key = process.env.PEXELS_KEY;
      const client = Pexels.createClient(key);
      const response: Pexels.PhotosWithTotalResults = await client.photos.search({ query: req.body.term, per_page: 50 }) as Pexels.PhotosWithTotalResults;
      const result: any[] = [];
      response.photos.forEach(p => {
        result.push({
          description: p.alt,
          url: p.url,
          photographer: p.photographer,
          photographerUrl: p.photographer_url,
          large: p.src.large,
          thumbnail: p.src.small
        })
      })
      return result;
    });
  }

}
