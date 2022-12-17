import Link from "next/link";
import { useState } from "react";
import { trpc, mutateCache } from "../../utils/trpc";
import { Page } from "@prisma/client";

type Props = {
  notebookId: string;
  pages: Page[];
};

export default function PagesList({ notebookId, pages }: Props) {
  const utils = trpc.useContext();
  const createPage = trpc.page.create.useMutation({
    onSuccess(newData) {
      utils.page.getAllPages.setData({ notebookId }, (oldData) =>
        mutateCache<typeof oldData, typeof newData>(oldData, newData, "create")
      );
    },
  });
  const updatePage = trpc.page.update.useMutation({
    onSuccess(newData) {
      utils.page.getAllPages.setData({ notebookId }, (oldData) =>
        mutateCache<typeof oldData, typeof newData>(oldData, newData, "update")
      );
    },
  });
  const deletePage = trpc.page.delete.useMutation({
    onSuccess(newData) {
      utils.page.getAllPages.setData({ notebookId }, (oldData) =>
        mutateCache<typeof oldData, typeof newData>(oldData, newData, "delete")
      );
    },
  });

  const [newPageName, setNewPageName] = useState("");

  const onCreatePage = async () => {
    if (newPageName === "") {
      return;
    }

    createPage.mutate({ notebookId, name: newPageName });
  };

  const onUpdatePage = async (name: string, id: string) => {
    updatePage.mutate({ id, name });
  };

  const onDeletePage = async (id: string) => {
    deletePage.mutate({ id });
  };

  return (
    <div>
      <button className="bg-green-200 p-2" onClick={onCreatePage}>
        create page
      </button>
      <input
        name="new-page"
        value={newPageName}
        onChange={(e) => setNewPageName(e.target.value)}
      />
      {pages.map((page) => (
        <PageItem
          key={page.id}
          page={page}
          notebookId={notebookId}
          onUpdatePage={onUpdatePage}
          onDeletePage={onDeletePage}
        />
      ))}
    </div>
  );
}

type PageItemProps = {
  notebookId: string;
  page: Page;
  onUpdatePage: (name: string, id: string) => void;
  onDeletePage: (id: string) => void;
};

function PageItem({
  page,
  notebookId,
  onUpdatePage,
  onDeletePage,
}: PageItemProps) {
  const [name, setName] = useState(page.name);
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
        <Link href={`notebook?id=${notebookId}&page=${page.id}`}>
          <p>{page.name}</p>
        </Link>
      )}
      <button onClick={() => onDeletePage(page.id)}>delete</button>
      {isUpdating && (
        <button
          onClick={() => {
            onUpdatePage(name, page.id);
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
