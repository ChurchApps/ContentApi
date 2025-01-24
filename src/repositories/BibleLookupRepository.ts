import { injectable } from "inversify";
import { UniqueIdHelper } from "@churchapps/apihelper"
import { DB } from "@churchapps/apihelper"
import { BibleLookup } from "../models";

@injectable()
export class BibleLookupRepository {

  public saveAll(lookups: BibleLookup[]) {
    const promises: Promise<BibleLookup>[] = [];
    lookups.forEach(b => { promises.push(this.save(b)); });
    return Promise.all(promises);
  }

  public save(lookup: BibleLookup) {
    return lookup.id ? this.update(lookup) : this.create(lookup);
  }

  private async create(lookup: BibleLookup) {
    lookup.id = UniqueIdHelper.shortId();

    const sql = "INSERT INTO bibleLookups (id, translationKey, lookupTime, ipAddress, startVerseKey, endVerseKey) VALUES (?, ?, now(), ?, ?, ?);";
    const params = [lookup.id, lookup.translationKey, lookup.ipAddress, lookup.startVerseKey, lookup.endVerseKey];
    await DB.query(sql, params);
    return lookup;
  }

  private async update(lookup: BibleLookup) {
    const sql = "UPDATE bibleLookups SET translationKey=?, lookupTime=?, ipAddress=?, startVerseKey=?, endVerseKey=? WHERE id=?";
    const params = [lookup.translationKey, lookup.lookupTime, lookup.ipAddress, lookup.startVerseKey, lookup.endVerseKey, lookup.id];
    await DB.query(sql, params);
    return lookup;
  }

  public delete(id: string) {
    return DB.query("DELETE FROM bibleLookups WHERE id=?;", [id]);
  }

  public load(id: string) {
    return DB.queryOne("SELECT * FROM bibleLookups WHERE id=?;", [id]);
  }


}
