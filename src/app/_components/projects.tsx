"use client";

import Link from "next/link";
import { Fragment } from "react";

import { api } from "@/trpc/react";
import { CreateProject } from "@/app/_components/create-project";

export function Projects({ access }: { access?: "ADMIN" | null }) {
  const projects = api.project.getProjects.useInfiniteQuery(
    {},
    {
      getNextPageParam: lastPage => lastPage?.cursor,
    }
  );

  return (
    <>
      {projects.error ? (
        <span className="text-lg font-medium">{projects.error.message}</span>
      ) : (
        <>
          <div className="flex items-start justify-start gap-4">
            <h1 className="bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text text-3xl font-bold text-transparent">
              Projects
            </h1>
            {access === "ADMIN" && <CreateProject />}
          </div>
          <div className="grid w-full grid-cols-2 gap-2">
            {projects.data?.pages.map((group, i) => (
              <Fragment key={i}>
                {group?.data.map(project => (
                  <Link
                    href={`/dashboard/project/${project.username}`}
                    key={project.username}
                    className="w-full break-words rounded-lg bg-gray-800 px-4 py-2 transition-colors hover:bg-gray-800/80 disabled:bg-gray-800/50"
                  >
                    {project.title}
                  </Link>
                ))}
              </Fragment>
            ))}
            {projects.hasNextPage && (
              <button
                onClick={async () => {
                  if (projects.isFetchingNextPage) return;
                  await projects.fetchNextPage();
                }}
                disabled={projects.isFetchingNextPage}
                className="w-full rounded-lg bg-neutral-500 px-4 py-2 transition-colors hover:bg-neutral-500/50 disabled:bg-neutral-500/50"
              >
                {projects.isFetchingNextPage ? "Loading..." : "Load More"}
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
}
