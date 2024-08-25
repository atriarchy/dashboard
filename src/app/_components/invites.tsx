"use client";

import { api } from "@/trpc/react";
import { InviteBanner } from "@/app/_components/invite-banner";

export function Invites() {
  const invites = api.collaborator.getMyInvites.useQuery();

  return (
    <div className="flex h-full w-full flex-col items-start justify-start gap-2">
      {invites.data && invites.data.length > 0 ? (
        invites.data?.map(invite => (
          <InviteBanner
            key={invite.username}
            username={invite.username}
            title={invite.title}
            project={invite.project}
          />
        ))
      ) : (
        <span className="text-lg font-medium">You have no invites yet.</span>
      )}
    </div>
  );
}
