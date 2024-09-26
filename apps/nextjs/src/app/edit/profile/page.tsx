import TopbarParent from "~/app/_components/helpers/topbarParent";
import ProfileEditStatic from "~/app/edit/profile/profileEditStatic";

export default function Page() {
  return (
    <>
      <TopbarParent>
        <div className="min-h-screen w-full bg-gray-100">
          <p>&nbsp;</p>
          <ProfileEditStatic />
        </div>
      </TopbarParent>
    </>
  );
}
