import { injectable } from "inversify";
import { UniqueIdHelper } from "@churchapps/apihelper"
import { DB } from "@churchapps/apihelper"
import { Song } from "../models";

@injectable()
export class SongRepository {

  public saveAll(songs: Song[]) {
    const promises: Promise<Song>[] = [];
    songs.forEach(sd => { promises.push(this.save(sd)); });
    return Promise.all(promises);
  }

  public save(song: Song) {
    return song.id ? this.update(song) : this.create(song);
  }

  private async create(song: Song) {
    song.id = UniqueIdHelper.shortId();

    const sql = "INSERT INTO songs (id, churchId, songDetailId, dateAdded) VALUES (?, ?, ?, ?);";
    const params = [song.id, song.churchId, song.songDetailId, song.dateAdded];
    console.log(sql, params);
    await DB.query(sql, params);
    return song;
  }

  private async update(song: Song) {
    const sql = "UPDATE songs SET songDetailId=?, dateAdded=? WHERE id=? and churchId=?";
    const params = [song.songDetailId, song.dateAdded, song.id, song.churchId];
    await DB.query(sql, params);
    return song;
  }

  public delete(id: string) {
    return DB.query("DELETE FROM songs WHERE id=?;", [id]);
  }

  public loadAll(churchId: string) {
    return DB.queryOne("SELECT * FROM songs WHERE churchId=? ORDER BY title;", [churchId]);
  }

  public load(churchId: string, id: string) {
    return DB.queryOne("SELECT * FROM songs WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public loadBySongDetailId(churchId: string, songDetailId: string) {
    return DB.queryOne("SELECT * FROM songs where churchId=? and songDetailId=?;", [churchId, songDetailId]);
  }

}
