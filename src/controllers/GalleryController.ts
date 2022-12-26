import { controller, httpGet, httpPost, interfaces, requestParam } from "inversify-express-utils";
import express from "express";
import { ContentBaseController } from "./ContentBaseController"
import { AwsHelper, FileHelper } from "../apiBase";
import { Environment } from "../helpers";

@controller("/gallery")
export class GalleryController extends ContentBaseController {

  @httpGet("/:folder")
  public async getAll(@requestParam("folder") folder: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      // TODO: Restrict permissions
      const files = await FileHelper.list(au.churchId + "/gallery/" + folder);
      return { images: files }
    });
  }

  @httpPost("/requestUpload")
  public async getUploadUrl(req: express.Request<{}, {}, { folder: string, fileName: string }>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      const key = au.churchId + "/gallery/" + req.body.folder + req.body.fileName;
      const result = (Environment.fileStore === "S3") ? await AwsHelper.S3PresignedUrl(key) : {};
      return result;
    });
  }

}
