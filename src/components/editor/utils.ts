import { Element, LinearElement } from "./types";
/*

  Coordinates of a rectangle

  (x1, y1) ------ (x2, y1)
  |                      |
  |                      |
  |                      |
  (x1, y2) ------ (x2, y2)

*/
export function getRectCoordinates(element: Element) {
  const coordinates = {
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
  };

  // negative width means that the rectangle was drawn from right to left
  // to find the upper left point (x1), we take its original position on x and substract the width (which equates to adding negative width)
  coordinates.x1 = element.width >= 0 ? element.x : element.x + element.width;
  coordinates.x2 = element.width >= 0 ? element.x + element.width : element.x;

  // TODO: there are cases where element.y + element.height will equal to 0 which we want to avoid.
  coordinates.y1 = element.height >= 0 ? element.y : element.y + element.height;
  coordinates.y2 = element.height >= 0 ? element.y + element.height : element.y;

  return coordinates;
}

export function getLinearCoordinates(element: LinearElement) {
  const coordinates = {
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
  };

  const x1 = element.points[0][0];
  const x2 = element.points[1][0];

  const y1 = element.points[0][1];
  const y2 = element.points[1][1];

  coordinates.x1 = x2 > x1 ? x1 : x2;
  coordinates.x2 = x2 > x1 ? x2 : x1;
  coordinates.y1 = y2 > y1 ? y1 : y2;
  coordinates.y2 = y2 > y1 ? y2 : y1;

  return coordinates;
}
