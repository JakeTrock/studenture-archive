/* eslint-disable @typescript-eslint/unbound-method */
import Google from "@auth/core/providers/google";
import type { DefaultSession } from "@auth/core/types";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import { Resend } from "resend";

import { db, eq, schema, tableCreator } from "@acme/db";

import VerifyEmail from "./verifyEmail";

export type { Session } from "next-auth";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      profileId: string;
      isEdu: boolean;
      userType: "user" | "banned" | "student" | "venture" | "admin";
    } & DefaultSession["user"];
  }
}

const commonEmailProviders = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
];

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: DrizzleAdapter(db, tableCreator),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    {
      id: "email",
      type: "email",
      name: "Email",
      server: {},
      from: `NoReply <${process.env.EMAIL_FROM ?? "noReply@studenture.com"}>`,
      maxAge: 24 * 60 * 60,
      async sendVerificationRequest(params) {
        const { identifier, url, theme } = params;
        const result = await resend.emails.send({
          from: process.env.EMAIL_FROM ?? "noReply@studenture.com",
          to: identifier,
          subject: "Studenture - Please verify your email.",
          react: VerifyEmail({ url, isDarkmode: theme.colorScheme === "dark" }),
          html: `<p>To login, please <a style="color: ${
            theme.colorScheme === "dark" ? "darkgreen" : "lightgreen"
          }; text-decoration: underline;" href="${url}">Click Here</a></p>`,
        });
        const failed = result.error;
        if (failed) {
          throw result.error;
        }
      },
      options: {},
    },
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (!user.email) {
        throw new Error("Null email error");
      }

      const usrResult = await db.query.users.findFirst({
        columns: {
          userType: true,
          name: true,
        },
        where: eq(schema.users.email, user.email),
      });

      if (!usrResult) {
        throw new Error("User not found");
      }
      const { userType, name: uname } = usrResult;

      if (userType === "user") {
        const insertion: Record<string, string> = {};
        //TODO: temporary hack until we create a proper user typer
        if (userType === "user") {
          if (user.email.endsWith("@studenture.com"))
            insertion.userType = "admin";
          else if (user.email.endsWith(".edu")) insertion.userType = "student";
          else if (!commonEmailProviders.includes(user.email.split("@")[1]!))
            insertion.userType = "employer";
        }
        if (!uname) {
          insertion.name = user.email.split("@")[0] ?? "Anonymous";
        }

        if (Object.keys(insertion).length > 0) {
          await db
            .update(schema.users)
            .set(insertion)
            .where(eq(schema.users.email, user.email));
        }
      }

      const usrProfile = await db.query.profile.findFirst({
        columns: {
          id: true,
        },
        where: eq(schema.profile.profileOwner, user.id),
      });

      let profileId = "";

      if (!usrProfile) {
        // T_T we don't get insert returning https://orm.drizzle.team/docs/insert#insert-returning
        await db
          .insert(schema.profile)
          .values({
            profileOwner: user.id,
            subHead: "Nothing here (yet)",
          })
          .then(async () =>
            db.query.profile
              .findFirst({
                columns: {
                  id: true,
                },
                where: eq(schema.profile.profileOwner, user.id),
              })
              .then((res) => {
                if (!res) {
                  throw new Error("Profile not found");
                }
                profileId = res.id;
              }),
          );
      } else {
        profileId = usrProfile.id;
      }

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          userType: userType,
          profileId,
          isEdu: user.email.endsWith(".edu"),
        },
      };
    },
  },
});

//sql find with composite key
//select * from users where id = 1 and providerAccountId = 2
