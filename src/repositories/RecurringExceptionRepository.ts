import { UniqueIdHelper } from "../apiBase"
import { DB } from "../apiBase/db"
import { RecurringException } from "../models";

export class RecurringExceptionRepository {
  public save(recurringException: RecurringException) {
    return recurringException.id ? this.update(recurringException) : this.create(recurringException);
  }

  private async create(recurringException: RecurringException) {
    recurringException.id = UniqueIdHelper.shortId();
    const sql = "INSERT INTO recurringExceptions (id, churchId, recurringEventId, eventId, originalDate, newDate) VALUES (?, ?, ?, ?, ?, ?);";
    const params = [recurringException.id, recurringException.churchId, recurringException.recurringEventId, recurringException.eventId, recurringException.originalDate, recurringException.newDate];
    await DB.query(sql, params);
    return recurringException;
  }

  private async update(recurringException: RecurringException) {
    const sql = "UPDATE recurringExceptions SET recurringEventId=?, eventId=?, originalDate=?, newDate=? WHERE id=? and churchId=?";
    const params = [recurringException.recurringEventId, recurringException.eventId, recurringException.originalDate, recurringException.newDate, recurringException.id, recurringException.churchId];
    await DB.query(sql, params);
    return recurringException;
  }
  
  public delete(churchId: string, id: string) {
    return DB.query("DELETE FROM recurringExceptions WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public load(churchId: string, id: string) {
    return DB.queryOne("SELECT * FROM recurringExceptions WHERE id=? AND churchId=?;", [id, churchId]);
  }

}