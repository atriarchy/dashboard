"use client";

import { api } from "@/trpc/react";
import {
  faCircleDot,
  faRobot,
  faUser,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { TicketItemDetails } from "@/app/_components/ticket-item-detail";
import { humanize } from "@/utils/string";
import Link from "next/link";
import toast from "react-hot-toast";
import Badge from "@/app/_components/primitives/badge";
import { UpdateTicket } from "@/app/_components/update-ticket";

export const categoryMap = {
  PROFILE_UPDATE: { color: "blue", label: "Profile Update", icon: faUser },
};

export const statusMap = {
  OPEN: { color: "green", label: "Open" },
  PENDING: { color: "yellow", label: "Pending" },
  CLOSED: { color: "red", label: "Closed" },
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function Ticket({
  ticket,
  access,
  myAvatar,
}: {
  ticket: string;
  access?: "ADMIN" | null;
  myAvatar?: string | null;
}) {
  const [comment, setComment] = useState("");
  const [privateComment, setPrivateComment] = useState(false);

  const localTicket = api.ticket.getTicket.useQuery({
    id: ticket,
  });

  const createComment = api.ticket.createComment.useMutation({
    onSuccess: async () => {
      setComment("");
      setPrivateComment(false);
      await localTicket.refetch();
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  if (localTicket.error) {
    return (
      <span className="p-4 text-lg font-medium text-gray-400">
        {localTicket.error.message}
      </span>
    );
  }

  if (!localTicket.data) {
    return (
      <span className="p-4 text-lg font-medium text-gray-400">Loading...</span>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center gap-2 px-4 pt-4">
        <div className="flex items-center justify-center">
          <div id="sidebarButton" />
          <h1 className="bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text text-3xl font-bold text-transparent">
            {localTicket.data.title}
          </h1>
        </div>
        <Badge
          text={
            categoryMap[localTicket.data.category].label ||
            humanize(localTicket.data.category)
          }
          color={categoryMap[localTicket.data.category].color || "gray"}
          icon={categoryMap[localTicket.data.category].icon || faCircleDot}
          dark
          pill
        />
        <Badge
          text={
            statusMap[localTicket.data.status].label ||
            humanize(localTicket.data.status)
          }
          color={statusMap[localTicket.data.status].color || "gray"}
          icon={faCircleDot}
          dark
          pill
        />
        <UpdateTicket
          id={localTicket.data.id}
          ticketTitle={localTicket.data.title}
          ticketStatus={localTicket.data.status}
          ticketCategory={localTicket.data.category}
          refetch={localTicket.refetch}
        />
      </div>
      <div className="flex w-full flex-1 flex-col items-center justify-between overflow-hidden">
        <ul role="list" className="w-full space-y-6 overflow-y-auto px-4">
          {localTicket.data.feed.map((item, index) => {
            const details = [];

            if (
              item.action.type === "CREATE_TICKET" ||
              item.action.type === "UPDATE_TICKET" ||
              item.action.type === "CLOSE_TICKET"
            ) {
              if (item.action.category === "PROFILE_UPDATE") {
                details.push(`Category: Profile Update`);
              }
              if (item.action.title) {
                details.push(`Title: ${item.action.title}`);
              }
              if (item.action.status) {
                details.push(`Status: ${humanize(item.action.status)}`);
              }
            }

            return (
              <li key={index} className="relative flex gap-x-4">
                <div
                  className={classNames(
                    index === localTicket.data!.feed.length - 1
                      ? "h-6"
                      : "-bottom-6",
                    "absolute left-0 top-0 flex w-6 justify-center"
                  )}
                >
                  <div className="w-px bg-gray-200" />
                </div>
                {item.action.type === "CREATE_COMMENT" ? (
                  <>
                    {item.userType === "SYSTEM" ? (
                      <div className="relative mt-3 flex h-6 w-6 items-center justify-center bg-neutral-900">
                        <FontAwesomeIcon icon={faRobot} />
                      </div>
                    ) : item.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt=""
                        src={item.avatar}
                        className="relative mt-3 h-6 w-6 flex-none rounded-full bg-gray-50"
                      />
                    ) : (
                      <div className="relative mt-3 flex h-6 w-6 items-center justify-center bg-neutral-900">
                        <FontAwesomeIcon icon={faUserCircle} />
                      </div>
                    )}
                    <div className="flex-auto rounded-md p-3 ring-1 ring-inset ring-white">
                      <div className="flex justify-between gap-x-4">
                        <div className="py-0.5 text-xs leading-5">
                          {item.userType === "ATRIARCHY" ? (
                            <Link
                              href={`/@${item.username}`}
                              className="font-medium hover:underline"
                            >
                              {`${item.name} (@${item.username})`}
                            </Link>
                          ) : (
                            <span className="font-medium">
                              {item.userType === "DISCORD"
                                ? `${item.name} (Discord)`
                                : item.userType === "SYSTEM"
                                  ? "System"
                                  : "Unknown"}
                            </span>
                          )}{" "}
                          commented{item.private && " privately"}
                        </div>
                        <div className="flex flex-col items-end justify-center">
                          <time
                            dateTime={item.createdAt.toISOString()}
                            className="flex-none py-0.5 text-xs leading-5 text-gray-400"
                          >
                            {item.createdAt.toLocaleString()}
                          </time>
                          {item.createdAt.toISOString() !==
                            item.updatedAt.toISOString() && (
                            <time
                              dateTime={item.updatedAt.toISOString()}
                              className="flex-none py-0.5 text-xs leading-5 text-gray-400"
                            >
                              Edited: {item.updatedAt.toLocaleString()}
                            </time>
                          )}
                        </div>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-6">
                        {item.action.message}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-neutral-900">
                      <div className="h-1.5 w-1.5 rounded-full ring-1 ring-gray-300" />
                    </div>
                    <div className="flex flex-auto flex-col">
                      <p className="py-0.5 text-xs leading-5">
                        {item.userType === "ATRIARCHY" ? (
                          <Link
                            href={`/@${item.username}`}
                            className="font-medium hover:underline"
                          >
                            {`${item.name} (@${item.username})`}
                          </Link>
                        ) : (
                          <span className="font-medium">
                            {item.userType === "DISCORD"
                              ? `${item.name} (Discord)`
                              : item.userType === "SYSTEM"
                                ? "System"
                                : "Unknown"}
                          </span>
                        )}{" "}
                        {item.action.type === "CREATE_TICKET"
                          ? "created a ticket"
                          : item.action.type === "UPDATE_TICKET"
                            ? "edited the ticket"
                            : item.action.type === "CLOSE_TICKET"
                              ? "closed the ticket"
                              : "performed an action"}
                        {item.private && " privately"}
                      </p>
                      <TicketItemDetails details={details} />
                    </div>
                    <time
                      dateTime={item.createdAt.toISOString()}
                      className="flex-none py-0.5 text-xs leading-5 text-gray-400"
                    >
                      {item.createdAt.toLocaleString()}
                    </time>
                  </>
                )}
              </li>
            );
          })}
        </ul>
        {localTicket.data.status !== "CLOSED" ? (
          <div className="mt-6 flex w-full gap-x-3 px-4 pb-4">
            {myAvatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                src={myAvatar}
                className="h-6 w-6 flex-none rounded-full bg-gray-50"
              />
            )}
            <form
              className="relative flex-auto"
              onSubmit={e => {
                e.preventDefault();

                if (createComment.isPending) {
                  return;
                }

                if (!comment) {
                  toast.error("Comment cannot be empty.");
                  return;
                }

                createComment.mutate({
                  id: localTicket.data!.id,
                  message: comment,
                  private: access === "ADMIN" ? privateComment : undefined,
                });
              }}
            >
              <div className="overflow-hidden rounded-lg pb-12 shadow-sm ring-1 ring-inset ring-white">
                <label htmlFor="comment" className="sr-only">
                  Add your comment
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  name="comment"
                  rows={2}
                  placeholder="Add your comment..."
                  maxLength={2048}
                  required
                  className="block w-full resize-none border-0 bg-transparent py-1.5 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex justify-between gap-2 py-2 pl-3 pr-2">
                <div className="flex items-center justify-center gap-2">
                  <small
                    className={
                      comment.length < 2048
                        ? "text-xs text-gray-400"
                        : "text-xs font-medium text-red-500"
                    }
                  >
                    {2048 - comment.length}
                  </small>
                </div>
                <div className="flex items-center justify-center gap-2">
                  {access === "ADMIN" && (
                    <>
                      <div className="flex items-center justify-center gap-2">
                        <>
                          <input
                            id="privateComment"
                            type="checkbox"
                            checked={privateComment}
                            onChange={e => setPrivateComment(e.target.checked)}
                            disabled={createComment.isPending}
                          />
                          <label
                            htmlFor="privateComment"
                            className="w-full text-sm"
                          >
                            Private Comment
                          </label>
                        </>
                      </div>
                      <button
                        type="button"
                        className="rounded-md bg-red-700 px-2.5 py-1.5 text-sm font-semibold shadow-sm hover:bg-red-500/50 disabled:bg-red-500/50"
                        disabled={createComment.isPending}
                        onClick={e => {
                          e.preventDefault();

                          if (createComment.isPending) {
                            return;
                          }

                          createComment.mutate({
                            id: localTicket.data!.id,
                            message: comment || undefined,
                            private:
                              access === "ADMIN" && (comment || undefined)
                                ? privateComment
                                : undefined,
                            status: "CLOSED",
                          });
                        }}
                      >
                        {comment ? "Comment + " : ""}Close Ticket
                      </button>
                      <button
                        type="button"
                        className="rounded-md bg-neutral-500 px-2.5 py-1.5 text-sm font-semibold shadow-sm hover:bg-neutral-500/50 disabled:bg-neutral-500/50"
                        disabled={createComment.isPending}
                        onClick={e => {
                          e.preventDefault();

                          if (createComment.isPending) {
                            return;
                          }

                          createComment.mutate({
                            id: localTicket.data!.id,
                            message: comment || undefined,
                            private:
                              access === "ADMIN" && (comment || undefined)
                                ? privateComment
                                : undefined,
                            status:
                              localTicket.data!.status === "PENDING"
                                ? "OPEN"
                                : "PENDING",
                          });
                        }}
                      >
                        {comment ? "Comment + " : ""}
                        {localTicket.data.status === "PENDING"
                          ? "Open"
                          : "Pend"}{" "}
                        Ticket
                      </button>
                    </>
                  )}
                  <button
                    type="submit"
                    className="rounded-md bg-violet-700 px-2.5 py-1.5 text-sm font-semibold shadow-sm hover:bg-violet-500 disabled:bg-neutral-500/50"
                    disabled={createComment.isPending}
                  >
                    Comment
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="my-4">
            <button
              type="button"
              className="rounded-md bg-violet-700 px-2.5 py-1.5 text-sm font-semibold shadow-sm hover:bg-violet-500 disabled:bg-neutral-500/50"
              disabled={createComment.isPending}
              onClick={e => {
                e.preventDefault();

                if (createComment.isPending) {
                  return;
                }

                createComment.mutate({
                  id: localTicket.data!.id,
                  status: "OPEN",
                });
              }}
            >
              Reopen Ticket
            </button>
          </div>
        )}
      </div>
    </>
  );
}
