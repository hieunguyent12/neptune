import { useRef } from "react";
import { Element, ElementStore, SHAPE } from "../types";
import { useRerender } from "./useRerender";

export type EditorState = {
  elements: ElementStore;
  elementIds: string[];
  activeShape: SHAPE;
  activeElementId: string | null;
  isDrawing: boolean;
  isEditingText: boolean;
};

export function useInitState() {
  const mutableEditorState = useRef<EditorState>({
    elements: {},
    elementIds: [],
    activeShape: "selection",
    activeElementId: null,
    isDrawing: false,
    isEditingText: false,
  });

  const rerender = useRerender();

  const updateElement = (args: Partial<Element> & { id: string }) => {
    const el = mutableEditorState.current.elements[args.id];

    // create a new element if it doesn't exist
    if (!el) {
      updateEditorState({
        elementIds: [...mutableEditorState.current.elementIds, args.id],
      });
    }

    mutableEditorState.current.elements[args.id] = {
      ...mutableEditorState.current.elements[args.id],
      ...args,
    } as Element;
  };

  const removeElement = (id: string) => {
    const newElements = { ...mutableEditorState.current.elements };
    const newElementsIds = [...mutableEditorState.current.elementIds];

    if (newElements[id]) {
      delete newElements[id];
    }

    const idx = newElementsIds.findIndex((_id) => _id === id);

    newElementsIds.splice(idx, 1);

    updateEditorState({
      elements: newElements,
      elementIds: newElementsIds,
    });
  };

  const updateEditorState = (
    args: Partial<EditorState>,
    shouldRerender = false
  ) => {
    Object.keys(mutableEditorState.current).map(
      (key) =>
        args.hasOwnProperty(key) &&
        // @ts-ignore
        (mutableEditorState.current[key] = args[key])
    );

    if (shouldRerender) {
      rerender();
    }
  };

  const getActiveElement = () =>
    mutableEditorState.current.elements[
      mutableEditorState.current.activeElementId || ""
    ];

  return {
    editorState: mutableEditorState.current,
    updateEditorState,
    updateElement,
    getActiveElement,
    removeElement,
  };
}
