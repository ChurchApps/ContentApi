import "reflect-metadata";
import dotenv from "dotenv";
import { Environment } from "../src/helpers/Environment";
import { Pool } from "../src/apiBase/pool";
import { DBCreator } from "../src/apiBase/tools/DBCreator"

const init = async () => {
  dotenv.config();
  Environment.init(process.env.APP_ENV?.toString() || "");
  console.log("Connecting");
  Pool.initPool();

  await DBCreator.init(["Links"]);

  const taskTables: { title: string, file: string }[] = [
    { title: "Blocks", file: "blocks.mysql" },
    { title: "Elements", file: "elements.mysql" },
    { title: "Pages", file: "pages.mysql" },
    { title: "Sections", file: "sections.mysql" },
    { title: "Playlists", file: "playlists.mysql" },
    { title: "Sermons", file: "sermons.mysql" },
    { title: "StreamingServices", file: "streamingServices.mysql" },
    { title: "Events", file: "events.mysql" },
    { title: "Event Exceptions", file: "eventExceptions.mysql" }
  ]

  await initTables("Content", taskTables);
};


const initTables = async (displayName: string, tables: { title: string, file: string }[]) => {
  console.log("");
  console.log("SECTION: " + displayName);
  for (const table of tables) await DBCreator.runScript(table.title, "./tools/dbScripts/" + table.file, false);
}

init()
  .then(() => { console.log("Database Created"); process.exit(0); })
  .catch((ex) => {
    console.log(ex);
    console.log("Database not created due to errors");
    process.exit(0);
  });
