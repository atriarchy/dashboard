"use client";

import { Fragment } from "react";
import { api } from "@/trpc/react";
import Link from "next/link";

export function Tickets() {
  const tickets = api.ticket.getTickets.useInfiniteQuery(
    {},
    {
      getNextPageParam: lastPage => lastPage?.cursor,
    }
  );

  return (
    <>
      {tickets.error ? (
        <span className="text-lg font-medium">{tickets.error.message}</span>
      ) : (
        <div className="flex w-full flex-col items-start justify-start gap-2">
          {tickets.data?.pages.map((group, i) => (
            <Fragment key={i}>
              {group?.data.map(ticket => (
                <Link
                  href={`/dashboard/tickets/${ticket.id}`}
                  key={ticket.id}
                  className="flex w-full flex-col items-start justify-start gap-2 rounded-lg bg-neutral-800 p-4 transition hover:bg-neutral-800/50"
                >
                  <p className="text-lg font-bold">{ticket.title}</p>
                  <span className="text-sm text-gray-400">
                    {ticket.createdAt.toLocaleString()}
                  </span>
                </Link>
              ))}
            </Fragment>
          ))}
          {tickets.hasNextPage && (
            <button
              onClick={async () => {
                if (tickets.isFetchingNextPage) return;
                await tickets.fetchNextPage();
              }}
              disabled={tickets.isFetchingNextPage}
              className="w-full rounded-lg bg-neutral-500 px-4 py-2 transition hover:bg-neutral-500/50 disabled:bg-neutral-500/50"
            >
              {tickets.isFetchingNextPage ? "Loading..." : "Load More"}
            </button>
          )}
        </div>
      )}
    </>
  );
}
