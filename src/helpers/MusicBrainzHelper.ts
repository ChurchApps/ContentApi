import { SongDetail } from "../models";

export class MusicBrainzHelper {
  /*
  static async search(query: string) {
    const url = `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(query)}&fmt=json`;
    const userAgent = "ChurchApps https://churchapps.org/"
    const response = await fetch(url, { headers: { "User-Agent": userAgent } });
    if (response.ok) {
      const data = await response.json();
      return this.convertRecordingsToSongDetails(data.recordings);
    } else {
      throw new Error(`Error fetching data from MusicBrainz: ${response.statusText}`);
    }
  }

  private static convertRecordingsToSongDetails(recordings: any[]) {
    return recordings.map(recording => {
      return this.convertRecordingToSongDetail(recording);
    });
  }

  private static convertRecordingToSongDetail(recording: any) {
    const result: SongDetail = {
      musicBrainzId: recording.id,
      title: recording.title,
      artist: recording['artist-credit']?.[0]?.name,
      album: recording.releases?.[0]?.title,
      releaseDate: recording.releases?.[0]?.date ? new Date(recording.releases?.[0]?.date) : undefined,
      seconds: recording.length ? Math.round(recording.length / 1000) : 0,
      thumbnail: recording.releases?.[0]?.id ? this.getCoverArtUrl(recording.releases?.[0]?.id) : undefined
    }
    return result;
  }

  private static getCoverArtUrl(releaseMbId: string) {
    // https://coverartarchive.org/release/{releaseMbId}
    const url = `https://coverartarchive.org/release/${releaseMbId}/front-250.jpg`;
    return url;
  }
*/
}
