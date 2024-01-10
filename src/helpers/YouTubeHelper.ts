import axios from 'axios'
import { Sermon } from '../models';
import { Environment } from '.';

export class YouTubeHelper {

  public static async getSermon(sermonId: string) {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails%2C+snippet&id=${sermonId}&key=${Environment.youTubeApiKey}`;
    const result = { title: "", thumbnail: "", description: "", duration: 0, publishDate: new Date() }
    const json: any = (await axios.get(url)).data;
    if (json.items?.length > 0) {
      const snippet = json.items[0].snippet;
      const details = json.items[0].contentDetails;
      result.duration = this.parseDuration(details.duration);
      result.title = snippet.title;
      result.description = snippet.description;
      result.thumbnail = snippet.thumbnails?.maxres?.url || "";
      result.publishDate = new Date(snippet.publishedAt);
    }
    return result;
  }

  private static parseDuration(duration: string) {
    let result = 0;
    const hourMatches = duration.match(/[0-9]{1,2}H/g);
    const minuteMatches = duration.match(/[0-9]{1,2}M/g);
    const secondMatches = duration.match(/[0-9]{1,2}S/g);

    const hours = (hourMatches?.length>0) ? parseInt(hourMatches[0].replace("H", ""), 0) : 0;
    const minutes = (minuteMatches?.length>0) ? parseInt(minuteMatches[0].replace("M", ""), 0) : 0;
    const seconds = (secondMatches?.length>0) ? parseInt(secondMatches[0].replace("S", ""), 0) : 0;
    result = hours * 3600 + minutes * 60 + seconds;
    return result;
  }

  public static async getVideosFromChannel(churchId:string, channelId: string) {
    const allSermons: Sermon[] = [];
    let data = await this.getVideoPage(churchId, channelId, "");
    allSermons.push(...data.sermons);
    let page = 0;
    while (page < 4 && data.nextPageToken) {
      data = await this.getVideoPage(churchId, channelId, data.nextPageToken);
      allSermons.push(...data.sermons);
      page++;
    }
    return allSermons;
  }

  public static async getVideoPage(churchId:string, channelId: string, pageToken:string) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=50&order=date&type=video&key=${Environment.youTubeApiKey}&pageToken=${pageToken}`;
    const json: any = (await axios.get(url)).data;
    const result = {
      sermons: YouTubeHelper.convertToSermons(churchId, json),
      nextPageToken: json.nextPageToken
    }
    return result;
  }

  private static convertToSermons(churchId:string, json: any) {
    const sermons:Sermon[] = [];
    for (const item of json.items) {
      const sermon:Sermon = {
        churchId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || "",
        description: item.snippet.description,
        publishDate: new Date(item.snippet.publishedAt),
        videoType: "youtube",
        videoData: item.id.videoId,
        duration: 0,
        permanentUrl:false,
        playlistId: "",
        videoUrl: "https://www.youtube.com/embed/" + item.id.videoId + "?autoplay=1&controls=0&showinfo=0&rel=0&modestbranding=1&disablekb=1"
      };
      sermons.push(sermon);
    }
    return sermons;
  }



}