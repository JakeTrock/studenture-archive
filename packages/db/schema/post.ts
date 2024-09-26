import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import { float, text, timestamp, varchar } from "drizzle-orm/mysql-core";

import { mySqlTable } from "./_table";
import { users } from "./auth";
import { postToTag } from "./tag";

/**
 INSERT INTO t3turbo_post
    (postCreator, title, subHead, body, locationLon, locationLat)
VALUES (1, 'Test Post', 'Test Subhead', 'Test Body', 0, 0);
 */

export const post = mySqlTable("post", {
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey()
    .unique(),
  postCreator: varchar("post_creator", { length: 128 }).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  subHead: varchar("sub_head", { length: 256 }).notNull(),
  applyLink: varchar("apply_link", { length: 256 }).notNull(),
  body: text("body").notNull(),
  postingType: varchar("posting_type", {
    enum: ["student", "venture"],
    length: 16,
  })
    .default("venture")
    .notNull(),
  locationLon: float("location_lon").notNull(),
  locationLat: float("location_lat").notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
});

export const postRelations = relations(post, ({ many, one }) => ({
  usersToGroups: many(postToTag),
  creator: one(users, { fields: [post.postCreator], references: [users.id] }),
}));
