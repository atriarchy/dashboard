import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { Sidebar } from "@/app/_components/sidebar";

export default async function ProjectPage({
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

  if (project) {
    return redirect(`/dashboard/projects/${params.project}/tracks`);
  }

  return (
    <HydrateClient>
      <main className="h-dvh w-full bg-neutral-900 text-gray-200">
        <div className="flex h-full w-full items-start justify-center">
          <Sidebar />
          <div className="flex h-full w-full grow flex-col items-start justify-start gap-4 overflow-y-auto p-4">
            <div className="flex items-center justify-center">
              <div id="sidebarButton" />
              <h1 className="bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text text-3xl font-bold text-transparent">
                Project not found.
              </h1>
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
