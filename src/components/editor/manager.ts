// the manager is responsible for handling actions on the editor such as drawing, selecting or removing elements

import { RoughCanvas } from "roughjs/bin/canvas";

import { Maybe } from "../../types/common";
import { Element, MarkOptional } from "./types";
import { getRectCoordinates } from "./utils";

// make width, height, and other properties optional when creating element because we don't know them yet
type Options<T extends Element> = MarkOptional<
  T,
  "width" | "height" | "id" | "selected"
>;

class Manager {
  // keep track of the current element that the user is interacting with
  public currentElement: Maybe<Element> = null;

  private elements: { [key: string]: Element } = {};

  private rc!: RoughCanvas;
  private canvas!: HTMLCanvasElement;

  constructor(rc: RoughCanvas, canvas: HTMLCanvasElement) {
    this.rc = rc;
    this.canvas = canvas;
  }

  /*
  =============
  ELEMENTS
  =============  
  */
  public addElement(newElement: Element) {
    this.elements[newElement.id] = newElement;
  }

  public setCurrentElement(element: Element) {
    this.currentElement = element;
  }

  public deleteElement(id: string) {
    delete this.elements[id];
  }

  public getAllElements() {
    return this.elements;
  }

  public getElementById(id: string): Element | undefined {
    return this.elements[id];
  }

  public replaceAllElements(elements: { [key: string]: Element }) {
    this.elements = elements;
  }

  public updateElementById(id: string, updatedElement: Element): void {
    if (this.getElementById(id)) {
      this.elements[id] = {
        ...this.elements[id],
        ...updatedElement,
      };
    }
  }

  public drawElements() {
    const ctx = this.canvas.getContext("2d");
    ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    Object.keys(this.elements).forEach((elKey) => {
      const element = this.elements[elKey];

      if (element.shape_type === "selection") {
        this.rc.rectangle(element.x, element.y, element.width, element.height, {
          seed: 1,
        });
      }

      if (element.shape_type === "rectangle") {
        this.rc.rectangle(element.x, element.y, element.width, element.height, {
          roughness: 2,
          fill: "red",
          seed: 1,
        });
      }

      if (element.shape_type === "ellipse") {
        this.rc.ellipse(
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
        this.rc.line(
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

      if (element.shape_type === "text") {
        const texts = element.text.split("\n");

        const ctx = this.canvas.getContext("2d");

        if (ctx) {
          ctx.font = "15px serif";
          const lineHeight = ctx.measureText("M").width * 1.2;

          // console.log(lineHeight);

          texts.forEach((text, i) => {
            ctx.fillText(text, element.x, element.y + i * lineHeight);
          });
        }
      }

      if (element.selected) {
        if (element.shape_type === "linear") {
          const x1 = element.points[0][0];
          const x2 = element.points[1][0];

          const y1 = element.points[0][1];
          const y2 = element.points[1][1];

          const _x1 = x2 > x1 ? x1 : x2;

          // right x
          const _x2 = x2 > x1 ? x2 : x1;

          const _y1 = y2 > y1 ? y1 : y2;
          const _y2 = y2 > y1 ? y2 : y1;

          this.rc.rectangle(
            _x1 - 10,
            _y1 - 10,
            _x2 - _x1 + 20,
            _y2 - _y1 + 20,
            {
              seed: 1,
            }
          );
        } else if (element.shape_type === "text") {
          this.rc.rectangle(
            element.x - 10,
            element.y - 20,
            element.width + 20,
            element.height + 20,
            {
              seed: 1,
            }
          );
        } else {
          const coords = getRectCoordinates(element);

          this.rc.rectangle(
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
  }
}
// const singleton = new Manager();

export default Manager;
