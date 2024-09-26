import type { StaticImport } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";

import { AuthShowcase } from "~/app/_components/auth-showcase";
import TopbarParent from "~/app/_components/helpers/topbarParent";
import headerImage from "~/styles/adecosample.jpg";

export const runtime = "edge";

export default function AuthView() {
  return (
    <TopbarParent>
      <div className="min-h-screen bg-gray-100">
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-center text-4xl font-bold text-gray-800">
            Authentication
          </h1>
          <br />
          <AuthShowcase />
        </main>
      </div>
      <Image
        src={headerImage as StaticImport}
        alt="flavor image of man standing against background"
        className="w-30 h-30"
      />
    </TopbarParent>
  );
}
