"use client";

import Link from "next/link";

import { api } from "@/trpc/react";
import { CreateTrack } from "@/app/_components/create-track";

export function Tracks({ project }: { project: string }) {
  const tracks = api.track.getMyTracks.useQuery({
    project: project,
  });

  return (
    <>
      {tracks.error ? (
        <span className="text-lg font-medium">{tracks.error.message}</span>
      ) : (
        <>
          <div className="flex items-start justify-start gap-4">
            <h2 className="bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text text-2xl font-bold text-transparent">
              My Tracks
            </h2>
            <CreateTrack project={project} />
          </div>
          <div className="grid w-full grid-cols-3 gap-2">
            {tracks.data?.map(track => (
              <Link
                href={`/dashboard/projects/${project}/tracks/${track.username}`}
                key={track.username}
                className="w-full break-words rounded-lg bg-gray-800 px-4 py-2 transition-colors hover:bg-gray-800/80 disabled:bg-gray-800/50"
              >
                {track.title}
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
