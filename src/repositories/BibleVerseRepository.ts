import { injectable } from "inversify";
import { UniqueIdHelper } from "@churchapps/apihelper";
import { DB } from "@churchapps/apihelper";
import { BibleVerse } from "../models";

@injectable()
export class BibleVerseRepository {
  public saveAll(verses: BibleVerse[]) {
    const promises: Promise<BibleVerse>[] = [];
    verses.forEach((v) => {
      promises.push(this.save(v));
    });
    return Promise.all(promises);
  }

  public save(verse: BibleVerse) {
    return verse.id ? this.update(verse) : this.create(verse);
  }

  private async create(verse: BibleVerse) {
    verse.id = UniqueIdHelper.shortId();

    const sql = "INSERT INTO bibleVerses (id, translationKey, chapterKey, keyName, number) VALUES (?, ?, ?, ?, ?);";
    const params = [verse.id, verse.translationKey, verse.chapterKey, verse.keyName, verse.number];
    await DB.query(sql, params);
    return verse;
  }

  private async update(verse: BibleVerse) {
    const sql = "UPDATE bibleVerses SET translationKey=?, chapterKey=?, keyName=?, number=? WHERE id=?";
    const params = [verse.translationKey, verse.chapterKey, verse.keyName, verse.number, verse.id];
    await DB.query(sql, params);
    return verse;
  }

  public delete(id: string) {
    return DB.query("DELETE FROM bibleVerses WHERE id=?;", [id]);
  }

  public load(id: string) {
    return DB.queryOne("SELECT * FROM bibleVerses WHERE id=?;", [id]);
  }

  public loadAll(translationKey: string, chapterKey: string) {
    return DB.query("SELECT * FROM bibleVerses WHERE translationKey=? and chapterKey=? order by number;", [
      translationKey,
      chapterKey
    ]);
  }
}
