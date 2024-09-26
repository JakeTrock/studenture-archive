import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { primaryKey, varchar } from "drizzle-orm/mysql-core";

import { mySqlTable } from "./_table";
import { post } from "./post";
import { profile } from "./profile";

/*
INSERT INTO t3turbo_tag (name)
VALUES ("fordham");
*/

export const tag = mySqlTable("tag", {
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey()
    .unique(),
  tagType: varchar("tag_type", {
    enum: ["userFlair", "payType", "location", "timezone", "userGen"],
    length: 16,
  })
    .default("userGen")
    .notNull(),
  name: varchar("name", { length: 256 }).notNull().unique(),
});

export const tagRelations = relations(tag, ({ many }) => ({
  postToTag: many(postToTag),
  profileToTag: many(profileToTag),
}));

export const profileToTag = mySqlTable(
  "profile_to_tag",
  {
    profileId: varchar("profile_id", { length: 128 }).notNull(),
    tagId: varchar("tag_id", { length: 128 }).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.profileId, t.tagId] }),
  }),
);
export const profileToTagRelation = relations(profileToTag, ({ one }) => ({
  tag: one(tag, {
    fields: [profileToTag.tagId],
    references: [tag.id],
  }),
  profile: one(profile, {
    fields: [profileToTag.profileId],
    references: [profile.id],
  }),
}));

export const postToTag = mySqlTable(
  "post_to_tag",
  {
    postId: varchar("post_id", { length: 128 }).notNull(),
    tagId: varchar("tag_id", { length: 128 }).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.postId, t.tagId] }),
  }),
);
export const postToTagRelation = relations(postToTag, ({ one }) => ({
  tag: one(tag, {
    fields: [postToTag.tagId],
    references: [tag.id],
  }),
  post: one(post, {
    fields: [postToTag.postId],
    references: [post.id],
  }),
}));
