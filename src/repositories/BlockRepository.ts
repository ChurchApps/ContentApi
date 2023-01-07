import { injectable } from "inversify";
import { UniqueIdHelper } from "../apiBase"
import { DB } from "../apiBase/db"
import { Block } from "../models";

@injectable()
export class BlockRepository {

  public save(block: Block) {
    return block.id ? this.update(block) : this.create(block);
  }

  private async create(block: Block) {
    block.id = UniqueIdHelper.shortId();

    const sql = "INSERT INTO blocks (id, churchId, blockType, name) VALUES (?, ?, ?, ?);";
    const params = [block.id, block.churchId, block.blockType, block.name];
    await DB.query(sql, params);
    return block;
  }

  private async update(block: Block) {
    const sql = "UPDATE blocks SET blockType=?, name=? WHERE id=? and churchId=?";
    const params = [block.blockType, block.name, block.id, block.churchId];
    await DB.query(sql, params);
    return block;
  }

  public delete(churchId: string, id: string) {
    return DB.query("DELETE FROM blocks WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public load(churchId: string, id: string) {
    return DB.queryOne("SELECT * FROM blocks WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public loadAll(churchId: string) {
    return DB.queryOne("SELECT * FROM blocks WHERE churchId=?;", [churchId]);
  }

}
