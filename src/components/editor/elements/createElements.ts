import { nanoid } from "nanoid";

import {
  Element,
  GenericElement,
  LinearElement,
  MarkOptional,
  TextElement,
} from "../types";

// make width, height, and other properties optional when creating element because we don't know them yet
type Options<T extends Element> = MarkOptional<
  T,
  "width" | "height" | "id" | "selected"
>;

// Rectangle, Ellipse, and Selection are generic because they contain the same properties (x, y, width, and height)
export function createGenericElement(
  options: Options<GenericElement>
): GenericElement {
  return createElementBase<GenericElement>(options);
}

export function createTextElement(options: Options<TextElement>): TextElement {
  return {
    ...createElementBase<TextElement>(options),
    text: options.text,
  };
}

export function createLinearElement(
  options: Options<LinearElement>
): LinearElement {
  return {
    ...createElementBase<LinearElement>(options),
    points: options.points,
    // points: [
    //   [options.x, options.y],
    //   [0, 0],
    // ],
  };
}

function createElementBase<T extends Element>({
  shape_type,
  x,
  y,
  id = nanoid(10),
  width = 0,
  height = 0,
  selected = false,
}: {
  shape_type: T["shape_type"];
  x: number;
  y: number;
  id?: string;
  width?: number;
  height?: number;
  selected?: boolean;
}) {
  return {
    shape_type,
    x,
    y,
    id,
    width,
    height,
    selected,
  };
}
