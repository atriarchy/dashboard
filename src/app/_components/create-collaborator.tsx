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
import {
  faGlobe,
  faMagnifyingGlass,
  faPlus,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import TextInput from "@/app/_components/primitives/text-input";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";

export function CreateCollaborator({
  refetch,
  track,
}: {
  refetch: () => void;
  track: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<
    | {
        atriarchy: {
          username: string;
          name: string;
          avatar: string | null;
        }[];
        discord: {
          id: string;
          username: string;
          name: string;
          avatar: string | null;
        }[];
      }
    | undefined
  >(undefined);

  const initalFocusRef = useRef(null);

  const query = api.search.searchAtriarchyAndDiscordUsers.useMutation({
    onSuccess: async data => {
      setResults(data);
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const addCollaborator = api.collaborator.addCollaborator.useMutation({
    onSuccess: async () => {
      refetch();
      setIsOpen(false);
      setSearch("");
      setResults(undefined);
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-fit items-center justify-center gap-2 rounded-lg bg-violet-700 px-4 py-2 transition hover:bg-violet-500"
      >
        <FontAwesomeIcon icon={faUserPlus} />
        Add Collaborator
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            if (query.isPending || addCollaborator.isPending) return;
            setIsOpen(false);
            setSearch("");
            setResults(undefined);
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
                    <DialogTitle as="h3"> Add Collaborator</DialogTitle>
                    <button
                      disabled={query.isPending || addCollaborator.isPending}
                      onClick={() => {
                        if (query.isPending || addCollaborator.isPending)
                          return;
                        setIsOpen(false);
                        setSearch("");
                        setResults(undefined);
                      }}
                      aria-label="Close"
                    >
                      <FontAwesomeIcon icon={faCircleXmark} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <form
                      className="flex flex-col items-start justify-start gap-2"
                      onSubmit={async e => {
                        e.preventDefault();

                        query.mutate({ query: search });
                      }}
                    >
                      <TextInput
                        id="search"
                        label="Search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search"
                        icon={faMagnifyingGlass}
                        required
                      />
                      <button
                        type="submit"
                        className="w-full rounded-lg bg-violet-700 p-2 transition hover:bg-violet-500 disabled:bg-neutral-500/50"
                        disabled={query.isPending || addCollaborator.isPending}
                      >
                        {query.isPending || addCollaborator.isPending
                          ? "Loading..."
                          : "Create"}
                      </button>
                    </form>
                    {results?.atriarchy.map(user => (
                      <div
                        key={user.username}
                        className="flex w-full items-center justify-between gap-4 rounded-lg bg-neutral-800 p-4"
                      >
                        <div className="flex items-center justify-start gap-2">
                          <FontAwesomeIcon
                            icon={faGlobe}
                            className="mr-2 text-xl"
                          />
                          <div className="flex items-center justify-start gap-2">
                            {user.avatar && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={user.avatar}
                                alt="Profile Picture"
                                className="h-8 w-8 rounded-full"
                              />
                            )}
                            <div className="flex flex-col items-start justify-start">
                              <div className="flex items-center justify-start gap-2">
                                <h2 className="text-lg font-bold">
                                  {user.name}
                                </h2>
                              </div>
                              <p className="text-sm text-gray-400">
                                @{user.username}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            addCollaborator.mutate({
                              username: user.username,
                              track: track,
                              role: "CONTRIBUTOR",
                            });
                          }}
                          className="flex items-center justify-start gap-2 rounded-lg bg-neutral-500 p-2 transition hover:bg-neutral-500/50 disabled:bg-neutral-500/50"
                          disabled={
                            addCollaborator.isPending || query.isPending
                          }
                        >
                          <FontAwesomeIcon icon={faPlus} />
                          <span>Add</span>
                        </button>
                      </div>
                    ))}
                    {results?.discord.map(user => (
                      <div
                        key={user.id}
                        className="flex w-full items-center justify-between gap-4 rounded-lg bg-neutral-800 p-4"
                      >
                        <div className="flex items-center justify-start gap-2">
                          <FontAwesomeIcon
                            icon={faDiscord}
                            className="mr-2 text-xl"
                          />
                          <div className="flex items-center justify-start gap-2">
                            {user.avatar && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={user.avatar}
                                alt="Profile Picture"
                                className="h-8 w-8 rounded-full"
                              />
                            )}
                            <div className="flex flex-col items-start justify-start">
                              <div className="flex items-center justify-start gap-2">
                                <h2 className="text-lg font-bold">
                                  {user.name}
                                </h2>
                              </div>
                              <p className="text-sm text-gray-400">
                                {user.username}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            addCollaborator.mutate({
                              discord: user.id,
                              track: track,
                              role: "CONTRIBUTOR",
                            });
                          }}
                          className="flex items-center justify-start gap-2 rounded-lg bg-neutral-500 p-2 transition hover:bg-neutral-500/50 disabled:bg-neutral-500/50"
                          disabled={
                            addCollaborator.isPending || query.isPending
                          }
                        >
                          <FontAwesomeIcon icon={faPlus} />
                          <span>Add</span>
                        </button>
                      </div>
                    ))}
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
