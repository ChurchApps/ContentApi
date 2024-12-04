import fs from "fs";
import path from "path";

import { EnvironmentBase, AwsHelper } from "@churchapps/apihelper";

export class Environment extends EnvironmentBase {

  static membershipApi: string;
  static youTubeApiKey: string;
  static pexelsKey: string;
  static vimeoToken: string;
  static messagingApi: string;
  static apiBibleKey: string;

  static async init(environment: string) {
    let file = "dev.json";
    if (environment === "staging") file = "staging.json";
    if (environment === "prod") file = "prod.json";

    const relativePath = "../../config/" + file;
    const physicalPath = path.resolve(__dirname, relativePath);

    const json = fs.readFileSync(physicalPath, "utf8");
    const data = JSON.parse(json);
    await this.populateBase(data, "contentApi", environment);

    this.membershipApi = data.membershipApi;
    this.messagingApi = data.messagingApi;
    this.youTubeApiKey = process.env.YOUTUBE_API_KEY || await AwsHelper.readParameter(`/${environment}/youTubeApiKey`);
    this.pexelsKey = process.env.PEXELS_KEY || await AwsHelper.readParameter(`/${environment}/pexelsKey`);
    this.vimeoToken = process.env.VIMEO_TOKEN || await AwsHelper.readParameter(`/${environment}/vimeoToken`)
    this.apiBibleKey = process.env.API_BIBLE_KEY || await AwsHelper.readParameter(`/${environment}/apiBibleKey`);
  }

}