import { redirect } from "next/navigation";
import { Auth } from "@/app/_components/auth";
import { getServerAuthSession } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";

export default async function Home() {
  const session = await getServerAuthSession();

  if (session) {
    return redirect("/dashboard");
  }

  return (
    <HydrateClient>
      <main className="h-dvh w-dvw bg-gray-950 text-gray-200">
        <div className="flex h-full flex-col items-center justify-center gap-4 p-4">
          <Auth
            session={session}
            className="rounded-full bg-slate-800 px-4 py-2 transition hover:bg-slate-800/50"
          />
        </div>
      </main>
    </HydrateClient>
  );
}
