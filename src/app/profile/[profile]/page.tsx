import { api, HydrateClient } from "@/trpc/server";
import {
  faApple,
  faSpotify,
  faTwitch,
  faTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default async function PublicProfile({
  params,
}: {
  params: { profile: string };
}) {
  const profile = await api.profile.getPublicProfile({
    username: params.profile,
  });

  return (
    <HydrateClient>
      <main className="h-dvh w-dvw bg-gray-950 text-gray-200">
        <div className="mx-auto flex h-full w-full max-w-screen-lg flex-col items-center justify-start gap-4 overflow-scroll p-4">
          {profile ? (
            <>
              <div className="flex flex-col items-center justify-start gap-1">
                <h1 className="bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text text-center text-3xl font-bold text-transparent">
                  {profile.name}
                </h1>
                <span className="text-md text-center">@{profile.username}</span>
              </div>
              {profile.bio && (
                <p className="text-center text-lg">{profile.bio}</p>
              )}
              {profile.links.length > 0 && (
                <div className="mt-4 flex items-center justify-start gap-4">
                  {profile.links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      className="text-3xl transition hover:text-gray-500"
                    >
                      {link.type === "YOUTUBE" && (
                        <FontAwesomeIcon icon={faYoutube} />
                      )}
                      {link.type === "TWITTER" && (
                        <FontAwesomeIcon icon={faTwitter} />
                      )}
                      {link.type === "TWITCH" && (
                        <FontAwesomeIcon icon={faTwitch} />
                      )}
                      {link.type === "SPOTIFY" && (
                        <FontAwesomeIcon icon={faSpotify} />
                      )}
                      {link.type === "APPLE_MUSIC" && (
                        <FontAwesomeIcon icon={faApple} />
                      )}
                      {link.type === "YOUTUBE_MUSIC" && (
                        <FontAwesomeIcon icon={faYoutube} />
                      )}
                    </a>
                  ))}
                </div>
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
