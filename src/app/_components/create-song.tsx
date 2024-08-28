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
import { faCloudArrowUp, faWarning } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import FileUpload from "./primitives/file-upload";
import { computeSHA256 } from "@/app/_helpers/crypto";

export function CreateSong({
  username,
  explicit,
}: {
  username: string;
  explicit: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentExplicit, setCurrentExplicit] = useState(explicit);
  const [audio, setAudio] = useState<File | undefined>();

  const initalFocusRef = useRef(null);

  const maxFileSize = api.track.getMaxSongFileSize.useQuery({
    username,
  }).data;

  const createSong = api.track.updateSong.useMutation({
    onSuccess: async ({ upload }) => {
      if (audio && upload) {
        await toast.promise(
          fetch(upload.url, {
            method: "PUT",
            headers: {
              "Content-Type": audio.type,
            },
            body: audio,
          }),
          {
            loading: "Uploading...",
            success: "Uploaded.",
            error: "Error uploading.",
          }
        );
      }
      setIsOpen(false);
      setAudio(undefined);
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
        <FontAwesomeIcon icon={faCloudArrowUp} />
        Upload Song
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            if (createSong.isPending) return;
            setIsOpen(false);
            setAudio(undefined);
            setCurrentExplicit(explicit);
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
                    <DialogTitle as="h3">Upload Song</DialogTitle>
                    <button
                      disabled={createSong.isPending}
                      onClick={() => {
                        if (createSong.isPending) return;
                        setIsOpen(false);
                        setAudio(undefined);
                        setCurrentExplicit(explicit);
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

                        if (createSong.isPending) return;

                        if (!audio) {
                          toast.error("Please select a song.");
                          return;
                        }

                        createSong.mutate({
                          username,
                          explicit: currentExplicit,
                          song: {
                            fileType: audio.type,
                            fileSize: audio.size,
                            checksum: await computeSHA256(audio),
                          },
                        });
                      }}
                    >
                      {audio && audio.type !== "audio/wav" && (
                        <div className="flex w-full items-center justify-start gap-4 rounded-lg bg-yellow-300 p-4 text-black">
                          <FontAwesomeIcon
                            icon={faWarning}
                            className="text-xl"
                          />
                          <div className="flex flex-col items-start justify-start">
                            <h6 className="text-lg font-bold">Warning</h6>
                            <p className="text-sm">
                              We recommend uploading a .wav file for the best
                              quality.
                            </p>
                          </div>
                        </div>
                      )}
                      {maxFileSize ? (
                        <FileUpload
                          id="song"
                          label="Song"
                          infoLabel={`Preferred: .wav, Accepts: .wav, .mp3\nMax Size: ${parseFloat((maxFileSize / 1048576).toFixed(2))}MB`}
                          accept={["audio/wav", "audio/mpeg"]}
                          maxSize={maxFileSize}
                          setFile={setAudio}
                          direction="column"
                          preview={audioUrl => (
                            <audio
                              controls
                              controlsList="nodownload"
                              src={audioUrl}
                              className="w-full"
                            />
                          )}
                        />
                      ) : (
                        <span className="text-sm text-gray-400">
                          Loading...
                        </span>
                      )}
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
                      <span className="text-sm text-gray-400">
                        {
                          'Uploading a song will set the music status to "Finished".'
                        }
                      </span>
                    </form>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        className="w-full rounded-lg bg-neutral-500 p-2 transition hover:bg-neutral-500/50 disabled:bg-neutral-500/50"
                        disabled={createSong.isPending}
                        onClick={() => {
                          if (createSong.isPending) return;
                          setIsOpen(false);
                          setAudio(undefined);
                          setCurrentExplicit(explicit);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        form="createProject"
                        className="w-full rounded-lg bg-violet-700 p-2 transition hover:bg-violet-500 disabled:bg-neutral-500/50"
                        disabled={createSong.isPending}
                      >
                        {createSong.isPending ? "Loading..." : "Upload"}
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
