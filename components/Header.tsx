import Link from "next/link";
import Image from "next/image";
import { auth, signIn, signOut } from "@/auth";

export default async function Header() {
  const session = await auth();

  return (
    <header className="flex items-center justify-between">
      <Link href="/" className="text-2xl font-semibold">
        They Vote For You — Postcode Lookup
      </Link>
      <div>
        {session ? (
          <details className="relative">
            <summary className="cursor-pointer">
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-300" />
              )}
            </summary>
            <div className="absolute right-0 mt-2 w-40 rounded-md border bg-white shadow-lg z-10">
              <Link
                href="/profile"
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Profile
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </form>
            </div>
          </details>
        ) : (
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/" });
            }}
          >
            <button className="px-3 py-2 rounded-lg bg-black text-white">
              Sign in with GitHub
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
