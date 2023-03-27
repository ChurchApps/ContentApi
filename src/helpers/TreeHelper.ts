import { Section, Element } from "../models";
import { ArrayHelper } from "../apiBase";
import { Repositories } from "../repositories";

export class TreeHelper {

  private static getChildElements(element: Element, allElements: Element[]) {
    const children = ArrayHelper.getAll(allElements, "parentId", element.id);
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

  static populateAnswers(elements: Element[]) {
    elements.forEach(e => {
      try {
        e.answers = JSON.parse(e.answersJSON);
      }
      catch {
        e.answers = [];
      }
      if (!e.answers) e.answers = [];
    })
  }

  static populateAnswersSections(sections: Section[]) {
    sections.forEach(e => {
      try {
        e.answers = JSON.parse(e.answersJSON);
      }
      catch {
        e.answers = [];
      }
      if(!e.answers) e.answers = [];
    })
  }

}