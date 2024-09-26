import type { StaticImport } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";
import Link from "next/link";

import { auth } from "@acme/auth";

import headerImage from "~/styles/studenture_icon.svg"; // Import the header image

export const runtime = "edge";

export default async function TopbarParent({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <main className="flex h-screen flex-col items-center bg-gradient-to-b from-[#78e765] to-[#23265e] text-black">
      <nav className="container mx-auto flex items-center justify-between bg-white px-4 py-2">
        <div className="flex space-x-4">
          <Image
            src={headerImage as StaticImport}
            alt="Studenture Header"
            className="h-10 w-10 justify-start"
          />
          <div className="justify-start text-2xl font-extrabold tracking-tight text-black">
            studenture
          </div>
        </div>

        <ul className="flex space-x-4">
          <li>
            <Link
              className="rounded bg-blue-400 p-2 font-bold hover:scale-[103%]"
              href="/"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              className="rounded bg-blue-400 p-2 font-bold hover:scale-[103%]"
              href="/search"
            >
              Search
            </Link>
          </li>
          {session ? (
            <>
              {session?.user.userType === "student" && (
                <li className="hidden lg:inline">
                  <Link
                    className="rounded bg-blue-400 p-2 font-bold"
                    href="/applications"
                  >
                    My Applications
                  </Link>
                </li>
              )}
              {session?.user.userType === "venture" ||
                (session?.user.userType === "student" && (
                  <li className="hidden lg:inline">
                    <Link
                      className="rounded bg-blue-400 p-2 font-bold"
                      href="/new/post"
                    >
                      Create Posting
                    </Link>
                  </li>
                ))}
              <li>
                <Link
                  className="rounded bg-blue-400 p-2 font-bold"
                  href={`/profile/${session?.user.profileId}`}
                >
                  My profile
                </Link>
              </li>
              <li>
                <Link
                  className="rounded bg-blue-400 p-2 font-bold"
                  href="/authn"
                >
                  Sign out
                </Link>
              </li>
              <li>
                <span>Logged in as {session.user.name}</span>
              </li>
            </>
          ) : (
            <li>
              <Link
                href="/authn"
                className="rounded bg-green-400 p-2 font-bold hover:scale-[103%]"
              >
                Sign in
              </Link>
            </li>
          )}
        </ul>
      </nav>
      <div className="container mx-auto flex px-4 py-2">{children}</div>
      <footer className="bottom-0 w-full bg-gray-200 py-4">
        <div className="container mx-auto text-center text-gray-600">
          &copy; {new Date().getFullYear()} Studenture Inc. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
