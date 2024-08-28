"use client";

import Link from "next/link";
import { Fragment } from "react";
import { api } from "@/trpc/react";
import { CreateTrack } from "@/app/_components/create-track";
import Badge from "./primitives/badge";
import { faHeadphones, faPaintbrush } from "@fortawesome/free-solid-svg-icons";
import IconExplicit from "./icons/icon-explicit";

export function Tracks({ project }: { project: string }) {
  const tracks = api.track.getTracks.useQuery({
    project: project,
  });

  const musicStatusMap = {
    IDEA: { color: "gray", label: "Idea" },
    DEMO: { color: "blue", label: "Demo" },
    WRITING: { color: "yellow", label: "Writing" },
    PRODUCTION: { color: "orange", label: "Production" },
    RECORDING: { color: "red", label: "Recording" },
    MIX_MASTER: { color: "purple", label: "Mix/Master" },
    ABANDONED: { color: "red", label: "Abandoned" },
    FINISHED: { color: "green", label: "Finished" },
  };

  const visualStatusMap = {
    SEARCHING: { color: "gray", label: "Looking for Artist" },
    CONCEPT: { color: "blue", label: "Concept" },
    WORKING: { color: "yellow", label: "Working" },
    POLISHING: { color: "orange", label: "Polishing" },
    ABANDONED: { color: "red", label: "Abandoned" },
    FINISHED: { color: "green", label: "Finished" },
  };

  return (
    <>
      {tracks.error ? (
        <span className="text-lg font-medium">{tracks.error.message}</span>
      ) : (
        <>
          <div className="flex items-start justify-start gap-4">
            <h2 className="bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text text-2xl font-bold text-transparent">
              Tracks
            </h2>
            <CreateTrack project={project} />
          </div>
          <div className="grid w-full grid-cols-3 gap-2">
            {tracks.data?.map((track, index) => (
              <Fragment key={index}>
                <Link
                  href={`/dashboard/projects/${project}/tracks/${track.username}`}
                  key={track.username}
                  className="flex w-full break-words rounded-lg bg-neutral-800 transition-colors hover:bg-neutral-700 disabled:bg-neutral-800/50"
                >
                  {track.order && (
                    <div className="flex w-8 flex-shrink-0 items-center justify-center rounded-l-lg bg-neutral-700">
                      <span className="text-lg font-bold text-neutral-100">
                        {track.order}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex flex-1 items-center justify-between truncate ${
                      track.order ? "rounded-r-lg border-l" : "rounded-lg"
                    } border-neutral-700 px-4 py-2`}
                  >
                    <div className="flex-1 truncate text-sm">
                      <span className="font-medium text-neutral-100">
                        {track.title}
                      </span>
                      <div className="mt-2 flex gap-2">
                        {track.explicit && <IconExplicit />}
                        <Badge
                          text={
                            musicStatusMap[track.musicStatus].label ||
                            track.musicStatus
                          }
                          color={musicStatusMap[track.musicStatus].color}
                          icon={faHeadphones}
                          dark
                        />
                        <Badge
                          text={
                            visualStatusMap[track.visualStatus].label ||
                            track.visualStatus
                          }
                          color={visualStatusMap[track.visualStatus].color}
                          icon={faPaintbrush}
                          dark
                        />
                      </div>
                      <div className="isolate mt-2 flex -space-x-1 overflow-hidden">
                        {track.collaborators?.map((collaborator, i) =>
                          collaborator?.avatar ? (
                            <img
                              key={i}
                              alt={collaborator.username || "Collaborator"}
                              src={collaborator.avatar}
                              className={`relative inline-block h-6 w-6 rounded-full ring-2 ring-neutral-800`}
                              style={{ zIndex: track.collaborators.length - i }}
                            />
                          ) : null
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </Fragment>
            ))}
          </div>
        </>
      )}
    </>
  );
}
