"use client";

import { useRouter } from "next/navigation";
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
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import TextInput from "./primitives/text-input";

export function CreateProject() {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  const initalFocusRef = useRef(null);

  const createProject = api.project.createProject.useMutation({
    onSuccess: ({ username }) => {
      router.push(`dashboard/project/${username}`);
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
        <FontAwesomeIcon icon={faPlus} />
        Add Project
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            if (createProject.isPending) return;
            setIsOpen(false);
            setTitle("");
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
                    <DialogTitle as="h3">New Project</DialogTitle>
                    <button
                      disabled={createProject.isPending}
                      onClick={() => {
                        if (createProject.isPending) return;
                        setIsOpen(false);
                        setTitle("");
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
                      onSubmit={e => {
                        e.preventDefault();

                        if (createProject.isPending) return;

                        createProject.mutate({
                          title,
                          username,
                          description: description || undefined,
                          deadline: deadline
                            ? new Date(deadline).toISOString()
                            : undefined,
                        });
                      }}
                    >
                      <TextInput
                        id="title"
                        label="Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Title"
                        maxLength={64}
                        required
                      />
                      <TextInput
                        id="username"
                        label="Slug"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="Slug"
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
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="min-h-16 w-full rounded-lg border border-slate-300 bg-white py-2 pl-2 pr-8 text-slate-900"
                            placeholder="Description"
                            maxLength={1024}
                          />
                          <small
                            className={
                              description.length < 1024
                                ? "pointer-events-none absolute bottom-2 right-2 -translate-y-1/2 text-xs text-gray-400"
                                : "pointer-events-none absolute bottom-2 right-2 -translate-y-1/2 text-xs font-medium text-red-500"
                            }
                          >
                            {1024 - description.length}
                          </small>
                        </div>
                      </div>
                      <div className="flex w-full flex-col items-center justify-start gap-2">
                        <label
                          htmlFor="deadline"
                          className="text-md w-full font-semibold"
                        >
                          Deadline
                        </label>
                        <input
                          type="datetime-local"
                          id="deadline"
                          value={deadline}
                          onChange={e => setDeadline(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900"
                          placeholder="Deadline"
                        />
                      </div>
                    </form>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        className="w-full rounded-lg bg-neutral-500 p-2 transition hover:bg-neutral-500/50 disabled:bg-neutral-500/50"
                        disabled={createProject.isPending}
                        onClick={() => {
                          if (createProject.isPending) return;
                          setIsOpen(false);
                          setTitle("");
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        form="createProject"
                        className="w-full rounded-lg bg-violet-700 p-2 transition hover:bg-violet-500 disabled:bg-neutral-500/50"
                        disabled={createProject.isPending}
                      >
                        {createProject.isPending ? "Loading..." : "Create"}
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
