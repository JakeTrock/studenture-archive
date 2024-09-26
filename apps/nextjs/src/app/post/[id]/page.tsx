import TopbarParent from "~/app/_components/helpers/topbarParent";
import PostStatic from "~/app/post/[id]/postStatic";

export default function Page({ params }: { params: { id: string } }) {
  return (
    <>
      <TopbarParent>
        <div className="min-h-screen w-full bg-gray-100">
          <p>&nbsp;</p>
          <PostStatic id={params.id} />
        </div>
      </TopbarParent>
    </>
  );
}
