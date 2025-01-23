import { injectable } from "inversify";
import { UniqueIdHelper } from "@churchapps/apihelper"
import { DB } from "@churchapps/apihelper"
import { BibleChapter } from "../models";

@injectable()
export class BibleChapterRepository {

  public saveAll(chapters: BibleChapter[]) {
    const promises: Promise<BibleChapter>[] = [];
    chapters.forEach(b => { promises.push(this.save(b)); });
    return Promise.all(promises);
  }

  public save(chapter: BibleChapter) {
    return chapter.id ? this.update(chapter) : this.create(chapter);
  }

  private async create(chapter: BibleChapter) {
    chapter.id = UniqueIdHelper.shortId();

    const sql = "INSERT INTO bibleChapters (id, translationKey, bookKey, keyName, number) VALUES (?, ?, ?, ?, ?);";
    const params = [chapter.id, chapter.translationKey, chapter.bookKey, chapter.keyName, chapter.number];
    await DB.query(sql, params);
    return chapter;
  }

  private async update(chapter: BibleChapter) {
    const sql = "UPDATE bibleChapters SET translationKey=?, bookKey=?, keyName=?, number=? WHERE id=?";
    const params = [chapter.translationKey, chapter.bookKey, chapter.keyName, chapter.number, chapter.id];
    await DB.query(sql, params);
    return chapter;
  }

  public delete(id: string) {
    return DB.query("DELETE FROM bibleChapters WHERE id=?;", [id]);
  }

  public load(id: string) {
    return DB.queryOne("SELECT * FROM bibleChapters WHERE id=?;", [id]);
  }

  public loadAll(translationKey: string, bookKey: string) {
    return DB.query("SELECT * FROM bibleChapters WHERE translationKey=? and bookKey=? order by number;", [translationKey, bookKey]);
  }

}
