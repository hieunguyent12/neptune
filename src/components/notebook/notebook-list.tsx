import Link from "next/link";
import { useState } from "react";
import { Notebook } from "@prisma/client";
import { trpc, mutateCache } from "../../utils/trpc";

export default function NotebookList() {
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

  const [newNotebookName, setNewNotebookName] = useState("");

  const onCreateNotebook = async () => {
    if (newNotebookName === "") {
      return;
    }

    await createNotebook.mutate({
      name: newNotebookName,
    });
  };

  const onUpdateNotebook = async (name: string, id: string) => {
    await updateNotebook.mutate({
      name,
      id,
    });
  };

  const onDeleteNotebook = async (notebookId: string) => {
    await deleteNotebook.mutate({
      id: notebookId,
    });
  };

  if (allNotebooks.isLoading) return <p>Loading...</p>;

  if (!allNotebooks.data) return <p>Empty :( </p>;

  return (
    <div>
      <button onClick={onCreateNotebook}>add</button>
      <input
        name="new-notebook"
        value={newNotebookName}
        onChange={(e) => setNewNotebookName(e.target.value)}
      />
      {allNotebooks.data.map((notebook) => (
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
