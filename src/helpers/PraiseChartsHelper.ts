import { SongDetail, SongDetailLink } from "../models";

export class PraiseChartsHelper {
  static async search(query: string) {
    const includes = "&arr_includes[]=id"
      + "&arr_includes[]=details.title"
      + "&arr_includes[]=details.artists.names"
      + "&arr_includes[]=details.album.title"
      + "&arr_includes[]=details.album.images.md.url";
    const url = `https://api.praisecharts.com/v1.0/catalog/search?q=${encodeURIComponent(query)}${includes}`;
    const userAgent = "ChurchApps https://churchapps.org/"
    const response = await fetch(url, { headers: { "User-Agent": userAgent } });
    if (response.ok) {
      const data = await response.json();
      return this.convertItemsToSongDetails(data.arrangements.items);
    } else {
      throw new Error(`Error fetching data from PraiseCharts: ${response.statusText}`);
    }
  }

  static async load(id: string) {
    const url = `https://api.praisecharts.com/v1.0/catalog/search?q=${encodeURIComponent(id)}`;
    const userAgent = "ChurchApps https://churchapps.org/"
    const response = await fetch(url, { headers: { "User-Agent": userAgent } });
    if (response.ok) {
      const data = await response.json();
      const songDetails = this.convertItemToSongDetail(data.arrangements.items[0]);
      this.appendDetails(data.arrangements.items[0], songDetails)
      const links = this.getLinks(data.arrangements.items[0]);
      return { songDetails, links };
    } else {
      throw new Error(`Error fetching data from PraiseCharts: ${response.statusText}`);
    }
  }

  private static convertItemsToSongDetails(items: any[]) {
    return items.map(item => {
      return this.convertItemToSongDetail(item);
    });
  }

  private static convertItemToSongDetail(item: any) {
    const result: SongDetail = {
      praiseChartsId: item.id,
      title: item.details?.title,
      artist: item.details?.artists?.names,
      album: item.details?.album?.title,
      thumbnail: item.details?.album?.images?.md?.url,
      seconds: 0
    }
    return result;
  }

  private static appendDetails(item: any, sd: SongDetail) {
    console.log("Item is", item);
    sd.bpm = item.bpm;
    sd.keySignature = item.details.original_key;
    sd.seconds = item.seconds;
    sd.thumbnail = ""; // Can only use for PC branded search
    sd.meter = item.details.meter;
    sd.tones = item.details.keys;

  }

  private static getLinks(item: any) {
    const result: SongDetailLink[] = [];
    if (item.details.external_ids) {
      const externalIds = item.details.external_ids;
      if (externalIds.spotify_id) result.push({ service: "Spotify", serviceKey: externalIds.spotify_id, url: "https://open.spotify.com/track/" + externalIds.spotify_id });
      if (externalIds.ccli_number) result.push({ service: "CCLI", serviceKey: externalIds.ccli_number, url: "https://songselect.ccli.com/Songs/" + externalIds.ccli_number });
      if (externalIds.isrc) result.push({ service: "ISRC", serviceKey: externalIds.isrc });
    }
    if (item.details.external_urls) {
      const externalUrls = item.details.external_urls;
      if (externalUrls.youtube) result.push({ service: "YouTube", id: externalUrls.youtube.split("=")[1], url: externalUrls.youtube });
    }
    return result;
  }

}
