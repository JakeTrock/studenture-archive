import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import { float, text, timestamp, varchar } from "drizzle-orm/mysql-core";

import { mySqlTable } from "./_table";
import { users } from "./auth";
import { profileToTag } from "./tag";

export const profile = mySqlTable("profile", {
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey()
    .unique(),
  profileOwner: varchar("profile_owner", { length: 36 }).notNull(),
  subHead: varchar("sub_head", { length: 512 }).notNull(),
  profileImage: varchar("profile_image", { length: 512 }),
  resumeFile: varchar("resume_file", { length: 512 }),
  locationLon: float("locationLon").default(-73.98513).notNull(),
  locationLat: float("locationLat").default(40.758896).notNull(),
  body: text("body"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
});

export const postRelations = relations(profile, ({ many, one }) => ({
  usersToGroups: many(profileToTag),
  creator: one(users, {
    fields: [profile.profileOwner],
    references: [users.id],
  }),
}));
