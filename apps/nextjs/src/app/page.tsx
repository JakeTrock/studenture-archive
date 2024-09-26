import TopbarParent from "~/app/_components/helpers/topbarParent";
import HomeView from "~/app/_components/views/homeView";

export const runtime = "edge";

export default function HomePage() {
  return (
    <TopbarParent>
      <HomeView />
    </TopbarParent>
  );
}
