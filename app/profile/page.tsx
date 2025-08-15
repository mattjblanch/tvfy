import { auth, update } from "@/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <form
          action={async (formData: FormData) => {
            "use server";
            const name = formData.get("name") as string;
            const image = formData.get("image") as string;
            await update({ user: { name, image } });
          }}
          className="mt-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={session.user?.name ?? ""}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="image">
              Image URL
            </label>
            <input
              id="image"
              name="image"
              type="text"
              defaultValue={session.user?.image ?? ""}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 rounded-lg bg-black text-white"
          >
            Save
          </button>
        </form>
      </div>
    </main>
  );
}
