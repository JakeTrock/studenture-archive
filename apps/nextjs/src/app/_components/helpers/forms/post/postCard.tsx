"use client";

import Link from "next/link";

import { PostCardSkeleton } from "~/app/_components/helpers/forms/post/postCardSkeleton";
import MapDisplay from "~/app/_components/helpers/subComponents/map/mapDisplay";
import { SimpleListDisplay } from "~/app/_components/helpers/subComponents/tag/tagListDisplay";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

export function PostCard({
  post,
  condensed,
}: {
  post:
    | RouterOutputs["post"]["byId"]
    | RouterOutputs["post"]["byProfileId"][number]
    | RouterOutputs["post"]["naturalSearch"][number]
    | undefined;
  condensed?: boolean;
}) {
  if (!post)
    return (
      <>
        <div className="relative flex w-full flex-col gap-4">
          <PostCardSkeleton pulse={false} />

          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
            <p className="text-2xl font-bold text-white">No post found.</p>
          </div>
        </div>
      </>
    );
  const {
    locationLat,
    locationLon,
    title,
    subHead,
    applyLink,
    tags,
    body,
    postCreator,
    postingType,
    id,
  } = post;
  const { data: userData } = api.auth.getSession.useQuery();
  const deletePost = api.post.delete.useMutation();
  // const applyToPost = api.jobApplication.applyToJob.useMutation();

  return (
    <div
      className={`relative flex w-full flex-col gap-4 rounded-lg bg-white/10 p-4 transition-all ${
        postingType === "student" ? "bg-orange-300" : "bg-blue-300"
      }`}
    >
      <div className="flex-grow break-words rounded-md bg-stone-200 p-2">
        <h2 className="text-2xl font-bold text-blue-400">{title}</h2>
        <h3 className="text-xl font-semibold text-green-500">{subHead}</h3>
        <span className="flex justify-center space-x-3">
          {!condensed && locationLat && locationLon && (
            <div className="h-80 w-80">
              <MapDisplay lat={locationLat} lng={locationLon} />
            </div>
          )}
        </span>
        {!!tags && Array.isArray(tags) && tags.length > 0 && (
          <SimpleListDisplay elements={tags} />
        )}
        <div className="overflow-auto">
          <p className="mt-2 text-sm text-gray-600">{body}</p>
        </div>
      </div>
      <div className="space-x-2">
        {userData?.user.profileId === postCreator ? (
          <>
            <Link
              href={`/edit/post/${id}`}
              className="rounded bg-green-400 p-2 font-bold hover:scale-[103%]"
            >
              Edit this post
            </Link>
            <button
              type="button"
              className="cursor-pointer text-sm font-bold uppercase text-red-400"
              onClick={async () => {
                if (!id) throw new Error("No id");
                await deletePost.mutateAsync(id);
              }}
              color={"#f472b6"}
            >
              Delete post
            </button>
          </>
        ) : (
          <>
            {!userData || !userData?.user.isEdu ? (
              <button
                type="button"
                className="cursor-pointer rounded-md bg-slate-200 p-2 text-sm font-bold uppercase text-green-400 hover:scale-[101%]"
                onClick={async () => {
                  // if (!id) throw new Error("No id");
                  // await applyToPost.mutateAsync(id);
                  //if user is not student, alert
                  await confirmDialog(
                    "Only students can apply to jobs, would you like to sign up as a student?",
                  ).then((confirmed) => {
                    if (confirmed) {
                      window.location.href = "/authn";
                    }
                  });
                  return;
                }}
              >
                Apply to job
              </button>
            ) : (
              <Link
                href={
                  applyLink.includes("@") ? `mailto:${applyLink}` : applyLink
                }
                className="rounded bg-green-400 p-2 font-bold hover:scale-[103%]"
              >
                Apply to job
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const confirmDialog = (msg: string) =>
  new Promise<boolean>((resolve, _reject) => {
    const confirmed = window.confirm(msg);
    return resolve(confirmed);
  });
