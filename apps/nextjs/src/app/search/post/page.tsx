import TopbarParent from "~/app/_components/helpers/topbarParent";
import TagSearch from "~/app/search/post/postSearch";

export const runtime = "edge";

export default function PostSearchPage() {
  return (
    <TopbarParent>
      <TagSearch />
    </TopbarParent>
  );
}
