import { controller, httpPost, httpGet, httpDelete, requestParam } from "inversify-express-utils";
import express from "express";
import { StreamingService } from "../models";
import { ContentBaseController } from "./ContentBaseController";
import { Permissions } from "../helpers/Permissions";
import { EncryptionHelper, DateHelper } from "@churchapps/apihelper";

@controller("/streamingServices")
export class StreamingServiceController extends ContentBaseController {

  @httpGet("/:id/hostChat")
  public async getHostChatRoom(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      let room = "";
      if (au.checkAccess(Permissions.chat.host)) room = EncryptionHelper.encrypt(id);
      return { room };
    });
  }

  @httpGet("/")
  public async loadAll(req: express.Request, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      const services = await this.repositories.streamingService.loadAll(au.churchId);
      const promises: Promise<any>[] = []
      services.forEach((s:StreamingService, index:number, allServices:StreamingService[]) => {
        // Update service time
        if (s.serviceTime < DateHelper.subtractHoursFromNow(6)) {
          if (!s.recurring) {
            promises.push(this.repositories.streamingService.delete(s.id, s.churchId));
            allServices.splice(index, 1)
          } else {
            s.serviceTime.setDate(s.serviceTime.getDate() + 7);
            promises.push(this.repositories.streamingService.save(s));
          }
        }
        s.serviceTime.setMinutes(s.serviceTime.getMinutes() - s.timezoneOffset);
      })
      await Promise.all(promises);

      return services;
    });
  }

  @httpDelete("/:id")
  public async delete(@requestParam("id") id: string, req: express.Request, res: express.Response): Promise<void> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.streamingServices.edit)) return this.json({}, 401);
      else {
        await this.repositories.streamingService.delete(id, au.churchId);
        return null;
      }
    });
  }

  @httpPost("/")
  public async save(req: express.Request<{}, {}, StreamingService[]>, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.streamingServices.edit)) return this.json({}, 401);
      else {
        let services: StreamingService[] = req.body;
        const promises: Promise<StreamingService>[] = [];
        services.forEach((service) => { if (service.churchId === au.churchId) promises.push(this.repositories.streamingService.save(service)); });
        services = await Promise.all(promises);
        return this.json(services, 200);
      }
    });
  }

}
