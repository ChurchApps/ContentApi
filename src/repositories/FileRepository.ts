import { DB } from "../apiBase/db";
import { File } from "../models";
import { ArrayHelper, UniqueIdHelper } from "../apiBase";

export class FileRepository {

  public save(file: File) {
    if (UniqueIdHelper.isMissing(file.id)) return this.create(file); else return this.update(file);
  }

  public async create(file: File) {
    file.id = UniqueIdHelper.shortId();
    const sql = "INSERT INTO files (id, churchId, fileName, contentPath, fileType, size, dateModified) VALUES (?, ?, ?, ?, ?, ?, NOW());";
    const params = [file.id, file.churchId, file.fileName, file.contentPath, file.fileType, file.size];
    await DB.query(sql, params);
    return file;
  }

  public async update(file: File) {
    const sql = "UPDATE files SET fileName=?, contentPath=?, fileType=?, size=?, dateModified=? WHERE id=? AND churchId=?";
    const params = [file.fileName, file.contentPath, file.fileType, file.size, file.dateModified, file.id, file.churchId];
    await DB.query(sql, params);
    return file;
  }

  public load(churchId: string, id: string): Promise<File> {
    return DB.queryOne("SELECT * FROM files WHERE id=? AND churchId=?", [id, churchId]);
  }

  public loadByIds(churchId: string, ids: string[]): Promise<File[]> {
    const sql = "SELECT * FROM files WHERE churchId=? AND id IN (" + ArrayHelper.fillArray("?", ids.length) + ")";
    return DB.query(sql, [churchId].concat(ids));
  }

  public loadForChurch(churchId: string): Promise<File[]> {
    return DB.query("SELECT * FROM files WHERE churchId=?", [churchId]);
  }

  public loadTotalBytes(churchId: string): Promise<{size:number}> {
    return DB.query("select sum(size) as size from files where churchId=?", [churchId]);
  }

  public delete(churchId: string, id: string): Promise<File> {
    return DB.query("DELETE FROM files WHERE id=? AND churchId=?", [id, churchId]);
  }

}
