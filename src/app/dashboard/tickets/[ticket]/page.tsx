import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { Sidebar } from "@/app/_components/sidebar";
import { Ticket } from "@/app/_components/ticket";

export default async function TicketPage({
  params,
}: {
  params: { ticket: string };
}) {
  const session = await getServerAuthSession();

  if (!session) {
    return redirect("/");
  }

  const onboarding = await api.profile.getOnboarding();

  if (!onboarding) {
    return redirect("/dashboard/onboarding");
  }

  const ticket = await api.ticket.getTicket({ id: params.ticket });
  const profile = await api.profile.getProfile();
  const access = await api.access.getAccess();

  if (!ticket) {
    return (
      <HydrateClient>
        <main className="h-dvh w-dvw bg-neutral-900 text-gray-200">
          <div className="flex h-full w-full items-start justify-center">
            <Sidebar profile={profile} session={session} access={access} />
            <div className="flex h-full w-full grow flex-col items-start justify-start gap-4 overflow-y-auto p-4">
              <h1 className="bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text text-3xl font-bold text-transparent">
                Ticket not found.
              </h1>
            </div>
          </div>
        </main>
      </HydrateClient>
    );
  }

  return (
    <HydrateClient>
      <main className="h-dvh w-dvw bg-neutral-900 text-gray-200">
        <div className="flex h-full w-full items-start justify-center">
          <Sidebar
            selected="TICKETS"
            profile={profile}
            session={session}
            access={access}
          />
          <div className="flex h-full w-full grow flex-col items-start justify-start gap-4">
            <Ticket
              ticket={ticket.id}
              access={access}
              myAvatar={session.user.image}
            />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
