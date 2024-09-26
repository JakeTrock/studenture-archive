import { authRouter } from "./router/auth";
import { jobApplicationRouter } from "./router/jobApplication";
import { postRouter } from "./router/post";
import { profileRouter } from "./router/profile";
import { tagRouter } from "./router/tag";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  profile: profileRouter,
  tag: tagRouter,
  jobApplication: jobApplicationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
