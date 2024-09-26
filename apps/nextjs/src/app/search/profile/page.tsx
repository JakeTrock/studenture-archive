import TopbarParent from "~/app/_components/helpers/topbarParent";
import ProfileSearch from "~/app/search/profile/profileSearch";

export const runtime = "edge";

export default function ProfileSearchPage() {
  return (
    <TopbarParent>
      <ProfileSearch />
    </TopbarParent>
  );
}
