import type { StaticImport } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";

import headerImage from "~/styles/studenture_icon.svg"; // Import the header image

export default function HomeView() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Image
        src={headerImage as StaticImport}
        alt="Studenture Header"
        className="w-30 h-30"
      />

      <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
        Studenture
      </h1>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800">Welcome to My App</h1>
        <p className="mt-4 text-lg text-gray-600">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
          auctor, nisl eu lacinia tincidunt, nunc mauris aliquet nunc, nec
          fermentum nunc nunc id nunc.
        </p>
      </main>
    </div>
  );
}
