import { injectable } from "inversify";
import { UniqueIdHelper } from "@churchapps/apihelper"
import { DB } from "@churchapps/apihelper"
import { BibleBook } from "../models";

@injectable()
export class BibleBookRepository {

  public saveAll(books: BibleBook[]) {
    const promises: Promise<BibleBook>[] = [];
    books.forEach(b => { promises.push(this.save(b)); });
    return Promise.all(promises);
  }

  public save(book: BibleBook) {
    return book.id ? this.update(book) : this.create(book);
  }

  private async create(book: BibleBook) {
    book.id = UniqueIdHelper.shortId();

    const sql = "INSERT INTO bibleBooks (id, translationKey, keyName, abbreviation, name, sort) VALUES (?, ?, ?, ?, ?, ?);";
    const params = [book.id, book.translationKey, book.keyName, book.abbreviation, book.name, book.sort];
    console.log(sql, params);
    await DB.query(sql, params);
    return book;
  }

  private async update(book: BibleBook) {
    const sql = "UPDATE bibleBooks SET translationKey=?, keyName=?, abbreviation=?, name=?, sort=? WHERE id=?";
    const params = [book.translationKey, book.keyName, book.abbreviation, book.name, book.sort, book.id];
    console.log(sql, params);
    await DB.query(sql, params);
    return book;
  }

  public delete(id: string) {
    return DB.query("DELETE FROM bibleBooks WHERE id=?;", [id]);
  }

  public load(id: string) {
    return DB.queryOne("SELECT * FROM bibleBooks WHERE id=?;", [id]);
  }

  public loadAll(translationKey: string) {
    return DB.query("SELECT * FROM bibleBooks WHERE translationKey=? order by sort;", [translationKey]);
  }

}
