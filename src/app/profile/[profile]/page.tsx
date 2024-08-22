import { Metadata } from "next";
import { getServerAuthSession } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import {
  faApple,
  faSpotify,
  faTwitch,
  faTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { faUserPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: { profile: string };
}): Promise<Metadata> {
  const profile = await api.profile.getPublicProfile({
    username: params.profile,
  });

  if (!profile) {
    return {
      title: "Profile not found - Atriarchy Release Dashboard",
      description: "The profile you are looking for could not be found.",
    };
  }

  return {
    title: `${profile.name} (@${profile.username}) - Atriarchy Studios`,
    description: `${profile.bio || `${profile.name}'s artist profile on the Atriarchy Release Dashboard.`}`,
    icons: [{ rel: "icon", url: "/favicon.ico" }],
  };
}

export default async function PublicProfile({
  params,
}: {
  params: { profile: string };
}) {
  const profile = await api.profile.getPublicProfile({
    username: params.profile,
  });

  let isAdmin = false;

  const session = await getServerAuthSession();

  if (session) {
    const access = await api.access.getAccess();

    if (access === "ADMIN") {
      isAdmin = true;
    }
  }

  return (
    <HydrateClient>
      <main className="min-h-dvh w-dvw overflow-y-auto bg-neutral-900 text-gray-200">
        <div className="mx-auto flex min-h-dvh w-full max-w-screen-lg flex-col items-center justify-between gap-4 p-4">
          {profile ? (
            <>
              <div className="flex h-full w-full flex-col items-center justify-start gap-4">
                <div className="flex flex-col items-center justify-start gap-1">
                  <h1 className="bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text text-center text-3xl font-bold text-transparent">
                    {profile.name}
                  </h1>
                  <span className="text-md text-center">
                    @{profile.username}
                  </span>
                </div>
                {profile.bio && (
                  <p className="whitespace-pre-wrap text-center text-lg">
                    {profile.bio}
                  </p>
                )}
                {profile.links.length > 0 && (
                  <div className="mt-4 flex items-center justify-start gap-4">
                    {profile.links.map((link, index) => (
                      <Link
                        key={index}
                        href={link.url}
                        target="_blank"
                        className="text-3xl transition hover:text-gray-500"
                      >
                        {link.type === "YOUTUBE" && (
                          <FontAwesomeIcon icon={faYoutube} fixedWidth />
                        )}
                        {link.type === "TWITTER" && (
                          <FontAwesomeIcon icon={faTwitter} fixedWidth />
                        )}
                        {link.type === "TWITCH" && (
                          <FontAwesomeIcon icon={faTwitch} fixedWidth />
                        )}
                        {link.type === "SPOTIFY" && (
                          <FontAwesomeIcon icon={faSpotify} fixedWidth />
                        )}
                        {link.type === "APPLE_MUSIC" && (
                          <FontAwesomeIcon icon={faApple} fixedWidth />
                        )}
                        {link.type === "YOUTUBE_MUSIC" && (
                          <FontAwesomeIcon icon={faYoutube} fixedWidth />
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {profile.canEdit ? (
                <Link
                  href="/dashboard/profile"
                  className="flex items-center justify-center gap-2 rounded-full bg-gray-700 px-4 py-2 font-semibold transition hover:bg-violet-500"
                >
                  <FontAwesomeIcon icon={faUserPen} fixedWidth />
                  <span>Edit</span>
                </Link>
              ) : (
                isAdmin && (
                  <Link
                    href={`/dashboard/profile/${profile.username}`}
                    className="flex items-center justify-center gap-2 rounded-full bg-gray-700 px-4 py-2 font-semibold transition hover:bg-violet-500"
                  >
                    <FontAwesomeIcon icon={faUserPen} fixedWidth />
                    <span>Edit as Admin</span>
                  </Link>
                )
              )}
            </>
          ) : (
            <h1 className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text text-3xl font-bold text-transparent">
              Profile not found.
            </h1>
          )}
        </div>
      </main>
    </HydrateClient>
  );
}
