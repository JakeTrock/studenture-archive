import TopbarParent from "~/app/_components/helpers/topbarParent";
import PostCreateStatic from "~/app/new/post/postCreateStatic";

export default function Page() {
  return (
    <>
      <TopbarParent>
        <div className="min-h-screen w-full bg-gray-100">
          <p>&nbsp;</p>
          <PostCreateStatic />
        </div>
      </TopbarParent>
    </>
  );
}
