import { Notebook, Page } from "@prisma/client";
import { get, set } from "idb-keyval";
import { nanoid } from "nanoid";
import create from "zustand";
import { EditorState } from "./components/editor/hooks/useInitState";

let isStateInitialized = false;

type AppState = {
  notebooks: Partial<Notebook>[];
  pages: (Partial<Page> & {
    editorState: EditorState;
  })[];

  addNotebook: (name: string) => void;
  updateNotebook: (name: string, id: string) => void;
  deleteNotebook: (id: string) => void;

  addPage: (name: string, notebookId: string) => void;
  updatePage: (name: string, id: string) => void;
  deletePage: (id: string) => void;
};

export const appState = create<AppState>((set) => ({
  notebooks: [],
  pages: [],

  addNotebook: (name: string) =>
    set((state) => ({
      notebooks: [
        ...state.notebooks,
        {
          id: nanoid(),
          name,
          created_at: new Date(),
          updated_at: null,
        },
      ],
    })),
  updateNotebook: (name: string, id: string) =>
    set((state) => {
      const newNotebooks = [...state.notebooks];

      const notebook = newNotebooks.find((notebook) => notebook.id === id);

      if (notebook) {
        notebook.name = name;
      }
      return {
        notebooks: newNotebooks,
      };
    }),
  deleteNotebook: (id: string) =>
    set((state) => {
      const newNotebooks = [...state.notebooks];

      const idx = newNotebooks.findIndex((notebook) => notebook.id === id);

      newNotebooks.splice(idx, 1);
      return {
        notebooks: newNotebooks,
      };
    }),

  addPage: (name: string, notebookId: string) =>
    set((state) => ({
      pages: [
        ...state.pages,
        {
          id: nanoid(),
          name,
          created_at: new Date(),
          updated_at: null,
          notebookId,
          editorState: {
            elementIds: [],
            elements: {},
            activeElementId: null,
            activeShape: "selection",
            isDrawing: false,
            isEditingText: false,
          },
        },
      ],
    })),
  updatePage: (name: string, id: string) =>
    set((state) => {
      const newPages = [...state.pages];

      const page = newPages.find((page) => page.id === id);

      if (page) {
        page.name = name;
      }
      return {
        pages: newPages,
      };
    }),
  deletePage: (id: string) =>
    set((state) => {
      const newPages = [...state.pages];

      const idx = newPages.findIndex((page) => page.id === id);

      newPages.splice(idx, 1);

      return {
        pages: newPages,
      };
    }),
}));

export async function initAppState() {
  if (isStateInitialized) return;

  console.log("init app state");

  isStateInitialized = true;

  const appStateFromIndexedDB: AppState | undefined = await get("appState");

  if (appStateFromIndexedDB) {
    appState.setState({
      notebooks: appStateFromIndexedDB.notebooks,
      pages: appStateFromIndexedDB.pages,
    });
  } else {
    set("appState", {
      notebooks: [],
      pages: [],
    });
  }

  // save to db on every state change
  const unsubscribe = appState.subscribe((state) => {
    set("appState", {
      notebooks: state.notebooks,
      pages: state.pages,
    });
  });

  return unsubscribe;
}
