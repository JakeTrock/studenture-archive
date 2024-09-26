"use client";

import { PostCard } from "~/app/_components/helpers/forms/post/postCard";
import { ProfileCard } from "~/app/_components/helpers/forms/profile/profileCard";
import { api } from "~/utils/api";

export default function PostStatic({ id }: { id: string }) {
  const { data } = api.post.byId.useQuery(id);
  const { data: profile } = api.profile.byId.useQuery(data?.postCreator ?? "");

  return (
    <>
      <PostCard post={data} />
      <hr />
      <h1 className="pl-4 text-4xl font-bold text-gray-800">Posting by:</h1>
      {profile && <ProfileCard profile={profile} condensed={true} />}
    </>
  );
}
