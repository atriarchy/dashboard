"use client";

import { api } from "@/trpc/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { CreateCollaborator } from "@/app/_components/create-collaborator";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import toast from "react-hot-toast";

export function Collaborators({
  username,
  access,
}: {
  username: string;
  access?: "ADMIN" | null;
}) {
  const track = api.track.getTrack.useQuery({
    username: username,
  });

  const updateCollaborator = api.collaborator.updateCollaborator.useMutation({
    onSuccess: async () => {
      await track.refetch();
    },
    onError: () => {
      toast.error("Failed to update access.");
    },
  });

  const deleteCollaborator = api.collaborator.deleteCollaborator.useMutation({
    onSuccess: async () => {
      await track.refetch();
    },
    onError: () => {
      toast.error("Failed to update access.");
    },
  });

  return (
    <>
      {track.error && (
        <span className="text-lg font-medium">{track.error.message}</span>
      )}
      {track.data && (
        <>
          <div className="mb-8 flex flex-col items-start justify-start gap-2">
            <h1 className="bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text text-3xl font-bold text-transparent">
              {track.data.title}
            </h1>
            {track.data.description && (
              <p className="text-lg">{track.data.description}</p>
            )}
            {track.data.manager && (
              <span className="text-sm text-gray-400">
                Project Lead:{" "}
                {track.data.manager.type === "ATRIARCHY"
                  ? `${track.data.manager.name} (@${track.data.manager.username})`
                  : `${track.data.manager.discord.username} (Discord)`}
              </span>
            )}
            {(track.data.me.role === "MANAGER" || access === "ADMIN") && (
              <CreateCollaborator
                refetch={() => track.refetch()}
                track={username}
                access={access}
              />
            )}
          </div>
          <div className="flex w-full flex-col items-start justify-start gap-2">
            {track.data.collaborators.map(collaborator => {
              if (collaborator.type === "ATRIARCHY") {
                return (
                  <div
                    key={"atriarchy:" + collaborator.username}
                    className="flex w-full items-center justify-between gap-4 rounded-lg bg-neutral-800 p-4"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FontAwesomeIcon
                        icon={faGlobe}
                        className="mr-2 text-xl"
                      />
                      {collaborator.avatar && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={collaborator.avatar}
                          alt="Profile Picture"
                          className="h-8 w-8 rounded-full"
                        />
                      )}
                      <div className="flex flex-col items-start justify-start">
                        <div className="flex items-center justify-start gap-2">
                          <h2 className="text-lg font-bold">
                            {collaborator.name}
                          </h2>
                        </div>
                        <p className="text-sm text-gray-400">
                          @{collaborator.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-start gap-2">
                      {!collaborator.acceptedInvite && (
                        <span className="rounded-full bg-neutral-950 px-2 py-1 text-sm">
                          Invited
                        </span>
                      )}

                      <select
                        onChange={event => {
                          if (event.target.value === "_delete") {
                            deleteCollaborator.mutate({
                              username: collaborator.username,
                              track: username,
                            });

                            return;
                          }

                          updateCollaborator.mutate({
                            username: collaborator.username,
                            role: event.target.value as
                              | "CONTRIBUTOR"
                              | "EDITOR",
                            track: username,
                          });
                        }}
                        value={collaborator.role}
                        className="rounded-full bg-gray-700 p-2"
                        disabled={
                          updateCollaborator.isPending ||
                          deleteCollaborator.isPending ||
                          collaborator.me ||
                          (track.data?.me.role !== "MANAGER" &&
                            access !== "ADMIN")
                        }
                      >
                        <option value="MANAGER" disabled>
                          Manager
                        </option>
                        <option value="EDITOR">Editor</option>
                        <option value="CONTRIBUTOR">Contributor</option>
                        <option value="_delete">Delete</option>
                      </select>
                    </div>
                  </div>
                );
              }

              if (collaborator.type === "DISCORD") {
                return (
                  <div
                    key={"discord:" + collaborator.discord.userId}
                    className="flex w-full items-center justify-between gap-4 rounded-lg bg-neutral-800 p-4"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FontAwesomeIcon
                        icon={faDiscord}
                        className="mr-2 text-xl"
                      />
                      {collaborator.discord.avatar && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={collaborator.discord.avatar}
                          alt="Profile Picture"
                          className="h-8 w-8 rounded-full"
                        />
                      )}
                      <h2 className="text-lg font-bold">
                        {collaborator.discord.username}
                      </h2>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      {!collaborator.acceptedInvite && (
                        <span className="rounded-full bg-neutral-950 px-2 py-1 text-sm">
                          Invited
                        </span>
                      )}
                      <select
                        onChange={event => {
                          if (event.target.value === "_delete") {
                            deleteCollaborator.mutate({
                              username:
                                collaborator.discord.username ?? undefined,
                              track: username,
                            });

                            return;
                          }

                          updateCollaborator.mutate({
                            username:
                              collaborator.discord.username ?? undefined,
                            role: event.target.value as
                              | "CONTRIBUTOR"
                              | "EDITOR",
                            track: username,
                          });
                        }}
                        value={collaborator.role}
                        className="rounded-full bg-gray-700 p-2"
                        disabled={
                          updateCollaborator.isPending ||
                          deleteCollaborator.isPending ||
                          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                          collaborator.me ||
                          (track.data?.me.role !== "MANAGER" &&
                            access !== "ADMIN")
                        }
                      >
                        <option value="MANAGER" disabled>
                          Manager
                        </option>
                        <option value="EDITOR">Editor</option>
                        <option value="CONTRIBUTOR">Contributor</option>
                        <option value="_delete">Delete</option>
                      </select>
                    </div>
                  </div>
                );
              }

              return <></>;
            })}
          </div>
        </>
      )}
    </>
  );
}
