import { createContext, useContext } from "react";

import { EditorState } from "./hooks/useInitState";
import { Element } from "./types";

export const EditorStateContext = createContext<{
  editorState: EditorState;
  getActiveElement: () => Element | null;
  updateElement: (args: Partial<Element> & { id: string }) => void;
  removeElement: (id: string) => void;
  updateEditorState: (
    args: Partial<EditorState>,
    shouldRerender?: boolean
  ) => void;
} | null>(null);

export const useEditorState = () => {
  const state = useContext(EditorStateContext)!;

  if (state === undefined) {
    throw new Error("useEditorState must be used within a EditorStateProvider");
  }

  return state;
};
