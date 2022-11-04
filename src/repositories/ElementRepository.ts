import { injectable } from "inversify";
import { UniqueIdHelper } from "../apiBase"
import { DB } from "../apiBase/db"
import { Element } from "../models";

@injectable()
export class ElementRepository {

  public save(element: Element) {
    return element.id ? this.update(element) : this.create(element);
  }

  private async create(element: Element) {
    element.id = UniqueIdHelper.shortId();

    const sql = "INSERT INTO elements (id, churchId, sectionId, elementType, sort, parentId, size, answers) VALUES (?, ?, ?, ?, ?, ?, ?, ?);";
    const params = [element.id, element.churchId, element.sectionId, element.elementType, element.sort, element.parentId, element.size, element.answers];
    await DB.query(sql, params);
    return element;
  }

  private async update(element: Element) {
    const sql = "UPDATE elements SET sectionId=?, elementType=?, sort=?, parentId=?, size=?, answers=? WHERE id=? and churchId=?";
    const params = [element.sectionId, element.elementType, element.sort, element.parentId, element.size, element.answers, element.id, element.churchId];
    await DB.query(sql, params);
    return element;
  }

  public delete(churchId: string, id: string) {
    return DB.query("DELETE FROM elements WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public load(churchId: string, id: string) {
    return DB.queryOne("SELECT * FROM elements WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public loadForSection(churchId: string, sectionId: string) {
    return DB.query("SELECT * FROM elements WHERE sectionId=? AND churchId=? order by sort;", [sectionId, churchId]);
  }

  public loadForPage(churchId: string, pageId: string) {
    const sql = "SELECT e.* "
      + " FROM elements e"
      + " INNER JOIN sections s on s.id=e.sectionId"
      + " WHERE e.churchId=? and s.pageId=?"
      + " ORDER BY sort;";
    return DB.query(sql, [pageId, churchId]);
  }

}
