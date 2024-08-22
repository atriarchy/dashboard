import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { Sidebar } from "@/app/_components/sidebar";
import { Profile, type ProfileType } from "@/app/_components/profile";

export default async function AdminProfilePage({
  params,
}: {
  params: { profile: string };
}) {
  const session = await getServerAuthSession();

  if (!session) {
    return redirect("/");
  }

  const onboarding = await api.profile.getOnboarding();

  if (!onboarding) {
    return redirect("/dashboard/onboarding");
  }

  const access = await api.access.getAccess();

  if (access !== "ADMIN") {
    return redirect("/dashboard");
  }

  const profile = (await api.profile.getProfile({
    as: params.profile,
  })) as ProfileType | null;

  return (
    <HydrateClient>
      <main className="h-dvh w-dvw bg-neutral-900 text-gray-200">
        <div className="flex h-full w-full items-start justify-center">
          <Sidebar selected="PROFILE" />
          <div className="flex h-full w-full grow flex-col items-start justify-start gap-4 overflow-y-auto p-4">
            {profile ? (
              <>
                <h1 className="bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text text-3xl font-bold text-transparent">
                  {`${profile.name}'s Profile`}
                </h1>
                <Profile profile={profile} as={profile.username} />
              </>
            ) : (
              <h1 className="bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text text-3xl font-bold text-transparent">
                Profile does not exist.
              </h1>
            )}
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
