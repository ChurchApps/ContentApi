import { UniqueIdHelper, DateHelper } from "@churchapps/apihelper"
import { DB } from "@churchapps/apihelper"
import { EventException } from "../models";

export class EventExceptionRepository {
  public save(eventException: EventException) {
    return eventException.id ? this.update(eventException) : this.create(eventException);
  }

  private async create(eventException: EventException) {
    eventException.id = UniqueIdHelper.shortId();
    const exceptionDate = DateHelper.toMysqlDate(eventException.exceptionDate);
    const sql = "INSERT INTO eventExceptions (id, churchId, eventId, exceptionDate) VALUES (?, ?, ?, ?);";
    const params = [eventException.id, eventException.churchId, eventException.eventId, exceptionDate];
    await DB.query(sql, params);
    return eventException;
  }

  private async update(eventException: EventException) {
    const exceptionDate = DateHelper.toMysqlDate(eventException.exceptionDate);
    const sql = "UPDATE eventExceptions SET eventId=?, exceptionDate=?, WHERE id=? and churchId=?";
    const params = [eventException.eventId, exceptionDate, eventException.id, eventException.churchId];
    await DB.query(sql, params);
    return eventException;
  }

  public delete(churchId: string, id: string) {
    return DB.query("DELETE FROM eventExceptions WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public load(churchId: string, id: string) {
    return DB.queryOne("SELECT * FROM eventExceptions WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public loadForEvents(churchId: string, eventIds: string[]) {
    return DB.query("SELECT * FROM eventExceptions WHERE churchId=? and eventId in (?);", [churchId, eventIds]);
  }

}