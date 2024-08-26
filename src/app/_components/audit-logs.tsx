"use client";

import { Fragment } from "react";

import { api } from "@/trpc/react";
import { AuditLog } from "@/app/_components/audit-log";

export function AuditLogs({ username }: { username: string }) {
  const logs = api.auditLog.getTrackAuditLogs.useInfiniteQuery(
    {
      username,
    },
    {
      getNextPageParam: lastPage => lastPage?.cursor,
    }
  );
  return (
    <>
      {logs.error ? (
        <span className="text-lg font-medium">{logs.error.message}</span>
      ) : (
        <div className="flex w-full flex-col items-start justify-start gap-2">
          {logs.data?.pages.map((group, i) => (
            <Fragment key={i}>
              {group?.data.map(project => (
                <AuditLog key={project.id} log={project} />
              ))}
            </Fragment>
          ))}
          {logs.hasNextPage && (
            <button
              onClick={async () => {
                if (logs.isFetchingNextPage) return;
                await logs.fetchNextPage();
              }}
              disabled={logs.isFetchingNextPage}
              className="w-full rounded-lg bg-neutral-500 px-4 py-2 transition-colors hover:bg-neutral-500/50 disabled:bg-neutral-500/50"
            >
              {logs.isFetchingNextPage ? "Loading..." : "Load More"}
            </button>
          )}
        </div>
      )}
    </>
  );
}
