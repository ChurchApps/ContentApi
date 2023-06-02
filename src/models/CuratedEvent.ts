import { Event } from "./Event";

export class CuratedEvent {
  public id?: string;
  public churchId?: string;
  public curatedCalendarId?: string;
  public groupId?: string;
  public eventId?: string;

  public eventData?: Event;
  public eventIds?: string[];
}