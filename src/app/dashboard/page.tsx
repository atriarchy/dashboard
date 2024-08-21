import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";

export default async function Dashboard() {
  const session = await getServerAuthSession();

  if (!session) {
    return redirect("/");
  }

  const onboarding = await api.profile.getOnboarding();

  if (!onboarding) {
    return redirect("/dashboard/onboarding");
  }

  return redirect("/dashboard/profile");
}
