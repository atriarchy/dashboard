"use client";

import { signIn, signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useIsBlocked } from "@/app/_components/navigation-block";

export function Auth({
  session,
  showIcon,
}: {
  session: Session | null;
  showIcon?: boolean;
}) {
  const isBlocked = useIsBlocked();

  return session ? (
    <button
      className="text-white transition hover:text-red-200"
      onClick={async () => {
        if (
          isBlocked &&
          !window.confirm(
            "You have unsaved changes. Do you really want to leave?"
          )
        ) {
          return;
        }

        await signOut();
      }}
    >
      <FontAwesomeIcon icon={faSignOutAlt} />
    </button>
  ) : (
    <button
      onClick={async () => {
        if (
          isBlocked &&
          !window.confirm(
            "You have unsaved changes. Do you really want to leave?"
          )
        ) {
          return;
        }

        await signIn("discord");
      }}
      className="rounded bg-neutral-500 px-4 py-2 transition hover:bg-neutral-500/50"
    >
      {showIcon && (
        <FontAwesomeIcon icon={faDiscord} fixedWidth className="pr-2" />
      )}
      Login with Discord
    </button>
  );
}
