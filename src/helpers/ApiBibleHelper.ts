import axios from "axios";
import { Environment } from "./Environment";
import { BibleBook, BibleChapter, BibleTranslation, BibleVerse, BibleVerseText } from "../models";

export class ApiBibleHelper {
  static baseUrl: string = "https://api.scripture.api.bible/v1";

  static async getTranslations() {
    const result: BibleTranslation[] = [];
    const url = this.baseUrl + "/bibles";
    const data = await this.getContent(url);

    data.data.forEach((d: any) => {
      result.push({
        name: d.name,
        abbreviation: d.abbreviation,
        language: d.language.id,
        source: "bible.api",
        sourceKey: d.id
      });
    });
    return result;
  }

  static async getBooks(translationKey: string) {
    const result: BibleBook[] = [];
    const url = this.baseUrl + "/bibles/" + translationKey + "/books";
    const data = await this.getContent(url);

    data.data.forEach((d: any, i: number) => {
      result.push({
        translationKey,
        keyName: d.id,
        abbreviation: d.abbreviation,
        name: d.name,
        sort: i
      });
    });
    return result;
  }

  static async getChapters(translationKey: string, bookKey: string) {
    const result: BibleChapter[] = [];
    const url = this.baseUrl + "/bibles/" + translationKey + "/books/" + bookKey + "/chapters";
    const data = await this.getContent(url);

    data.data.forEach((d: any) => {
      result.push({
        translationKey,
        bookKey,
        keyName: d.id,
        number: parseInt(d.number, 0) || 0
      });
    });
    return result;
  }

  static async getVerses(translationKey: string, chapterKey: string) {
    const result: BibleVerse[] = [];
    const url = this.baseUrl + "/bibles/" + translationKey + "/chapters/" + chapterKey + "/verses";
    const data = await this.getContent(url);

    data.data.forEach((d: any) => {
      const parts = d.id.split(".");
      result.push({
        translationKey,
        chapterKey,
        keyName: d.id,
        number: parseInt(parts[parts.length - 1], 0) || 0
      });
    });
    return result;
  }


  static async getVerseText(translationKey: string, startVerseKey: string, endVerseKey: string) {
    const url = this.baseUrl + "/bibles/" + translationKey + "/verses/" + startVerseKey + "-" + endVerseKey
      + "?content-type=json&include-titles=false&include-verse-numbers=false";
    const data = await this.getContent(url);
    const result: BibleVerseText[] = [];
    data.data.content.forEach((c: any) => {
      c.items.forEach((i: any, idx: number) => {
        if (i.attrs?.verseId) {
          const parts = i.attrs.verseId.split(".");
          const verse = parseInt(parts[parts.length - 1], 0) || 0;
          if (verse > 0) {
            result.push({
              translationKey,
              verseKey: i.attrs.verseId,
              verseNumber: verse,
              content: i.text.trim(),
              newParagraph: c.name === "para" && idx === 0
            });
          }
        }
      })
    });
    return result;
  }


  static async getContent(url: string) {
    const resp = await axios.get(url, {
      headers: { "api-key": Environment.apiBibleKey }
    });
    const json: any = resp.data;
    return json;
  }


}

