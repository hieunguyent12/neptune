import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "../../prisma";
import { protectedProcedure, router } from "../trpc";

export const notebookRouter = router({
  getAllNotebooks: protectedProcedure.query(async ({ ctx }) => {
    const notebooks = await prisma.notebook.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
    return notebooks;
  }),

  getNotebookById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const notebook = await prisma.notebook.findUnique({
        where: {
          id: input.id,
        },
      });

      if (notebook) {
        if (notebook.userId === ctx.session.user.id) {
          return notebook;
        } else {
          throw new TRPCError({
            code: "UNAUTHORIZED",
          });
        }
      } else {
        return null;
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await prisma.notebook.create({
        data: {
          name: input.name,
          created_at: new Date(),
          userId: ctx.session.user.id,
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
      const notebook = await prisma.notebook.findUnique({
        where: {
          id: input.id,
        },
      });

      if (isAuthorized(ctx.session.user.id, notebook?.userId || " ")) {
        return await prisma.notebook.update({
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
      const notebook = await prisma.notebook.findUnique({
        where: {
          id: input.id,
        },
      });

      if (isAuthorized(ctx.session.user.id, notebook?.userId || " ")) {
        return await prisma.notebook.delete({
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
