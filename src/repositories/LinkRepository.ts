import { Link } from "../models";
import { DB, UniqueIdHelper } from "@churchapps/apihelper";

export class LinkRepository {

  public loadAll(churchId: string) {
    return DB.query("SELECT * FROM links WHERE churchId=? order by sort", [churchId]);
  }

  public loadByCategory(churchId: string, category: string) {
    return DB.query("SELECT * FROM links WHERE churchId=? and category=? order by sort", [churchId, category]);
  }

  public save(link: Link) {
    return link.id ? this.update(link) : this.create(link);
  }

  private async create(link: Link) {
    link.id = UniqueIdHelper.shortId();
    const query = "INSERT INTO links (id, churchId, category, url, linkType, linkData, photo, icon, text, sort, parentId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    const params = [link.id, link.churchId, link.category, link.url, link.linkType, link.linkData, link.photo, link.icon, link.text, link.sort, link.parentId];
    await DB.query(query, params)
    return link;
  }

  public delete(id: string, churchId: string) {
    return DB.query("DELETE FROM links WHERE id=? AND churchId=?;", [id, churchId]);
  }

  private async update(link: Link) {
    const sql = "UPDATE links SET category=?, url=?, linkType=?, linkData=?, photo=?, icon=?, text=?, sort=?, parentId=? WHERE id=?;";
    const params = [link.category, link.url, link.linkType, link.linkData, link.photo, link.icon, link.text, link.sort, link.parentId, link.id];
    await DB.query(sql, params);
    return link;
  }

  public loadById(id: string, churchId: string): Promise<Link> {
    return DB.queryOne("SELECT * FROM links WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public convertToModel(churchId: string, data: any) {
    const result = {
      ...data
    }
    if (result.photo === undefined) {
      if (!result.photoUpdated) {
        result.photo = ""
      } else {
        result.photo = "/" + churchId + "/b1/tabs/" + data.id + ".png?dt=" + data.photoUpdated.getTime().toString();
      }
    }
    return result;
  }


  public convertAllToModel(churchId: string, data: any[]) {
    const result: Link[] = [];
    data.forEach(d => result.push(this.convertToModel(churchId, d)));
    return result;
  }
}
