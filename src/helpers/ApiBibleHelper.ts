import axios from "axios";
import { Environment } from "./Environment";
import { BibleBook, BibleTranslation } from "../models";
import { Repositories } from "../repositories";
import { ArrayHelper } from "@churchapps/apihelper";

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

  /*Start old code*/

  static async getContent(url: string) {
    console.log(url, { "api-key": Environment.apiBibleKey })

    const resp = await axios.get(url, {
      headers: { "api-key": Environment.apiBibleKey }
    });


    const json: any = resp.data;
    return json;
  }


  static async bible(bibleId: string) {
    const url = this.baseUrl + "/bibles/" + bibleId;
    const data = await this.getContent(url);
    const d = data.data;
    const result = {
      id: d.id,
      name: d.name,
      abbreviation: d.abbreviation,
      language: d.language.id,
      copyright: d.copyright
    };
    return result;
  }

  static async books(bibleId: string) {
    const url = this.baseUrl + "/bibles/" + bibleId + "/books";
    const data = await this.getContent(url);
    const result: any[] = [];
    let i = 1;
    data.data.forEach((d: any) => {
      result.push({
        id: d.id,
        number: i,
        name: d.name,
      });
      i++;
    });
    return result;
  }

  static async chapters(bibleId: string, bookId: string) {
    const url = this.baseUrl + "/bibles/" + bibleId + "/books/" + bookId + "/chapters";
    const data = await this.getContent(url);
    const result: any[] = [];
    data.data.forEach((d: any) => {
      if (parseInt(d.number, 0) > 0) {
        result.push({
          id: d.id,
          number: parseInt(d.number, 0)
        });
      }
    });
    return result;
  }

  static async verses(bibleId: string, chapterId: string) {
    const url = this.baseUrl + "/bibles/" + bibleId + "/chapters/" + chapterId + "/verses";
    const data = await this.getContent(url);
    const result: any[] = [];
    data.data.forEach((d: any) => {
      const parts = d.id.split(".");
      const verse = parseInt(parts[parts.length - 1], 0);
      if (verse > 0) {
        result.push({
          id: d.id,
          number: verse
        });
      }
    });
    return result;
  }

  static async passages(bibleId: string, chapterId: string) {
    const url = this.baseUrl + "/bibles/" + bibleId + "/passages/" + chapterId
      + "?content-type=json&include-titles=false&include-verse-numbers=false";
    const data = await this.getContent(url);
    const result: any[] = [];
    data.data.content.forEach((c: any) => {
      c.items.forEach((i: any, idx: number) => {
        if (i.attrs?.verseId) {
          const parts = i.attrs.verseId.split(".");
          const verse = parseInt(parts[parts.length - 1], 0);
          if (verse > 0) {
            result.push({
              id: i.attrs.verseId,
              number: verse,
              text: i.text.trim(),
              newParagraph: c.name === "para" && idx === 0
            });
          }
        }
      })
    });
    return result;
  }
  /*
    static async import(abbreviation: string) {
      console.log("Importing Bible", new Date().toISOString());

      const bibles = await this.getTranslations();
      console.log("Bibles", bibles);
      const bible = ArrayHelper.getOne(bibles, "abbreviation", abbreviation);
      if (!bible) throw new Error("Bible not found: " + abbreviation);
      const bibleId = bible.id;

      const saveTranslation: BibleTranslation = {
        name: bible.name,
        abbreviation: bible.abbreviation,
        source: "bible.api",
        sourceKey: bible.id,
        language: bible.language
      }
      await Repositories.getCurrent().bibleTranslation.save(saveTranslation);

      // const bible = await ApiBibleHelper.bible(bibleId);
      const books = await ApiBibleHelper.books(bible.id);



      const result: any = {
        name: bible.name,
        metadata: { publisher: bible.copyright },
        books: []
      }

      let i = 0;
      for (const book of books) {
        i++;
        // const book = books[0];
        const b: any = {
          number: book.number,
          name: book.name,
          chapters: []
        }
        result.books.push(b);



        const chapters = await ApiBibleHelper.chapters(bibleId, book.id);
        for (const chapter of chapters) {
          const c: any = {
            number: chapter.number,
            verses: []
          }
          b.chapters.push(c);

          const versePromises: Promise<any>[] = [];
          const passages = await ApiBibleHelper.passages(bibleId, chapter.id);
          for (const passage of passages) {
            const v: any = {
              number: passage.number,
              text: passage.text,
              newParagraph: passage.newParagraph
            }


            const saveVerse = {
              book: book.id,
              translation: abbreviation,
              chapter: c.number,
              verse: v.number,
              content: v.text,
              newParagraph: v.newParagraph
            }

            versePromises.push(Repositories.getCurrent().bibleVerse.save(saveVerse));



            c.verses.push(v);
          }
          console.log("SAVING", book.id + " " + c.number);
          await Promise.all(versePromises);

        }

      }
      */
  /*
      const toSave:Bible = {
        source: "bible.api",
        sourceKey: bibleId,
        name: result.name,
        abbreviation: bible.abbreviation,
        content: JSON.stringify(result)
      }
      await Repositories.getCurrent().bible.save(toSave);
      */
  /*
      for (const book of books) {
        for (const chapter of book.chapters) {
          for (const verse of chapter.verses) {

            const saveVerse = {
              book: book.abbreviation,
              chapter: chapter.number,
              verse: verse.number,
              content: verse.text,
              newParagraph: verse.newParagraph
            }
            await Repositories.getCurrent().verse.save(saveVerse);
          }
        }
      }
  */
  // console.log("Import Complete", new Date().toISOString());
}

