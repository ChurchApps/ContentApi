import { controller, httpGet, httpPost, interfaces, requestParam } from "inversify-express-utils";
import express from "express";
import { ContentBaseController } from "./ContentBaseController"
import { AwsHelper, FileHelper } from "../apiBase";
import { Environment } from "../helpers";

@controller("/gallery")
export class GalleryController extends ContentBaseController {

  @httpGet("/")
  public async getAll(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      // TODO: Restrict permissions
      const files = await FileHelper.list(au.churchId + "/gallery");
      return { images: files }
    });
  }

  @httpPost("/requestUpload")
  public async getUploadUrl(req: express.Request<{}, {}, { fileName: string }>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      const key = au.churchId + "/gallery/" + req.body.fileName;
      const result = (Environment.fileStore === "S3") ? await AwsHelper.S3PresignedUrl(key) : {};
      return result;
    });
  }

}
