import Page from "../page";
import PagesList from "../page/page-list";
import { trpc } from "../../utils/trpc";

type Props = {
  notebookId: string;
  pageId?: string;
};

export default function Notebook({ notebookId, pageId }: Props) {
  const notebook = trpc.notebook.getNotebookById.useQuery({ id: notebookId });
  const pages = trpc.page.getAllPages.useQuery({ notebookId });

  if (notebook.isLoading || pages.isLoading) {
    return <p>Loading...</p>;
  }

  if (!notebook.data) return <p>notebook does not exist</p>;

  if (!pages.data) return <p>Notebook is empty</p>;

  return (
    <div>
      <div>
        <p>notebook id: {notebookId}</p>
        <PagesList notebookId={notebookId} pages={pages.data} />
      </div>

      {/* The presence of pageId indicates that a page of the notebook is being rendered */}
      {pageId && pages.data && <Page pageId={pageId} />}
    </div>
  );
}
