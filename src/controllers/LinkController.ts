import { controller, httpPost, httpGet, httpDelete, requestParam } from "inversify-express-utils";
import express from "express";
import { Permissions } from "../helpers";
import { ContentBaseController } from "./ContentBaseController";
import { Link } from "../models";

@controller("/links")
export class LinkController extends ContentBaseController {

  // Anonymous access
  @httpGet("/church/:churchId")
  public async loadAnon(@requestParam("churchId") churchId: string, req: express.Request, res: express.Response): Promise<any> {
    return this.actionWrapperAnon(req, res, async () => {
      const category = req.query.category.toString();
      if (category === undefined) return await this.repositories.link.loadAll(churchId);
      else return await this.repositories.link.loadByCategory(churchId, category);
    });
  }


  @httpGet("/")
  public async loadAll(req: express.Request, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      const category = req.query.category.toString();
      let data;
      if (category === undefined) {
        data = await this.repositories.link.loadAll(au.churchId);
      } else {
        data = await this.repositories.link.loadByCategory(au.churchId, category);
      }

      const results = this.repositories.link.convertAllToModel(au.churchId, data);
      return results;
    });
  }

  @httpPost("/")
  public async save(req: express.Request<{}, {}, Link[]>, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.content.edit)) return this.json({}, 401);
      else {
        let links: Link[] = req.body;
        const promises: Promise<Link>[] = [];
        links.forEach((link) => {
          if (link.churchId === au.churchId) {
            promises.push(
              this.repositories.link.save(link).then(async (l) => {
                l.churchId = au.churchId;
                /*
                if (l.photo !== undefined && l.photo.startsWith("data:image/png;base64,")) {
                  await this.savePhoto(au.churchId, l)
                }*/
                return link;
              })
            );
          }
        });
        links = await Promise.all(promises);
        return this.json(links, 200);
      }
    });
  }

  @httpDelete("/:id")
  public async delete(@requestParam("id") id: string, req: express.Request, res: express.Response): Promise<void> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.links.edit)) return this.json({}, 401);
      else {
        await this.repositories.link.delete(id, au.churchId);
      }
    });
  }

  /*
  private async savePhoto(churchId: string, link: Link) {
    const base64 = link.photo.split(',')[1];
    const key = "/" + churchId + "/tabs/" + link.id + ".png";
    return FileHelper.store(key, "image/png", Buffer.from(base64, 'base64')).then(async () => {
      link.photo = EnvironmentBase.contentRoot + key + "?dt=" + new Date().getTime().toString();
      await this.baseRepositories.link.save(link);
    });
  }
  */
}