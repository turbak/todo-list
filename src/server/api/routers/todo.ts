import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const todoRouter = createTRPCRouter({
  get: publicProcedure
  .input(z.object({id: z.string()}))
  .query(({ ctx, input}) => {
    return ctx.prisma.todo.findFirst({where: {id: input.id}});
  }),

  list: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.todo.findMany({where: {userId: ctx.session.user.id}});
  }),

  create: protectedProcedure
  .input(z.object({description: z.string()}))
  .mutation(({ ctx, input}) => {
    return ctx.prisma.todo.create({
      data: {
        description: input.description,
        userId: ctx.session.user.id,
      },
    });
  }),

  delete: protectedProcedure
  .input(z.object({id: z.string()}))
  .mutation(({ ctx, input}) => {
    return ctx.prisma.todo.delete({
      where: {
        id: input.id,
      },
    });
  })
});
