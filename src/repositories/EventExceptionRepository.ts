import { UniqueIdHelper } from "../apiBase"
import { DB } from "../apiBase/db"
import { EventException } from "../models";

export class EventExceptionRepository {
  public save(eventException: EventException) {
    return eventException.id ? this.update(eventException) : this.create(eventException);
  }

  private async create(eventException: EventException) {
    eventException.id = UniqueIdHelper.shortId();
    const sql = "INSERT INTO eventExceptions (id, churchId, eventId, exceptionDate, recurrenceDate) VALUES (?, ?, ?, ?, ?);";
    const params = [eventException.id, eventException.churchId, eventException.eventId, eventException.exceptionDate, eventException.recurrenceDate];
    await DB.query(sql, params);
    return eventException;
  }

  private async update(eventException: EventException) {
    const sql = "UPDATE eventExceptions SET eventId=?, exceptionDate=?, recurrenceDate=? WHERE id=? and churchId=?";
    const params = [eventException.eventId, eventException.exceptionDate, eventException.recurrenceDate, eventException.id, eventException.churchId];
    await DB.query(sql, params);
    return eventException;
  }
  
  public delete(churchId: string, id: string) {
    return DB.query("DELETE FROM eventExceptions WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public load(churchId: string, id: string) {
    return DB.queryOne("SELECT * FROM eventExceptions WHERE id=? AND churchId=?;", [id, churchId]);
  }

}