import { useRouter } from "next/router";
import Link from "next/link";
import { useSession } from "next-auth/react";

import Notebook from "../../components/notebook/";

export default function _Notebook() {
  const router = useRouter();
  const { data: session } = useSession();

  const { id, page } = router.query;

  const isLoggedIn = !!session;

  return (
    <div>
      <Link href="/home">
        <p>HOME</p>
      </Link>
      {id && (
        <Notebook
          notebookId={id as string}
          pageId={page as string | undefined}
          isLoggedIn={isLoggedIn}
        />
      )}
    </div>
  );
}
