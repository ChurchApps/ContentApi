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
      const curatedEvents: CuratedEvent[] = await this.repositories.curatedEvent.loadByCuratedCalendarId(au.churchId, curatedCalendarId);
      if (req.query?.with === "eventData") {
        const promises: Promise<CuratedEvent>[] = [];
        curatedEvents?.forEach(c => {
          promises.push(this.repositories.event.load(au.churchId, c.eventId).then((eventData: Event) => {
            c.eventData = eventData;
            return c;
          }))
        })

        const result = await Promise.all(promises);
        return result;
      }

      return curatedEvents;
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
  public async save(req: express.Request<{}, {}, PostRequestBody[]>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.content.edit)) return this.json({}, 401);
      else {
        const promises: Promise<CuratedEvent | CuratedEvent[]>[] = [];
        req.body.forEach(curatedEvent => {
          curatedEvent.churchId = au.churchId;
          const saveFunction = async () => {
            if (curatedEvent?.eventIds) {
              //If eventIds are there, it means only specific group events are need to be added.
              const eventPromises: Promise<CuratedEvent>[] = [];
              curatedEvent.eventIds.forEach((id) => {
                eventPromises.push(this.repositories.curatedEvent.save({...curatedEvent, eventId: id}))
              });

              return await Promise.all(eventPromises);
            } else {
              // If eventId is not there, it means the whole group needs to be added to the curated calendar. All the group events will be added to the curated calendar.
              const groupEvents = await this.repositories.event.loadPublicForGroup(curatedEvent.churchId, curatedEvent.groupId);
              if (groupEvents?.length > 0) {
                //If events are there in a group, then save each event with it's ID in curated events.
                const eventPromises: Promise<CuratedEvent>[] = [];
                groupEvents.forEach((event: Event) => {
                  eventPromises.push(this.repositories.curatedEvent.save({...curatedEvent, eventId: event.id}))
                })

                return await Promise.all(eventPromises);
              } else {
                //If there are no events in a group, still allow them to add a group with eventId as NULL.
                return await this.repositories.curatedEvent.save(curatedEvent)
              }
            }
          }

          promises.push(saveFunction());
        })

        const result = await Promise.all(promises);
        return result.flat();
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

  @httpDelete("/calendar/:curatedCalendarId/event/:eventId")
  public async deleteByEventId(@requestParam("curatedCalendarId") curatedCalendarId: string, @requestParam("eventId") eventId: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async(au) => {
      if (!au.checkAccess(Permissions.content.edit)) return this.json({}, 401);
      else {
        await this.repositories.curatedEvent.deleteByEventId(au.churchId, curatedCalendarId, eventId);
      }
    })
  }
        
  @httpDelete("/calendar/:curatedCalendarId/group/:groupId")
  public async deleteByGroupId(@requestParam("curatedCalendarId") curatedCalendarId: string, @requestParam("groupId") groupId: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async(au) => {
      if (!au.checkAccess(Permissions.content.edit)) return this.json({}, 401);
      else {
        await this.repositories.curatedEvent.deleteByGroupId(au.churchId, curatedCalendarId, groupId);
      }
    })
  }

}

interface PostRequestBody extends CuratedEvent {
  eventIds?: string[];
}