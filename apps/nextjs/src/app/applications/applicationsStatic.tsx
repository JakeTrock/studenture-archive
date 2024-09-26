"use client";

import { PostCardSkeleton } from "~/app/_components/helpers/forms/post/postCardSkeleton";
import { api } from "~/utils/api";

export default function ApplicationsStatic() {
  const { data } = api.jobApplication.checkAllApplicationsStatus.useQuery();

  if (!data || data.length < 1)
    return (
      <>
        <div className="relative flex w-full flex-col gap-4">
          <PostCardSkeleton pulse={false} />
          <PostCardSkeleton pulse={false} />
          <PostCardSkeleton pulse={false} />

          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
            <p className="text-2xl font-bold text-white">No applications yet</p>
          </div>
        </div>
      </>
    );

  return (
    <>
      <div className="container mx-auto flex flex-col gap-4">
        {data?.map((application) => (
          <div key={application.jobId}>
            <p>
              {application.jobId} - {application.approvalStatus}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
