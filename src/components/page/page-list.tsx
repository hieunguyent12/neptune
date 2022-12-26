import Link from "next/link";
import { useState } from "react";
import { trpc, mutateCache } from "../../utils/trpc";
import { Page } from "@prisma/client";
import { appState as useAppState } from "../../appState";

type Props = {
  notebookId: string;
  pages: Page[];
  isLoggedIn: boolean;
};

export default function PagesList({ notebookId, pages, isLoggedIn }: Props) {
  if (isLoggedIn) {
    return <PagesListForAuthedUser notebookId={notebookId} pages={pages} />;
  } else {
    return <PagesListForGuest notebookId={notebookId} pages={pages} />;
  }
}

function PagesListForAuthedUser({
  notebookId,
  pages,
}: {
  notebookId: string;
  pages: Page[];
}) {
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

  const onCreatePage = (name: string, notebookId: string) => {
    if (name === "") return;

    createPage.mutate({ notebookId, name });
  };

  const onUpdatePage = (name: string, id: string) => {
    if (name === "") return;

    updatePage.mutate({ id, name });
  };

  const onDeletePage = (id: string) => {
    deletePage.mutate({ id });
  };

  return (
    <_PagesListInner
      notebookId={notebookId}
      pages={pages}
      onCreatePage={onCreatePage}
      onUpdatePage={onUpdatePage}
      onDeletePage={onDeletePage}
    />
  );
}

function PagesListForGuest({
  notebookId,
  pages,
}: {
  notebookId: string;
  pages: Page[];
}) {
  const createPage = useAppState((state) => state.addPage);
  const updatePage = useAppState((state) => state.updatePage);
  const deletePage = useAppState((state) => state.deletePage);

  return (
    <_PagesListInner
      notebookId={notebookId}
      pages={pages}
      onCreatePage={createPage}
      onUpdatePage={updatePage}
      onDeletePage={deletePage}
    />
  );
}

function _PagesListInner({
  onCreatePage,
  onUpdatePage,
  onDeletePage,
  pages,
  notebookId,
}: {
  notebookId: string;
  pages: Page[];
  onCreatePage: (name: string, notebookId: string) => void;
  onUpdatePage: (name: string, id: string) => void;
  onDeletePage: (id: string) => void;
}) {
  const [newPageName, setNewPageName] = useState("");

  return (
    <div>
      <button
        className="bg-green-200 p-2"
        onClick={() => onCreatePage(newPageName, notebookId)}
      >
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
