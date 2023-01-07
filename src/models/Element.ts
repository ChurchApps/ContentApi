export class Element {
  public id?: string;
  public churchId?: string;
  public sectionId?: string;
  public blockId?: string;
  public elementType?: string;
  public sort?: number;
  public parentId?: string;
  public answersJSON?: string;

  public answers?: any[];
  public elements?: Element[];
}