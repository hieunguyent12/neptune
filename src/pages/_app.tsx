import "../styles/globals.css";
import type { AppProps, AppType } from "next/app";
import { SessionProvider } from "next-auth/react";
import { trpc } from "../utils/trpc";
import { initAppState } from "../appState";
import { useEffect } from "react";

// if (typeof window !== "undefined") {
//   initAppState();
// }

const Neptune: AppType = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) => {
  useEffect(() => {
    initAppState();
  }, []);
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default trpc.withTRPC(Neptune);
