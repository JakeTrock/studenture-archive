import { z } from "zod";

import { and, eq, ne, schema } from "@acme/db";

import {
  createTRPCRouter,
  eduProcedure,
  studentOrVentureProcedure,
} from "../trpc";

const chunkSize = 5;

export const jobApplicationRouter = createTRPCRouter({
  getApplicationsFeedChunk: studentOrVentureProcedure
    .input(
      z.object({
        continuePoint: z.number(),
        posting: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const dbSel = await ctx.db
        .select()
        .from(schema.jobApplication)
        .where(eq(schema.jobApplication.jobId, input.posting))
        .limit(chunkSize)
        .offset(input.continuePoint);

      const allApplicants = dbSel.map((element) =>
        ctx.db
          .select()
          .from(schema.profile)
          .where(eq(schema.profile.id, element.applicantId)),
      );

      const applicantProfiles = await Promise.all(allApplicants);

      const applicants = applicantProfiles.map(
        (element) =>
          element[0]?.id !== undefined && {
            profile: element[0],
            application: dbSel.find(
              (application) => application.applicantId === element[0]?.id,
            ),
          },
      );

      return applicants;
    }),

  changeApprovalStatus: studentOrVentureProcedure
    .input(
      z.object({
        application: z.string(),
        approvalStatus: z.enum([
          "applied",
          "rejectedResume",
          "resumeApproved",
          "rejectedCoverLetter",
          "approved",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      //check if user owns job posting
      const posting = await ctx.db.query.post.findFirst({
        columns: {
          id: true,
        },
        where: and(
          eq(schema.post.id, input.application),
          eq(schema.post.postCreator, ctx.session?.user.profileId),
        ),
      });

      if (posting === null || posting === undefined) {
        throw new Error("User not authorized to edit this application");
      }

      return ctx.db
        .update(schema.jobApplication)
        .set({
          approvalStatus: input.approvalStatus,
        })
        .where(
          and(
            eq(schema.jobApplication.id, input.application),
            eq(schema.jobApplication.jobId, posting.id),
            ne(schema.jobApplication.approvalStatus, "cancelled"),
            ne(schema.jobApplication.approvalStatus, "approved"),
          ),
        );
    }),

  applyToJob: eduProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(schema.jobApplication).values({
        applicantId: ctx.session.user.profileId,
        jobId: input,
      });
    }),

  addCoverLetter: eduProcedure
    .input(
      z.object({
        application: z.string(),
        coverLetter: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.db
        .select()
        .from(schema.jobApplication)
        .where(eq(schema.jobApplication.id, input.application));

      if (application.length === 0 || application[0]?.id === undefined) {
        throw new Error("Application not found");
      }

      if (application[0]?.applicantId !== ctx.session?.user.profileId) {
        throw new Error("User not authorized to edit this application");
      }

      return ctx.db
        .update(schema.jobApplication)
        .set({
          coverLetter: input.coverLetter,
        })
        .where(eq(schema.jobApplication.id, input.application));
    }),

  checkAllApplicationsStatus: eduProcedure.query(async ({ ctx }) => {
    const applications = await ctx.db
      .select({
        jobId: schema.jobApplication.jobId,
        approvalStatus: schema.jobApplication.approvalStatus,
      })
      .from(schema.jobApplication)
      .where(eq(schema.jobApplication.applicantId, ctx.session.user.id));

    const applicationNames = applications.map((element) =>
      ctx.db
        .select({
          id: schema.post.id,
          name: schema.post.title,
        })
        .from(schema.post)
        .where(eq(schema.post.id, element.jobId)),
    );

    const applicationNamesResolved = await Promise.all(applicationNames);

    const mergedStatus = applications.map((element) => {
      return {
        ...element,
        ...applicationNamesResolved.find(
          (application) => application[0]?.id === element.jobId,
        ),
      };
    });

    return mergedStatus;
  }),

  cancelApplication: eduProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: applicationId }) => {
      return ctx.db
        .update(schema.jobApplication)
        .set({
          approvalStatus: "cancelled",
        })
        .where(
          and(
            eq(schema.jobApplication.id, applicationId),
            eq(schema.jobApplication.applicantId, ctx.session?.user.profileId),
            ne(schema.jobApplication.approvalStatus, "cancelled"),
          ),
        );
    }),
});
