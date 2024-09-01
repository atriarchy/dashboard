"use client";
import {
  faBars,
  faCircleInfo,
  faCircleUser,
  faFile,
  faList,
  faMusic,
  faRecordVinyl,
  faTicket,
  faUserPen,
  faUserPlus,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Access } from "@/app/_components/access";
import type { Profile } from "@prisma/client";
import type { Session } from "@/server/auth";
import { Auth } from "@/app/_components/auth";
import Image from "next/image";
import logo from "@/assets/atriarchy-light.png";
import { BlockLink } from "@/app/_components/navigation-block";
import { useState } from "react";

export function Sidebar({
  selected,
  project,
  access,
  session,
  profile,
  track,
  open,
}: {
  selected?:
    | "PROFILE"
    | "PROJECTS"
    | "INVITES"
    | "TICKETS"
    | "PROJECTS_TRACKS"
    | "PROJECTS_AGREEMENTS"
    | "PROJECTS_TRACKS_INFO"
    | "PROJECTS_TRACKS_COLLABORATORS"
    | "PROJECTS_TRACKS_LOGS"
    | "PROJECTS_TRACKS_CREDITS";
  project?: {
    title: string;
    username: string;
  };
  access?: string | null;
  session?: Session;
  profile?: Profile | null;
  track?: {
    title: string;
    username: string;
    access: "MANAGER" | "EDITOR" | "CONTRIBUTOR" | "VIEWER";
  };
  open?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(open ?? false);
  let className =
    "z-20 flex min-h-dvh h-screen min-w-52 flex-col items-center justify-between gap-2 overflow-y-auto bg-neutral-800 py-4 shadow-inner";
  if (isOpen) {
    className += " max-sm:w-screen max-sm:absolute";
  } else {
    className += " max-sm:hidden";
  }

  return (
    <div>
      <aside className={className}>
        {/* Logo at the top of the sidebar */}
        <div className="mb-4 flex flex-col items-center justify-center px-4">
          <Image
            src={logo}
            alt="Logo"
            width={128}
            height={69}
            objectFit="contain"
          />
        </div>
        <div className="flex h-full w-full flex-col items-center justify-start gap-2 overflow-y-auto px-4">
          <BlockLink
            href="/dashboard/projects"
            className={`flex w-full items-center justify-start gap-2 rounded-lg p-2 font-semibold ${
              selected === "PROJECTS"
                ? "bg-violet-700"
                : "bg-gray-700 transition hover:bg-violet-500"
            }`}
          >
            <FontAwesomeIcon icon={faMusic} fixedWidth />
            <span>Projects</span>
          </BlockLink>
          <BlockLink
            href="/dashboard/invites"
            className={`flex w-full items-center justify-start gap-2 rounded-lg p-2 font-semibold ${
              selected === "INVITES"
                ? "bg-violet-700"
                : "bg-gray-700 transition hover:bg-violet-500"
            }`}
          >
            <FontAwesomeIcon icon={faUsers} fixedWidth />
            <span>Invites</span>
          </BlockLink>
          <BlockLink
            href="/dashboard/tickets"
            className={`flex w-full items-center justify-start gap-2 rounded-lg p-2 font-semibold ${
              selected === "TICKETS"
                ? "bg-violet-700"
                : "bg-gray-700 transition hover:bg-violet-500"
            }`}
          >
            <FontAwesomeIcon icon={faTicket} fixedWidth />
            <span>Tickets</span>
          </BlockLink>
          {isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className={`hover:bg-violet-500"} flex w-full items-center justify-start gap-2 rounded-lg bg-gray-700 p-2 font-semibold transition sm:hidden`}
            >
              <FontAwesomeIcon icon={faBars} fixedWidth />
              <span>Back</span>
            </button>
          )}
          {project && (
            <>
              <div className="mt-8 flex w-full flex-col items-center justify-start gap-2">
                <span className="text-lm w-full font-semibold text-white">
                  {project.title}
                </span>
                <BlockLink
                  href={`/dashboard/projects/${project.username}/tracks`}
                  className={`flex w-full items-center justify-start gap-2 rounded-lg p-2 font-semibold ${
                    selected === "PROJECTS_TRACKS"
                      ? "bg-violet-700"
                      : "bg-gray-700 transition hover:bg-violet-500"
                  }`}
                >
                  <FontAwesomeIcon icon={faRecordVinyl} fixedWidth />
                  <span>Tracks</span>
                </BlockLink>
                <BlockLink
                  href={`/dashboard/projects/${project.username}/agreements`}
                  className={`flex w-full items-center justify-start gap-2 rounded-lg p-2 font-semibold ${
                    selected === "PROJECTS_AGREEMENTS"
                      ? "bg-violet-700"
                      : "bg-gray-700 transition hover:bg-violet-500"
                  }`}
                >
                  <FontAwesomeIcon icon={faFile} fixedWidth />
                  <span>Agreements</span>
                </BlockLink>
              </div>
              {track && (
                <div className="mt-8 flex w-full flex-col items-center justify-start gap-2">
                  <span className="text-lm w-full font-semibold text-white">
                    {track.title}
                  </span>
                  <BlockLink
                    href={`/dashboard/projects/${project.username}/tracks/${track.username}`}
                    className={`flex w-full items-center justify-start gap-2 rounded-lg p-2 font-semibold ${
                      selected === "PROJECTS_TRACKS_INFO"
                        ? "bg-violet-700"
                        : "bg-gray-700 transition hover:bg-violet-500"
                    }`}
                  >
                    <FontAwesomeIcon icon={faCircleInfo} fixedWidth />
                    <span>Info</span>
                  </BlockLink>
                  <BlockLink
                    href={`/dashboard/projects/${project.username}/tracks/${track.username}/collaborators`}
                    className={`flex w-full items-center justify-start gap-2 rounded-lg p-2 font-semibold ${
                      selected === "PROJECTS_TRACKS_COLLABORATORS"
                        ? "bg-violet-700"
                        : "bg-gray-700 transition hover:bg-violet-500"
                    }`}
                  >
                    <FontAwesomeIcon icon={faUserPlus} fixedWidth />
                    <span>Collaborators</span>
                  </BlockLink>
                  <BlockLink
                    href={`/dashboard/projects/${project.username}/tracks/${track.username}/credits`}
                    className={`flex w-full items-center justify-start gap-2 rounded-lg p-2 font-semibold ${
                      selected === "PROJECTS_TRACKS_CREDITS"
                        ? "bg-violet-700"
                        : "bg-gray-700 transition hover:bg-violet-500"
                    }`}
                  >
                    <FontAwesomeIcon icon={faUserPen} fixedWidth />
                    <span>Credits</span>
                  </BlockLink>
                  <BlockLink
                    href={`/dashboard/projects/${project.username}/tracks/${track.username}/logs`}
                    className={`flex w-full items-center justify-start gap-2 rounded-lg p-2 font-semibold ${
                      selected === "PROJECTS_TRACKS_LOGS"
                        ? "bg-violet-700"
                        : "bg-gray-700 transition hover:bg-violet-500"
                    }`}
                  >
                    <FontAwesomeIcon icon={faList} fixedWidth />
                    <span>Audit Logs</span>
                  </BlockLink>
                </div>
              )}
            </>
          )}
        </div>
        <div className="mt-8 flex w-full flex-col items-center justify-start gap-2 px-4">
          {access === "ADMIN" && <Access />}
          <BlockLink
            href="/dashboard/profile"
            className={`flex w-full items-center justify-start gap-2 rounded-lg p-2 font-semibold ${
              selected === "PROFILE"
                ? "bg-violet-700"
                : "bg-gray-700 transition hover:bg-violet-500"
            }`}
          >
            <FontAwesomeIcon icon={faCircleUser} fixedWidth />
            <span>Profile</span>
          </BlockLink>
        </div>
        {session?.user?.name && session?.user?.image && (
          <div className="flex w-full items-center justify-between gap-2 px-4 pt-2">
            {profile ? (
              <BlockLink
                href={`/@${profile.username}`}
                className="group flex items-center gap-2 overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={session.user.image}
                  alt=""
                  className="h-8 w-8 rounded-full"
                />
                <span className="max-w-[120px] truncate bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text font-semibold text-white transition group-hover:text-transparent">
                  {`@${profile.username}`}
                </span>
              </BlockLink>
            ) : (
              <div className="flex items-center gap-2 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={session.user.image}
                  alt=""
                  className="h-8 w-8 rounded-full"
                />
                <span className="max-w-[120px] truncate font-semibold text-white">
                  {session.user.name}
                </span>
              </div>
            )}
            <Auth session={session} showIcon />
          </div>
        )}
      </aside>
      <button className="text-lg" onClick={() => setIsOpen(true)}>
        <FontAwesomeIcon icon={faBars} size="xl" className="ml-3 mt-5" />
      </button>
    </div>
  );
}
