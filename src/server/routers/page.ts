import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "../../prisma";
import { protectedProcedure, router } from "../trpc";

export const pageRouter = router({
  getAllPages: protectedProcedure
    .input(
      z.object({
        notebookId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      return await prisma.page.findMany({
        where: {
          notebookId: input.notebookId,
          userId: ctx.session.user.id,
        },
      });
    }),

  getPageById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const page = await prisma.page.findUnique({
        where: {
          id: input.id,
        },
      });

      return page;
    }),

  create: protectedProcedure
    .input(
      z.object({
        notebookId: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await prisma.page.create({
        data: {
          name: input.name,
          notebookId: input.notebookId,
          created_at: new Date(),
          userId: ctx.session.user.id,
          canvasData: "",
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const page = await prisma.page.findUnique({
        where: {
          id: input.id,
        },
      });

      if (isAuthorized(ctx.session.user.id, page?.userId || "")) {
        return await prisma.page.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
          },
        });
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const page = await prisma.page.findUnique({
        where: {
          id: input.id,
        },
      });

      if (isAuthorized(ctx.session.user.id, page?.userId || "")) {
        return await prisma.page.delete({
          where: {
            id: input.id,
          },
        });
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }
    }),
});

function isAuthorized(userId: string, resourceUserId: string) {
  return userId === resourceUserId;
}
