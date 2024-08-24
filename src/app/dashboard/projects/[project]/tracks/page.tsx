import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { Sidebar } from "@/app/_components/sidebar";
import { Tracks } from "@/app/_components/tracks";

export default async function TracksPage({
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
      <main className="h-dvh w-dvw bg-neutral-900 text-gray-200">
        <div className="flex h-full w-full items-start justify-center">
          <Sidebar selected="PROJECTS_TRACKS" project={project.username} />
          <div className="flex h-full w-full grow flex-col items-start justify-start gap-4 overflow-y-auto p-4">
            <div className="mb-8 flex flex-col items-start justify-start gap-2">
              <h1 className="bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text text-3xl font-bold text-transparent">
                {project.title}
              </h1>
              {project.description && (
                <p className="text-lg">{project.description}</p>
              )}
            </div>
            <Tracks project={params.project} />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
