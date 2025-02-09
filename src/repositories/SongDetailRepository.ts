import { injectable } from "inversify";
import { UniqueIdHelper } from "@churchapps/apihelper"
import { DB } from "@churchapps/apihelper"
import { SongDetail } from "../models";

@injectable()
export class SongDetailRepository {

  public saveAll(songDetails: SongDetail[]) {
    const promises: Promise<SongDetail>[] = [];
    songDetails.forEach(sd => { promises.push(this.save(sd)); });
    return Promise.all(promises);
  }

  public save(songDetail: SongDetail) {
    return songDetail.id ? this.update(songDetail) : this.create(songDetail);
  }

  private async create(songDetail: SongDetail) {
    songDetail.id = UniqueIdHelper.shortId();

    const sql = "INSERT INTO songDetails (id, musicBrainzId, title, artist, album, language, thumbnail, releaseDate, bpm, keySignature, seconds) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    const params = [songDetail.id, songDetail.musicBrainzId, songDetail.title, songDetail.artist, songDetail.album, songDetail.language, songDetail.thumbnail, songDetail.releaseDate, songDetail.bpm, songDetail.keySignature, songDetail.seconds];
    console.log(sql, params);
    await DB.query(sql, params);
    return songDetail;
  }

  private async update(songDetail: SongDetail) {
    const sql = "UPDATE songDetails SET musicBrainzId=?, title=?, artist=?, album=?, language=?, thumbnail=?, releaseDate=?, bpm=?, keySignature=?, seconds=? WHERE id=?";
    const params = [songDetail.musicBrainzId, songDetail.title, songDetail.artist, songDetail.album, songDetail.language, songDetail.thumbnail, songDetail.releaseDate, songDetail.bpm, songDetail.keySignature, songDetail.seconds, songDetail.id];
    await DB.query(sql, params);
    return songDetail;
  }

  public delete(id: string) {
    return DB.query("DELETE FROM songDetails WHERE id=?;", [id]);
  }

  public load(id: string) {
    return DB.queryOne("SELECT * FROM songDetails WHERE id=?;", [id]);
  }

  public search(query: string) {
    const q = "%" + query.replace(/ /g, "%") + "%";
    return DB.query("SELECT * FROM songDetails where title + ' ' + artist like ? or artist + ' ' + title like ?;", [q, q]);
  }

  public loadByMusicBrainzId(mbId: string) {
    return DB.queryOne("SELECT * FROM songDetails where musicBrainzId=?;", [mbId]);
  }

  public loadForChurch(churchId: string) {
    const sql = "SELECT sd.*, s.Id as songId, s.churchId"
      + " FROM songs s"
      + " INNER JOIN songDetails sd on sd.id=s.songDetailId"
      + " WHERE s.churchId=?"
    return DB.query(sql, [churchId]);
  }

}
