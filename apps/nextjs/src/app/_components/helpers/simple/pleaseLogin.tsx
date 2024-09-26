"use client";

import Link from "next/link";

export function PleaseLogin() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-center text-4xl font-bold text-gray-800">
          Please login to access this function
          <br />
          <Link
            href="/authn"
            className="rounded bg-green-400 p-2 text-2xl font-bold hover:scale-[103%]"
          >
            Sign in
          </Link>
        </h1>
      </main>
    </div>
  );
}
