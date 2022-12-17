import { useRouter } from "next/router";
import Link from "next/link";

import Notebook from "../../components/notebook/";

export default function _Notebook() {
  const router = useRouter();

  const { id, page } = router.query;

  return (
    <div>
      <Link href="/home">
        <p>HOME</p>
      </Link>
      {id && (
        <Notebook
          notebookId={id as string}
          pageId={page as string | undefined}
        />
      )}
    </div>
  );
}
