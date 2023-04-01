import { UniqueIdHelper } from "../apiBase"
import { DB } from "../apiBase/db"
import { RecurringEvent } from "../models";

export class RecurringEventRepository {
  public save(recurringEvent: RecurringEvent) {
    return recurringEvent.id ? this.update(recurringEvent) : this.create(recurringEvent);
  }

  private async create(recurringEvent: RecurringEvent) {
    recurringEvent.id = UniqueIdHelper.shortId();
    const sql = "INSERT INTO recurringEvents (id, churchId, groupId, start, rule) VALUES (?, ?, ?, ?, ?);";
    const params = [recurringEvent.id, recurringEvent.churchId, recurringEvent.groupId, recurringEvent.start, recurringEvent.rule];
    await DB.query(sql, params);
    return recurringEvent;
  }

  private async update(recurringEvent: RecurringEvent) {
    const sql = "UPDATE recurringEvents SET groupId=?, startDate=?, rule=? WHERE id=? and churchId=?";
    const params = [recurringEvent.groupId, recurringEvent.start, recurringEvent.rule, recurringEvent.id, recurringEvent.churchId];
    await DB.query(sql, params);
    return recurringEvent;
  }
  
  public delete(churchId: string, id: string) {
    return DB.query("DELETE FROM recurringEvents WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public load(churchId: string, id: string) {
    return DB.queryOne("SELECT * FROM recurringEvents WHERE id=? AND churchId=?;", [id, churchId]);
  }

}