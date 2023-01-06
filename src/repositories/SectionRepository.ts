import { injectable } from "inversify";
import { UniqueIdHelper } from "../apiBase"
import { DB } from "../apiBase/db"
import { Section } from "../models";

@injectable()
export class SectionRepository {

  public save(section: Section) {
    return section.id ? this.update(section) : this.create(section);
  }

  private async create(section: Section) {
    section.id = UniqueIdHelper.shortId();

    const sql = "INSERT INTO sections (id, churchId, pageId, zone, background, textColor, sort) VALUES (?, ?, ?, ?, ?, ?, ?);";
    const params = [section.id, section.churchId, section.pageId, section.zone, section.background, section.textColor, section.sort];
    await DB.query(sql, params);
    return section;
  }

  private async update(section: Section) {
    const sql = "UPDATE sections SET pageId=?, zone=?, background=?, textColor=?, sort=? WHERE id=? and churchId=?";
    const params = [section.pageId, section.zone, section.background, section.textColor, section.sort, section.id, section.churchId];
    await DB.query(sql, params);
    return section;
  }

  public async updateSort(churchId: string, pageId: string, zone: string) {
    const sections = await this.loadForZone(churchId, pageId, zone);
    const promises: Promise<Section>[] = [];
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].sort !== i + 1) {
        sections[i].sort = i + 1;
        promises.push(this.save(sections[i]));
      }
    }
    if (promises.length > 0) await Promise.all(promises);
  }

  public delete(churchId: string, id: string) {
    return DB.query("DELETE FROM sections WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public load(churchId: string, id: string) {
    return DB.queryOne("SELECT * FROM sections WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public loadForPage(churchId: string, pageId: string) {
    return DB.query("SELECT * FROM sections WHERE pageId=? AND churchId=? order by sort;", [pageId, churchId]);
  }

  public loadForZone(churchId: string, pageId: string, zone: string) {
    return DB.query("SELECT * FROM sections WHERE pageId=? AND churchId=? AND zone=? order by sort;", [pageId, churchId, zone]);
  }

}
