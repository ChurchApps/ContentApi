import { DateHelper } from "@churchapps/apihelper";
import { Repositories } from "../repositories";
import { YouTubeHelper } from "./YouTubeHelper";
import { VimeoHelper } from "./VimeoHelper";
import { Sermon, StreamingService } from "../models";

export class ScheduleHelper {

  public static async handleAutoImports() {
    let settings = await Repositories.getCurrent().setting.loadAllPublicSettings();
    settings = settings.filter((s: any) => s.value !== "");
    await this.handleImport(settings, "youtube");
    await this.handleImport(settings, "vimeo");
  }

  public static async handleImport(settings: any, type: "youtube" | "vimeo") {
    const getAllImports = Repositories.getCurrent().setting.convertAllImports(Repositories.getCurrent().setting.getImports(settings, type));

    if (getAllImports.length > 0) {
      for (const importSetting of getAllImports) {
        let videosToAdd;
        const sermons = await Repositories.getCurrent().sermon.loadPublicAll(importSetting.churchId);
        const sermonsFromPlaylist = sermons.filter((s) => s.playlistId === importSetting.playlistId && s.videoType === type);
        const getchannel = type === "youtube" ? await YouTubeHelper.getVideosFromChannel(importSetting.churchId, importSetting.youtubeChannelId) : await VimeoHelper.getVideosFromChannel(importSetting.churchId, importSetting.vimeoChannelId);
        const videosFromChannel = getchannel;

        // list of videos that has already been added, to get data of last video added to the playlist.
        const addedVideos = sermonsFromPlaylist.filter((sp) => {
          return videosFromChannel.some((vc) => {
            return sp.videoData === vc.videoData;
          });
        });

        if (addedVideos.length > 0) {
          const arrayOfDates = addedVideos.map((v) => DateHelper.toDate(v.publishDate).getTime());
          const maxDate = new Date(Math.max(...arrayOfDates));
          const availableVideosList = videosFromChannel.filter((vc) => vc.publishDate >= maxDate);
          // If more than one video has been uploaded on the same day, remove the one that's all ready been added as sermon.
          videosToAdd = availableVideosList.filter((v) => {
            return !addedVideos.some((av) => {
              return v.videoData === av.videoData;
            });
          });
        } else {
          // Auto import all the videos available in channel, if added videos are empty.
          videosToAdd = videosFromChannel;
        }

        const sermonsToAdd = [...videosToAdd];
        sermonsToAdd.forEach((s) => {
          s.playlistId = importSetting.playlistId;
          this.saveSermons(s);
        });
      }
    }
  }

  public static async saveSermons(sermon: Sermon) {
    await Repositories.getCurrent().sermon.save(sermon);
  }

  public static async updateServiceTimes() {
    const services = await Repositories.getCurrent().streamingService.loadAllRecurring();
    services.forEach((s: StreamingService) => {
      if (s.serviceTime < new Date()) {
        s.serviceTime.setDate(s.serviceTime.getDate() + 7);
        this.saveStreamingServices(s);
      }
    })
  }

  public static async saveStreamingServices(streamingService: StreamingService) {
    await Repositories.getCurrent().streamingService.save(streamingService);
  }

}
