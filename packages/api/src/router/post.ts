import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

import { and, eq, gte, inArray, like, lte, or, schema } from "@acme/db";

import { tagManager } from "../helpers/tagManager";
import {
  createTRPCRouter,
  eduProcedure,
  publicProcedure,
  studentOrVentureProcedure,
} from "../trpc";

const chunkSize = 20;

export const postRouter = createTRPCRouter({
  naturalSearch: publicProcedure //TODO: https://web.archive.org/web/20230617133855/https://trpc.io/docs/client/react/suspense#usesuspenseinfinitequery
    .input(
      z.object({
        continuePoint: z.number(),
        query: z.string(),
        tags: z.array(z.string()).optional(),
        locationLat: z.number().optional(),
        locationLon: z.number().optional(),
        radius: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { continuePoint, query, locationLat, locationLon } = input;
      let { tags } = input;

      if (!tags || tags.length === 0) {
        tags = ["US"];
      }

      const fetchedTags = await ctx.db.query.tag.findMany({
        where: inArray(schema.tag.name, tags),
      });

      const tagToPostLinks =
        fetchedTags.length > 0
          ? await ctx.db
              .select({
                postId: schema.postToTag.postId,
                tagId: schema.postToTag.tagId,
              })
              .from(schema.postToTag)
              .where(
                inArray(
                  schema.postToTag.tagId,
                  fetchedTags.map((tag) => tag.id),
                ),
              )
          : [];

      const rad = input.radius ?? 20;

      const qry =
        locationLat && locationLon
          ? and(
              // TODO: await https://github.com/sqlc-dev/sqlc/issues/3091
              or(
                like(schema.post.title, `%${query}%`),
                like(schema.post.subHead, `%${query}%`),
                like(schema.post.body, `%${query}%`),
              ),
              inArray(
                schema.post.id,
                tagToPostLinks.map((tag) => tag.postId),
              ),
              gte(schema.post.locationLat, locationLat - rad),
              lte(schema.post.locationLat, locationLat + rad),
              gte(schema.post.locationLon, locationLon - rad),
              lte(schema.post.locationLon, locationLon + rad),
            )
          : and(
              like(schema.post.title, `%${query}%`),
              inArray(
                schema.post.id,
                tagToPostLinks.map((tag) => tag.postId),
              ),
            );

      const dbSel = await ctx.db
        .select({
          id: schema.post.id,
          title: schema.post.title,
          subHead: schema.post.subHead,
          applyLink: schema.post.applyLink,
          body: schema.post.body,
          locationLat: schema.post.locationLat,
          locationLon: schema.post.locationLon,
          postingType: schema.post.postingType,
          createdAt: schema.post.createdAt,
          updatedAt: schema.post.updatedAt,
          postCreator: schema.post.postCreator,
        })
        .from(schema.post)
        .where(qry)
        .limit(chunkSize)
        .offset(continuePoint);

      if (dbSel.length === 0) return [];

      const finalTags = await ctx.db
        .select({
          postId: schema.postToTag.postId,
          id: schema.postToTag.tagId,
          tagType: schema.tag.tagType,
          name: schema.tag.name,
        })
        .from(schema.postToTag)
        .where(
          inArray(
            schema.postToTag.postId,
            dbSel.map((post) => post.id),
          ),
        )
        .innerJoin(schema.tag, eq(schema.tag.id, schema.postToTag.tagId));

      const selWithTags = dbSel.map((post) => {
        const tagsCleaned = [
          ...finalTags.filter(
            (tag) =>
              tag.postId === post.id && tag.name != null && tag.tagType != null,
          ),
        ];

        const highlights = fetchedTags.filter((tag) =>
          tagToPostLinks.find(
            (tagLink) => tagLink.postId === post.id && tagLink.tagId === tag.id,
          ),
        );

        const highlightedTags = tagsCleaned.map((tag) => {
          return {
            ...tag,
            highlighted: !!highlights.find(
              (highlight) => highlight.id === tag.id,
            ),
          };
        });

        return {
          ...post,
          tags: highlightedTags,
        };
      });

      return selWithTags;
    }),

  byProfileId: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const posts = await ctx.db.query.post.findMany({
        where: eq(schema.post.postCreator, input),
      });

      if (posts.length == 0) return [];

      const tagLinks = await ctx.db
        .select({
          postId: schema.postToTag.postId,
          tagId: schema.postToTag.tagId,
        })
        .from(schema.postToTag)
        .where(
          inArray(
            schema.postToTag.postId,
            posts.map((post) => post.id),
          ),
        );

      const tags = tagLinks.length
        ? await ctx.db
            .select({
              id: schema.tag.id,
              name: schema.tag.name,
              tagType: schema.tag.tagType,
            })
            .from(schema.tag)
            .where(
              inArray(
                schema.tag.id,
                tagLinks.map((tag) => tag.tagId),
              ),
            )
        : [];

      const pmap = posts.map((post) => {
        return {
          ...post,
          tags: tags.filter((tag) =>
            tagLinks.find(
              (tagLink) =>
                tagLink.postId === post.id && tagLink.tagId === tag.id,
            ),
          ),
        };
      });

      return pmap;
    }),

  byId: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const post = await ctx.db.query.post.findFirst({
      where: eq(schema.post.id, input),
    });

    if (!post) return null;

    const tagLinks = await ctx.db
      .select({
        postId: schema.postToTag.postId,
        tagId: schema.postToTag.tagId,
      })
      .from(schema.postToTag)
      .where(eq(schema.postToTag.postId, post.id));

    const tags =
      tagLinks.length > 0
        ? await ctx.db
            .select({
              id: schema.tag.id,
              name: schema.tag.name,
              tagType: schema.tag.tagType,
            })
            .from(schema.tag)
            .where(
              inArray(
                schema.tag.id,
                tagLinks.map((tag) => tag.tagId),
              ),
            )
        : [];

    return {
      ...post,
      tags,
    };
  }),

  create: studentOrVentureProcedure
    .input(
      z.object({
        title: z.string().min(15),
        body: z.string().min(144),
        tags: z.array(z.string()).min(2),
        applyLink: z.string(),
        postCreator: z.string(),
        locationLon: z.number(),
        locationLat: z.number(),
        subHead: z.string().min(30),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const id = createId();
      await ctx.db.insert(schema.post).values({
        id,
        title: input.title,
        body: input.body,
        applyLink: input.applyLink,
        postCreator: input.postCreator,
        subHead: input.subHead,
        locationLat: input.locationLat,
        locationLon: input.locationLon,
      });

      await tagManager({
        linkType: "post",
        ctx,
        linkId: id,
        tags: input.tags,
        lat: input.locationLat,
        lon: input.locationLon,
      });
    }),

  update: studentOrVentureProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(15),
        body: z.string().min(144),
        applyLink: z.string(),
        tags: z.array(z.string()).min(2),
        postCreator: z.string(),
        locationLon: z.number(),
        locationLat: z.number(),
        subHead: z.string().min(20),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(schema.post)
        .set({
          title: input.title,
          body: input.body,
          postCreator: input.postCreator,
          applyLink: input.applyLink,
          subHead: input.subHead,
          locationLat: input.locationLat,
          locationLon: input.locationLon,
        })
        .where(
          and(
            eq(schema.post.id, input.id),
            eq(schema.post.postCreator, input.postCreator),
          ),
        );

      await tagManager({
        linkType: "post",
        ctx,
        linkId: input.id,
        tags: input.tags,
        lat: input.locationLat,
        lon: input.locationLon,
      });
    }),

  delete: eduProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db
      .delete(schema.post)
      .where(
        and(
          eq(schema.post.id, input),
          eq(schema.post.postCreator, ctx.session?.user.id),
        ),
      );
  }),
});
