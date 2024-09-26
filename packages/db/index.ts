import { Client } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import * as auth from "./schema/auth";
import * as jobApplication from "./schema/jobApplication";
import * as post from "./schema/post";
import * as profile from "./schema/profile";
import * as tag from "./schema/tag";

export const schema = {
  ...auth,
  ...post,
  ...profile,
  ...jobApplication,
  ...tag,
};

export { mySqlTable as tableCreator } from "./schema/_table";

export * from "drizzle-orm";

export const db = drizzle(
  new Client({
    url: process.env.DATABASE_URL,
  }).connection(),
  { schema },
);
