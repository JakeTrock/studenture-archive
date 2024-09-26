import { and, eq, inArray, schema } from "@acme/db";
import type { db as acmeDb } from "@acme/db";

import { getTzAndNearby } from "../helpers/getTzAndNearby";

const maxTagLength = 10;

// abstract the tag insert/update logic, include loc tag update logic
export async function tagManager({
  linkType,
  ctx,
  linkId,
  tags,
  lat,
  lon,
}: {
  linkType: "post" | "profile";
  ctx: {
    db: typeof acmeDb;
  };
  linkId: string;
  tags: string[];
  lat: number;
  lon: number;
}) {
  // we can actually do this because we push up all the tags every time, so this is a valid check
  if (tags.length > maxTagLength)
    throw new Error(`Too many tags, max is ${maxTagLength}`);

  if (tags.length) {
    const existingTags = await ctx.db.query.tag.findMany({
      where: inArray(schema.tag.name, tags),
    });

    if (linkType === "post") {
      const payTypeTag = existingTags.filter(
        (tag) => tag.tagType === "payType",
      );
      if (!payTypeTag) {
        throw new Error("No pay type tag found");
      } else if (payTypeTag.length > 1) {
        throw new Error("Too many pay type tags found");
      }
    }

    const existingNames = existingTags.map((tag) => tag.name);

    const novelTags = tags
      .filter((tag) => !existingNames.includes(tag))
      .map((tag) => ({ name: tag, tagType: "userGen" as const }));

    if (novelTags.length) {
      await ctx.db.insert(schema.tag).values(novelTags);
    }
  }

  const tdata = await getTzAndNearby(lat, lon);

  const newIds = await ctx.db
    .select({
      id: schema.tag.id,
    })
    .from(schema.tag)
    .where(
      inArray(schema.tag.name, [
        ...tags, // mixing in tz/loc tags
        ...tdata,
      ]),
    );

  const deletionPromises = (async () => {
    if (linkType === "post") {
      const existingLinkages = await ctx.db.query.postToTag.findMany({
        where: eq(schema.postToTag.postId, linkId),
      });
      const nonOverlappingIds = existingLinkages.filter(
        (existingLinkage) =>
          !newIds.find((newId) => newId.id === existingLinkage.tagId),
      );
      return nonOverlappingIds.map(async (nonOverlapId) =>
        ctx.db
          .delete(schema.postToTag)
          .where(
            and(
              eq(schema.postToTag.postId, linkId),
              eq(schema.postToTag.tagId, nonOverlapId.tagId),
            ),
          ),
      );
    } else {
      const existingLinkages = await ctx.db.query.profileToTag.findMany({
        where: eq(schema.profileToTag.profileId, linkId),
      });
      const nonOverlappingIds = existingLinkages.filter(
        (existingLinkage) =>
          !newIds.find((newId) => newId.id === existingLinkage.profileId),
      );
      return nonOverlappingIds.map(async (nonOverlapId) =>
        ctx.db
          .delete(schema.profileToTag)
          .where(
            and(
              eq(schema.profileToTag.profileId, linkId),
              eq(schema.profileToTag.tagId, nonOverlapId.tagId),
            ),
          ),
      );
    }
  })();

  const linkTagPromises =
    linkType === "post"
      ? newIds.map(async (tag) =>
          ctx.db.insert(schema.postToTag).values({
            postId: linkId,
            tagId: tag.id,
          }),
        )
      : newIds.map(async (tag) =>
          ctx.db.insert(schema.profileToTag).values({
            profileId: linkId,
            tagId: tag.id,
          }),
        );

  const preprocessedDeletionPromises = await deletionPromises;

  await Promise.allSettled([preprocessedDeletionPromises, ...linkTagPromises]);
}
