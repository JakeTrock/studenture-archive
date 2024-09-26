import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import { text, timestamp, varchar } from "drizzle-orm/mysql-core";

import { mySqlTable } from "./_table";
import { users } from "./auth";
import { post } from "./post";

export const jobApplication = mySqlTable("job_application", {
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey()
    .unique(), //used for step 1, resume attachments
  applicantId: varchar("applicant_id", { length: 128 }).notNull(),
  jobId: varchar("job_id", { length: 128 }).notNull(),

  coverLetter: text("cover_letter"), //step 2 of process

  //approval status enumeration
  approvalStatus: varchar("approval_status", {
    enum: [
      "cancelled",
      "applied",
      "rejectedResume",
      "resumeApproved",
      "rejectedCoverLetter",
      "approved",
    ],
    length: 255,
  })
    .default("applied")
    .notNull(),

  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
});

export const jobApplicationRelations = relations(jobApplication, ({ one }) => ({
  applicant: one(users, {
    fields: [jobApplication.applicantId],
    references: [users.id],
  }),
  job: one(post, { fields: [jobApplication.jobId], references: [post.id] }),
}));
