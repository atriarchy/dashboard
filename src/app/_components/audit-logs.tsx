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

  // Flatten all logs from paginated pages
  const allLogs = logs.data?.pages.flatMap(page => page?.data ?? []) ?? [];

  return logs.error ? (
    <span className="text-lg font-medium">{logs.error.message}</span>
  ) : (
    <div className="flow-root w-full">
      <ul role="list" className="-mb-8">
        {allLogs.map((log, idx) => (
          <AuditLog
            key={log.id}
            log={log}
            isLast={idx === allLogs.length - 1}
          />
        ))}
      </ul>

      {logs.hasNextPage && (
        <div className="mt-4">
          <button
            onClick={async () => {
              if (logs.isFetchingNextPage) return;
              await logs.fetchNextPage();
            }}
            disabled={logs.isFetchingNextPage}
            className="w-full rounded-lg bg-neutral-700 px-4 py-2 text-white transition-colors hover:bg-neutral-600 disabled:opacity-50"
          >
            {logs.isFetchingNextPage ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
