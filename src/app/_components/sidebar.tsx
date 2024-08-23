import { getServerAuthSession } from "@/server/auth";
import { faCircleUser, faMusic } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Access } from "./access";
import Link from "next/link";
import { Auth } from "./auth";
import { api } from "@/trpc/server";
import Image from "next/image";
import logo from "@/assets/atriarchy-light.png";

export async function Sidebar({
  selected,
}: {
  selected?: "PROFILE" | "PROJECTS";
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
        {access === "ADMIN" && <Access />}
        <Link
          href="/dashboard/profile"
          className={`bg-purple- flex w-full items-center justify-start gap-2 rounded-lg p-2 font-semibold ${
            selected === "PROFILE"
              ? "bg-violet-700"
              : "bg-gray-700 transition hover:bg-violet-500"
          }`}
        >
          <FontAwesomeIcon icon={faCircleUser} fixedWidth />
          <span>Profile</span>
        </Link>
        <Link
          href="/dashboard/projects"
          className={`bg-purple- flex w-full items-center justify-start gap-2 rounded-lg p-2 font-semibold ${
            selected === "PROJECTS"
              ? "bg-violet-700"
              : "bg-gray-700 transition hover:bg-violet-500"
          }`}
        >
          <FontAwesomeIcon icon={faMusic} fixedWidth />
          <span>Projects</span>
        </Link>
      </div>
      {session?.user?.name && session?.user?.image && (
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={session.user.image}
              alt="Profile Picture"
              className="h-8 w-8 rounded-full"
            />
            <span className="max-w-[120px] truncate font-semibold text-white">
              {profile ? `@${profile.username}` : session.user.name}
            </span>
          </div>
          <Auth session={session} showIcon />
        </div>
      )}
    </div>
  );
}
