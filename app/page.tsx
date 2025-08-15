import { auth } from "@/auth";
import PostcodeTool from "@/components/PostcodeTool";

export default async function Page() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <p className="mt-3 text-gray-600">
          Enter a postcode, pick your electorate if needed, and see how your MP
          voted in recent divisions.
        </p>

        {session ? (
          <PostcodeTool />
        ) : (
          <div className="mt-10 rounded-xl border bg-white p-6 text-gray-700">
            <p className="mb-2 font-medium">You need to sign in to use the tool.</p>
            <p className="text-sm">This keeps API keys server-side and usage fair.</p>
          </div>
        )}
      </div>
    </main>
  );
}