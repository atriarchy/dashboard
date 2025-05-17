import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { Profile } from "@/app/_components/profile";

export default async function Onboarding() {
  const session = await getServerAuthSession();

  if (!session) {
    return redirect("/");
  }

  const onboarding = await api.profile.getOnboarding();

  if (onboarding) {
    return redirect("/dashboard");
  }

  return (
    <HydrateClient>
      <main className="min-h-dvh w-full bg-neutral-900 text-gray-200">
        <div className="flex h-full w-full flex-col items-start justify-start gap-4 p-4">
          <h1 className="text-4xl font-bold">
            <span>👋 </span>
            <span className="bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text text-transparent">
              Hello!
            </span>
          </h1>

          <p className="text-2xl font-semibold">
            Welcome to the Atriarchy Release Dashboard!
          </p>
          <p className="text-lg">
            {
              "Let's get you set up with your Artist profile. Once you're all set up, you can share your profile and contribute to Atriarchy albums."
            }
          </p>
          <Profile onboarding email={session.user.email} />
        </div>
      </main>
    </HydrateClient>
  );
}
