import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { Sidebar, SidebarButton } from "@/app/_components/sidebar";
import { Invites } from "@/app/_components/invites";

export default async function InvitesPage() {
  const session = await getServerAuthSession();

  if (!session) {
    return redirect("/");
  }

  const onboarding = await api.profile.getOnboarding();

  if (!onboarding) {
    return redirect("/dashboard/onboarding");
  }

  const profile = await api.profile.getProfile();
  const access = await api.access.getAccess();

  return (
    <HydrateClient>
      <main className="h-dvh w-full bg-neutral-900 text-gray-200">
        <div className="flex h-full w-full items-start justify-center">
          <Sidebar
            selected="INVITES"
            profile={profile}
            session={session}
            access={access}
          />
          <div className="flex h-full w-full flex-col items-start justify-start gap-4 p-4">
            <div className="flex items-center justify-center">
              <SidebarButton />
              <h1 className="bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text text-3xl font-bold text-transparent">
                Invites
              </h1>
            </div>
            <Invites />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
