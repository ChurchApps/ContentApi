import { UniqueIdHelper } from "../apiBase"
import { DB } from "../apiBase/db"
import { Event } from "../models";

export class EventRepository {
  public save(event: Event) {
    return event.id ? this.update(event) : this.create(event);
  }

  private async create(event: Event) {
    event.id = UniqueIdHelper.shortId();
    const sql = "INSERT INTO events (id, churchId, groupId, allDay, start, end, title, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?);";
    const params = [event.id, event.churchId, event.groupId, event.allDay, event.start, event.end, event.title, event.description];
    await DB.query(sql, params);
    return event;
  }

  private async update(event: Event) {
    const sql = "UPDATE events SET groupId=?, allDay=?, start=?, end=?, title=?, description=? WHERE id=? and churchId=?";
    const params = [event.groupId, event.allDay, event.start, event.end, event.title, event.description, event.id, event.churchId];
    await DB.query(sql, params);
    return event;
  }
  
  public delete(churchId: string, id: string) {
    return DB.query("DELETE FROM events WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public load(churchId: string, id: string) {
    return DB.queryOne("SELECT * FROM events WHERE id=? AND churchId=?;", [id, churchId]);
  }

}