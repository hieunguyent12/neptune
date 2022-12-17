import { router } from "../trpc";

import { notebookRouter } from "./notebook";
import { pageRouter } from "./page";

export const appRouter = router({
  notebook: notebookRouter,
  page: pageRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
