import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { Sidebar, SidebarButton } from "@/app/_components/sidebar";
import { InviteBanner } from "@/app/_components/invite-banner";
import { EditTrack } from "@/app/_components/update-track";
import { DeleteTrack } from "@/app/_components/delete-track";
import IconExplicit from "@/app/_components/icons/icon-explicit";
import { CreateSong } from "@/app/_components/create-song";
import { UpdateMaxSongFileSize } from "@/app/_components/update-max-song-file-size";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowDown, faBan } from "@fortawesome/free-solid-svg-icons";

export default async function InfoPage({
  params,
}: {
  params: { project: string; track: string };
}) {
  const session = await getServerAuthSession();

  if (!session) {
    return redirect("/");
  }

  const onboarding = await api.profile.getOnboarding();

  if (!onboarding) {
    return redirect("/dashboard/onboarding");
  }

  const track = await api.track.getTrack({ username: params.track });

  if (!track) {
    return (
      <HydrateClient>
        <main className="h-dvh w-full bg-neutral-900 text-gray-200">
          <div className="flex h-full w-full items-start justify-center">
            <Sidebar />
            <div className="flex h-full w-full grow flex-col items-start justify-start gap-4 overflow-y-auto p-4">
              <div className="flex items-center justify-center">
                <SidebarButton />
                <h1 className="bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text text-3xl font-bold text-transparent">
                  Track not found.
                </h1>
              </div>
            </div>
          </div>
        </main>
      </HydrateClient>
    );
  }

  const access = await api.access.getAccess();
  const profile = await api.profile.getProfile();

  return (
    <HydrateClient>
      <main className="h-dvh w-full bg-neutral-900 text-gray-200">
        <div className="flex h-full w-full items-start justify-center">
          <Sidebar
            selected="PROJECTS_TRACKS_INFO"
            project={{
              title: track.project.title,
              username: track.project.username,
            }}
            track={{
              title: track.title,
              username: track.username,
              access: track.me.role,
            }}
            profile={profile}
            session={session}
            access={access}
          />
          <div className="flex h-full w-full grow flex-col items-start justify-start gap-4 overflow-y-auto p-4">
            {
              <div className="mb-8 flex flex-col items-start justify-start gap-2">
                <div className="flex items-center justify-center">
                  <SidebarButton />
                  <h1 className="flex items-center space-x-2 text-3xl font-bold">
                    {track.deletedAt ? (
                      <span className="flex items-center gap-2 text-gray-400 line-through">
                        <FontAwesomeIcon
                          icon={faBan}
                          className="text-red-500"
                        />
                        {track.title}
                        <span className="text-sm font-normal">(Deleted)</span>
                      </span>
                    ) : (
                      <span className="bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text text-transparent">
                        {track.title}
                      </span>
                    )}
                    {track.explicit && <IconExplicit />}
                  </h1>
                </div>
                {track.description && (
                  <p
                    className={`text-lg ${track.deletedAt ? "text-gray-400" : ""}`}
                  >
                    {track.description}
                  </p>
                )}
                {track.manager && (
                  <span className="text-sm text-gray-400">
                    Project Lead:{" "}
                    {track.manager.type === "ATRIARCHY"
                      ? `${track.manager.name} (@${track.manager.username})`
                      : `${track.manager.discord.username} (Discord)`}
                  </span>
                )}
                {track.deletedAt && access === "ADMIN" && (
                  <span className="text-sm text-gray-400">
                    Deleted on: {new Date(track.deletedAt).toLocaleString()}
                  </span>
                )}
              </div>
            }
            {track.me.role !== "VIEWER" && !track.me.acceptedInvite && (
              <InviteBanner username={track.username} />
            )}
            {(track.me.role === "MANAGER" ||
              track.me.role === "EDITOR" ||
              access === "ADMIN") &&
              !track.deletedAt && (
                <div className="flex items-center gap-4">
                  <EditTrack
                    access={access}
                    username={track.username}
                    title={track.title}
                    description={track.description}
                    explicit={track.explicit}
                    type={track.type}
                    musicStatus={track.musicStatus}
                    visualStatus={track.visualStatus}
                  />
                  {(track.me.role === "MANAGER" || access === "ADMIN") && (
                    <DeleteTrack
                      username={track.username}
                      title={track.title}
                      access={access}
                    />
                  )}
                </div>
              )}

            {track.deletedAt && access === "ADMIN" && (
              <DeleteTrack
                username={track.username}
                title={track.title}
                isDeleted={true}
                access={access}
              />
            )}
            {!track.deletedAt && (
              <div className="flex items-center gap-2">
                <CreateSong
                  username={track.username}
                  explicit={track.explicit}
                />
                {access === "ADMIN" && (
                  <UpdateMaxSongFileSize
                    username={track.username}
                    initialValue={track.maxSongFileSize}
                  />
                )}
              </div>
            )}
            {track.songUrl && (!track.deletedAt || access === "ADMIN") && (
              <div className="flex w-full max-w-lg items-center gap-3">
                <audio controls className="h-10 w-full">
                  <source src={track.songUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>

                <a
                  href={track.songUrl}
                  download={track.username}
                  className="text-violet-400 transition hover:text-violet-200"
                  title="Download Song"
                >
                  <FontAwesomeIcon icon={faCloudArrowDown} size="xl" />
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
