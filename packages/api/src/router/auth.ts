// import { eq, schema } from "@acme/db";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  // contextRedirect: publicProcedure.query(async ({ ctx }) => {
  //   const {userType} = ctx.session?.user;
  //   if (userType) {
  //     if (!userType) {
  //       return `home`;
  //     } else {
  //       return userType;
  //     }
  //   } else {
  //     return `home`;
  //   }
  // }),
  // getSecretMessage: protectedProcedure.query(() => {
  //   // testing type validation of overridden next-auth Session in @acme/auth package
  //   return "you can see this secret message!";
  // }),
});
