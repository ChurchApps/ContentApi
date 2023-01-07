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

    const sql = "INSERT INTO elements (id, churchId, sectionId, blockId, elementType, sort, parentId, answersJSON) VALUES (?, ?, ?, ?, ?, ?, ?, ?);";
    const params = [element.id, element.churchId, element.sectionId, element.blockId, element.elementType, element.sort, element.parentId, element.answersJSON];
    await DB.query(sql, params);
    return element;
  }

  private async update(element: Element) {
    const sql = "UPDATE elements SET sectionId=?, blockId=?, elementType=?, sort=?, parentId=?, answersJSON=? WHERE id=? and churchId=?";
    const params = [element.sectionId, element.blockId, element.elementType, element.sort, element.parentId, element.answersJSON, element.id, element.churchId];
    await DB.query(sql, params);
    return element;
  }

  public async updateSortForBlock(churchId: string, blockId: string, parentId: string) {
    const elements = await this.loadForBlock(churchId, blockId);
    const promises: Promise<Element>[] = [];
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].parentId === parentId) {
        if (elements[i].sort !== i + 1) {
          elements[i].sort = i + 1;
          promises.push(this.save(elements[i]));
        }
      }
    }
    if (promises.length > 0) await Promise.all(promises);
  }

  public async updateSort(churchId: string, sectionId: string, parentId: string) {
    const elements = await this.loadForSection(churchId, sectionId);
    const promises: Promise<Element>[] = [];
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].parentId === parentId) {
        if (elements[i].sort !== i + 1) {
          elements[i].sort = i + 1;
          promises.push(this.save(elements[i]));
        }
      }
    }
    if (promises.length > 0) await Promise.all(promises);
  }

  public delete(churchId: string, id: string) {
    return DB.query("DELETE FROM elements WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public load(churchId: string, id: string) {
    return DB.queryOne("SELECT * FROM elements WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public loadForBlock(churchId: string, blockId: string) {
    return DB.query("SELECT * FROM elements WHERE churchId=? AND blockId=? order by sort;", [churchId, blockId]);
  }

  public loadForSection(churchId: string, sectionId: string) {
    return DB.query("SELECT * FROM elements WHERE churchId=? AND sectionId=? order by sort;", [churchId, sectionId]);
  }

  public loadForPage(churchId: string, pageId: string) {
    const sql = "SELECT e.* "
      + " FROM elements e"
      + " INNER JOIN sections s on s.id=e.sectionId"
      + " WHERE s.pageId=? AND e.churchId=?"
      + " ORDER BY sort;";
    return DB.query(sql, [pageId, churchId]);
  }

}
