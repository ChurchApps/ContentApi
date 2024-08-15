import { Section, Element } from "../models";
import { ArrayHelper } from "@churchapps/apihelper";
import { Repositories } from "../repositories";

export class TreeHelper {

  public static getChildElements(element: Element, allElements: Element[]) {
    const children = ArrayHelper.getAll(allElements, "parentId", element.id);
    if (element.elementType==="row") console.log("Children for row - ", element.id, children.length)
    if (children.length > 0) {
      element.elements = children;
      element.elements.forEach(e => { this.getChildElements(e, allElements); });
    }
  }

  static buildTree(sections: Section[], allElements: Element[]) {
    const result = sections;
    result.forEach(s => {
      s.elements = ArrayHelper.getAll(ArrayHelper.getAll(allElements, "sectionId", s.id), "parentId", null);
      s.elements.forEach(e => { this.getChildElements(e, allElements); });
    })
    return result;
  }

  static async insertBlocks(sections: Section[], allElements: Element[], churchId: string) {
    const blockIds: string[] = [];
    sections.forEach(s => { if (s.targetBlockId) blockIds.push(s.targetBlockId) });
    allElements.forEach(e => { if (e.answers.targetBlockId) blockIds.push(e.answers.targetBlockId); });
    if (blockIds.length > 0) {
      const allBlockSections = await Repositories.getCurrent().section.loadForBlocks(churchId, blockIds);
      const allBlockElements = await Repositories.getCurrent().element.loadForBlocks(churchId, blockIds);
      this.populateAnswers(allBlockElements);
      this.populateAnswers(allBlockSections);

      allElements.forEach(e => {
        if (e.answers?.targetBlockId) {
          const blockSections: Section[] = [{ id: "" }]
          const blockElements = ArrayHelper.getAll(allBlockElements, "blockId", e.answers?.targetBlockId);
          const tree = this.buildTree(blockSections, blockElements);
          e.elements = tree[0].elements;
        }
      })

      sections.forEach(s => {
        if (s.targetBlockId) {
          const blockSections = ArrayHelper.getAll(allBlockSections, "blockId", s.targetBlockId);
          const blockElements = ArrayHelper.getAll(allBlockElements, "blockId", s.targetBlockId);
          const tree = this.buildTree(blockSections, blockElements);
          s.sections = tree;
        }
      })

    }
  }

  static populateAnswers(items: Element[] | Section[]) {
    items.forEach(e => {
      try {
        e.answers = JSON.parse(e.answersJSON);
        e.styles = JSON.parse(e.stylesJSON);
      }
      catch {
        e.answers = {};
        e.styles = {};
      }
      if (!e.answers) e.answers = {};
      if (!e.styles) e.styles = {};
    })
  }

  static async duplicateSection(section:Section) {
    const sec = {...section};
    sec.id = undefined;
    const result = await Repositories.getCurrent().section.save(sec);
    const promises:Promise<Element>[] = [];
    sec.elements?.forEach(e => {
      promises.push(this.duplicateElement(e, result.id, null));
    });
    await Promise.all(promises);
    return result;
  }

  static async duplicateElement(element: Element, sectionId: string, parentId: string) {
    const el = {...element};
    el.id = undefined;
    el.sectionId = sectionId;
    el.parentId = parentId;
    // el.sort = element.sort + 1;
    const result = await Repositories.getCurrent().element.save(el);
    const promises:Promise<Element>[] = [];
    el.elements?.forEach(e => {
      promises.push(this.duplicateElement(e, sectionId, result.id));
    });
    await Promise.all(promises);
    return result;
  }

}