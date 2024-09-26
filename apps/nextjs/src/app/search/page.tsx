import Link from "next/link";

import TopbarParent from "~/app/_components/helpers/topbarParent";

export const runtime = "edge";

export default function BrowsePage() {
  return (
    <TopbarParent>
      <div className="min-h-screen w-full bg-gray-100">
        <main className="container mx-auto px-4 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <main className="grid grid-cols-[240px_1fr] items-start gap-10">
              <div className="flex flex-col gap-4">
                <h1>Search Profiles:</h1>
                <Link
                  className="rounded bg-blue-400 p-2 font-bold"
                  href="/search/profile"
                >
                  Search Profiles
                </Link>
                <hr />
                <h1>Search Posts:</h1>
                <Link
                  className="rounded bg-blue-400 p-2 font-bold"
                  href="/search/post"
                >
                  Search Posts
                </Link>
              </div>
            </main>
          </div>
        </main>
      </div>
    </TopbarParent>
  );
}
