/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";

import { PostList } from "~/app/_components/helpers/forms/post/postList";
import { ProfileCardSkeleton } from "~/app/_components/helpers/forms/profile/profileCardSkeleton";
import MapDisplay from "~/app/_components/helpers/subComponents/map/mapDisplay";
import { SimpleListDisplay } from "~/app/_components/helpers/subComponents/tag/tagListDisplay";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

export function ProfileCard({
  profile,
  condensed,
}: {
  profile:
    | RouterOutputs["profile"]["byId"]
    | RouterOutputs["profile"]["byUserId"]
    | RouterOutputs["profile"]["naturalSearch"][number]
    | undefined;
  condensed?: boolean;
}) {
  if (!profile)
    return (
      <>
        <div className="relative flex w-full flex-col gap-4">
          <ProfileCardSkeleton pulse={false} />

          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
            <p className="text-2xl font-bold text-white">No profile found.</p>
          </div>
        </div>
      </>
    );
  const {
    name,
    userType,
    subHead,
    tags,
    body,
    locationLat,
    locationLon,
    createdAt,
    updatedAt,
    profileImage,
    resumeFile,
    id,
  } = profile;
  const { data: userData } = api.auth.getSession.useQuery();
  const deleteProfile = api.profile.delete.useMutation();

  const posts = id && api.post.byProfileId.useQuery(id);

  return (
    <div className="relative flex w-full flex-col gap-4 rounded-lg bg-white/10 p-4 transition-all">
      <div className="flex-grow">
        {!condensed && (
          <img
            alt="profile upload preview"
            src={
              profileImage ?? "/_next/static/media/studenture_icon.eceddbeb.svg"
            }
            className="w-max-40 h-max-40 mx-auto rounded-full"
          />
        )}
        {name && <h2 className="text-2xl font-bold text-blue-400">{name}</h2>}
        {userType && (
          <p className="text-sm font-thin text-gray-400">{userType}</p>
        )}
        <h3 className="text-xl font-semibold text-green-500">{subHead}</h3>
        <hr />
        <span className="flex justify-center space-x-3">
          {!condensed && locationLat && locationLon && (
            <div className="h-80 w-80">
              <MapDisplay lat={locationLat} lng={locationLon} />
            </div>
          )}
        </span>
        <SimpleListDisplay elements={tags} />
        <div className="overflow-auto break-words">
          <p className="mt-2 text-sm text-gray-600">{body}</p>
        </div>
        <span className="flex justify-center space-x-3">
          {createdAt && (
            <p className="mt-2 text-sm text-gray-300">
              Created at: {createdAt.toDateString()}
            </p>
          )}
          {updatedAt && (
            <p className="mt-2 text-sm text-gray-300">
              Updated at: {updatedAt.toDateString()}
            </p>
          )}
          {!condensed && userData?.user.profileId === id && (
            <>
              <Link
                href={`/edit/profile`}
                className="rounded bg-green-400 p-2 font-bold hover:scale-[103%]"
              >
                Edit your profile
              </Link>
              <button
                type="button"
                className="cursor-pointer text-sm font-bold uppercase text-red-400"
                onClick={async () =>
                  confirmDialog(
                    "Are you sure you want to delete your profile?",
                  ).then(async (result) => {
                    if (result) {
                      await deleteProfile.mutateAsync();
                    }
                  })
                }
                color={"#f472b6"}
              >
                Delete your profile(!)
              </button>
            </>
          )}
        </span>

        {!condensed && resumeFile && (
          <span className="flex flex-col space-x-3">
            <h1 className="text-4xl font-bold text-gray-800">Resume:</h1>
            <button
              type="button"
              className="rounded bg-gray-500 p-2 hover:scale-[103%]"
            >
              <a href={resumeFile} target="_blank" rel="noreferrer">
                Download
              </a>
            </button>
            <iframe
              className="overflow-scroll border-2 border-green-500 bg-gray-200 p-4"
              src={resumeFile}
              title="resumeDisplay"
            />
          </span>
        )}

        {!condensed && (
          <>
            <span className="flex space-x-3">
              <h1 className="text-4xl font-bold text-gray-800">Posts:</h1>
              {userData?.user.profileId === id && (
                <>
                  <Link
                    href={`/new/post`}
                    className="rounded bg-gray-500 p-2 hover:scale-[103%]"
                  >
                    + new
                  </Link>
                </>
              )}
            </span>

            <div className="overflow-scroll border-2 border-green-500">
              {posts === "" || !posts?.data ? (
                <>
                  <h2>No posts yet.</h2>
                </>
              ) : (
                <PostList posts={posts?.data} />
              )}
            </div>
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
