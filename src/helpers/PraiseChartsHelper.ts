import { Setting, SongDetail, SongDetailLink } from "../models";
import OAuth from "oauth";
import { Environment } from "./Environment";
import { Repositories } from "../repositories";
import https from "https";

export class PraiseChartsHelper {

  static async loadUserTokens(au: any) {
    const settings: Setting[] = await Repositories.getCurrent().setting.loadUser(au.churchId, au.id);
    const token = settings.find(s => s.keyName === "praiseChartsAccessToken")?.value;
    const secret = settings.find(s => s.keyName === "praiseChartsAccessTokenSecret")?.value;
    return { token, secret };
  }

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
      console.log("Getting access token", oauthToken, oauthTokenSecret, oauthVerifier);
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

  static async oAuthGet(url: string, accessToken: string, accessTokenSecret: string) {
    return new Promise((resolve, reject) => {
      const oauth = this.getOAuth();
      oauth.get(url, accessToken, accessTokenSecret, (err, data) => {
        if (err) return reject(err);
        resolve(JSON.parse(data as string));
      });
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
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return this.convertItemsToSongDetails(data.arrangements.items);
    } else {
      throw new Error(`Error fetching data from PraiseCharts: ${response.statusText}`);
    }
  }


  static async download(skus: string[], accessToken: string, accessTokenSecret: string) {
    const url = `https://api.praisecharts.com/v1.0/download?skus=${encodeURIComponent(skus.join(","))}`;
    const oauth = this.getOAuth();
    const authHeader = oauth.authHeader(url, accessToken, accessTokenSecret, "GET");

    return new Promise((resolve, reject) => {
      const req = https.request(url, { method: "GET", headers: { Authorization: authHeader } }, (res) => {
        const chunks: Buffer[] = [];
        res.on("data", chunk => chunks.push(chunk));
        res.on("end", () => { const buffer = Buffer.concat(chunks); resolve(buffer); });
      });

      req.on("error", reject);
      req.end();
    });
  }

  static async loadArrangmentRaw(id: string, keys: string[], accessToken: string, accessTokenSecret: string) {
    let url = `https://api.praisecharts.com/v1.0/library/import-arrangement/${id}`;
    if (keys.length > 0) url += "?keys[]=" + keys.join(",");
    return this.oAuthGet(url, accessToken, accessTokenSecret);
  }

  static async loadSongFromLibrary(id: string, keys: string[], accessToken: string, accessTokenSecret: string) {
    let url = `https://api.praisecharts.com/v1.0/library/search?q=${encodeURIComponent(id)}`;
    if (keys.length > 0) url += "&keys[]=" + keys.join(",");
    const data: any = await this.oAuthGet(url, accessToken, accessTokenSecret);
    return data;
  }

  static async loadSongFromCatalog(id: string, keys: string[]) {
    let url = `https://api.praisecharts.com/v1.0/catalog/search?q=${encodeURIComponent(id)}`;
    if (keys.length > 0) url += "&keys[]=" + keys.join(",");
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return data.arrangements.items[0];
    } else {
      throw new Error(`Error fetching data from PraiseCharts: ${response.statusText}`);
    }
  }

  static async load(id: string) {
    const url = `https://api.praisecharts.com/v1.0/catalog/search?q=${encodeURIComponent(id)}`;
    const response = await fetch(url);
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
