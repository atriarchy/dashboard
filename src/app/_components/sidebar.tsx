import { getServerAuthSession } from "@/server/auth";
import {
  faCircleInfo,
  faCircleUser,
  faFile,
  faMusic,
  faRecordVinyl,
  faUserPlus,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Access } from "@/app/_components/access";
import Link from "next/link";
import { Auth } from "@/app/_components/auth";
import { api } from "@/trpc/server";
import Image from "next/image";
import logo from "@/assets/atriarchy-light.png";

export async function Sidebar({
  selected,
  project,
  track,
}: {
  selected?:
    | "PROFILE"
    | "PROJECTS"
    | "INVITES"
    | "PROJECTS_TRACKS"
    | "PROJECTS_AGREEMENTS"
    | "PROJECTS_TRACKS_INFO"
    | "PROJECTS_TRACKS_COLLABORATORS";
  project?: {
    title: string;
    username: string;
  };
  track?: {
    title: string;
    username: string;
    access: "MANAGER" | "EDITOR" | "CONTRIBUTOR" | "VIEWER";
  };
}) {
  const session = await getServerAuthSession();
  const access = await api.access.getAccess();
  const profile = await api.profile.getProfile();

  return (
    <div className="flex h-full min-w-52 flex-col items-center justify-between gap-2 overflow-auto bg-neutral-800 p-4 shadow-inner">
      {/* Logo at the top of the sidebar */}
      <div className="mb-4 flex flex-col items-center justify-center">
        <Image
          src={logo}
          alt="Logo"
          width={128}
          height={69}
          objectFit="contain"
        />
      </div>

      <div className="flex h-full w-full flex-col items-center justify-start gap-2">
        <Link
          href="/dashboard/projects"
          className={`flex w-full items-center justify-start gap-2 rounded-lg p-2 font-semibold ${
            selected === "PROJECTS"
              ? "bg-violet-700"
              : "bg-gray-700 transition hover:bg-violet-500"
          }`}
        >
          <FontAwesomeIcon icon={faMusic} fixedWidth />
          <span>Projects</span>
        </Link>
        <Link
          href="/dashboard/invites"
          className={`flex w-full items-center justify-start gap-2 rounded-lg p-2 font-semibold ${
            selected === "INVITES"
              ? "bg-violet-700"
              : "bg-gray-700 transition hover:bg-violet-500"
          }`}
        >
          <FontAwesomeIcon icon={faUsers} fixedWidth />
          <span>Invites</span>
        </Link>
        {project && (
          <>
            <div className="mt-8 flex w-full flex-col items-center justify-start gap-2">
              <span className="text-lm w-full font-semibold text-white">
                {project.title}
              </span>
              <Link
                href={`/dashboard/projects/${project.username}/tracks`}
                className={`flex w-full items-center justify-start gap-2 rounded-lg p-2 font-semibold ${
                  selected === "PROJECTS_TRACKS"
                    ? "bg-violet-700"
                    : "bg-gray-700 transition hover:bg-violet-500"
                }`}
              >
                <FontAwesomeIcon icon={faRecordVinyl} fixedWidth />
                <span>Tracks</span>
              </Link>
              <Link
                href={`/dashboard/projects/${project.username}/agreements`}
                className={`flex w-full items-center justify-start gap-2 rounded-lg p-2 font-semibold ${
                  selected === "PROJECTS_AGREEMENTS"
                    ? "bg-violet-700"
                    : "bg-gray-700 transition hover:bg-violet-500"
                }`}
              >
                <FontAwesomeIcon icon={faFile} fixedWidth />
                <span>Agreements</span>
              </Link>
            </div>
            {track && (
              <div className="mt-8 flex w-full flex-col items-center justify-start gap-2">
                <span className="text-lm w-full font-semibold text-white">
                  {track.title}
                </span>
                <Link
                  href={`/dashboard/projects/${project.username}/tracks/${track.username}/info`}
                  className={`flex w-full items-center justify-start gap-2 rounded-lg p-2 font-semibold ${
                    selected === "PROJECTS_TRACKS_INFO"
                      ? "bg-violet-700"
                      : "bg-gray-700 transition hover:bg-violet-500"
                  }`}
                >
                  <FontAwesomeIcon icon={faCircleInfo} fixedWidth />
                  <span>Info</span>
                </Link>
                <Link
                  href={`/dashboard/projects/${project.username}/tracks/${track.username}/collaborators`}
                  className={`flex w-full items-center justify-start gap-2 rounded-lg p-2 font-semibold ${
                    selected === "PROJECTS_TRACKS_COLLABORATORS"
                      ? "bg-violet-700"
                      : "bg-gray-700 transition hover:bg-violet-500"
                  }`}
                >
                  <FontAwesomeIcon icon={faUserPlus} fixedWidth />
                  <span>Collaborators</span>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
      {access === "ADMIN" && <Access />}
      <Link
        href="/dashboard/profile"
        className={`flex w-full items-center justify-start gap-2 rounded-lg p-2 font-semibold ${
          selected === "PROFILE"
            ? "bg-violet-700"
            : "bg-gray-700 transition hover:bg-violet-500"
        }`}
      >
        <FontAwesomeIcon icon={faCircleUser} fixedWidth />
        <span>Profile</span>
      </Link>
      {session?.user?.name && session?.user?.image && (
        <div className="flex w-full items-center justify-between gap-2 pt-2">
          {profile ? (
            <Link
              href={`/@${profile.username}`}
              className="group flex items-center gap-2 overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={session.user.image}
                alt="Profile Picture"
                className="h-8 w-8 rounded-full"
              />
              <span className="max-w-[120px] truncate bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text font-semibold text-white transition group-hover:text-transparent">
                {`@${profile.username}`}
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-2 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={session.user.image}
                alt="Profile Picture"
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
    </div>
  );
}
