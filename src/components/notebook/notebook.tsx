import Page from "../page";
import PagesList from "../page/page-list";

import { appState as useAppState } from "../../appState";
import { trpc } from "../../utils/trpc";
import { Page as PageType } from "@prisma/client";

type Props = {
  notebookId: string;
  pageId?: string;
  isLoggedIn: boolean;
};

export default function Notebook({ notebookId, pageId, isLoggedIn }: Props) {
  if (isLoggedIn) {
    return <NotebookForAuthedUser notebookId={notebookId} pageId={pageId} />;
  } else {
    return <NotebookForGuest notebookId={notebookId} pageId={pageId} />;
  }
}

function NotebookForAuthedUser({
  notebookId,
  pageId,
}: {
  notebookId: string;
  pageId: string | undefined;
}) {
  const notebook = trpc.notebook.getNotebookById.useQuery({ id: notebookId });
  const pages = trpc.page.getAllPages.useQuery({ notebookId });

  if (notebook.isLoading || pages.isLoading) {
    return <p>Loading...</p>;
  }

  if (!notebook.data) return <p>notebook does not exist</p>;

  if (!pages.data) return <p>Notebook is empty</p>;

  return (
    <_NotebookInner
      notebookId={notebookId}
      pages={pages.data}
      pageId={pageId}
    />
  );
}

function NotebookForGuest({
  notebookId,
  pageId,
}: {
  notebookId: string;
  pageId: string | undefined;
}) {
  const allPages = useAppState((state) => state.pages);

  const pages = allPages.filter((page) => page.notebookId === notebookId);

  return (
    <_NotebookInner
      // we are lying here
      pages={pages as PageType[]}
      pageId={pageId}
      notebookId={notebookId}
      isLoggedIn={false}
    />
  );
}

type _NotebookInnerProps = {
  notebookId: string;
  pages: PageType[];
  pageId: string | undefined;
  isLoggedIn?: boolean;
};

function _NotebookInner({
  notebookId,
  pages,
  pageId,
  isLoggedIn = true,
}: _NotebookInnerProps) {
  return (
    <div>
      <div>
        <p>notebook id: {notebookId}</p>
        <PagesList
          notebookId={notebookId}
          pages={pages}
          isLoggedIn={isLoggedIn}
        />
      </div>

      {/* The presence of pageId indicates that a page of the notebook is being rendered */}
      {pageId && pages && <Page pageId={pageId} isLoggedIn={isLoggedIn} />}
    </div>
  );
}
