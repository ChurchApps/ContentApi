import { injectable } from "inversify";
import { UniqueIdHelper } from "@churchapps/apihelper"
import { DB } from "@churchapps/apihelper"
import { BibleBook } from "../models";

@injectable()
export class BibleBookRepository {

  public save(book: BibleBook) {
    return book.id ? this.update(book) : this.create(book);
  }

  private async create(book: BibleBook) {
    book.id = UniqueIdHelper.shortId();

    const sql = "INSERT INTO bibleBooks (id, keyName, name, sort) VALUES (?, ?, ?, ?);";
    const params = [book.id, book.keyName, book.name, book.sort];
    await DB.query(sql, params);
    return book;
  }

  private async update(book: BibleBook) {
    const sql = "UPDATE bibleBooks SET keyName=?, name=?, sort=? WHERE id=?";
    const params = [book.keyName, book.name, book.sort, book.id];
    await DB.query(sql, params);
    return book;
  }

  public delete(id: string) {
    return DB.query("DELETE FROM bibleBooks WHERE id=?;", [id]);
  }

  public load(id: string) {
    return DB.queryOne("SELECT * FROM bibleBooks WHERE id=?;", [id]);
  }

  public loadAll() {
    return DB.query("SELECT * FROM bibleBooks order by name;", []);
  }

}
