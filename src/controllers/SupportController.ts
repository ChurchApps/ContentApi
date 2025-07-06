import { controller, httpPost } from "inversify-express-utils";
import express from "express";
import { ContentBaseController } from "./ContentBaseController";
import { PollyHelper } from "../helpers/PollyHelper";

@controller("/support")
export class SupportController extends ContentBaseController {
  @httpPost("/createAudio")
  public async post(req: express.Request<{}, {}, { ssml: string }>, res: express.Response): Promise<any> {
    return this.actionWrapperAnon(req, res, async () => {
      // const ssml = "<speak><p>Hello World</p><mark name=\"test\" /><p>Goodbye<mark name=\"test2\" /></p></speak>";
      const ssml = req.body.ssml;
      const data = await PollyHelper.SsmlToMp3(ssml);
      return data;
    });
  }
}
