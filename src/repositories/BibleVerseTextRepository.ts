import { injectable } from "inversify";
import { UniqueIdHelper } from "@churchapps/apihelper"
import { DB } from "@churchapps/apihelper"
import { BibleVerseText } from "../models";

@injectable()
export class BibleVerseTextTextRepository {

  public saveAll(texts: BibleVerseText[]) {
    const promises: Promise<BibleVerseText>[] = [];
    texts.forEach(v => { promises.push(this.save(v)); });
    return Promise.all(promises);
  }

  public save(text: BibleVerseText) {
    return text.id ? this.update(text) : this.create(text);
  }

  private async create(text: BibleVerseText) {
    text.id = UniqueIdHelper.shortId();

    const sql = "INSERT INTO bibleVerseTexts (id, translationKey, verseKey, verseNumber, content, newParagraph) VALUES (?, ?, ?, ?, ?, ?);";
    const params = [text.id, text.translationKey, text.verseKey, text.verseNumber, text.content, text.newParagraph];
    await DB.query(sql, params);
    return text;
  }

  private async update(text: BibleVerseText) {
    const sql = "UPDATE bibleVerseTexts SET translationKey=?, verseKey=?, verseNumber=?, content=?, newParagraph=? WHERE id=?";
    const params = [text.translationKey, text.verseKey, text.verseNumber, text.content, text.newParagraph, text.id];
    await DB.query(sql, params);
    return text;
  }

  public delete(id: string) {
    return DB.query("DELETE FROM bibleVerseTexts WHERE id=?;", [id]);
  }

  public load(id: string) {
    return DB.queryOne("SELECT * FROM bibleVerseTexts WHERE id=?;", [id]);
  }

  public loadRange(translationKey: string, startVerseKey: string, endVerseKey: string) {
    return DB.query("SELECT * FROM bibleVerseTexts WHERE translationKey=? and verseKey BETWEEN ? AND ? order by verseNumber;", [translationKey, startVerseKey, endVerseKey]);
  }

}
