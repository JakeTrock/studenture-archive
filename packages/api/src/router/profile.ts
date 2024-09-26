import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

import { and, eq, gte, inArray, like, lte, or, schema } from "@acme/db";

import { tagManager } from "../helpers/tagManager";
import {
  createTRPCRouter,
  eduProcedure,
  protectedProcedure,
  publicProcedure,
} from "../trpc";

const chunkSize = 20;

export const profileRouter = createTRPCRouter({
  byId: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db.query.profile
      .findFirst({
        where: eq(schema.profile.id, input),
      })
      .then(async (profile) => {
        if (!profile) return null;

        const tagLinks = await ctx.db.query.profileToTag.findMany({
          where: eq(schema.profileToTag.profileId, profile?.id),
        });

        const trueName = await ctx.db.query.users.findFirst({
          where: eq(schema.users.id, profile.profileOwner),
        });

        //find all tags linked to this post by profileToTag
        const findTags =
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
          ...profile,
          tags: findTags,
          name: trueName?.name,
          userType: trueName?.userType,
        };
      });
  }),

  byUserId: publicProcedure
    .input(z.string().length(36))
    .query(async ({ ctx, input }) => {
      const trueName = await ctx.db.query.users.findFirst({
        where: eq(schema.users.id, input),
      });

      if (!trueName) return null;

      return ctx.db.query.profile
        .findFirst({
          where: eq(schema.profile.profileOwner, input),
        })
        .then((post) => {
          if (!post) return null;
          return ctx.db.query.profileToTag
            .findMany({
              where: eq(schema.profileToTag.profileId, post.id),
            })
            .then(async (tagids) => {
              const tags = await ctx.db.query.tag.findMany({
                where: inArray(
                  schema.tag.id,
                  tagids.map((tag) => tag.tagId),
                ),
              });
              return {
                ...post,
                tags,
                name: trueName?.name,
                userType: trueName?.userType,
              };
            });
        });
    }),

  getSelf: protectedProcedure.query(async ({ ctx }) => {
    const trueName = await ctx.db.query.users.findFirst({
      where: eq(schema.users.id, ctx.session?.user.id),
    });
    const profile = await ctx.db.query.profile.findFirst({
      where: eq(schema.profile.profileOwner, ctx.session?.user.id),
    });
    if (!profile) return null;

    const tagids = await ctx.db.query.profileToTag.findMany({
      where: eq(schema.profileToTag.profileId, profile.id),
    });

    const tags =
      tagids.length > 0
        ? await ctx.db.query.tag.findMany({
            where: inArray(
              schema.tag.id,
              tagids.map((tag) => tag.tagId),
            ),
          })
        : [];

    return {
      ...profile,
      tags,
      name: trueName?.name,
    };
  }),

  naturalSearch: publicProcedure
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

      const tagToProfileLinks =
        fetchedTags.length > 0
          ? await ctx.db
              .select({
                profileId: schema.profileToTag.profileId,
                tagId: schema.profileToTag.tagId,
              })
              .from(schema.profileToTag)
              .where(
                inArray(
                  schema.profileToTag.tagId,
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
                like(schema.profile.body, `%${query}%`),
                like(schema.profile.subHead, `%${query}%`),
              ),
              gte(schema.profile.locationLat, locationLat - rad),
              lte(schema.profile.locationLat, locationLat + rad),
              gte(schema.profile.locationLon, locationLon - rad),
              lte(schema.profile.locationLon, locationLon + rad),
              inArray(
                schema.profile.id,
                tagToProfileLinks.map((tag) => tag.profileId),
              ),
            )
          : and(
              or(
                like(schema.profile.body, `%${query}%`),
                like(schema.profile.subHead, `%${query}%`),
              ),
              inArray(
                schema.profile.id,
                tagToProfileLinks.map((tag) => tag.profileId),
              ),
            );

      const dbSel = await ctx.db
        .select({
          id: schema.profile.id,
          name: schema.users.name,
          userType: schema.users.userType,
          subHead: schema.profile.subHead,
          body: schema.profile.body,
          locationLat: schema.profile.locationLat,
          locationLon: schema.profile.locationLon,
          createdAt: schema.profile.createdAt,
          updatedAt: schema.profile.updatedAt,
          profileOwner: schema.profile.profileOwner,
          profileImage: schema.profile.profileImage,
          resumeFile: schema.profile.resumeFile,
        })
        .from(schema.profile)
        .innerJoin(
          schema.users,
          eq(schema.users.id, schema.profile.profileOwner),
        )
        .where(qry)
        .limit(chunkSize)
        .offset(continuePoint);

      if (dbSel.length === 0) return [];

      const finalTags = await ctx.db
        .select({
          profileId: schema.profileToTag.profileId,
          id: schema.profileToTag.tagId,
          tagType: schema.tag.tagType,
          name: schema.tag.name,
        })
        .from(schema.profileToTag)
        .where(
          inArray(
            schema.profileToTag.profileId,
            dbSel.map((post) => post.id),
          ),
        )
        .innerJoin(schema.tag, eq(schema.tag.id, schema.profileToTag.tagId));

      const selWithTags = dbSel.map((profile) => {
        const tagsCleaned = [
          ...finalTags.filter(
            (tag) =>
              tag.profileId === profile.id &&
              tag.name != null &&
              tag.tagType != null,
          ),
        ];

        const highlights = fetchedTags.filter((tag) =>
          tagToProfileLinks.find(
            (tagLink) =>
              tagLink.profileId === profile.id && tagLink.tagId === tag.id,
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
          ...profile,
          tags: highlightedTags,
        };
      });

      return selWithTags;
    }),

  create: protectedProcedure
    .input(
      z.object({
        subHead: z.string(),
        body: z.string(),
        profileOwner: z.string().length(36),
        tags: z.array(z.string()),
        imageUrl: z.string().optional(),
        resumeUrl: z.string().optional(),
        locationLat: z.number(),
        locationLon: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const id = createId();
      await ctx.db.insert(schema.profile).values({
        id,
        subHead: input.subHead,
        body: input.body,
        profileOwner: input.profileOwner,
        locationLat: input.locationLat,
        locationLon: input.locationLon,
        profileImage: input.imageUrl,
        resumeFile: input.resumeUrl,
      });

      await tagManager({
        linkType: "profile",
        ctx,
        linkId: id,
        tags: input.tags,
        lat: input.locationLat,
        lon: input.locationLon,
      });
    }),

  fileUpdate: protectedProcedure
    .input(
      //TODO: delete old img/res if it changes
      z.object({
        id: z.string(),
        imageUrl: z.string().optional(),
        resumeUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(schema.profile)
        .set({
          profileImage: input.imageUrl,
          resumeFile: input.resumeUrl,
        })
        .where(eq(schema.profile.id, input.id));
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        subHead: z.string(),
        body: z.string(),
        tags: z.array(z.string()),
        locationLat: z.number(),
        locationLon: z.number(),
        imageUrl: z.string().optional(),
        resumeUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      //TODO: delete old img/res if it changes
      await ctx.db
        .update(schema.profile)
        .set({
          subHead: input.subHead,
          body: input.body,
          locationLat: input.locationLat,
          locationLon: input.locationLon,
          profileImage: input.imageUrl,
          resumeFile: input.resumeUrl,
        })
        .where(eq(schema.profile.id, input.id));

      if (input.name) {
        await ctx.db
          .update(schema.users)
          .set({
            name: input.name,
          })
          .where(eq(schema.users.id, ctx.session?.user.id));
      }

      await tagManager({
        linkType: "profile",
        ctx,
        linkId: input.id,
        tags: input.tags,
        lat: input.locationLat,
        lon: input.locationLon,
      });
    }),

  delete: eduProcedure.mutation(async ({ ctx }) => {
    //TODO: delete resume and pfp
    if (!ctx.session) throw new Error("User not logged in");
    await ctx.db
      .delete(schema.post)
      .where(eq(schema.post.postCreator, ctx.session.user.id));
    await ctx.db
      .delete(schema.jobApplication)
      .where(eq(schema.jobApplication.applicantId, ctx.session.user.id));
    return ctx.db
      .delete(schema.profile)
      .where(eq(schema.profile.profileOwner, ctx.session.user.id));
  }),
});
