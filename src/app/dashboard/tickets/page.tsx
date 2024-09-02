import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { Sidebar } from "@/app/_components/sidebar";
import { Tickets } from "@/app/_components/tickets";

export default async function TicketsPage() {
  const session = await getServerAuthSession();

  if (!session) {
    return redirect("/");
  }

  const onboarding = await api.profile.getOnboarding();

  if (!onboarding) {
    return redirect("/dashboard/onboarding");
  }

  const access = await api.access.getAccess();
  const profile = await api.profile.getProfile();

  return (
    <HydrateClient>
      <main className="h-dvh w-full bg-neutral-900 text-gray-200">
        <div className="flex h-full w-full items-start justify-center">
          <Sidebar profile={profile} session={session} access={access} />
          <div className="flex h-full w-full grow flex-col items-start justify-start gap-4 overflow-y-auto p-4">
            <Tickets />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
