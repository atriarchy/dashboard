import { getServerAuthSession } from "@/server/auth";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Access } from "./access";
import Link from "next/link";
import { Auth } from "./auth";
import { api } from "@/trpc/server";

export async function Sidebar({ selected }: { selected?: "PROFILE" }) {
  const session = await getServerAuthSession();
  const access = await api.access.getAccess();

  return (
    <div className="flex h-full min-w-52 flex-col items-center justify-between gap-2 overflow-auto bg-neutral-800 p-4 shadow-inner">
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
      </div>
      {session?.user?.name && session?.user?.image && (
        <div className="flex w-full items-center justify-start gap-2">
          <img
            src={session.user.image}
            alt="Profile Picture"
            className="h-8 w-8 rounded-full"
          />
          <span className="font-semibold text-white">{session.user.name}</span>
        </div>
      )}

      <Auth
        session={session}
        className="flex w-full items-center justify-start gap-2 rounded-lg bg-red-500 p-2 font-semibold transition hover:bg-red-700"
        showIcon
      />
    </div>
  );
}
