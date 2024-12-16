import { injectable } from "inversify";
import { UniqueIdHelper } from "@churchapps/apihelper"
import { DB } from "@churchapps/apihelper"
import { BibleVerse } from "../models";

@injectable()
export class BibleVerseRepository {

  public save(verse: BibleVerse) {
    return verse.id ? this.update(verse) : this.create(verse);
  }

  private async create(verse: BibleVerse) {
    verse.id = UniqueIdHelper.shortId();

    const sql = "INSERT INTO bibleVerses (id, translation, book, chapter, verse, content, newParagraph) VALUES (?, ?, ?, ?, ?, ?, ?);";
    const params = [verse.id, verse.translation, verse.book, verse.chapter, verse.verse, verse.content, verse.newParagraph];
    await DB.query(sql, params);
    return verse;
  }

  private async update(verse: BibleVerse) {
    const sql = "UPDATE bibleVerses SET translation=?, book=?, chapter=?, verse=?, content=?, newParagraph=? WHERE id=?";
    const params = [verse.translation, verse.book, verse.chapter, verse.verse, verse.content, verse.newParagraph, verse.id];
    await DB.query(sql, params);
    return verse;
  }

  public delete(id: string) {
    return DB.query("DELETE FROM bibleVerses WHERE id=?;", [id]);
  }

  public load(id: string) {
    return DB.queryOne("SELECT * FROM bibleVerses WHERE id=?;", [id]);
  }

  public loadAll() {
    return DB.query("SELECT * FROM bibleVerses order by name;", []);
  }

}
