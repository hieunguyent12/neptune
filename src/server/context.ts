import { inferAsyncReturnType } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../pages/api/auth/[...nextauth]";

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export async function createContext(opts: trpcNext.CreateNextContextOptions) {
  const session = await unstable_getServerSession(
    opts.req,
    opts.res,
    authOptions
  );

  return {
    session,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
