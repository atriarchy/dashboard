"use client";

import { signIn, signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

export function Auth({
  session,
  showIcon,
}: {
  session: Session | null;
  showIcon?: boolean;
}) {
  return session ? (
    <FontAwesomeIcon
      icon={faSignOutAlt}
      className="cursor-pointer text-white hover:text-red-200"
      onClick={async () => await signOut()}
    />
  ) : (
    <button
      onClick={async () => await signIn("discord")}
      className="rounded bg-neutral-500 px-4 py-2 transition hover:bg-neutral-500/50"
    >
      {showIcon && (
        <FontAwesomeIcon icon={faDiscord} fixedWidth className="pr-2" />
      )}
      Login with Discord
    </button>
  );
}
