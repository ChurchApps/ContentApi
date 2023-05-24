import { controller, httpPost, httpGet, interfaces, requestParam, httpDelete } from "inversify-express-utils";
import express from "express";
import { ContentBaseController } from "./ContentBaseController"
import { CuratedEvent, Event } from "../models"
import { Permissions } from "../helpers";

@controller("/curatedEvents")
export class CuratedEventController extends ContentBaseController {

  @httpGet("/calendar/:curatedCalendarId")
  public async getForCuratedCalendar(@requestParam("curatedCalendarId") curatedCalendarId: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      const result = await this.repositories.curatedEvent.loadForCuratedCalendar(au.churchId, curatedCalendarId);
      return result;
    });
  }

  @httpGet("/calendar/:curatedCalendarId/events")
  public async getEventsForCuratedCalendar(@requestParam("curatedCalendarId") curatedCalendarId: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      let results: Event[] = [];
      const curatedEvents = await this.repositories.curatedEvent.loadForCuratedCalendar(au.churchId, curatedCalendarId);
      if (curatedEvents?.length > 0) {
        //If Curated Events are there for a specific Curated Calendar, then get the groupIds and eventIds - to find those events in Events table.
        const groupIds = curatedEvents.map((crtEv: CuratedEvent) => crtEv.groupId);
        const eventIds = curatedEvents.map((crtEv: CuratedEvent) => crtEv.eventId);
        if (groupIds?.length > 0 && eventIds?.length > 0) {
          const events = await this.repositories.event.loadPublicByIds(au.churchId, groupIds, eventIds);
          results = events;
        }
      }
      return results;
    });
  }

  @httpGet("/:id")
  public async get(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      return await this.repositories.curatedEvent.load(au.churchId, id);
    });
  }

  @httpGet("/")
  public async loadAll(req: express.Request, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      return await this.repositories.curatedEvent.loadAll(au.churchId);
    });
  }

  @httpPost("/")
  public async save(req: express.Request<{}, {}, CuratedEvent[]>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.content.edit)) return this.json({}, 401);
      else {
        const promises: Promise<CuratedEvent>[] = [];
        req.body.forEach(async curatedEvent => {
          curatedEvent.churchId = au.churchId;
          if (curatedEvent?.eventId) {
            //If eventId is there, it's already pointed to a group event - save it directly.
            promises.push(this.repositories.curatedEvent.save(curatedEvent));
          } else {
            //If eventId is not there, it means the whole group needs to be added to the curated calendar. All the group events will be added to the curated calendar.
            const groupEvents = await this.repositories.event.loadPublicForGroup(curatedEvent.churchId, curatedEvent.groupId);
            if (groupEvents?.length > 0) {
              //If events are there in a group, then save each event with it's ID in curated events.
              groupEvents.forEach((ev: Event) => {
                promises.push(this.repositories.curatedEvent.save({...curatedEvent, eventId: ev.id}));
              })
            } else {
              //If there are no events in a group, still allow them to add a group with eventId as NULL.
              promises.push(this.repositories.curatedEvent.save(curatedEvent));
            }
          }
        });
        const result = await Promise.all(promises);
        return result;
      }
    });
  }

  @httpDelete("/:id")
  public async delete(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.content.edit)) return this.json({}, 401);
      else {
        await this.repositories.curatedEvent.delete(au.churchId, id);
      }
    });
  }

}
