import { injectable } from "inversify";
import { UniqueIdHelper } from "@churchapps/apihelper"
import { DB } from "@churchapps/apihelper"
import { ArrangementKey } from "../models";

@injectable()
export class ArrangementKeyRepository {

  public saveAll(arrangementKeys: ArrangementKey[]) {
    const promises: Promise<ArrangementKey>[] = [];
    arrangementKeys.forEach(sd => { promises.push(this.save(sd)); });
    return Promise.all(promises);
  }

  public save(arrangementKey: ArrangementKey) {
    return arrangementKey.id ? this.update(arrangementKey) : this.create(arrangementKey);
  }

  private async create(arrangementKey: ArrangementKey) {
    arrangementKey.id = UniqueIdHelper.shortId();

    const sql = "INSERT INTO arrangementKeys (id, churchId, arrangementId, keySignature, shortDescription) VALUES (?, ?, ?, ?, ?);";
    const params = [arrangementKey.id, arrangementKey.churchId, arrangementKey.arrangementId, arrangementKey.keySignature, arrangementKey.shortDescription];
    await DB.query(sql, params);
    return arrangementKey;
  }

  private async update(arrangementKey: ArrangementKey) {
    const sql = "UPDATE arrangementKeys SET arrangementId=?, keySignature=?, shortDescription=? WHERE id=? and churchId=?";
    const params = [arrangementKey.arrangementId, arrangementKey.keySignature, arrangementKey.shortDescription, arrangementKey.id, arrangementKey.churchId];
    await DB.query(sql, params);
    return arrangementKey;
  }

  public delete(churchId: string, id: string) {
    return DB.query("DELETE FROM arrangementKeys WHERE id=? and churchId=?;", [id, churchId]);
  }

  public loadAll(churchId: string) {
    return DB.queryOne("SELECT * FROM arrangementKeys WHERE churchId=? ORDER BY name;", [churchId]);
  }

  public load(churchId: string, id: string) {
    return DB.queryOne("SELECT * FROM arrangementKeys WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public loadByArrangementId(churchId: string, arrangementId: string) {
    return DB.query("SELECT * FROM arrangementKeys where churchId=? and arrangementId=?;", [churchId, arrangementId]);
  }

}
