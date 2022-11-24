import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const appRouter = router({
  hello: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      return {
        id: 1,
      };
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
