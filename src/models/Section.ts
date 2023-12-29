import { Element } from "./Element";

export class Section {
  public id?: string;
  public churchId?: string;
  public pageId?: string;
  public blockId?: string;
  public zone?: string;
  public background?: string;
  public textColor?: string;
  public headingColor?: string;
  public sort?: number;
  public targetBlockId?: string;
  public answersJSON?: string;
  public stylesJSON?: string;

  public answers?: any;
  public styles?: any;
  public elements?: Element[];
  public sections?: Section[];
}
