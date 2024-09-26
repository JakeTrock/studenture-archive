"use client";

import { ProfileCard } from "~/app/_components/helpers/forms/profile/profileCard";
import { api } from "~/utils/api";

export default function ProfileStatic({ id }: { id: string }) {
  const { data } = api.profile.byId.useQuery(id);

  return <ProfileCard profile={data} />;
}
