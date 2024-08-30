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

export function UpdateTicket({
  id,
  ticketTitle,
  ticketStatus,
  ticketCategory,
  refetch,
}: {
  id: string;
  ticketTitle: string;
  ticketStatus: "OPEN" | "PENDING" | "CLOSED";
  ticketCategory: "PROFILE_UPDATE";
  refetch: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(ticketTitle);
  const [currentStatus, setCurrentStatus] = useState<
    "OPEN" | "PENDING" | "CLOSED"
  >(ticketStatus);
  const [currentCategory, setCurrentCategory] =
    useState<"PROFILE_UPDATE">(ticketCategory);

  const initalFocusRef = useRef(null);

  const editTicket = api.ticket.editTicket.useMutation({
    onSuccess: () => {
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
        aria-label="Edit Ticket"
      >
        <FontAwesomeIcon icon={faPencil} />
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            if (editTicket.isPending) return;
            setIsOpen(false);
            setCurrentTitle(ticketTitle);
            setCurrentStatus(ticketStatus);
            setCurrentCategory(ticketCategory);
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
                    <DialogTitle as="h3">Edit Ticket</DialogTitle>
                    <button
                      disabled={editTicket.isPending}
                      onClick={() => {
                        if (editTicket.isPending) return;
                        setIsOpen(false);
                        setCurrentTitle(ticketTitle);
                        setCurrentStatus(ticketStatus);
                        setCurrentCategory(ticketCategory);
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

                        if (editTicket.isPending) return;

                        editTicket.mutate({
                          id,
                          title: currentTitle,
                          status: currentStatus,
                          category: currentCategory,
                        });
                      }}
                    >
                      <TextInput
                        id="title"
                        label="Title"
                        value={currentTitle}
                        onChange={e => setCurrentTitle(e.target.value)}
                        placeholder="Title"
                        maxLength={256}
                        required
                      />
                      <select
                        id="category"
                        name="Category"
                        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900"
                        value={currentCategory}
                        onChange={e =>
                          setCurrentCategory(e.target.value as "PROFILE_UPDATE")
                        }
                      >
                        <option value="PROFILE_UPDATE">Profile Update</option>
                      </select>
                      <select
                        id="status"
                        name="Status"
                        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900"
                        value={currentStatus}
                        onChange={e =>
                          setCurrentStatus(
                            e.target.value as "OPEN" | "PENDING" | "CLOSED"
                          )
                        }
                      >
                        <option value="OPEN">Open</option>
                        <option value="PENDING">Pending</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </form>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        className="w-full rounded-lg bg-neutral-500 p-2 transition hover:bg-neutral-500/50 disabled:bg-neutral-500/50"
                        disabled={editTicket.isPending}
                        onClick={() => {
                          if (editTicket.isPending) return;
                          setIsOpen(false);
                          setCurrentTitle(ticketTitle);
                          setCurrentStatus(ticketStatus);
                          setCurrentCategory(ticketCategory);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        form="createProject"
                        className="w-full rounded-lg bg-violet-700 p-2 transition hover:bg-violet-500 disabled:bg-neutral-500/50"
                        disabled={editTicket.isPending}
                      >
                        {editTicket.isPending ? "Loading..." : "Edit"}
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
