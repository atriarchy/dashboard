import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { Sidebar } from "@/app/_components/sidebar";
import { Projects } from "@/app/_components/projects";

export default async function ProjectsPage() {
  const session = await getServerAuthSession();

  if (!session) {
    return redirect("/");
  }

  const onboarding = await api.profile.getOnboarding();

  if (!onboarding) {
    return redirect("/dashboard/onboarding");
  }

  const access = await api.access.getAccess();

  return (
    <HydrateClient>
      <main className="h-dvh w-dvw bg-neutral-900 text-gray-200">
        <div className="flex h-full w-full items-start justify-center">
          <Sidebar selected="PROJECTS" />
          <div className="flex h-full w-full grow flex-col items-start justify-start gap-4 overflow-y-auto p-4">
            <Projects access={access} />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
