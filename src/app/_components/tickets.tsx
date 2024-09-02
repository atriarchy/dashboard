"use client";

import { Fragment } from "react";
import { api } from "@/trpc/react";
import Link from "next/link";
import { categoryMap, statusMap } from "@/app/_components/ticket";
import { humanize } from "@/utils/string";
import { faCircleDot } from "@fortawesome/free-solid-svg-icons";
import Badge from "@/app/_components/primitives/badge";

export function Tickets() {
  const tickets = api.ticket.getTickets.useInfiniteQuery(
    {},
    {
      getNextPageParam: lastPage => lastPage?.cursor,
    }
  );

  return (
    <>
      <div className="flex items-center justify-center">
        <div id="sidebarButton" />
        <h1 className="bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text text-3xl font-bold text-transparent">
          Tickets
        </h1>
      </div>
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
                  <div className="flex items-center justify-center gap-2">
                    <Badge
                      text={
                        categoryMap[ticket.category].label ||
                        humanize(ticket.category)
                      }
                      color={categoryMap[ticket.category].color || "gray"}
                      icon={categoryMap[ticket.category].icon || faCircleDot}
                      dark
                      pill
                    />
                    <Badge
                      text={
                        statusMap[ticket.status].label ||
                        humanize(ticket.status)
                      }
                      color={statusMap[ticket.status].color || "gray"}
                      icon={faCircleDot}
                      dark
                      pill
                    />
                  </div>
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
