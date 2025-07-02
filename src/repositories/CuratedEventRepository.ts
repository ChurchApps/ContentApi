import { injectable } from "inversify";
import { UniqueIdHelper } from "@churchapps/apihelper";
import { DB } from "@churchapps/apihelper";
import { CuratedEvent } from "../models";

@injectable()
export class CuratedEventRepository {
  public save(curatedEvent: CuratedEvent) {
    return curatedEvent.id ? this.update(curatedEvent) : this.create(curatedEvent);
  }

  private async create(curatedEvent: CuratedEvent) {
    curatedEvent.id = UniqueIdHelper.shortId();

    const sql = "INSERT INTO curatedEvents (id, churchId, curatedCalendarId, groupId, eventId) VALUES (?, ?, ?, ?, ?);";
    const params = [
      curatedEvent.id,
      curatedEvent.churchId,
      curatedEvent.curatedCalendarId,
      curatedEvent.groupId,
      curatedEvent.eventId
    ];
    await DB.query(sql, params);
    return curatedEvent;
  }

  private async update(curatedEvent: CuratedEvent) {
    const sql = "UPDATE curatedEvents SET curatedCalendarId=?, groupId=?, eventId=? WHERE id=? and churchId=?";
    const params = [
      curatedEvent.curatedCalendarId,
      curatedEvent.groupId,
      curatedEvent.eventId,
      curatedEvent.id,
      curatedEvent.churchId
    ];
    await DB.query(sql, params);
    return curatedEvent;
  }

  public delete(churchId: string, id: string) {
    return DB.query("DELETE FROM curatedEvents WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public deleteByEventId(churchId: string, curatedCalendarId: string, eventId: string) {
    return DB.query("DELETE FROM curatedEvents WHERE curatedCalendarId=? AND eventId=? and churchId=?;", [
      curatedCalendarId,
      eventId,
      churchId
    ]);
  }

  public deleteByGroupId(churchId: string, curatedCalendarId: string, groupId: string) {
    return DB.query("DELETE FROM curatedEvents WHERE curatedCalendarId=? AND groupId=? and churchId=?;", [
      curatedCalendarId,
      groupId,
      churchId
    ]);
  }

  public load(churchId: string, id: string) {
    return DB.queryOne("SELECT * FROM curatedEvents WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public loadAll(churchId: string) {
    return DB.query("SELECT * FROM curatedEvents WHERE churchId=?;", [churchId]);
  }

  public loadByCuratedCalendarId(churchId: string, curatedCalendarId: string) {
    return DB.query("SELECT * FROM curatedEvents WHERE churchId=? AND curatedCalendarId=?;", [
      churchId,
      curatedCalendarId
    ]);
  }

  public loadForEvents(curatedCalendarId: string, churchId: string) {
    const sql =
      "SELECT * " +
      " FROM curatedEvents ce" +
      " INNER JOIN events e ON " +
      " (CASE" +
      " WHEN ce.eventId IS NULL THEN e.groupId=ce.groupId" +
      " ELSE e.id=ce.eventId" +
      " END)" +
      " where curatedCalendarId=? AND ce.churchId=? and e.visibility='public';";
    return DB.query(sql, [curatedCalendarId, churchId]);
  }
}
