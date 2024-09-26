import { auth, signIn, signOut } from "@acme/auth";

export async function AuthShowcase() {
  const session = await auth();

  if (!session) {
    return (
      <>
        <form
          className="flex flex-col items-center justify-center gap-4"
          action={async (e) => {
            "use server";
            await signIn("email", {
              email: String(e.get("email")).trim(),
            });
          }}
        >
          <input
            className="rounded-full border-2 border-blue-400 bg-blue-400 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
            type="email"
            name="email"
            required
          />
          <button className="rounded-full border-2 border-blue-400 bg-blue-400 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">
            Sign in with Email
          </button>
        </form>

        <p className="mt-4 text-center text-lg text-gray-600">or</p>
        <br />

        <div className="flex justify-center">
          <form
            action={async () => {
              "use server";
              await signIn("google");
            }}
          >
            <button className="rounded-full border-2 border-blue-400 bg-blue-400 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">
              Sign in with Google
            </button>
          </form>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-black">
        {session && <span>Logged in as {session.user.name}</span>}
      </p>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button className="rounded-full border-2 border-blue-400 bg-blue-400 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">
          Sign out
        </button>
      </form>
    </div>
  );
}
