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
  faCheck,
  faPencil,
  faWarning,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import TextInput from "@/app/_components/primitives/text-input";
import SelectInput from "./primitives/select-input";
import TextArea from "./primitives/text-area";
import CheckboxItem from "./primitives/checkbox-item";
import { humanize } from "@/utils/string";
import { useRouter } from "next/navigation";

type TrackType = "ORIGINAL" | "PARODY" | "COVER";

export function EditTrack({
  access,
  role,
  username,
  title,
  description,
  explicit,
  musicStatus,
  visualStatus,
  type,
  status,
}: {
  access?: "ADMIN" | null;
  role: "VIEWER" | "MANAGER" | "EDITOR" | "CONTRIBUTOR";
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
  type: "ORIGINAL" | "PARODY" | "COVER";
  status: "DRAFT" | "SUBMITTED" | "ACCEPTED" | "REJECTED";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmittingOpen, setIsSubmittingOpen] = useState(false);
  const [isAccceptingOpen, setIsAcceptingOpen] = useState(false);
  const [isRejectingOpen, setIsRejectingOpen] = useState(false);
  const [isRecallOpen, setIsRecallOpen] = useState(false);
  const [originalTitle, setOriginalTitle] = useState(title);
  const [originalDescription, setOriginalDescription] = useState(
    description ?? ""
  );
  const [originalExplicit, setOriginalExplicit] = useState(explicit);
  const [originalMusicStatus, setOriginalMusicStatus] = useState<
    | "IDEA"
    | "DEMO"
    | "WRITING"
    | "PRODUCTION"
    | "RECORDING"
    | "MIX_MASTER"
    | "ABANDONED"
    | "FINISHED"
  >(musicStatus);
  const [originalVisualStatus, setOriginalVisualStatus] = useState<
    "ABANDONED" | "FINISHED" | "SEARCHING" | "CONCEPT" | "WORKING" | "POLISHING"
  >(visualStatus);
  const [originalType, setOriginalType] = useState<TrackType>(type);
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
  const [currentType, setCurrentType] = useState<TrackType>(type);
  const [currentStatus, setCurrentStatus] = useState<
    "DRAFT" | "SUBMITTED" | "ACCEPTED" | "REJECTED"
  >(status);
  const [validationData, setValidationData] = useState<
    | {
        audioFileUploaded: boolean;
        credits: number;
        lyricsSet: boolean;
        title: string;
        explicit: boolean;
        trackType: TrackType;
        unsignedAgreements: {
          id: string;
          title: string;
          name: string;
        }[];
        ready: boolean;
      }
    | undefined
  >(undefined);
  const [validationChecked, setValidationChecked] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");
  const router = useRouter();

  const initalFocusRef = useRef(null);

  const editTrack = api.track.updateTrack.useMutation({
    onSuccess: () => {
      setOriginalTitle(currentTitle);
      setOriginalDescription(currentDescription);
      setOriginalExplicit(currentExplicit);
      setOriginalMusicStatus(currentMusicStatus);
      setOriginalVisualStatus(currentVisualStatus);
      setOriginalType(currentType);
      toast.success("Track updated successfully");
      setIsOpen(false);
      router.refresh();
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const submitTrack = api.track.submitTrack.useMutation({
    onSuccess: () => {
      toast.success("Track submitted successfully");
      setIsSubmittingOpen(false);
      setValidationChecked(false);
      setCurrentStatus("SUBMITTED");
      router.refresh();
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const validateTrack = api.track.validateTrack.useMutation({
    onSuccess: data => {
      setValidationData(data);
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const updateTrackStatus = api.track.updateTrackStatus.useMutation({
    onSuccess: data => {
      toast.success("Track status updated successfully");
      setIsAcceptingOpen(false);
      setIsRejectingOpen(false);
      setIsRecallOpen(false);
      setCurrentStatus(data);
      setNotes("");
      router.refresh();
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const reset = () => {
    setCurrentTitle(originalTitle);
    setCurrentDescription(originalDescription);
    setCurrentExplicit(originalExplicit);
    setCurrentMusicStatus(originalMusicStatus);
    setCurrentVisualStatus(originalVisualStatus);
    setCurrentType(originalType);
  };

  return (
    <>
      {(access === "ADMIN" ||
        (currentStatus !== "SUBMITTED" && currentStatus !== "ACCEPTED")) && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsSubmittingOpen(false);
            setIsAcceptingOpen(false);
            setIsRejectingOpen(false);
            setIsRecallOpen(false);
          }}
          className="flex w-fit items-center justify-center gap-2 rounded-lg bg-violet-700 px-4 py-2 text-sm transition hover:bg-violet-500"
        >
          <FontAwesomeIcon icon={faPencil} />
          Edit
        </button>
      )}

      {currentStatus !== "SUBMITTED" &&
        currentStatus !== "ACCEPTED" &&
        (role === "MANAGER" || access === "ADMIN") && (
          <button
            onClick={() => {
              setIsSubmittingOpen(true);
              setIsOpen(false);
              setIsAcceptingOpen(false);
              setIsRejectingOpen(false);
              setIsRecallOpen(false);
              validateTrack.mutate({
                username,
              });
            }}
            className="flex w-fit items-center justify-center gap-2 rounded-lg bg-violet-700 px-4 py-2 text-sm transition hover:bg-violet-500"
          >
            <FontAwesomeIcon icon={faCheck} />
            {currentStatus === "DRAFT"
              ? "Submit for Release"
              : "Resubmit for Release"}
          </button>
        )}

      {((currentStatus === "SUBMITTED" &&
        (role === "MANAGER" || access === "ADMIN")) ||
        (currentStatus === "ACCEPTED" && access === "ADMIN")) && (
        <button
          onClick={() => {
            setIsRecallOpen(true);
            setIsOpen(false);
            setIsAcceptingOpen(false);
            setIsSubmittingOpen(false);
            setIsRejectingOpen(false);
          }}
          className="flex w-fit items-center justify-center gap-2 rounded-lg bg-violet-700 px-4 py-2 text-sm transition hover:bg-violet-500"
        >
          <FontAwesomeIcon icon={faXmark} />
          Cancel Submission
        </button>
      )}

      {currentStatus === "SUBMITTED" && access === "ADMIN" && (
        <button
          onClick={() => {
            setIsAcceptingOpen(true);
            setIsOpen(false);
            setIsSubmittingOpen(false);
            setIsRejectingOpen(false);
            setIsRecallOpen(false);
          }}
          className="flex w-fit items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm transition hover:bg-green-500"
        >
          <FontAwesomeIcon icon={faCheck} />
          Accept
        </button>
      )}

      {currentStatus === "SUBMITTED" && access === "ADMIN" && (
        <button
          onClick={() => {
            setIsRejectingOpen(true);
            setIsOpen(false);
            setIsSubmittingOpen(false);
            setIsAcceptingOpen(false);
            setIsRecallOpen(false);
          }}
          className="flex w-fit items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm transition hover:bg-red-500"
        >
          <FontAwesomeIcon icon={faXmark} />
          Reject
        </button>
      )}

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            if (editTrack.isPending) return;
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
                    <DialogTitle as="h3">Edit Track</DialogTitle>
                    <button
                      disabled={editTrack.isPending}
                      onClick={() => {
                        if (editTrack.isPending) return;
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

                        if (editTrack.isPending) return;

                        editTrack.mutate({
                          username,
                          title: currentTitle,
                          explicit: currentExplicit,
                          musicStatus: currentMusicStatus,
                          visualStatus: currentVisualStatus,
                          description: currentDescription || undefined,
                          type: currentType,
                        });
                      }}
                    >
                      {musicStatus === "FINISHED" && (
                        <div className="flex w-full items-center justify-start gap-4 rounded-lg bg-yellow-300 p-4 text-black">
                          <FontAwesomeIcon
                            icon={faWarning}
                            className="text-xl"
                          />
                          <div className="flex flex-col items-start justify-start">
                            <h6 className="text-lg font-bold">Warning</h6>
                            <p className="text-sm">
                              Changing the music status will unsubmit your
                              uploaded song.
                            </p>
                          </div>
                        </div>
                      )}
                      <TextInput
                        id="title"
                        label="Title"
                        value={currentTitle}
                        onChange={e => setCurrentTitle(e.target.value)}
                        placeholder="Title"
                        maxLength={64}
                        required
                        disabled={editTrack.isPending}
                      />
                      <TextArea
                        id="description"
                        label="Description"
                        value={currentDescription}
                        onChange={e => setCurrentDescription(e.target.value)}
                        placeholder="Description"
                        maxLength={1024}
                        disabled={editTrack.isPending}
                      />
                      <SelectInput
                        id="explicit"
                        label="Is this track explicit?"
                        value={currentExplicit ? "EXPLICIT" : "CLEAN"}
                        onChange={e =>
                          setCurrentExplicit(e.target.value === "EXPLICIT")
                        }
                        options={[
                          { value: "CLEAN", label: "Clean" },
                          { value: "EXPLICIT", label: "Explicit" },
                        ]}
                        readOnly={editTrack.isPending}
                      />
                      <SelectInput
                        id="type"
                        label="Track Type"
                        value={currentType}
                        onChange={e =>
                          setCurrentType(e.target.value as TrackType)
                        }
                        options={[
                          { value: "ORIGINAL", label: "Original" },
                          { value: "PARODY", label: "Parody" },
                          { value: "COVER", label: "Cover" },
                        ]}
                        readOnly={editTrack.isPending}
                      />
                      <SelectInput
                        id="musicStatus"
                        label="Music Status"
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
                        options={[
                          { value: "IDEA", label: "Idea" },
                          { value: "DEMO", label: "Demo" },
                          { value: "WRITING", label: "Writing" },
                          { value: "PRODUCTION", label: "Production" },
                          { value: "RECORDING", label: "Recording" },
                          { value: "MIX_MASTER", label: "Mix and Master" },
                          { value: "ABANDONED", label: "Abandoned" },
                          {
                            value: "FINISHED",
                            label: "Finished",
                            disabled: access !== "ADMIN",
                          },
                        ]}
                        readOnly={editTrack.isPending}
                      />
                      <SelectInput
                        id="visualStatus"
                        label="Visual Status"
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
                        options={[
                          { value: "SEARCHING", label: "Searching" },
                          { value: "CONCEPT", label: "Concept" },
                          { value: "WORKING", label: "Working" },
                          { value: "POLISHING", label: "Polishing" },
                          { value: "ABANDONED", label: "Abandoned" },
                          { value: "FINISHED", label: "Finished" },
                        ]}
                        readOnly={editTrack.isPending}
                      />
                    </form>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        className="w-full rounded-lg bg-neutral-500 p-2 transition hover:bg-neutral-500/50 disabled:bg-neutral-500/50"
                        disabled={editTrack.isPending}
                        onClick={() => {
                          if (editTrack.isPending) return;
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
                        disabled={editTrack.isPending}
                      >
                        {editTrack.isPending ? "Loading..." : "Save"}
                      </button>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isSubmittingOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            if (submitTrack.isPending) return;
            setIsSubmittingOpen(false);
            setValidationChecked(false);
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
                    <DialogTitle as="h3">Submit Track</DialogTitle>
                    <button
                      disabled={submitTrack.isPending}
                      onClick={() => {
                        if (submitTrack.isPending) return;
                        setIsSubmittingOpen(false);
                        setValidationChecked(false);
                      }}
                      aria-label="Close"
                    >
                      <FontAwesomeIcon icon={faCircleXmark} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <form
                      id="submitProject"
                      onSubmit={async e => {
                        e.preventDefault();

                        if (
                          submitTrack.isPending ||
                          !validationData?.ready ||
                          !validationChecked
                        )
                          return;

                        submitTrack.mutate({
                          username,
                        });
                      }}
                    >
                      {validateTrack.isPending || !validationData ? (
                        <span className="text-lg font-medium text-gray-400">
                          Loading...
                        </span>
                      ) : (
                        <div>
                          <p className="text-md mb-2 font-medium">
                            Auto-Validation:
                          </p>
                          <CheckboxItem
                            id="audioFileUploaded"
                            label="Audio File"
                            description={
                              validationData.audioFileUploaded
                                ? "Uploaded! Make sure the file is up-to-date."
                                : "Not uploaded. Please upload an audio file."
                            }
                            checked={validationData.audioFileUploaded}
                            disabled
                          />
                          <CheckboxItem
                            id="credits"
                            label="Credits"
                            description={
                              validationData.credits !== 0
                                ? `There are ${validationData.credits} credit${
                                    validationData.credits > 1 ? "s" : ""
                                  }! Make sure all the credits are up-to-date.`
                                : "There are no credits. Please add at least one credit."
                            }
                            checked={validationData.credits > 0}
                            disabled
                          />
                          <CheckboxItem
                            id="lyricsSet"
                            label="Lyrics"
                            description={
                              validationData.lyricsSet
                                ? "Lyrics are set! Make sure the lyrics are up-to-date."
                                : "Lyrics are not set. Please set the lyrics."
                            }
                            checked={validationData.lyricsSet}
                            disabled
                          />
                          <CheckboxItem
                            id="title"
                            label="Title"
                            description={`Title is set as "${
                              validationData.title
                            }"! Make sure the title is up-to-date and not a placeholder.`}
                            checked={true}
                            disabled
                          />
                          <CheckboxItem
                            id="explicit"
                            label="Explicit / Clean"
                            description={`This track is set as ${
                              validationData.explicit ? "Explicit" : "Clean"
                            }! Make sure the explicit status is up-to-date.`}
                            checked={true}
                            disabled
                          />
                          <CheckboxItem
                            id="trackType"
                            label="Track Type"
                            description={`This track is set as ${humanize(
                              validationData.trackType
                            )}! Make sure the track type is up-to-date.`}
                            checked={true}
                            disabled
                          />
                          <CheckboxItem
                            id="agreements"
                            label="Agreements"
                            description={
                              validationData.unsignedAgreements.length === 0
                                ? "All agreements are signed!"
                                : `The following agreements are unsigned:\n${validationData.unsignedAgreements
                                    .map(
                                      agreement =>
                                        `- ${agreement.name}: ${agreement.title}`
                                    )
                                    .join("\n")}\nPlease sign all agreements.`
                            }
                            checked={
                              validationData.unsignedAgreements.length === 0
                            }
                            disabled
                          />
                          {validationData?.ready && (
                            <>
                              <p className="text-md my-2 font-medium">
                                Manual Validation:
                              </p>
                              <CheckboxItem
                                id="creditsVerify"
                                label="Credits"
                                description="I have reviewed the credits and confirm they are correct."
                                checked={validationChecked}
                                onChange={e =>
                                  setValidationChecked(e.target.checked)
                                }
                              />
                              <p className="mt-2 text-sm text-gray-400">
                                {
                                  'Submitting this track will set the music and visual status to "Finished" and lock the track for editing.'
                                }
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </form>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        className="w-full rounded-lg bg-neutral-500 p-2 transition hover:bg-neutral-500/50 disabled:bg-neutral-500/50"
                        disabled={submitTrack.isPending}
                        onClick={() => {
                          if (submitTrack.isPending) return;
                          setIsSubmittingOpen(false);
                          setValidationChecked(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        form="submitProject"
                        className="w-full rounded-lg bg-violet-700 p-2 transition hover:bg-violet-500 disabled:bg-neutral-500/50"
                        disabled={
                          submitTrack.isPending ||
                          !validationData?.ready ||
                          !validationChecked
                        }
                      >
                        {submitTrack.isPending ? "Loading..." : "Submit"}
                      </button>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isAccceptingOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            if (updateTrackStatus.isPending) return;
            setIsAcceptingOpen(false);
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
                    <DialogTitle as="h3">Accept Track</DialogTitle>
                    <button
                      disabled={updateTrackStatus.isPending}
                      onClick={() => {
                        if (updateTrackStatus.isPending) return;
                        setIsAcceptingOpen(false);
                      }}
                      aria-label="Close"
                    >
                      <FontAwesomeIcon icon={faCircleXmark} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <form
                      id="acceptProject"
                      onSubmit={async e => {
                        e.preventDefault();

                        if (updateTrackStatus.isPending) return;

                        updateTrackStatus.mutate({
                          username,
                          status: "ACCEPTED",
                        });
                      }}
                    ></form>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        className="w-full rounded-lg bg-neutral-500 p-2 transition hover:bg-neutral-500/50 disabled:bg-neutral-500/50"
                        disabled={updateTrackStatus.isPending}
                        onClick={() => {
                          if (updateTrackStatus.isPending) return;
                          setIsAcceptingOpen(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        form="acceptProject"
                        className="w-full rounded-lg bg-green-700 p-2 transition hover:bg-green-500 disabled:bg-neutral-500/50"
                        disabled={updateTrackStatus.isPending}
                      >
                        {updateTrackStatus.isPending ? "Loading..." : "Accept"}
                      </button>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isRejectingOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            if (updateTrackStatus.isPending) return;
            setIsRejectingOpen(false);
            setNotes("");
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
                    <DialogTitle as="h3">Reject Track</DialogTitle>
                    <button
                      disabled={updateTrackStatus.isPending}
                      onClick={() => {
                        if (updateTrackStatus.isPending) return;
                        setIsRejectingOpen(false);
                        setNotes("");
                      }}
                      aria-label="Close"
                    >
                      <FontAwesomeIcon icon={faCircleXmark} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <form
                      id="acceptProject"
                      onSubmit={async e => {
                        e.preventDefault();

                        if (updateTrackStatus.isPending) return;

                        updateTrackStatus.mutate({
                          username,
                          status: "REJECTED",
                          notes,
                        });
                      }}
                    >
                      <TextArea
                        id="notes"
                        label="Notes"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Rejection Notes"
                        maxLength={1024}
                        disabled={updateTrackStatus.isPending}
                      />
                    </form>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        className="w-full rounded-lg bg-neutral-500 p-2 transition hover:bg-neutral-500/50 disabled:bg-neutral-500/50"
                        disabled={updateTrackStatus.isPending}
                        onClick={() => {
                          if (updateTrackStatus.isPending) return;
                          setIsRejectingOpen(false);
                          setNotes("");
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        form="acceptProject"
                        className="w-full rounded-lg bg-red-700 p-2 transition hover:bg-red-500 disabled:bg-neutral-500/50"
                        disabled={updateTrackStatus.isPending}
                      >
                        {updateTrackStatus.isPending ? "Loading..." : "Reject"}
                      </button>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isRecallOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            if (updateTrackStatus.isPending) return;
            setIsRecallOpen(false);
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
                    <DialogTitle as="h3">Cancel Submission</DialogTitle>
                    <button
                      disabled={updateTrackStatus.isPending}
                      onClick={() => {
                        if (updateTrackStatus.isPending) return;
                        setIsRecallOpen(false);
                      }}
                      aria-label="Close"
                    >
                      <FontAwesomeIcon icon={faCircleXmark} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <form
                      id="acceptProject"
                      onSubmit={async e => {
                        e.preventDefault();

                        if (updateTrackStatus.isPending) return;

                        updateTrackStatus.mutate({
                          username,
                          status: "DRAFT",
                        });
                      }}
                    ></form>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        className="w-full rounded-lg bg-neutral-500 p-2 transition hover:bg-neutral-500/50 disabled:bg-neutral-500/50"
                        disabled={updateTrackStatus.isPending}
                        onClick={() => {
                          if (updateTrackStatus.isPending) return;
                          setIsRecallOpen(false);
                        }}
                      >
                        No
                      </button>
                      <button
                        type="submit"
                        form="acceptProject"
                        className="w-full rounded-lg bg-violet-700 p-2 transition hover:bg-violet-500 disabled:bg-neutral-500/50"
                        disabled={updateTrackStatus.isPending}
                      >
                        {updateTrackStatus.isPending ? "Loading..." : "Yes"}
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
