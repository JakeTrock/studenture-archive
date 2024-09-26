"use client";

import { ProfileCard } from "~/app/_components/helpers/forms/profile/profileCard";
import { ProfileCardSkeleton } from "~/app/_components/helpers/forms/profile/profileCardSkeleton";
import type { RouterOutputs } from "~/utils/api";

export function ProfileList({
  profiles,
}: {
  profiles:
    | RouterOutputs["profile"]["byId"][]
    | RouterOutputs["profile"]["naturalSearch"]
    | []
    | undefined;
}) {
  if (!profiles || profiles.length === 0) {
    return (
      <div className="relative flex w-full flex-col gap-4">
        <ProfileCardSkeleton pulse={false} />
        <ProfileCardSkeleton pulse={false} />
        <ProfileCardSkeleton pulse={false} />

        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
          <p className="text-2xl font-bold text-white">No profiles yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {profiles.map((p) => {
        if (p) return <ProfileCard condensed={true} key={p.id} profile={p} />;
      })}
    </div>
  );
}
