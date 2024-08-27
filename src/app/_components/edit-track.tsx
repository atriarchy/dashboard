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
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import TextInput from "@/app/_components/primitives/text-input";

export function EditTrack({
  username,
  title,
  description,
  explicit,
  musicStatus,
  visualStatus,
}: {
  username: string;
  title: string;
  description: string | null;
  explicit: boolean;
  musicStatus:
    | "IDEA"
    | "DEMO"
    | "WRITING"
    | "PRODUCTION"
    | "RECORDING"
    | "MIX_MASTER"
    | "ABANDONED"
    | "FINISHED";
  visualStatus:
    | "ABANDONED"
    | "FINISHED"
    | "SEARCHING"
    | "CONCEPT"
    | "WORKING"
    | "POLISHING";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(
    description ?? ""
  );
  const [currentExplicit, setCurrentExplicit] = useState(explicit);
  const [currentMusicStatus, setCurrentMusicStatus] = useState<
    | "IDEA"
    | "DEMO"
    | "WRITING"
    | "PRODUCTION"
    | "RECORDING"
    | "MIX_MASTER"
    | "ABANDONED"
    | "FINISHED"
  >(musicStatus);
  const [currentVisualStatus, setCurrentVisualStatus] = useState<
    "ABANDONED" | "FINISHED" | "SEARCHING" | "CONCEPT" | "WORKING" | "POLISHING"
  >(visualStatus);

  const initalFocusRef = useRef(null);

  const editTrack = api.track.updateTrack.useMutation({
    onSuccess: () => {
      setIsOpen(false);
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
        <FontAwesomeIcon icon={faPencil} />
        Edit
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            if (editTrack.isPending) return;
            setIsOpen(false);
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
                    <DialogTitle as="h3">New Track</DialogTitle>
                    <button
                      disabled={editTrack.isPending}
                      onClick={() => {
                        if (editTrack.isPending) return;
                        setIsOpen(false);
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

                        if (editTrack.isPending) return;

                        editTrack.mutate({
                          username,
                          title: currentTitle,
                          explicit: currentExplicit,
                          musicStatus: currentMusicStatus,
                          visualStatus: currentVisualStatus,
                          description: currentDescription || undefined,
                        });
                      }}
                    >
                      <TextInput
                        id="title"
                        label="Title"
                        value={currentTitle}
                        onChange={e => setCurrentTitle(e.target.value)}
                        placeholder="Title"
                        maxLength={64}
                        required
                      />

                      <div className="flex w-full flex-col items-center justify-start gap-2">
                        <label
                          htmlFor="description"
                          className="text-md w-full font-semibold"
                        >
                          Description
                        </label>
                        <div className="relative w-full">
                          <textarea
                            id="description"
                            value={currentDescription}
                            onChange={e =>
                              setCurrentDescription(e.target.value)
                            }
                            className="min-h-16 w-full rounded-lg border border-slate-300 bg-white py-2 pl-2 pr-8 text-slate-900"
                            placeholder="Description"
                            maxLength={1024}
                          />
                          <small
                            className={
                              currentDescription.length < 1024
                                ? "pointer-events-none absolute bottom-2 right-2 -translate-y-1/2 text-xs text-gray-400"
                                : "pointer-events-none absolute bottom-2 right-2 -translate-y-1/2 text-xs font-medium text-red-500"
                            }
                          >
                            {1024 - currentDescription.length}
                          </small>
                        </div>
                      </div>
                      <select
                        id="explicit"
                        name="Is this track explicit?"
                        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900"
                        value={currentExplicit ? "EXPLICIT" : "CLEAN"}
                        onChange={e =>
                          setCurrentExplicit(e.target.value === "EXPLICIT")
                        }
                      >
                        <option value="CLEAN">Clean</option>
                        <option value="EXPLICIT">Explicit</option>
                      </select>
                      <select
                        id="musicStatus"
                        name="Music Status"
                        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900"
                        value={currentMusicStatus}
                        onChange={e =>
                          setCurrentMusicStatus(
                            e.target.value as
                              | "IDEA"
                              | "DEMO"
                              | "WRITING"
                              | "PRODUCTION"
                              | "RECORDING"
                              | "MIX_MASTER"
                              | "ABANDONED"
                              | "FINISHED"
                          )
                        }
                      >
                        <option value="IDEA">Idea</option>
                        <option value="DEMO">Demo</option>
                        <option value="WRITING">Writing</option>
                        <option value="PRODUCTION">Production</option>
                        <option value="RECORDING">Recording</option>
                        <option value="MIX_MASTER">Mix and Master</option>
                        <option value="ABANDONED">Abandoned</option>
                        <option value="FINISHED">Finished</option>
                      </select>
                      <select
                        id="visualStatus"
                        name="Visual Status"
                        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900"
                        value={currentVisualStatus}
                        onChange={e =>
                          setCurrentVisualStatus(
                            e.target.value as
                              | "ABANDONED"
                              | "FINISHED"
                              | "SEARCHING"
                              | "CONCEPT"
                              | "WORKING"
                              | "POLISHING"
                          )
                        }
                      >
                        <option value="SEARCHING">Searching</option>
                        <option value="CONCEPT">Concept</option>
                        <option value="WORKING">Working</option>
                        <option value="POLISHING">Polishing</option>
                        <option value="ABANDONED">Abandoned</option>
                        <option value="FINISHED">Finished</option>
                      </select>
                    </form>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        className="w-full rounded-lg bg-neutral-500 p-2 transition hover:bg-neutral-500/50 disabled:bg-neutral-500/50"
                        disabled={editTrack.isPending}
                        onClick={() => {
                          if (editTrack.isPending) return;
                          setIsOpen(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        form="createProject"
                        className="w-full rounded-lg bg-violet-700 p-2 transition hover:bg-violet-500 disabled:bg-neutral-500/50"
                        disabled={editTrack.isPending}
                      >
                        {editTrack.isPending ? "Loading..." : "Create"}
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
