import { DateTimeHelper, UniqueIdHelper } from "../apiBase";
import { DB } from "../apiBase/db";
import { StreamingService } from "../models";

export class StreamingServiceRepository {

  public save(service: StreamingService) {
    return service.id ? this.update(service) : this.create(service);
  }

  private async create(service: StreamingService) {
    service.id = UniqueIdHelper.shortId();
    const serviceTime = DateTimeHelper.toMysqlDate(service.serviceTime);
    const sql = "INSERT INTO streamingServices (id, churchId, serviceTime, earlyStart, chatBefore, chatAfter, provider, providerKey, videoUrl, timezoneOffset, recurring, label, sermonId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    const params = [service.id, service.churchId, serviceTime, service.earlyStart, service.chatBefore, service.chatAfter, service.provider, service.providerKey, service.videoUrl, service.timezoneOffset, service.recurring, service.label, service.sermonId];
    await DB.query(sql, params);
    return service;
  }

  private async update(service: StreamingService) {
    const serviceTime = DateTimeHelper.toMysqlDate(service.serviceTime);
    const sql = "UPDATE streamingServices SET serviceTime=?, earlyStart=?, chatBefore=?, chatAfter=?, provider=?, providerKey=?, videoUrl=?, timezoneOffset=?, recurring=?, label=?, sermonId=? WHERE id=?;";
    const params = [serviceTime, service.earlyStart, service.chatBefore, service.chatAfter, service.provider, service.providerKey, service.videoUrl, service.timezoneOffset, service.recurring, service.label, service.sermonId, service.id];
    await DB.query(sql, params);
    return service;
  }

  public delete(id: string, churchId: string) {
    return DB.query("DELETE FROM streamingServices WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public loadById(id: string, churchId: string): Promise<StreamingService> {
    return DB.queryOne("SELECT * FROM streamingServices WHERE id=? AND churchId=?;", [id]);
  }

  public loadAll(churchId: string): Promise<StreamingService[]> {
    return DB.query("SELECT * FROM streamingServices WHERE churchId=? ORDER BY serviceTime;", [churchId]);
  }

}
