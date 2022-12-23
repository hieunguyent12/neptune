import { nanoid } from "nanoid";
import { RoughCanvas } from "roughjs/bin/canvas";

import {
  Element,
  GenericElement,
  LinearElement,
  MarkOptional,
  TextElement,
} from "../types";
import { getRectCoordinates } from "../utils";

// make width, height, and other properties optional when creating element because we don't know them yet
type Options<T extends Element> = MarkOptional<
  T,
  "width" | "height" | "id" | "selected"
>;

export class ElementUtils {
  static canvas: HTMLCanvasElement;
  static roughCanvas: RoughCanvas;

  // Rectangle, Ellipse, and Selection are generic because they contain the same properties (x, y, width, and height)
  static createGenericElement(options: Options<GenericElement>) {
    return createElementBase<GenericElement>(options);
  }

  static createLinearElement(options: Options<LinearElement>) {
    return {
      ...createElementBase<LinearElement>(options),
      points: options.points,
    };
  }

  static createTextElement(options: Options<TextElement>) {
    return {
      ...createElementBase<TextElement>(options),
      text: options.text,
    };
  }

  static drawElements(elements: { [key: string]: Element }) {
    const rc = ElementUtils.roughCanvas;
    const canvas = ElementUtils.canvas;

    if (rc && canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      Object.keys(elements).forEach((elementKey) => {
        const element = elements[elementKey];

        if (element.shape_type === "rectangle") {
          rc.rectangle(element.x, element.y, element.width, element.height, {
            roughness: 2,
            fill: "red",
            seed: 1,
          });
        }

        if (element.shape_type === "ellipse") {
          rc.ellipse(
            element.x + element.width / 2,
            element.y + element.height / 2,
            element.width,
            element.height,
            {
              roughness: 2,
              fill: "green",
              seed: 1,
            }
          );
        }

        if (element.shape_type === "linear") {
          rc.line(
            element.points[0][0],
            element.points[0][1],
            element.points[1][0],
            element.points[1][1],
            {
              roughness: 2,
              seed: 1,
            }
          );
        }

        if (element.shape_type === "selection") {
          rc.rectangle(element.x, element.y, element.width, element.height, {
            seed: 1,
          });
        }

        if (element.shape_type === "text") {
          const texts = element.text.split("\n");

          if (ctx) {
            ctx.font = "16px serif";
            const lineHeight = ctx.measureText("M").width * 1.2;

            texts.forEach((text, i) => {
              ctx.fillText(text, element.x, element.y + i * lineHeight);
            });
          }
        }

        if (element.selected) {
          if (element.shape_type === "text") {
            rc.rectangle(
              element.x - 10,
              element.y - 20,
              element.width + 20,
              element.height + 20,
              {
                seed: 1,
              }
            );
          } else if (element.shape_type === "linear") {
            const x1 = element.points[0][0];
            const x2 = element.points[1][0];

            const y1 = element.points[0][1];
            const y2 = element.points[1][1];

            const _x1 = x2 > x1 ? x1 : x2;
            const _x2 = x2 > x1 ? x2 : x1;

            const _y1 = y2 > y1 ? y1 : y2;
            const _y2 = y2 > y1 ? y2 : y1;

            rc.rectangle(_x1 - 10, _y1 - 10, _x2 - _x1 + 20, _y2 - _y1 + 20, {
              seed: 1,
            });
          } else {
            const coords = getRectCoordinates(element);

            rc.rectangle(
              coords.x1 - 10,
              coords.y1 - 10,
              coords.x2 - coords.x1 + 20,
              coords.y2 - coords.y1 + 20,
              {
                seed: 1,
              }
            );
          }
        }
      });
    } else {
      throw new Error("Rough Canvas and Canvas are not defined");
    }
  }
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
