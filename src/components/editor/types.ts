import { SHAPES } from "./constants";

export type SHAPE_TYPES = typeof SHAPES;
export type SHAPE = ValueOf<SHAPE_TYPES>;

type BaseElement = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  selected: boolean;
};

// generic elements share the same properties
export type GenericElement =
  | RectangleElement
  | EllipseElement
  | SelectionElement;

export type Element = GenericElement | LinearElement | TextElement;

export type RectangleElement = BaseElement & {
  shape_type: SHAPE_TYPES["RECTANGLE"];
};

export type EllipseElement = BaseElement & {
  shape_type: SHAPE_TYPES["ELLIPSE"];
};

export type SelectionElement = BaseElement & {
  shape_type: SHAPE_TYPES["SELECTION"];
};

export type LinearElement = BaseElement & {
  shape_type: SHAPE_TYPES["LINEAR"];
  points: [Point, Point];
};

export type TextElement = BaseElement & {
  shape_type: SHAPE_TYPES["TEXT"];
  text: string;
};

type ValueOf<T> = T[keyof T];

export type MarkOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type Point = [number, number];
