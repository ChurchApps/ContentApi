import { injectable } from "inversify";
import { UniqueIdHelper } from "../apiBase"
import { DB } from "../apiBase/db"
import { CuratedEvent } from "../models";

@injectable()
export class CuratedEventRepository {

  public save(curatedEvent: CuratedEvent) {
    return curatedEvent.id ? this.update(curatedEvent) : this.create(curatedEvent);
  }

  private async create(curatedEvent: CuratedEvent) {
    curatedEvent.id = UniqueIdHelper.shortId();

    const sql = "INSERT INTO curatedEvents (id, churchId, curatedCalendarId, groupId, eventId) VALUES (?, ?, ?, ?, ?);";
    const params = [curatedEvent.id, curatedEvent.churchId, curatedEvent.curatedCalendarId, curatedEvent.groupId, curatedEvent.eventId];
    await DB.query(sql, params);
    return curatedEvent;
  }

  private async update(curatedEvent: CuratedEvent) {
    const sql = "UPDATE curatedEvents SET curatedCalendarId=?, groupId=?, eventId=? WHERE id=? and churchId=?";
    const params = [curatedEvent.curatedCalendarId, curatedEvent.groupId, curatedEvent.eventId, curatedEvent.id, curatedEvent.churchId];
    await DB.query(sql, params);
    return curatedEvent;
  }

  public delete(churchId: string, id: string) {
    return DB.query("DELETE FROM curatedEvents WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public load(churchId: string, id: string) {
    return DB.queryOne("SELECT * FROM curatedEvents WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public loadAll(churchId: string) {
    return DB.query("SELECT * FROM curatedEvents WHERE churchId=?;", [churchId]);
  }

}
