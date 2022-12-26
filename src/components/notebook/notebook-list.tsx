import Link from "next/link";
import { useState } from "react";
import { Notebook } from "@prisma/client";
import { appState as useAppState } from "../../appState";
import { trpc, mutateCache } from "../../utils/trpc";

export default function NotebookList({ isLoggedIn }: { isLoggedIn: boolean }) {
  // if user is not logged in, persist their data in indexedDB

  if (isLoggedIn) {
    return <NotebookListForAuthedUser />;
  } else {
    return <NotebookListForGuest />;
  }
}

function NotebookListForAuthedUser() {
  const utils = trpc.useContext();
  const createNotebook = trpc.notebook.create.useMutation({
    onSuccess(newData) {
      utils.notebook.getAllNotebooks.setData(undefined, (oldData) =>
        mutateCache<typeof oldData, typeof newData>(oldData, newData, "create")
      );
    },
  });
  const updateNotebook = trpc.notebook.update.useMutation({
    onSuccess(newData) {
      utils.notebook.getAllNotebooks.setData(undefined, (oldData) =>
        mutateCache<typeof oldData, typeof newData>(oldData, newData, "update")
      );
    },
  });
  const deleteNotebook = trpc.notebook.delete.useMutation({
    onSuccess(newData) {
      utils.notebook.getAllNotebooks.setData(undefined, (oldData) =>
        mutateCache<typeof oldData, typeof newData>(oldData, newData, "delete")
      );
    },
  });
  const allNotebooks = trpc.notebook.getAllNotebooks.useQuery();

  const onCreateNotebook = (newNotebookName: string) => {
    if (newNotebookName === "") {
      return;
    }

    createNotebook.mutate({
      name: newNotebookName,
    });
  };

  const onUpdateNotebook = (name: string, id: string) => {
    updateNotebook.mutate({
      name,
      id,
    });
  };

  const onDeleteNotebook = (notebookId: string) => {
    deleteNotebook.mutate({
      id: notebookId,
    });
  };

  if (allNotebooks.isLoading) return <p>Loading...</p>;

  if (!allNotebooks.data) return <p>Empty :( </p>;

  return (
    <_NotebookListInner
      allNotebooks={allNotebooks.data}
      onCreateNotebook={onCreateNotebook}
      onUpdateNotebook={onUpdateNotebook}
      onDeleteNotebook={onDeleteNotebook}
    />
  );
}

function NotebookListForGuest() {
  const allNotebooks = useAppState((state) => state.notebooks);
  const addNotebook = useAppState((state) => state.addNotebook);
  const updateNotebook = useAppState((state) => state.updateNotebook);
  const deleteNotebook = useAppState((state) => state.deleteNotebook);

  const onCreateNotebook = (name: string) => addNotebook(name);

  const onUpdateNotebook = (name: string, id: string) =>
    updateNotebook(name, id);

  const onDeleteNotebook = (notebookId: string) => deleteNotebook(notebookId);

  return (
    <_NotebookListInner
      allNotebooks={allNotebooks as Notebook[]}
      onCreateNotebook={onCreateNotebook}
      onUpdateNotebook={onUpdateNotebook}
      onDeleteNotebook={onDeleteNotebook}
    />
  );
}

type NotebookListInnerProps = {
  allNotebooks: Notebook[];
  onCreateNotebook: (name: string) => void;
  onUpdateNotebook: (name: string, id: string) => void;
  onDeleteNotebook: (notebookId: string) => void;
};

function _NotebookListInner({
  allNotebooks,
  onCreateNotebook,
  onDeleteNotebook,
  onUpdateNotebook,
}: NotebookListInnerProps) {
  const [newNotebookName, setNewNotebookName] = useState("");

  return (
    <div>
      <button onClick={() => onCreateNotebook(newNotebookName)}>add</button>
      <input
        name="new-notebook"
        value={newNotebookName}
        onChange={(e) => setNewNotebookName(e.target.value)}
      />
      {allNotebooks.map((notebook) => (
        <NotebookItem
          key={notebook.id}
          notebook={notebook}
          onDeleteNotebook={onDeleteNotebook}
          onUpdateNotebook={onUpdateNotebook}
        />
      ))}
    </div>
  );
}

type NotebookItemProps = {
  notebook: Notebook;
  onDeleteNotebook: (notebookId: string) => void;
  onUpdateNotebook: (name: string, id: string) => void;
};

function NotebookItem({
  notebook,
  onDeleteNotebook,
  onUpdateNotebook,
}: NotebookItemProps) {
  const [name, setName] = useState(notebook.name);
  const [isUpdating, setIsUpdating] = useState(false);

  return (
    <div className="p-2 bg-slate-200 mb-2">
      {isUpdating ? (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      ) : (
        <Link href={`/notebook?id=${notebook.id}`}>
          <p>{notebook.name}</p>
        </Link>
      )}
      <button onClick={() => onDeleteNotebook(notebook.id)}>delete</button>
      {isUpdating && (
        <button
          onClick={() => {
            onUpdateNotebook(name, notebook.id);
          }}
        >
          save changes
        </button>
      )}
      <button onClick={() => setIsUpdating(!isUpdating)}>
        {isUpdating ? "cancel" : "update"}
      </button>
    </div>
  );
}
