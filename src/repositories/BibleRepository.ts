import { injectable } from "inversify";
import { UniqueIdHelper } from "@churchapps/apihelper"
import { DB } from "@churchapps/apihelper"
import { Bible } from "../models";

@injectable()
export class BibleRepository {

  public save(bible: Bible) {
    return bible.id ? this.update(bible) : this.create(bible);
  }

  private async create(bible: Bible) {
    bible.id = UniqueIdHelper.shortId();

    const sql = "INSERT INTO bibles (id, source, sourceKey, name, abbreviation, content) VALUES (?, ?, ?, ?, ?, ?);";
    const params = [bible.id, bible.source, bible.sourceKey, bible.name, bible.abbreviation, bible.content];
    await DB.query(sql, params);
    return bible;
  }

  private async update(bible: Bible) {
    const sql = "UPDATE bibles SET source=?, sourceKey=?, name=?, abbreviation=?, content=? WHERE id=?";
    const params = [bible.source, bible.sourceKey, bible.name, bible.abbreviation, bible.content, bible.id];
    await DB.query(sql, params);
    return bible;
  }

  public delete(id: string) {
    return DB.query("DELETE FROM bibles WHERE id=?;", [id]);
  }

  public load(id: string) {
    return DB.queryOne("SELECT * FROM bibles WHERE id=?;", [id]);
  }

  public loadBySource(source: string, sourceKey: string) {
    return DB.queryOne("SELECT * FROM bibles WHERE source=? and sourceKey=?;", [source, sourceKey]);
  }

  public loadByAbbreviation(abbreviation: string) {
    return DB.queryOne("SELECT * FROM bibles WHERE abbreviation=?;", [abbreviation]);
  }

  public loadAll() {
    return DB.query("SELECT * FROM bibles order by name;", []);
  }

}
