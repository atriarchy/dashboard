"use client";

import { signIn, signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonRunning } from "@fortawesome/free-solid-svg-icons";

export function Auth({
  session,
  className,
  showIcon,
}: {
  session: Session | null;
  className: string;
  showIcon?: boolean;
}) {
  return (
    <button
      className={className}
      onClick={async () => {
        if (session) {
          await signOut();
        } else {
          await signIn("discord");
        }
      }}
    >
      {showIcon && <FontAwesomeIcon icon={faPersonRunning} fixedWidth />}
      {session ? "Sign Out" : "Sign In with Discord"}
    </button>
  );
}
