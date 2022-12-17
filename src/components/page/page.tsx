import Editor from "../editor";
import { trpc } from "../../utils/trpc";

export default function Page({ pageId }: { pageId: string }) {
  const page = trpc.page.getPageById.useQuery({ id: pageId });

  if (page.isLoading) return <p>Loading...</p>;

  if (!page.data) return <p>Page does not exist</p>;

  return (
    <div>
      <div>
        <p>{page.data.name}</p>

        <div>
          <Editor canvasJSON={JSON.stringify(page.data.canvasData)} />
        </div>
      </div>
    </div>
  );
}
