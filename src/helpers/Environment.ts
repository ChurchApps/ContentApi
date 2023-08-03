import fs from "fs";
import path from "path";

import { EnvironmentBase } from "../apiBase/helpers";

export class Environment extends EnvironmentBase {

  static membershipApi: string;
  static youTubeApiKey: string;

  static init(environment: string) {
    let file = "dev.json";
    if (environment === "staging") file = "staging.json";
    if (environment === "prod") file = "prod.json";


    const relativePath = "../../config/" + file;
    const physicalPath = path.resolve(__dirname, relativePath);

    const json = fs.readFileSync(physicalPath, "utf8");
    const data = JSON.parse(json);
    this.populateBase(data);

    this.membershipApi = data.membershipApi;
    this.youTubeApiKey = process.env.YOUTUBE_API_KEY;
  }

}