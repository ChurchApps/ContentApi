import { SongDetail, Song, Arrangement, SongDetailLink } from "../models";
import { PraiseChartsHelper } from "./PraiseChartsHelper";
import { Repositories } from "../repositories";

export class SongHelper {


  static async importSongs(churchId: string, songs: { title?: string, artist?: string, lyrics?: string, ccliNumber?: string, geniusId?: string }[]): Promise<Arrangement[]> {
    const promises: Promise<Arrangement>[] = [];
    for (const song of songs) {
      const promise = this.importSong(churchId, song.title, song.artist, song.lyrics, song.ccliNumber, song.geniusId);
      promises.push(promise);
    }
    return Promise.all(promises);
  }

  static async importSong(churchId: string, title?: string, artist?: string, lyrics?: string, ccliNumber?: string, geniusId?: string): Promise<Arrangement> {
    try {
      // 1. Try to find existing song by CCLI
      const existingSong = await this.findExistingSongByCCLI(churchId, ccliNumber);
      if (existingSong) return existingSong;

      // 2. Try to find existing song by Genius ID
      if (geniusId) {
        const existingByGenius = await this.findExistingSongByGeniusId(churchId, geniusId);
        if (existingByGenius) return existingByGenius;
      }

      // 3. Look up song on PraiseCharts
      const praiseChartsResult = await PraiseChartsHelper.findBestMatch(title, artist, lyrics, ccliNumber, geniusId);
      if (!praiseChartsResult) return null; // throw new Error("Song not found on PraiseCharts");

      // 4. Get or create song detail
      const songDetail = await this.getOrCreateSongDetail(praiseChartsResult, ccliNumber, geniusId);

      // 5. Check if arrangement exists for this church
      const existingArrangement = await Repositories.getCurrent().arrangement.loadBySongDetailId(churchId, songDetail.id);
      if (existingArrangement.length > 0) return existingArrangement[0];

      // 6. Create new Song and Arrangement
      return await this.createSongAndArrangement(churchId, songDetail, lyrics);
    } catch (error) {
      console.error("Error importing song:", error);
      throw new Error(`Error importing song: ${error.message}`);
    }
  }

  private static async findExistingSongByCCLI(churchId: string, ccliNumber?: string): Promise<SongDetail | null> {
    if (!ccliNumber) return null;

    const existingByCCLI = await Repositories.getCurrent().songDetailLink.loadByServiceAndKey("CCLI", ccliNumber);
    if (existingByCCLI) {
      const songDetail = await Repositories.getCurrent().songDetail.load(existingByCCLI.songDetailId);
      if (songDetail) {
        const existingArrangement = await Repositories.getCurrent().arrangement.loadBySongDetailId(churchId, songDetail.id);
        if (existingArrangement.length > 0) return songDetail;
      }
    }
    return null;
  }

  private static async findExistingSongByGeniusId(churchId: string, geniusId: string): Promise<Arrangement | null> {
    const existingByGenius = await Repositories.getCurrent().songDetailLink.loadByServiceAndKey("Genius", geniusId);
    if (existingByGenius) {
      const songDetail = await Repositories.getCurrent().songDetail.load(existingByGenius.songDetailId);
      if (songDetail) {
        const existingArrangement = await Repositories.getCurrent().arrangement.loadBySongDetailId(churchId, songDetail.id);
        if (existingArrangement.length > 0) {
          return existingArrangement[0];
        }
      }
    }
    return null;
  }

  private static async getOrCreateSongDetail(praiseChartsResult: SongDetail, ccliNumber?: string, geniusId?: string): Promise<SongDetail> {
    let songDetail = await Repositories.getCurrent().songDetail.loadByPraiseChartsId(praiseChartsResult.praiseChartsId);

    if (!songDetail) {
      // Create new song detail
      songDetail = praiseChartsResult;
      songDetail = await Repositories.getCurrent().songDetail.save(songDetail);

      // Create song detail links from PraiseCharts
      await this.createSongDetailLinks(songDetail, praiseChartsResult.praiseChartsId);
    }

    // Create additional links for CCLI and Genius if provided
    await this.createAdditionalLinks(songDetail, ccliNumber, geniusId);

    return songDetail;
  }

  private static async createSongDetailLinks(songDetail: SongDetail, praiseChartsId: string): Promise<void> {
    const { links } = await PraiseChartsHelper.load(praiseChartsId);
    for (const link of links) {
      link.songDetailId = songDetail.id;
      await Repositories.getCurrent().songDetailLink.save(link);
    }
  }

  private static async createAdditionalLinks(songDetail: SongDetail, ccliNumber?: string, geniusId?: string): Promise<void> {
    const existingLinks = await Repositories.getCurrent().songDetailLink.loadForSongDetail(songDetail.id);

    // Create CCLI link if provided and doesn't exist
    if (ccliNumber && !existingLinks.some((link: SongDetailLink) => link.service === "CCLI" && link.serviceKey === ccliNumber)) {
      const ccliLink: SongDetailLink = {
        songDetailId: songDetail.id,
        service: "CCLI",
        serviceKey: ccliNumber,
        url: `https://songselect.ccli.com/Songs/${ccliNumber}`
      };
      await Repositories.getCurrent().songDetailLink.save(ccliLink);
    }

    // Create Genius link if provided and doesn't exist
    if (geniusId && !existingLinks.some((link: SongDetailLink) => link.service === "Genius" && link.serviceKey === geniusId)) {
      const geniusLink: SongDetailLink = {
        songDetailId: songDetail.id,
        service: "Genius",
        serviceKey: geniusId,
        url: `https://genius.com/songs/${geniusId}`
      };
      await Repositories.getCurrent().songDetailLink.save(geniusLink);
    }
  }

  private static async createSongAndArrangement(churchId: string, songDetail: SongDetail, lyrics?: string): Promise<Arrangement> {
    // Create new Song
    const song: Song = {
      churchId,
      name: songDetail.title,
      dateAdded: new Date()
    };
    const savedSong = await Repositories.getCurrent().song.save(song);

    // Create new Arrangement
    const arrangement: Arrangement = {
      churchId,
      songId: savedSong.id,
      songDetailId: songDetail.id,
      name: "Default",
      lyrics: lyrics || ""
    };
    return await Repositories.getCurrent().arrangement.save(arrangement);
  }

}
