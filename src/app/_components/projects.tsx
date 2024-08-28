"use client";

import Link from "next/link";
import { Fragment } from "react";
import { api } from "@/trpc/react";
import { ProjectForm } from "@/app/_components/project-form";
import Badge from "./primitives/badge";

export function Projects({ access }: { access?: "ADMIN" | null }) {
  const projects = api.project.getProjects.useInfiniteQuery(
    {},
    {
      getNextPageParam: lastPage => lastPage?.cursor,
    }
  );

  const statusColorMap = {
    DRAFT: "gray",
    ACTIVE: "green",
    CLOSED: "red",
    RELEASED: "purple",
  };

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
            {access === "ADMIN" && <ProjectForm />}
          </div>
          <div className="grid w-full grid-cols-3 gap-2">
            {projects.data?.pages.map((group, i) => (
              <Fragment key={i}>
                {group?.data.map(project => (
                  <Link
                    href={`/dashboard/projects/${project.username}`}
                    key={project.username}
                    className="flex w-full break-words rounded-lg bg-neutral-800 transition-colors hover:bg-neutral-700 disabled:bg-neutral-800/50"
                  >
                    {project.thumbnail && (
                      <div className="flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={project.thumbnail}
                          alt={project.title}
                          className="h-16 w-16 rounded-l-lg object-cover"
                        />
                      </div>
                    )}
                    <div
                      className={`flex flex-1 items-center justify-between truncate px-4 py-2 ${
                        project.thumbnail
                          ? "rounded-r-lg border-l border-neutral-700"
                          : "rounded-lg"
                      }`}
                    >
                      <div className="flex-1 truncate text-sm">
                        <span className="font-medium text-neutral-100">
                          {project.title}
                        </span>
                        <span className="ml-2">
                          <Badge
                            text={project.status}
                            color={statusColorMap[project.status]}
                            dark
                          />
                        </span>
                        <p className="text-gray-400">
                          {`${project.trackCount} track${
                            project.trackCount !== 1 ? "s" : ""
                          }`}
                        </p>
                      </div>
                    </div>
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
                className="w-full rounded-lg bg-neutral-500 px-4 py-2 transition-colors hover:bg-neutral-400 disabled:bg-neutral-500/50"
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
