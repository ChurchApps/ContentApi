import { Setting, SongDetail, SongDetailLink } from "../models";
import OAuth from "oauth";
import { Environment } from "./Environment";
import { Repositories } from "../repositories";


export class PraiseChartsHelper {

  static getOAuth(returnUrl?: string) {
    const requestTokenUrl = "https://api.praisecharts.com/oauth/request_token";
    const accessTokenUrl = "https://api.praisecharts.com/oauth/access_token";
    const oauth = new OAuth.OAuth(requestTokenUrl, accessTokenUrl, Environment.praiseChartsConsumerKey, Environment.praiseChartsConsumerSecret, "1.0A", returnUrl || "https://churchapps.org/", "HMAC-SHA1");
    return oauth;
  }

  static getRequestToken(returnUrl: string): Promise<{ oauthToken: string, oauthTokenSecret: string }> {
    return new Promise((resolve, reject) => {
      const oauth = this.getOAuth(returnUrl);
      oauth.getOAuthRequestToken((err, oauthToken, oauthTokenSecret) => {
        if (err) console.log("Error is", err);
        if (err) return reject(err);
        resolve({ oauthToken, oauthTokenSecret });
      });
    });
  }

  static getAuthorizeUrl(oauthToken: string) {
    return `https://api.praisecharts.com/oauth/authorize?oauth_token=${oauthToken}`;
  }

  static getAccessToken(oauthToken: string, oauthTokenSecret: string, oauthVerifier: string): Promise<{ accessToken: string, accessTokenSecret: string }> {
    return new Promise((resolve, reject) => {
      const oauth = this.getOAuth("http://localhost:3101/pingback");
      oauth.getOAuthAccessToken(
        oauthToken,
        oauthTokenSecret,
        oauthVerifier,
        (err, accessToken, accessTokenSecret) => {
          if (err) console.log("Error is", err);
          if (err) return reject(err);
          resolve({ accessToken, accessTokenSecret });
        }
      );
    });
  }


  static searchLibraryAuth(query: string, accessToken: string, accessTokenSecret: string) {
    const url = `https://api.praisecharts.com/v1.0/library/search?q=${encodeURIComponent(query)}`;
    return new Promise((resolve, reject) => {
      const oauth = this.getOAuth();
      oauth.get(url, accessToken, accessTokenSecret, (err, data) => {
        if (err) return reject(err);
        resolve(JSON.parse(data as string));
      });
    });
  }




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


  static async download(skus: string[], accessToken: string, accessTokenSecret: string) {
    const url = `https://api.praisecharts.com/v1.0/download?skus=${encodeURIComponent(skus.join(","))}`;
    return new Promise((resolve, reject) => {
      const oauth = this.getOAuth();

      oauth.get(url, accessToken, accessTokenSecret, (err, data, resp) => {
        if (err) return reject(err);
        // Convert to Buffer (because `data` is a string, but we want binary-safe output)
        const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'binary');
        resolve(buffer);
        // resolve(data as any); // Cast to any to avoid TypeScript error
      });
    });
  }

  static async loadRaw(id: string) {
    const url = `https://api.praisecharts.com/v1.0/catalog/search?q=${encodeURIComponent(id)}`;
    const userAgent = "ChurchApps https://churchapps.org/"
    const response = await fetch(url, { headers: { "User-Agent": userAgent } });
    if (response.ok) {
      const data = await response.json();
      return data.arrangements.items[0];
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
