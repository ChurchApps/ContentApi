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
    if (blockIds.length > 0) {
      const allBlockSections = await Repositories.getCurrent().section.loadForBlocks(churchId, blockIds);
      const allBlockElements = await Repositories.getCurrent().element.loadForBlocks(churchId, blockIds);
      this.populateAnswers(allBlockElements);

      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].targetBlockId) {
          const blockSections = ArrayHelper.getAll(allBlockSections, "blockId", sections[i].targetBlockId);
          const blockElements = ArrayHelper.getAll(allBlockElements, "blockId", sections[i].targetBlockId);
          const tree = this.buildTree(blockSections, blockElements);
          tree.forEach(s => s.sourceId = sections[i].id)
          sections.splice(i, 1, ...tree);
        }
      }
    }
    // return sections;
  }

  static populateAnswers(elements: Element[]) {
    elements.forEach(e => {
      try {
        e.answers = JSON.parse(e.answersJSON);
      }
      catch {
        e.answers = [];
      }
    })
  }

}