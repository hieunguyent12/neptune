import { Page as PageType } from "@prisma/client";

import { appState as useAppState } from "../../appState";
import Editor from "../../components/editor";
import { trpc } from "../../utils/trpc";

export default function Page({
  pageId,
  isLoggedIn,
}: {
  pageId: string;
  isLoggedIn: boolean;
}) {
  if (isLoggedIn) {
    return <PageForAuthedUser pageId={pageId} />;
  } else {
    return <PageForGuest pageId={pageId} />;
  }
}

function PageForAuthedUser({ pageId }: { pageId: string }) {
  const page = trpc.page.getPageById.useQuery({ id: pageId });

  if (page.isLoading) return <p>Loading...</p>;

  if (!page.data) return <p>Page does not exist</p>;

  return <_PageInner page={page.data} />;
}

function PageForGuest({ pageId }: { pageId: string }) {
  const allPages = useAppState((state) => state.pages);

  const page = allPages.find((page) => page.id === pageId) as
    | PageType
    | undefined;

  if (!page) return <p>Page does not exist</p>;

  return <_PageInner page={page} />;
}

function _PageInner({ page }: { page: PageType }) {
  return (
    <div>
      <div>
        <p>{page.name}</p>

        <div>
          <Editor />
        </div>
      </div>
    </div>
  );
}
