"use client";

import { Fragment, useRef, useState, useEffect, useCallback } from "react";
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
import { faTrash, faUndo } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function DeleteTrack({
  username,
  title,
  isDeleted,
}: {
  username: string;
  title: string;
  isDeleted?: boolean;
  access?: "ADMIN" | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const initialFocusRef = useRef(null);
  const router = useRouter();

  const deleteTrack = api.track.deleteTrack.useMutation({
    onSuccess: () => {
      setIsOpen(false);
      toast.success(`Track deleted successfully`);
      // Navigate back to the project page
      const path = window.location.pathname;
      if (path.includes("/tracks/")) {
        const projectPath = path.substring(
          0,
          path.lastIndexOf("/tracks/") + "/tracks".length
        );
        router.push(projectPath);
      } else {
        router.push("/dashboard");
      }
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const restoreTrack = api.track.restoreTrack.useMutation({
    onSuccess: () => {
      setIsOpen(false);
      toast.success(`Track restored successfully`);
      router.refresh();
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const hardDeleteTrack = api.track.hardDeleteTrack.useMutation({
    onSuccess: () => {
      setIsOpen(false);
      toast.success(`Track permanently deleted`);
      // Navigate back to the project page
      const path = window.location.pathname;
      if (path.includes("/tracks/")) {
        const projectPath = path.substring(
          0,
          path.lastIndexOf("/tracks/") + "/tracks".length
        );
        router.push(projectPath);
      } else {
        router.push("/dashboard");
      }
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const actionText = isDeleted ? "permanently delete" : "delete";

  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  const handleDeleteAction = useCallback(() => {
    if (isDeleted) {
      if (!hardDeleteTrack.isPending) {
        hardDeleteTrack.mutate({ username });
      }
    } else {
      if (!deleteTrack.isPending) {
        deleteTrack.mutate({ username });
      }
    }
  }, [deleteTrack, hardDeleteTrack, isDeleted, username]);

  // Handle keyboard events for dialog
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      // Confirm delete action when Enter key is pressed
      if (
        event.key === "Enter" &&
        !deleteTrack.isPending &&
        !hardDeleteTrack.isPending &&
        !event.isComposing
      ) {
        event.preventDefault();
        handleDeleteAction();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isOpen,
    deleteTrack.isPending,
    hardDeleteTrack.isPending,
    handleDeleteAction,
  ]);

  return (
    <>
      {isDeleted ? (
        <div className="flex items-center gap-3">
          <button
            onClick={() => restoreTrack.mutate({ username })}
            className="flex w-fit items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm transition hover:bg-green-500"
            disabled={restoreTrack.isPending}
          >
            <FontAwesomeIcon icon={faUndo} />
            Restore
          </button>
          <button
            onClick={() => setIsOpen(true)}
            className="flex w-fit items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm transition hover:bg-red-500"
            disabled={hardDeleteTrack.isPending}
          >
            <FontAwesomeIcon icon={faTrash} />
            Permanently Delete
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex w-fit items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm transition hover:bg-red-500"
          disabled={deleteTrack.isPending}
        >
          <FontAwesomeIcon icon={faTrash} />
          Delete
        </button>
      )}

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            if (deleteTrack.isPending || hardDeleteTrack.isPending) return;
            setIsOpen(false);
          }}
          initialFocus={initialFocusRef}
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
                  <div className="mb-4 flex items-start justify-between gap-4 text-lg font-bold">
                    <DialogTitle as="h3" className="text-red-500">
                      {isDeleted ? "Permanently Delete Track" : "Delete Track"}
                    </DialogTitle>
                    <button
                      disabled={
                        deleteTrack.isPending || hardDeleteTrack.isPending
                      }
                      onClick={() => {
                        if (deleteTrack.isPending || hardDeleteTrack.isPending)
                          return;
                        setIsOpen(false);
                      }}
                      aria-label="Close"
                    >
                      <FontAwesomeIcon icon={faCircleXmark} />
                    </button>
                  </div>
                  <form
                    className="flex flex-col gap-2"
                    onSubmit={e => {
                      e.preventDefault();
                      handleDeleteAction();
                    }}
                  >
                    <p className="mb-4">
                      Are you sure you want to {actionText}{" "}
                      <strong>{title}</strong>?
                      {isDeleted && (
                        <span className="mt-2 block text-sm text-gray-300">
                          This action cannot be undone. The track and all
                          related data will be permanently removed.
                        </span>
                      )}
                    </p>

                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        className="w-full rounded-lg bg-neutral-500 p-2 transition hover:bg-neutral-500/50 disabled:bg-neutral-500/50"
                        disabled={
                          deleteTrack.isPending || hardDeleteTrack.isPending
                        }
                        onClick={() => {
                          if (
                            deleteTrack.isPending ||
                            hardDeleteTrack.isPending
                          )
                            return;
                          setIsOpen(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        ref={deleteButtonRef}
                        className="w-full rounded-lg bg-red-700 p-2 transition hover:bg-red-600 disabled:bg-neutral-500/50"
                        disabled={
                          deleteTrack.isPending || hardDeleteTrack.isPending
                        }
                      >
                        {deleteTrack.isPending || hardDeleteTrack.isPending
                          ? "Loading..."
                          : isDeleted
                            ? "Permanently Delete"
                            : "Delete"}
                      </button>
                    </div>
                  </form>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
