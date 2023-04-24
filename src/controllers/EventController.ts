import { controller, httpPost, httpGet, interfaces, requestParam, httpDelete } from "inversify-express-utils";
import express from "express";
import { ContentBaseController } from "./ContentBaseController"
import { Event, EventException } from "../models"
import { Permissions } from "../helpers";

@controller("/events")
export class EventController extends ContentBaseController {

  @httpGet("/group/:groupId")
  public async getForGroup(@requestParam("groupId") groupId: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      const result = await this.repositories.event.loadForGroup(au.churchId, groupId);
      await this.addExceptionDates(result);
      return result;
    });
  }

  @httpGet("/public/group/:churchId/:groupId")
  public async getPublicForGroup(@requestParam("churchId") churchId: string, @requestParam("groupId") groupId: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapperAnon(req, res, async () => {
      const result = await this.repositories.event.loadPublicForGroup(churchId, groupId);
      await this.addExceptionDates(result);
      return result;
    });
  }

  @httpGet("/:id")
  public async get(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      return await this.repositories.event.load(au.churchId, id);
    });
  }

  @httpPost("/")
  public async save(req: express.Request<{}, {}, Event[]>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      //if (!au.checkAccess(Permissions.content.edit)) return this.json({}, 401);
      //else {
        const promises: Promise<Event>[] = [];
        req.body.forEach(event => {
          event.churchId = au.churchId;
          promises.push(this.repositories.event.save(event));
        });
        const result = await Promise.all(promises);
        return result;
      //}
    });
  }

  @httpDelete("/:id")
  public async delete(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.content.edit)) return this.json({}, 401);
      else {
        await this.repositories.event.delete(au.churchId, id);
      }
    });
  }

  private async addExceptionDates(events: Event[]) {
    const promises: Promise<Event>[] = [];
    const eventIds = events.map(event => event.id);
    events.forEach(event => { event.exceptionDates=[]; });
    const result = await this.repositories.eventException.loadForEvents(events[0].churchId, eventIds);
    result.forEach((eventException:EventException) => {
      const event = events.find(event => event.id === eventException.eventId);
      if (event) event.exceptionDates.push(eventException.exceptionDate);
    });
  }

}
