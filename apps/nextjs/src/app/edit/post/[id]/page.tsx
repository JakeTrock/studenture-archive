import TopbarParent from "~/app/_components/helpers/topbarParent";
import PostEditStatic from "~/app/edit/post/[id]/postEditStatic";

export default function Page({ params }: { params: { id: string } }) {
  return (
    <>
      <TopbarParent>
        <div className="min-h-screen w-full bg-gray-100">
          <p>&nbsp;</p>
          <PostEditStatic id={params.id} />
        </div>
      </TopbarParent>
    </>
  );
}
