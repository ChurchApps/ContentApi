import axios from 'axios'
import { Environment } from '.';

export class YouTubeHelper {

  public static async getSermon(sermonId: string) {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails%2C+snippet&id=${sermonId}&key=${Environment.youTubeApiKey}`;
    const result = { title: "", thumbnail: "", description: "", duration: 0 }
    const json: any = (await axios.get(url)).data;
    if (json.items?.length > 0) {
      const snippet = json.items[0].snippet;
      const details = json.items[0].contentDetails;
      result.duration = this.parseDuration(details.duration);
      result.title = snippet.title;
      result.description = snippet.description;
      result.thumbnail = snippet.thumbnails?.maxres?.url || "";
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



}