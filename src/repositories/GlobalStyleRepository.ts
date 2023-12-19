import { DB } from "@churchapps/apihelper";
import { GlobalStyle } from "../models";
import { UniqueIdHelper } from "@churchapps/apihelper";

export class GlobalStyleRepository {

  public save(globalStyle: GlobalStyle) {
    if (UniqueIdHelper.isMissing(globalStyle.id)) return this.create(globalStyle); else return this.update(globalStyle);
  }

  public async create(globalStyle: GlobalStyle) {
    globalStyle.id = UniqueIdHelper.shortId();
    const sql = "INSERT INTO globalStyles (id, churchId, fonts, palette, customCss, customJS) VALUES (?, ?, ?, ?, ?, ?);";
    const params = [globalStyle.id, globalStyle.churchId, globalStyle.fonts, globalStyle.palette, globalStyle.customCss, globalStyle.customJS];
    await DB.query(sql, params);
    return globalStyle;
  }

  public async update(globalStyle: GlobalStyle) {
    const sql = "UPDATE globalStyles SET fonts=?, palette=?, customCss=?, customJS=? WHERE id=? AND churchId=?";
    const params = [globalStyle.fonts, globalStyle.palette, globalStyle.customCss, globalStyle.customJS, globalStyle.id, globalStyle.churchId];
    await DB.query(sql, params);
    return globalStyle;
  }

  public load(churchId: string, id: string): Promise<GlobalStyle> {
    return DB.queryOne("SELECT * FROM globalStyles WHERE id=? AND churchId=?", [id, churchId]);
  }

  public loadForChurch(churchId: string): Promise<GlobalStyle[]> {
    return DB.queryOne("SELECT * FROM globalStyles WHERE churchId=? limit 1;", [churchId]);
  }

  public delete(churchId: string, id: string): Promise<GlobalStyle> {
    return DB.query("DELETE FROM globalStyles WHERE id=? AND churchId=?", [id, churchId]);
  }

}
