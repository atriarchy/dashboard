"use client";

import { useRouter } from "next/navigation";
import { Fragment, useRef, useState, useEffect } from "react";
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
import { faPencil, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import TextInput from "@/app/_components/primitives/text-input";
import TextArea from "./primitives/text-area";
import { computeSHA256 } from "@/app/_helpers/crypto";
import FileUpload from "@/app/_components/primitives/file-upload";
import { ProjectStatus, type Project } from "@prisma/client";
import { humanize, slugify } from "@/utils/string";

export type ProjectFormProps = {
  id?: Project["id"];
  title?: Project["title"];
  status?: Project["status"];
  username?: Project["username"];
  description?: Project["description"];
  deadline?: string;
  discordChannelId?: Project["discordChannelId"];
};

export function ProjectForm(props: ProjectFormProps) {
  const router = useRouter();

  const { id } = props;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [title, setTitle] = useState(props.title ?? "");
  const [status, setStatus] = useState(props.status ?? ProjectStatus.DRAFT);
  const [username, setUsername] = useState(props.username ?? "");
  const [description, setDescription] = useState(props.description ?? "");
  const [deadline, setDeadline] = useState(props.deadline);
  const [discordChannelId, setDiscordChannelId] = useState(
    props.discordChannelId ?? ""
  );
  const [thumbnail, setThumbnail] = useState<File | undefined>();
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const initialFocusRef = useRef(null);
  const initialFocusDeleteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDeleteOpen && initialFocusDeleteRef.current) {
      initialFocusDeleteRef.current.focus();
    }
  }, [isDeleteOpen]);

  const reset = () => {
    setTitle(props.title ?? "");
    setUsername(props.username ?? "");
    setDescription(props.description ?? "");
    setDeadline(props.deadline ?? "");
    setStatus(props.status ?? ProjectStatus.DRAFT);
    setDiscordChannelId(props.discordChannelId ?? "");
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

  const deleteMutation = api.project.deleteProject.useMutation({
    onSuccess: () => {
      toast.success("Project deleted.");
      router.push("/dashboard/projects");
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  return (
    <>
      <div className="mb-2 flex items-center gap-2">
        <button
          onClick={() => {
            setIsEditOpen(true);
            setIsDeleteOpen(false);
          }}
          className="flex w-fit items-center justify-center gap-2 rounded-lg bg-violet-700 px-4 py-2 transition hover:bg-violet-500"
        >
          <FontAwesomeIcon icon={id ? faPencil : faPlus} />
          {!id && "Add Project"}
        </button>
        {id && (
          <button
            onClick={() => {
              setIsDeleteOpen(true);
              setIsEditOpen(false);
            }}
            className="flex w-fit items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 transition hover:bg-red-500"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        )}
      </div>

      <Transition appear show={isEditOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            if (mutation.isPending) return;
            setIsEditOpen(false);
            reset();
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
                  <div className="mb-2 flex items-start justify-between gap-4 text-lg font-bold">
                    <DialogTitle as="h3">
                      {id ? "Edit" : "New"} Project
                    </DialogTitle>
                    <button
                      disabled={mutation.isPending}
                      onClick={() => {
                        if (mutation.isPending) return;
                        setIsEditOpen(false);
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
                          // @ts-expect-error id is expected for resource updates
                          id,
                          title,
                          username,
                          status,
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
                        onChange={e => {
                          setTitle(e.target.value);
                          setUsername(slugify(e.target.value));
                        }}
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
                      <TextArea
                        id="description"
                        label="Description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Description"
                        maxLength={1024}
                        className="min-h-16"
                      />
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
                      <div className="flex w-full flex-col items-center justify-start gap-2">
                        <label
                          htmlFor="status"
                          className="text-md w-full font-semibold"
                        >
                          Status
                        </label>
                        <select
                          id="status"
                          name="status"
                          className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900"
                          value={status}
                          onChange={e =>
                            setStatus(e.target.value as ProjectStatus)
                          }
                        >
                          {Object.keys(ProjectStatus).map(statusOption => (
                            <option key={statusOption} value={statusOption}>
                              {humanize(statusOption)}
                            </option>
                          ))}
                        </select>
                      </div>
                      {!id && (
                        <TextInput
                          id="discordChannelId"
                          label="Discord Channel ID"
                          value={discordChannelId}
                          onChange={e => setDiscordChannelId(e.target.value)}
                          placeholder="Discord Channel ID"
                        />
                      )}
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
                          setIsEditOpen(false);
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
                        {mutation.isPending
                          ? "Loading..."
                          : id
                            ? "Save"
                            : "Create"}
                      </button>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isDeleteOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            if (deleteMutation.isPending) return;
            setIsDeleteOpen(false);
            setDeleteConfirmation("");
          }}
          initialFocus={initialFocusDeleteRef}
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
                      Delete Project
                    </DialogTitle>
                    <button
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (deleteMutation.isPending) return;
                        setIsDeleteOpen(false);
                        setDeleteConfirmation("");
                      }}
                      aria-label="Close"
                    >
                      <FontAwesomeIcon icon={faCircleXmark} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <form
                      id="deleteProject"
                      className="flex flex-col items-start justify-start gap-2"
                      onSubmit={async e => {
                        e.preventDefault();
                        if (deleteMutation.isPending || !id) return;

                        if (deleteConfirmation !== username) {
                          toast.error(
                            "Project slug does not match. Please try again."
                          );
                          return;
                        }

                        deleteMutation.mutate({
                          id,
                        });
                      }}
                    >
                      <p className="mb-4">
                        Are you sure you want to delete the project{" "}
                        <strong>{title}</strong>?
                      </p>
                      <TextInput
                        id="deleteConfirmation"
                        label="Type the project slug to confirm deletion."
                        value={deleteConfirmation}
                        onChange={e => {
                          setDeleteConfirmation(e.target.value);
                        }}
                        placeholder={username}
                        maxLength={username.length}
                        required
                        ref={initialFocusDeleteRef}
                      />
                    </form>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        className="w-full rounded-lg bg-neutral-500 p-2 transition hover:bg-neutral-500/50 disabled:bg-neutral-500/50"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (deleteMutation.isPending) return;
                          setIsDeleteOpen(false);
                          setDeleteConfirmation("");
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        form="deleteProject"
                        className="w-full rounded-lg bg-red-700 p-2 transition hover:bg-red-600 disabled:bg-neutral-500/50"
                        disabled={
                          deleteMutation.isPending ||
                          deleteConfirmation !== username
                        }
                      >
                        {deleteMutation.isPending ? "Loading..." : "Delete"}
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
