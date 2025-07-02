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
  static praiseChartsConsumerKey: string;
  static praiseChartsConsumerSecret: string;
  static aiProvider: string;
  static openRouterApiKey: string;
  static openAiApiKey: string;

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
    this.youTubeApiKey =
      process.env.YOUTUBE_API_KEY || (await AwsHelper.readParameter(`/${environment}/youTubeApiKey`));
    this.pexelsKey = process.env.PEXELS_KEY || (await AwsHelper.readParameter(`/${environment}/pexelsKey`));
    this.vimeoToken = process.env.VIMEO_TOKEN || (await AwsHelper.readParameter(`/${environment}/vimeoToken`));
    this.apiBibleKey = process.env.API_BIBLE_KEY || (await AwsHelper.readParameter(`/${environment}/apiBibleKey`));
    this.praiseChartsConsumerKey =
      process.env.PRAISECHARTS_CONSUMER_KEY ||
      (await AwsHelper.readParameter(`/${environment}/praiseChartsConsumerKey`));
    this.praiseChartsConsumerSecret =
      process.env.PRAISECHARTS_CONSUMER_SECRET ||
      (await AwsHelper.readParameter(`/${environment}/praiseChartsConsumerSecret`));
    this.aiProvider = data.aiProvider;
    this.openRouterApiKey =
      process.env.OPENROUTER_API_KEY || (await AwsHelper.readParameter(`/${environment}/openRouterApiKey`));
    this.openAiApiKey = process.env.OPENAI_API_KEY || (await AwsHelper.readParameter(`/${environment}/openAiApiKey`));
  }
}
