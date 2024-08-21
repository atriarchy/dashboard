"use client";

import { Fragment, useState } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Description,
  Transition,
  TransitionChild,
  PopoverButton,
  PopoverPanel,
  Popover,
} from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleXmark,
  faNoteSticky,
  faRotateRight,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import { faNoteSticky as faNoteStickyRegular } from "@fortawesome/free-regular-svg-icons";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { api } from "@/trpc/react";
import toast from "react-hot-toast";

export function Access() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const access = api.access.getAllAccess.useQuery();
  const providers = api.access.getProviders.useQuery();

  const updateNote = api.access.updateNote.useMutation({
    onSuccess: async data => {
      if (!data) {
        toast.error("Could not update note.");
      }
      setLoading(false);
      await access.refetch();
    },
    onError: () => {
      setLoading(false);
    },
  });

  const updateAccess = api.access.updateAccess.useMutation({
    onSuccess: async data => {
      if (!data) {
        toast.error("Could not update access.");
      }
      setLoading(false);
      await access.refetch();
    },
    onError: () => {
      setLoading(false);
    },
  });

  const deleteAccess = api.access.deleteAccess.useMutation({
    onSuccess: async data => {
      if (!data) {
        toast.error("Could not delete access.");
      }
      setLoading(false);
      await access.refetch();
    },
    onError: () => {
      setLoading(false);
    },
  });

  const updateUsername = api.access.updateUsername.useMutation({
    onSuccess: async data => {
      if (!data) {
        toast.error("Could not update username.");
      }
      setLoading(false);
      await access.refetch();
    },
    onError: () => {
      setLoading(false);
    },
  });

  return (
    <>
      <button
        className="flex w-full items-center justify-start gap-2 rounded-lg bg-gray-700 p-2 font-semibold transition hover:bg-violet-500"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <FontAwesomeIcon icon={faUserShield} fixedWidth />
        <span>Access</span>
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[1]"
          onClose={() => setIsOpen(false)}
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
            <div className="fixed inset-0 bg-black/50 backdrop-blur" />
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
                <DialogPanel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-gray-900 p-6 text-left align-middle text-gray-200 shadow-xl transition-all">
                  <DialogTitle
                    as="div"
                    className="mb-4 flex items-start justify-between gap-2 text-3xl font-bold"
                  >
                    <h3 className="bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text text-transparent">
                      Manage Admin Access
                    </h3>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-xl"
                      aria-label="Close"
                    >
                      <FontAwesomeIcon icon={faCircleXmark} />
                    </button>
                  </DialogTitle>
                  <Description as="div">
                    <div className="flex w-full flex-col items-center justify-between gap-4">
                      <div className="flex w-full flex-col items-center justify-between gap-2">
                        {access.data
                          ?.sort((a, b) => {
                            if (a.role === b.role) return 0;
                            if (a.role === "ADMIN") return -1;
                            if (b.role === "ADMIN") return 1;
                            return 0;
                          })
                          .map(access => (
                            <div
                              key={access.id}
                              className="flex w-full items-center justify-between rounded-lg bg-slate-800 p-4"
                            >
                              <div className="flex items-center justify-start gap-4">
                                {access.provider === "discord" && (
                                  <FontAwesomeIcon icon={faDiscord} />
                                )}
                                <span>{access.providerAccountUsername}</span>
                                <div className="flex items-center justify-start gap-2">
                                  <Popover>
                                    <PopoverButton>
                                      <FontAwesomeIcon
                                        icon={
                                          access.note
                                            ? faNoteSticky
                                            : faNoteStickyRegular
                                        }
                                      />
                                    </PopoverButton>
                                    <PopoverPanel
                                      anchor="right"
                                      className="ml-2 flex flex-col items-start justify-center gap-2 rounded-md bg-slate-900 p-2 text-white"
                                    >
                                      <p>ID: {access.providerAccountId}</p>
                                      <form
                                        id={`note-${access.id}`}
                                        className="flex w-full max-w-sm flex-col items-center justify-center gap-2"
                                        onSubmit={event => {
                                          event.preventDefault();
                                          setLoading(true);
                                          updateNote.mutate({
                                            id: access.id,
                                            note: (
                                              document.getElementById(
                                                `note-input-${access.id}`
                                              ) as HTMLInputElement
                                            ).value,
                                          });
                                        }}
                                      >
                                        <textarea
                                          id={`note-input-${access.id}`}
                                          wrap="soft"
                                          className="w-full rounded-lg bg-gray-700 p-2"
                                          placeholder="No note."
                                          defaultValue={access.note ?? ""}
                                          autoCapitalize="none"
                                          autoComplete="off"
                                          autoCorrect="off"
                                        />
                                        <button
                                          type="submit"
                                          id={`note-${access.id}`}
                                          className="w-full rounded-lg bg-green-500 p-2 transition hover:bg-green-500/50 disabled:bg-green-500/20"
                                          disabled={loading}
                                        >
                                          Update Note
                                        </button>
                                      </form>
                                    </PopoverPanel>
                                  </Popover>
                                  <button
                                    onClick={() => {
                                      setLoading(true);
                                      updateUsername.mutate({
                                        id: access.id,
                                      });
                                    }}
                                    disabled={loading}
                                  >
                                    <FontAwesomeIcon icon={faRotateRight} />
                                  </button>
                                </div>
                              </div>
                              <select
                                onChange={event => {
                                  setLoading(true);

                                  if (event.target.value === "_delete") {
                                    deleteAccess.mutate({
                                      id: access.id,
                                    });

                                    return;
                                  }

                                  updateAccess.mutate({
                                    id: access.id,
                                    role: event.target.value as "ADMIN",
                                  });
                                }}
                                value={access.role}
                                className="rounded-full bg-gray-700 p-2"
                                disabled={providers.data?.some(
                                  p =>
                                    p.provider === access.provider &&
                                    p.providerAccountId ===
                                      access.providerAccountId
                                )}
                              >
                                <option value="ADMIN">Admin</option>
                                <option value="_delete">Delete</option>
                              </select>
                            </div>
                          ))}
                      </div>
                      <div className="flex w-full flex-col items-start justify-between gap-2">
                        <h6 className="text-lg font-bold">Add Admin Access</h6>
                        <form
                          id="add-access"
                          className="flex w-full flex-col items-center justify-center gap-2"
                          onSubmit={event => {
                            event.preventDefault();
                            setLoading(true);
                            updateAccess.mutate({
                              discordId: (
                                document.getElementById(
                                  "add-access-id"
                                ) as HTMLInputElement
                              ).value,
                              role: (
                                document.getElementById(
                                  "add-access-role"
                                ) as HTMLSelectElement
                              ).value as "ADMIN",
                              note: (
                                document.getElementById(
                                  "add-access-note"
                                ) as HTMLTextAreaElement
                              ).value,
                            });
                            (
                              document.getElementById(
                                "add-access"
                              ) as HTMLFormElement
                            ).reset();
                          }}
                        >
                          <input
                            id="add-access-id"
                            type="text"
                            className="w-full rounded-lg bg-gray-700 p-2"
                            placeholder="Discord ID"
                            autoCapitalize="none"
                            autoComplete="off"
                            autoCorrect="off"
                            required
                          />
                          <select
                            id="add-access-role"
                            className="hidden w-full rounded-lg bg-gray-700 p-2"
                            required
                          >
                            <option value="ADMIN">Admin</option>
                          </select>
                          <textarea
                            id="add-access-note"
                            wrap="soft"
                            className="w-full rounded-lg bg-gray-700 p-2"
                            placeholder="Note"
                            autoCapitalize="none"
                            autoComplete="off"
                            autoCorrect="off"
                          />
                          <button
                            type="submit"
                            className="w-full rounded-lg bg-green-500 p-2 transition hover:bg-green-700 disabled:bg-gray-800"
                            disabled={loading}
                          >
                            Add Admin Access
                          </button>
                        </form>
                      </div>
                    </div>
                  </Description>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
