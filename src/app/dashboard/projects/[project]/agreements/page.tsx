import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { Sidebar, SidebarButton } from "@/app/_components/sidebar";
import { Agreements } from "@/app/_components/agreements";

export default async function AgreementsPage({
  params,
}: {
  params: { project: string };
}) {
  const session = await getServerAuthSession();

  if (!session) {
    return redirect("/");
  }

  const onboarding = await api.profile.getOnboarding();

  if (!onboarding) {
    return redirect("/dashboard/onboarding");
  }

  const project = await api.project.getProject({ username: params.project });

  if (!project) {
    return redirect(`/dashboard/projects/${params.project}`);
  }

  const access = await api.access.getAccess();

  return (
    <HydrateClient>
      <main className="h-dvh w-full bg-neutral-900 text-gray-200">
        <div className="flex h-full w-full items-start justify-center">
          <Sidebar
            selected="PROJECTS_AGREEMENTS"
            project={{
              title: project.title,
              username: project.username,
            }}
          />
          <div className="flex h-full w-full grow flex-col items-start justify-start gap-4 overflow-y-auto p-4">
            <div className="flex items-center justify-center">
              <SidebarButton />
              <h1 className="mb-8 bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text text-3xl font-bold text-transparent">
                {project.title}
              </h1>
            </div>
            <Agreements access={access} project={params.project} />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
