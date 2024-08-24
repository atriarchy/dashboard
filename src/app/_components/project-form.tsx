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
import { faPencil, faPlus } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import TextInput from "@/app/_components/primitives/text-input";
import { computeSHA256 } from "@/app/_helpers/crypto";
import FileUpload from "./primitives/file-upload";
import type { Project } from "@prisma/client";

export type ProjectFormProps = {
  id?: Project["id"];
  title?: Project["title"];
  username?: Project["username"];
  description?: Project["description"];
  deadline?: string;
  discordChannelId?: Project["discordChannelId"];
  thumbnail?: Blob;
};

export function ProjectForm(props: ProjectFormProps) {
  const router = useRouter();

  const { id } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(props.title || "");
  const [username, setUsername] = useState(props.username || "");
  const [description, setDescription] = useState(props.description || "");
  const [deadline, setDeadline] = useState(props.deadline);
  const [discordChannelId, setDiscordChannelId] = useState(
    props.discordChannelId || ""
  );
  const [thumbnail, setThumbnail] = useState<File | undefined>();

  const initalFocusRef = useRef(null);

  const reset = () => {
    setTitle(props.title || "");
    setUsername(props.username || "");
    setDescription(props.description || "");
    setDeadline(props.deadline || "");
    setDiscordChannelId(props.discordChannelId || "");
    setThumbnail(undefined);
  };

  const target = id ? api.project.updateProject : api.project.createProject;
  const mutation = target.useMutation({
    onSuccess: async ({ upload }) => {
      if (thumbnail && upload) {
        await toast.promise(
          fetch(upload.url, {
            method: "PUT",
            headers: {
              "Content-Type": thumbnail.type,
            },
            body: thumbnail,
          }),
          {
            loading: "Uploading...",
            success: "Uploaded.",
            error: "Error uploading.",
          }
        );
      }
      router.push(`/dashboard/projects/${username}`);
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
        <FontAwesomeIcon icon={id ? faPencil : faPlus} />
        {!id && "Add Project"}
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            if (mutation.isPending) return;
            setIsOpen(false);
            reset();
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
                    <DialogTitle as="h3">
                      {id ? "Edit" : "New"} Project
                    </DialogTitle>
                    <button
                      disabled={mutation.isPending}
                      onClick={() => {
                        if (mutation.isPending) return;
                        setIsOpen(false);
                        reset();
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
                        if (mutation.isPending) return;

                        mutation.mutate({
                          // @ts-ignore
                          id,
                          title,
                          username,
                          description: description || undefined,
                          deadline: deadline
                            ? new Date(deadline).toISOString()
                            : undefined,
                          discordChannelId: discordChannelId || undefined,
                          thumbnail: thumbnail
                            ? {
                                fileType: thumbnail.type,
                                fileSize: thumbnail.size,
                                checksum: await computeSHA256(thumbnail),
                              }
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
                      <TextInput
                        id="discordChannelId"
                        label="Discord Channel ID"
                        value={discordChannelId}
                        onChange={e => setDiscordChannelId(e.target.value)}
                        placeholder="Discord Channel ID"
                        required
                      />
                      <FileUpload
                        id="thumbnail"
                        label="Thumbnail"
                        infoLabel={"Accepts: .png, .jpeg\nMax Size: 1MB"}
                        accept={["image/png", "image/jpeg"]}
                        maxSize={1048576} // 1MB
                        setFile={setThumbnail}
                        preview={thumbnailUrl => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumbnailUrl}
                            alt="Thumbnail"
                            className="h-full w-full rounded-lg object-cover"
                          />
                        )}
                      />
                    </form>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        className="w-full rounded-lg bg-neutral-500 p-2 transition hover:bg-neutral-500/50 disabled:bg-neutral-500/50"
                        disabled={mutation.isPending}
                        onClick={() => {
                          if (mutation.isPending) return;
                          setIsOpen(false);
                          reset();
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        form="createProject"
                        className="w-full rounded-lg bg-violet-700 p-2 transition hover:bg-violet-500 disabled:bg-neutral-500/50"
                        disabled={mutation.isPending}
                      >
                        {mutation.isPending ? "Loading..." : "Save"}
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
