"use client";

import Link from "next/link";

import { PostCard } from "~/app/_components/helpers/forms/post/postCard";
import { PostCardSkeleton } from "~/app/_components/helpers/forms/post/postCardSkeleton";
import type { RouterOutputs } from "~/utils/api";

export function PostList({
  posts,
}: {
  posts:
    | RouterOutputs["post"]["byId"][]
    | RouterOutputs["post"]["naturalSearch"]
    | []
    | undefined;
}) {
  if (!posts || posts.length === 0) {
    return (
      <div className="relative flex w-full flex-col gap-4">
        <PostCardSkeleton pulse={false} />
        <PostCardSkeleton pulse={false} />
        <PostCardSkeleton pulse={false} />

        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
          <p className="text-2xl font-bold text-white">No posts yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {posts.map((p) => {
        if (p)
          return (
            <Link href={`/post/${p.id}`}>
              <PostCard key={p.id} post={p} condensed={true} />
            </Link>
          );
      })}
    </div>
  );
}
