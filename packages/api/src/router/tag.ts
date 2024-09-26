import { eq, like } from "drizzle-orm";
import { z } from "zod";

import { schema } from "@acme/db";

import {
  createTRPCRouter,
  publicProcedure,
  studentOrVentureProcedure,
} from "../trpc";

export const tagRouter = createTRPCRouter({
  confirmExists: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      if (input === "") return false;

      const tag = await ctx.db.query.tag.findFirst({
        where: eq(schema.tag.name, input),
      });
      //return boolean if tag exists
      return !!tag;
    }),
  naturalSearch: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      if (input === "") return [];

      const tags = await ctx.db.query.tag.findMany({
        where: like(schema.tag.name, `%${input}%`),
      });
      return tags;
    }),
  getPayTypes: studentOrVentureProcedure.query(async ({ ctx }) => {
    const tags = await ctx.db.query.tag.findMany({
      where: eq(schema.tag.tagType, "payType"),
    });
    return tags;
  }),
});
