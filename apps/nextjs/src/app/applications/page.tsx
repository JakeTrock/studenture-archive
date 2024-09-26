import TopbarParent from "~/app/_components/helpers/topbarParent";
import ApplicationsStatic from "~/app/applications/applicationsStatic";

export default function Page() {
  return (
    <>
      <TopbarParent>
        <div className="min-h-screen w-full bg-gray-100">
          <p>&nbsp;</p>
          <ApplicationsStatic />
        </div>
      </TopbarParent>
    </>
  );
}
