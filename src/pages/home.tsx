import { useSession } from "next-auth/react";
import NotebookList from "../components/notebook/notebook-list";

export default function Home() {
  const { data: session } = useSession();

  const isLoggedIn = !!session;

  return (
    <div>
      <NotebookList isLoggedIn={isLoggedIn} />
    </div>
  );
}
