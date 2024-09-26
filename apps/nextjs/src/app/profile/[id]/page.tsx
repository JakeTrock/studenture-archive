import TopbarParent from "~/app/_components/helpers/topbarParent";
import ProfileStatic from "~/app/profile/[id]/profileStatic";

export default function Page({ params }: { params: { id: string } }) {
  return (
    <>
      <TopbarParent>
        <div className="min-h-screen w-full bg-gray-100">
          <p>&nbsp;</p>
          <ProfileStatic id={params.id} />
        </div>
      </TopbarParent>
    </>
  );
}
