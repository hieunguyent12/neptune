// excalidraw on steroids!
import { useState, MouseEvent, useRef, useEffect } from "react";
import { RoughCanvas } from "roughjs/bin/canvas";

// TODO for some reason we can't use "import rough from 'roughjs'", also typescript doesn't work with rough??
// @ts-ignore
import rough from "roughjs/bundled/rough.cjs";

import ShapeOption from "./components/shape-option";
import { Maybe } from "../../types/common";
import { SHAPES } from "./constants";
import { SHAPE, Element } from "./types";
import {
  createGenericElement,
  createLinearElement,
  createTextElement,
} from "./elements/createElements";
import { getRectCoordinates } from "./utils";

import Manager from "./manager";

export default function Editor() {
  const [_editorManager, setEditorManager] = useState<Maybe<Manager>>(null);
  const editorManager = _editorManager!;

  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [activeElement, setActiveElement] = useState<Maybe<Element>>(null);
  const canvasRef = useRef<Maybe<HTMLCanvasElement>>(null);
  const roughCanvasRef = useRef<Maybe<RoughCanvas>>(null);

  const [activeShape, setActiveShape] = useState<Maybe<SHAPE>>(null);

  const [showTextEditor, setShowTextEditor] = useState(false);
  const textEditorRef = useRef<Maybe<HTMLDivElement>>(null);
  const textEditorInputRef = useRef<Maybe<HTMLTextAreaElement>>(null);

  const [mousePos, setMousePos] = useState({
    x: 0,
    y: 0,
  });

  const onMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!activeShape) return;

    let newElement!: Element;

    const options = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    };

    // create a new element immediately
    switch (activeShape) {
      case "rectangle":
      case "selection":
      case "ellipse":
        newElement = createGenericElement({
          ...options,
          shape_type: activeShape,

          width: 0,
          height: 0,
        });
        break;

      case "linear":
        newElement = createLinearElement({
          ...options,
          shape_type: activeShape,
          points: [
            [options.x, options.y],
            [options.x, options.y],
          ],
        });
        break;
      case "text":
        newElement = createTextElement({
          ...options,
          x: e.clientX,
          y: e.clientY,
          shape_type: activeShape,
          text: "",
        });
        // console.log(e.clientX, e.clientY);
        setShowTextEditor(true);
        setMousePos({
          x: e.clientX,
          y: e.clientY,
        });
        break;
      default:
        break;
    }

    if (newElement) {
      editorManager.addElement(newElement);

      // TODO: Think about whether or not this component should be responsible for keeping track of the current element
      editorManager.setCurrentElement(newElement);
      setActiveElement(newElement);

      editorManager.drawElements();
    }
  };

  const onMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    // if there is an active dragging element, we update its width and height according to the current mouse position

    if (!editorManager) return;

    if (activeElement && activeElement.shape_type !== "text") {
      if (activeElement.shape_type === "linear") {
        editorManager.updateElementById(activeElement.id, {
          ...activeElement,
          points: [
            [activeElement.points[0][0], activeElement.points[0][1]],
            [e.nativeEvent.offsetX, e.nativeEvent.offsetY],
          ],
        });
      } else {
        const newWidth = e.nativeEvent.offsetX - activeElement.x;
        const newHeight = e.nativeEvent.offsetY - activeElement.y;

        editorManager.updateElementById(activeElement.id, {
          ...activeElement,
          width: newWidth,
          height: newHeight,
        });

        if (activeElement.shape_type === "selection") {
          Object.keys(editorManager.getAllElements()).forEach((elKey) => {
            const element = editorManager.getElementById(elKey);

            if (element && element.shape_type !== "selection") {
              const selectionCoords = getRectCoordinates(
                editorManager.getElementById(activeElement.id) as Element
              );
              if (
                element.shape_type === "rectangle" ||
                element.shape_type === "ellipse" ||
                element.shape_type === "text"
              ) {
                const coords = getRectCoordinates(element);

                if (
                  coords.x1 >= selectionCoords.x1 &&
                  coords.x2 <= selectionCoords.x2 &&
                  coords.y1 >= selectionCoords.y1 &&
                  coords.y2 <= selectionCoords.y2
                ) {
                  editorManager.updateElementById(element.id, {
                    ...element,
                    selected: true,
                  });
                } else {
                  editorManager.updateElementById(element.id, {
                    ...element,
                    selected: false,
                  });
                }
              }

              if (element.shape_type === "linear") {
                const x1 = element.points[0][0];
                const x2 = element.points[1][0];

                const y1 = element.points[0][1];
                const y2 = element.points[1][1];

                // get the left x
                const _x1 = x2 > x1 ? x1 : x2;

                // right x
                const _x2 = x2 > x1 ? x2 : x1;

                const _y1 = y2 > y1 ? y1 : y2;
                const _y2 = y2 > y1 ? y2 : y1;

                if (
                  _x1 >= selectionCoords.x1 &&
                  _x2 <= selectionCoords.x2 &&
                  _y1 >= selectionCoords.y1 &&
                  _y2 <= selectionCoords.y2
                ) {
                  editorManager.updateElementById(element.id, {
                    ...element,
                    selected: true,
                  });
                } else {
                  editorManager.updateElementById(element.id, {
                    ...element,
                    selected: false,
                  });
                }
              }
            }
          });
        }
      }

      editorManager.drawElements();
    }
  };

  const onMouseUp = () => {
    // if we are drawing elements, finish it
    if (activeElement && activeElement.shape_type !== "text") {
      setActiveElement(null);

      if (activeElement.shape_type === "selection") {
        editorManager.deleteElement(activeElement.id);

        editorManager.drawElements();
      }
    }
  };

  const onDoubleClick = () => {};

  const onSelectShape = (shape: SHAPE) => setActiveShape(shape);

  const renderShapesOptions = () => {
    return Object.values(SHAPES).map((shape) => (
      <ShapeOption
        key={shape}
        shape={shape as SHAPE}
        onSelectShape={onSelectShape}
      />
    ));
  };

  useEffect(() => {
    const roughCanvas = roughCanvasRef.current!;
    const canvas = canvasRef.current!;

    const editorManager = new Manager(roughCanvas, canvas);

    setEditorManager(editorManager);
  }, []);

  // we need to set the dimensions inside a useEffect because "window" does not exist when Next.js renders the page in the server
  useEffect(() => {
    setCanvasDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  useEffect(() => {
    const textarea = textEditorInputRef.current;

    if (!textarea) return;

    textarea.addEventListener("input", () => {
      const computedStyleTextarea = getComputedStyle(textarea);

      const textareaWidthWithPadding = textarea.clientWidth;
      const textareaHeightWithPadding = textarea.clientHeight;

      const textareaWidthOnly =
        textareaWidthWithPadding -
        (parseFloat(computedStyleTextarea.paddingLeft) +
          parseFloat(computedStyleTextarea.paddingRight));
      const textareaHeightOnly =
        textareaHeightWithPadding -
        (parseFloat(computedStyleTextarea.paddingTop) +
          parseFloat(computedStyleTextarea.paddingBottom));

      // grow the textarea if the text exceeds the border -- https://stackoverflow.com/a/36958094
      const offsetHeight = textarea.clientHeight - textareaHeightOnly;

      if (textarea.scrollHeight > textarea.clientHeight) {
        textarea.style.height = `${textarea.scrollHeight - offsetHeight}px`;
      } else {
        textarea.style.height = `1px`;
        textarea.style.height = `${textarea.scrollHeight - offsetHeight}px`;
      }

      const offsetWidth = textarea.clientWidth - textareaWidthOnly;

      if (textarea.scrollWidth > textarea.clientWidth) {
        textarea.style.width = `${textarea.scrollWidth - offsetWidth}px`;
      } else {
        textarea.style.width = `1px`;
        textarea.style.width = `${textarea.scrollWidth - offsetWidth}px`;
      }
    });
  }, [showTextEditor]);

  useEffect(() => {
    const cb = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (
          activeElement &&
          activeElement.shape_type === "text" &&
          textEditorInputRef.current &&
          canvasRef.current
        ) {
          const style = getComputedStyle(textEditorInputRef.current);
          const width = parseInt(style.width.split("px")[0]);
          let height = parseInt(style.height.split("px")[0]);
          // const texts = textEditorInputRef.current.value.split("\n");

          // const ctx = canvasRef.current.getContext("2d");

          // texts.forEach((text, i) => {
          //   if (!ctx) return;

          //   if (text === "") {
          //     text = "asdfsdf";
          //   }

          //   ctx.font = "15px serif";
          //   const metrics = ctx?.measureText(text);

          //   if (metrics) {
          //     let actualHeight =
          //       metrics.actualBoundingBoxAscent +
          //       metrics.actualBoundingBoxDescent;

          //     height += actualHeight + 5;
          //   }
          // });

          editorManager.updateElementById(activeElement.id, {
            ...activeElement,
            width,
            height,
            text: textEditorInputRef.current.value || "",
          });

          setShowTextEditor(false);

          editorManager.drawElements();
        }
      }
    };

    window.addEventListener("keydown", cb);

    return () => {
      window.removeEventListener("keydown", cb);
    };
  });

  return (
    <div>
      {renderShapesOptions()}

      <button onClick={() => console.log(editorManager.getAllElements())}>
        Log elements
      </button>

      <div className="text-editor" ref={textEditorRef}>
        {showTextEditor &&
          activeElement &&
          activeElement.shape_type === "text" && (
            <textarea
              dir="auto"
              tabIndex={0}
              wrap="off"
              className="text-editor-input"
              ref={textEditorInputRef}
              style={{
                top: `${mousePos.y}px`,
                left: `${mousePos.x}px`,
              }}
            ></textarea>
          )}
      </div>
      <canvas
        id="notebook-editor-canvas"
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        ref={(el) => {
          if (el) {
            canvasRef.current = el;
            roughCanvasRef.current = rough.canvas(el);
          }
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onDoubleClick={onDoubleClick}
      ></canvas>
    </div>
  );
}
