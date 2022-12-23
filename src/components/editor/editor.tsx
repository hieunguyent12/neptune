import { useState, useRef, MouseEvent, useEffect } from "react";
// TODO for some reason we can't use "import rough from 'roughjs'", also typescript doesn't work with rough??
// @ts-ignore
import rough from "roughjs/bundled/rough.cjs";
import { RoughCanvas } from "roughjs/bin/canvas";

import { SHAPES } from "./constants";
import { SHAPE, Element } from "./types";
import ShapeOption from "./components/shape-option";
import CanvasTextEditor from "./components/canvas-text-editor";
import { ElementUtils } from "./elements";
import { useInitState } from "./hooks/useInitState";
import { useCanvasDimensions } from "./hooks/useCanvasDimensions";
import { getRectCoordinates, getLinearCoordinates } from "./utils";
import { EditorStateContext, useEditorState } from "./context";

type EditorProps = {
  canvasJSON?: string;
};

function _Editor({ canvasJSON = "" }: EditorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const roughCanvasRef = useRef<RoughCanvas | null>(null);
  const mousePos = useRef({
    x: 0,
    y: 0,
  });

  const {
    editorState,
    updateEditorState,
    updateElement,
    getActiveElement,
    removeElement,
  } = useEditorState();

  const canvasDimensions = useCanvasDimensions();

  const renderShapeOptions = () => {
    return Object.values(SHAPES).map((shape) => (
      <ShapeOption
        key={shape}
        shape={shape as SHAPE}
        onSelectShape={(_shape) => updateEditorState({ activeShape: _shape })}
      />
    ));
  };

  const renderTextEditor = () => {
    if (!editorState.activeElementId) return;

    const activeElement = getActiveElement();

    if (activeElement && activeElement.shape_type === "text") {
      return (
        <CanvasTextEditor
          x={mousePos.current.x}
          y={mousePos.current.y}
          id={activeElement.id}
        />
      );
    }
  };

  const onMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    mousePos.current.x = e.pageX;
    mousePos.current.y = e.pageY;

    if (!editorState.activeElementId || !editorState.isDrawing) return;

    const activeElement = editorState.elements[editorState.activeElementId];

    if (isGenericElement(editorState.activeShape)) {
      const newWidth = e.nativeEvent.offsetX - activeElement.x;
      const newHeight = e.nativeEvent.offsetY - activeElement.y;

      updateElement({
        id: editorState.activeElementId,
        width: newWidth,
        height: newHeight,
      });

      if (
        editorState.activeShape === "selection" &&
        activeElement.shape_type === "selection"
      ) {
        // highlight selected elements
        const coordsOfSelection = getRectCoordinates(activeElement);

        Object.keys(editorState.elements).forEach((elementKey) => {
          const element = editorState.elements[elementKey];

          if (element && element.shape_type !== "selection") {
            let coordsOfCurrentElement!: ReturnType<typeof getRectCoordinates>;

            if (element.shape_type === "linear") {
              coordsOfCurrentElement = getLinearCoordinates(element);
            } else {
              coordsOfCurrentElement = getRectCoordinates(element);
            }

            if (
              isElementInSelectionBounds(
                coordsOfCurrentElement,
                coordsOfSelection
              )
            ) {
              updateElement({
                id: element.id,
                selected: true,
              });
            } else {
              updateElement({
                id: element.id,
                selected: false,
              });
            }
          }
        });
      }

      ElementUtils.drawElements(editorState.elements);
    } else if (
      editorState.activeShape === "linear" &&
      activeElement.shape_type === "linear"
    ) {
      updateElement({
        id: editorState.activeElementId,
        points: [
          [activeElement.points[0][0], activeElement.points[0][1]],
          [e.nativeEvent.offsetX, e.nativeEvent.offsetY],
        ],
      });

      ElementUtils.drawElements(editorState.elements);
    }
  };

  const onMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    let newElement!: Element;

    switch (editorState.activeShape) {
      case "ellipse":
      case "rectangle":
      case "selection":
        newElement = ElementUtils.createGenericElement({
          x: e.nativeEvent.offsetX,
          y: e.nativeEvent.offsetY,
          shape_type: editorState.activeShape,
        });

        updateEditorState({
          activeElementId: newElement.id,
          isDrawing: true,
        });

        break;
      case "text":
        if (editorState.isEditingText) return;

        newElement = ElementUtils.createTextElement({
          x: e.nativeEvent.offsetX,
          y: e.nativeEvent.offsetY,
          shape_type: editorState.activeShape,
          text: "",
        });

        updateEditorState(
          {
            activeElementId: newElement.id,
            isEditingText: true,
          },
          true
        );

        break;
      case "linear":
        newElement = ElementUtils.createLinearElement({
          x: e.nativeEvent.offsetX,
          y: e.nativeEvent.offsetY,
          shape_type: editorState.activeShape,
          // starts out as a dot
          points: [
            [e.nativeEvent.offsetX, e.nativeEvent.offsetY],
            [e.nativeEvent.offsetX, e.nativeEvent.offsetY],
          ],
        });

        updateEditorState(
          {
            activeElementId: newElement.id,
            isDrawing: true,
          },
          true
        );
        break;
      default:
        break;
    }

    if (newElement) {
      // updateElement will automically create the element for us
      updateElement({
        ...newElement,
      });
    }
  };

  const onMouseUp = (e: MouseEvent<HTMLCanvasElement>) => {
    if (editorState.isDrawing) {
      updateEditorState({
        isDrawing: false,
      });

      if (
        editorState.activeShape === "selection" &&
        editorState.activeElementId
      ) {
        // delete the selection element
        Object.keys(editorState.elements).forEach((key) => {
          const el = editorState.elements[key];
          if (el && el.shape_type === "selection") {
            removeElement(key);
          }
        });

        updateEditorState({
          activeElementId: null,
        });

        ElementUtils.drawElements(editorState.elements);
      }
    }
  };

  const onDoubleClick = (e: MouseEvent<HTMLCanvasElement>) => {
    if (editorState.activeShape === "selection") {
      let newElement = ElementUtils.createTextElement({
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
        shape_type: "text",
        text: "",
      });

      updateEditorState(
        {
          activeElementId: newElement.id,
          isEditingText: true,
          isDrawing: false,
        },
        true
      );

      updateElement({
        ...newElement,
      });
    }
  };

  return (
    <div className="editor-container">
      <button onClick={() => console.log(editorState.elements)}>
        log state
      </button>
      {renderShapeOptions()}

      <div className="text-editor">
        {editorState.isEditingText && renderTextEditor()}
      </div>

      <canvas
        ref={(el) => {
          if (el) {
            canvasRef.current = el;
            roughCanvasRef.current = rough.canvas(el);
            ElementUtils.canvas = el;
            ElementUtils.roughCanvas = rough.canvas(el);
          }
        }}
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        onDoubleClick={onDoubleClick}
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      ></canvas>
    </div>
  );
}

const Editor = () => {
  const editorState = useInitState();

  return (
    <EditorStateContext.Provider value={editorState}>
      <_Editor />
    </EditorStateContext.Provider>
  );
};

function isGenericElement(shape: SHAPE) {
  return shape === "rectangle" || shape === "ellipse" || shape === "selection";
}

function isElementInSelectionBounds<
  T extends ReturnType<typeof getRectCoordinates>
>(coordsOfCurrentElement: T, coordsOfSelection: T) {
  return (
    coordsOfCurrentElement.x1 >= coordsOfSelection.x1 &&
    coordsOfCurrentElement.x2 <= coordsOfSelection.x2 &&
    coordsOfCurrentElement.y1 >= coordsOfSelection.y1 &&
    coordsOfCurrentElement.y2 <= coordsOfSelection.y2
  );
}

export default Editor;
