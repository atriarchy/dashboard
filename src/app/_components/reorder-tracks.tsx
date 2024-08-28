"use client";

import { Fragment, useRef, useState } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";

import { api } from "@/trpc/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { faBarsStaggered } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { Reorder } from "framer-motion";

export function ReorderTracks({
  tracks,
  refetch,
}: {
  tracks: {
    username: string;
    title: string;
    order: number | null;
  }[];
  refetch: () => void;
}) {
  const nullIndex = tracks.findIndex(track => track.order === null);

  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<
    (
      | {
          username: string;
          title: string;
        }
      | "_null"
    )[]
  >([
    ...tracks.slice(0, nullIndex > -1 ? nullIndex : 0),
    "_null",
    ...tracks.slice(nullIndex > -1 ? nullIndex : 0),
  ]);

  const initalFocusRef = useRef(null);

  const reorderTracks = api.track.reorderTracks.useMutation({
    onSuccess: async () => {
      setIsOpen(false);
      refetch();
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-fit items-center justify-center gap-2 rounded-lg bg-violet-700 px-4 py-2 text-sm transition hover:bg-violet-500"
      >
        <FontAwesomeIcon icon={faBarsStaggered} />
        Reorder Tracks
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            if (reorderTracks.isPending) return;
            setIsOpen(false);
            setItems([
              ...tracks.slice(0, nullIndex > -1 ? nullIndex : 0),
              "_null",
              ...tracks.slice(nullIndex > -1 ? nullIndex : 0),
            ]);
          }}
          initialFocus={initalFocusRef}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </TransitionChild>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle text-white shadow-xl transition-all">
                  <div className="mb-2 flex items-start justify-between gap-4 text-lg font-bold">
                    <DialogTitle as="h3">Reorder Tracks</DialogTitle>
                    <button
                      disabled={reorderTracks.isPending}
                      onClick={() => {
                        if (reorderTracks.isPending) return;
                        setIsOpen(false);
                        setItems([
                          ...tracks.slice(0, nullIndex > -1 ? nullIndex : 0),
                          "_null",
                          ...tracks.slice(nullIndex > -1 ? nullIndex : 0),
                        ]);
                      }}
                      aria-label="Close"
                    >
                      <FontAwesomeIcon icon={faCircleXmark} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <form
                      id="createProject"
                      className="flex flex-col items-start justify-start gap-2"
                      onSubmit={async e => {
                        e.preventDefault();

                        if (reorderTracks.isPending) return;

                        reorderTracks.mutate({
                          tracks: items
                            .filter(item => item !== "_null")
                            .map((item, index) => ({
                              username: item.username,
                              order:
                                index < items.findIndex(i => i === "_null")
                                  ? index + 1
                                  : null,
                            })),
                        });
                      }}
                    >
                      <span className="text-lg font-bold">Ordered:</span>
                      {items[0] === "_null" && (
                        <span className="text-sm text-gray-400">None</span>
                      )}
                      <Reorder.Group
                        axis="y"
                        values={items}
                        onReorder={setItems}
                        className="flex w-full flex-col gap-2"
                      >
                        {items.map((item, index) =>
                          item === "_null" ? (
                            <Reorder.Item
                              key={"_null"}
                              value={"_null"}
                              dragListener={false}
                              className="flex flex-col"
                            >
                              <span className="text-lg font-bold">
                                Unordered:
                              </span>
                              {index === items.length - 1 && (
                                <span className="text-sm text-gray-400">
                                  None
                                </span>
                              )}
                            </Reorder.Item>
                          ) : (
                            <Reorder.Item key={item.username} value={item}>
                              <div className="group flex w-full break-words rounded-lg bg-neutral-800">
                                {index <
                                  items.findIndex(i => i === "_null") && (
                                  <div className="flex w-8 flex-shrink-0 items-center justify-center rounded-l-lg bg-neutral-700">
                                    <span className="text-lg font-bold text-neutral-100">
                                      {index + 1}
                                    </span>
                                  </div>
                                )}
                                <div
                                  className={`flex flex-1 items-center justify-between truncate ${
                                    index < items.findIndex(i => i === "_null")
                                      ? "rounded-r-lg border-l"
                                      : "rounded-lg"
                                  } border-neutral-700 px-4 py-2`}
                                >
                                  <div className="flex-1 truncate text-sm">
                                    <span className="font-medium text-neutral-100">
                                      {item.title}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Reorder.Item>
                          )
                        )}
                      </Reorder.Group>
                    </form>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        className="w-full rounded-lg bg-neutral-500 p-2 transition hover:bg-neutral-500/50 disabled:bg-neutral-500/50"
                        disabled={reorderTracks.isPending}
                        onClick={() => {
                          if (reorderTracks.isPending) return;
                          setIsOpen(false);
                          setItems([
                            ...tracks.slice(0, nullIndex > -1 ? nullIndex : 0),
                            "_null",
                            ...tracks.slice(nullIndex > -1 ? nullIndex : 0),
                          ]);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        form="createProject"
                        className="w-full rounded-lg bg-violet-700 p-2 transition hover:bg-violet-500 disabled:bg-neutral-500/50"
                        disabled={reorderTracks.isPending}
                      >
                        {reorderTracks.isPending ? "Loading..." : "Save"}
                      </button>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
