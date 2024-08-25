"use client";

import { useState } from "react";

import { api } from "@/trpc/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import Link from "next/link";

export function InviteBanner({
  username,
  title,
  project,
}: {
  username: string;
  title?: string;
  project?: string;
}) {
  const [hide, setHide] = useState(false);

  const acceptInvite = api.collaborator.acceptInvite.useMutation({
    onSuccess: async () => {
      setHide(true);
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const declineInvite = api.collaborator.declineInvite.useMutation({
    onSuccess: async () => {
      setHide(true);
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  if (hide) {
    return <></>;
  }

  return (
    <div className="flex w-full items-center justify-between gap-4 rounded-lg bg-neutral-800 p-4">
      <div className="flex items-center justify-start gap-4">
        <FontAwesomeIcon icon={faUserPlus} className="text-xl" />
        <div className="flex flex-col items-start justify-start">
          <div className="flex items-center justify-start gap-2">
            <h2 className="text-lg font-bold">Invite Pending</h2>
          </div>
          <p className="text-sm text-gray-400">
            You have been invited to collaborate on {title ?? "this track"}.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-start gap-2">
        {project && (
          <Link
            href={`/dashboard/projects/${project}/tracks/${username}`}
            className="w-fit rounded-lg bg-neutral-500 p-2 transition hover:bg-neutral-500/50 disabled:bg-neutral-500/50"
          >
            Open Track
          </Link>
        )}
        <button
          onClick={() =>
            declineInvite.mutate({
              track: username,
            })
          }
          className="w-fit rounded-lg bg-red-500 p-2 transition hover:bg-red-500/50 disabled:bg-red-500/50"
          disabled={acceptInvite.isPending || declineInvite.isPending}
        >
          Decline Invite
        </button>
        <button
          onClick={() =>
            acceptInvite.mutate({
              track: username,
            })
          }
          className="w-fit rounded-lg bg-violet-700 p-2 transition hover:bg-violet-500 disabled:bg-neutral-500/50"
          disabled={acceptInvite.isPending || declineInvite.isPending}
        >
          Accept Invite
        </button>
      </div>
    </div>
  );
}
