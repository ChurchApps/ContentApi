import { injectable } from "inversify";
import { UniqueIdHelper } from "@churchapps/apihelper"
import { DB } from "@churchapps/apihelper"
import { Arrangement } from "../models";

@injectable()
export class ArrangementRepository {

  public saveAll(arrangements: Arrangement[]) {
    const promises: Promise<Arrangement>[] = [];
    arrangements.forEach(sd => { promises.push(this.save(sd)); });
    return Promise.all(promises);
  }

  public save(arrangement: Arrangement) {
    return arrangement.id ? this.update(arrangement) : this.create(arrangement);
  }

  private async create(arrangement: Arrangement) {
    arrangement.id = UniqueIdHelper.shortId();

    const sql = "INSERT INTO arrangements (id, churchId, songId, songDetailId, name, lyrics) VALUES (?, ?, ?, ?, ?, ?);";
    const params = [arrangement.id, arrangement.churchId, arrangement.songId, arrangement.songDetailId, arrangement.name, arrangement.lyrics];
    await DB.query(sql, params);
    return arrangement;
  }

  private async update(arrangement: Arrangement) {
    const sql = "UPDATE arrangements SET songId=?, songDetailId=?, name=?, lyrics=? WHERE id=? and churchId=?";
    const params = [arrangement.songId, arrangement.songDetailId, arrangement.name, arrangement.lyrics, arrangement.id, arrangement.churchId];
    console.log(sql, params);
    await DB.query(sql, params);
    return arrangement;
  }

  public delete(churchId: string, id: string) {
    return DB.query("DELETE FROM arrangements WHERE id=? and churchId=?;", [id, churchId]);
  }

  public loadAll(churchId: string) {
    return DB.queryOne("SELECT * FROM arrangements WHERE churchId=? ORDER BY name;", [churchId]);
  }

  public load(churchId: string, id: string) {
    return DB.queryOne("SELECT * FROM arrangements WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public loadBySongId(churchId: string, songId: string) {
    return DB.query("SELECT * FROM arrangements where churchId=? and songId=?;", [churchId, songId]);
  }

  public loadBySongDetailId(churchId: string, songDetailId: string) {
    return DB.query("SELECT * FROM arrangements where churchId=? and songDetailId=?;", [churchId, songDetailId]);
  }

}
