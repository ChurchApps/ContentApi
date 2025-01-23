import "reflect-metadata";
import dotenv from "dotenv";
import { Environment } from "../src/helpers/Environment";
import { Pool, DBCreator } from "@churchapps/apihelper";


const init = async () => {
  dotenv.config();
  await Environment.init(process.env.APP_ENV?.toString() || "");
  console.log("Connecting");
  Pool.initPool();

  const taskTables: { title: string, file: string }[] = [
    { title: "Blocks", file: "blocks.mysql" },
    { title: "Elements", file: "elements.mysql" },
    { title: "GlobalStyles", file: "globalStyles.mysql" },
    { title: "Pages", file: "pages.mysql" },
    { title: "Sections", file: "sections.mysql" },
    { title: "Playlists", file: "playlists.mysql" },
    { title: "Sermons", file: "sermons.mysql" },
    { title: "StreamingServices", file: "streamingServices.mysql" },
    { title: "Events", file: "events.mysql" },
    { title: "Event Exceptions", file: "eventExceptions.mysql" },
    { title: "Curated Calendars", file: "curatedCalendars.mysql" },
    { title: "Curated Events", file: "curatedEvents.mysql" },
    { title: "Links", file: "links.mysql" },
    { title: "Settings", file: "settings.mysql" },
  ]

  const bibleTables: { title: string, file: string }[] = [
    { title: "Translations", file: "bibleTranslations.mysql" }
  ]

  await initTables("Content", taskTables);
  await initTables("Bible", bibleTables);
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
