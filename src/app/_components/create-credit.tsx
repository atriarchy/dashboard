"use client";

import { Fragment, useEffect, useRef, useState } from "react";
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
import { faUserPen, faWarning } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import TextInput from "@/app/_components/primitives/text-input";

// {
//   Group: {
//     DatabaseValue: LabelValue,
//   },
// }
export const CreditTypes = {
  Writing: {
    Composing: "Composing",
    Lyrics: "Lyrics",
    "Composing and Lyrics": "Composing and Lyrics",
  },
  Music: {
    Vocalist: "Vocalist",
    Instrumentalist: "Instrumentalist",
    Producer: "Producer",
    Engineer: "Engineer",
  },
  Visual: {
    "Visual Artist": "Visual Artist",
    "Video Editors": "Video Editors",
  },
};

export function CreateCredit({
  refetch,
  track,
  access,
  me,
  id,
  defaultType,
  defaultValue,
}: {
  refetch: () => void;
  track: string;
  access?: "ADMIN" | null;
  me: "MANAGER" | "EDITOR" | "CONTRIBUTOR";
  id?: string;
  defaultType?: string;
  defaultValue?: string | null;
}) {
  const flattenCreditTypes = Object.values(CreditTypes)
    .map(value => Object.keys(value))
    .flat();

  const [isOpen, setIsOpen] = useState(false);
  const [userType, setUserType] = useState<"COLLABORATOR" | "MANUAL">(
    "COLLABORATOR"
  );
  const [user, setUser] = useState("");
  const [manualUser, setManualUser] = useState("");
  const [type, setType] = useState(
    defaultType
      ? flattenCreditTypes.includes(defaultType)
        ? defaultType
        : "_other"
      : ""
  );
  const [manualType, setManualType] = useState(
    defaultType && !flattenCreditTypes.includes(defaultType) ? defaultType : ""
  );
  const [value, setValue] = useState(defaultValue ?? "");

  const initalFocusRef = useRef(null);

  const trackQuery = api.track.getTrack.useQuery({
    username: track,
  });

  const updateCredit = api.credit.updateTrackCredit.useMutation({
    onSuccess: () => {
      refetch();
      setIsOpen(false);
      if (id) return;
      setUserType("COLLABORATOR");
      setUser("");
      setManualUser("");
      setType("");
      setManualType("");
      setValue("");
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (me === "CONTRIBUTOR" && trackQuery.data?.me.id) {
      setUserType("COLLABORATOR");
      setUser(trackQuery.data.me.id);
    }
  }, [me, trackQuery.data?.me.id]);

  return (
    <>
      {trackQuery.data && (
        <>
          {id ? (
            <button
              onClick={() => setIsOpen(true)}
              className="w-fit rounded-lg bg-violet-700 p-2 transition hover:bg-violet-500"
            >
              Edit
            </button>
          ) : (
            <button
              onClick={() => setIsOpen(true)}
              className="flex w-fit items-center justify-center gap-2 rounded-lg bg-violet-700 px-4 py-2 text-sm transition hover:bg-violet-500"
            >
              <FontAwesomeIcon icon={faUserPen} />
              <span>Add Credit</span>
            </button>
          )}

          <Transition appear show={isOpen} as={Fragment}>
            <Dialog
              as="div"
              className="relative z-10"
              onClose={() => {
                if (trackQuery.isPending || updateCredit.isPending) return;
                setIsOpen(false);
                if (id) return;
                setUserType("COLLABORATOR");
                setUser("");
                setManualUser("");
                setType("");
                setManualType("");
                setValue("");
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
                          {id ? "Edit Credit" : "Add Credit"}
                        </DialogTitle>
                        <button
                          disabled={
                            trackQuery.isPending || updateCredit.isPending
                          }
                          onClick={() => {
                            if (trackQuery.isPending || updateCredit.isPending)
                              return;
                            setIsOpen(false);
                            if (id) return;
                            setUserType("COLLABORATOR");
                            setUser("");
                            setManualUser("");
                            setType("");
                            setManualType("");
                            setValue("");
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

                            if (trackQuery.isPending || updateCredit.isPending)
                              return;

                            if (!type) {
                              toast.error("Please select a credit type.");
                              return;
                            }

                            if (type === "_other" && !manualType) {
                              toast.error("Please enter a credit type.");
                              return;
                            }

                            if (userType === "COLLABORATOR" && !user) {
                              toast.error("Please select a collaborator.");
                              return;
                            }

                            if (userType === "MANUAL" && !manualUser) {
                              toast.error("Please enter a name.");
                              return;
                            }

                            if (id) {
                              updateCredit.mutate({
                                id: id,
                                type: type === "_other" ? manualType : type,
                                value: value || undefined,
                              });

                              return;
                            }

                            if (userType === "COLLABORATOR") {
                              updateCredit.mutate({
                                track: track,
                                collaborator: user,
                                type: type === "_other" ? manualType : type,
                                value: value || undefined,
                              });
                            }

                            if (userType === "MANUAL") {
                              updateCredit.mutate({
                                track: track,
                                manual: manualUser,
                                type: type === "_other" ? manualType : type,
                                value: value || undefined,
                              });
                            }
                          }}
                        >
                          {!id && (
                            <>
                              <select
                                id="userType"
                                name="Type"
                                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900"
                                value={userType}
                                onChange={e =>
                                  setUserType(
                                    e.target.value as "COLLABORATOR" | "MANUAL"
                                  )
                                }
                              >
                                <option value="COLLABORATOR">
                                  Collaborator
                                </option>
                                {me !== "CONTRIBUTOR" && (
                                  <option value="MANUAL">Manual</option>
                                )}
                              </select>
                              {userType === "COLLABORATOR" && (
                                <select
                                  id="user"
                                  name="Collaborator"
                                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900"
                                  value={user}
                                  onChange={e => setUser(e.target.value)}
                                >
                                  <>
                                    {user === "" && (
                                      <option value="" disabled hidden>
                                        Select Collaborator
                                      </option>
                                    )}
                                    {trackQuery.data.collaborators
                                      .filter(c => {
                                        if (
                                          access === "ADMIN" ||
                                          me === "MANAGER" ||
                                          me === "EDITOR"
                                        ) {
                                          return true;
                                        }

                                        return c.me;
                                      })
                                      .map(collaborator => (
                                        <option
                                          key={collaborator.id}
                                          value={collaborator.id}
                                        >
                                          {collaborator.type === "ATRIARCHY" &&
                                            `${collaborator.name} (@${collaborator.username})`}
                                          {collaborator.type === "DISCORD" &&
                                            `${collaborator.discord.username} (Discord)`}
                                        </option>
                                      ))}
                                  </>
                                </select>
                              )}
                              {userType === "MANUAL" && (
                                <>
                                  <div className="flex w-full items-center justify-start gap-4 rounded-lg bg-yellow-300 p-4 text-black">
                                    <FontAwesomeIcon
                                      icon={faWarning}
                                      className="text-xl"
                                    />
                                    <div className="flex flex-col items-start justify-start">
                                      <h6 className="text-lg font-bold">
                                        Warning
                                      </h6>
                                      <p className="text-sm">
                                        Avoid using manual credits if possible.
                                        Try to add the user you are crediting as
                                        a collaborator first.
                                      </p>
                                    </div>
                                  </div>
                                  <TextInput
                                    id="manualUser"
                                    label="Name"
                                    value={manualUser}
                                    onChange={e =>
                                      setManualUser(e.target.value)
                                    }
                                    placeholder="Name"
                                    maxLength={128}
                                    required
                                  />
                                </>
                              )}
                            </>
                          )}
                          <select
                            id="type"
                            name="Type"
                            className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900"
                            value={type}
                            onChange={e => setType(e.target.value)}
                          >
                            {type === "" && (
                              <option value="" disabled hidden>
                                Select Credit Type
                              </option>
                            )}
                            {Object.entries(CreditTypes).map(
                              ([key, value], i) => (
                                <optgroup key={i} label={key}>
                                  {Object.entries(value).map(([key, value]) => (
                                    <option key={key} value={key}>
                                      {value}
                                    </option>
                                  ))}
                                </optgroup>
                              )
                            )}
                            <optgroup label="Other">
                              <option value="_other">Other</option>
                            </optgroup>
                          </select>
                          {type === "_other" && (
                            <TextInput
                              id="manaualType"
                              label="Other Credit"
                              value={manualType}
                              onChange={e => setManualType(e.target.value)}
                              placeholder="Other Credit"
                              maxLength={128}
                              required
                            />
                          )}
                          <div className="flex w-full flex-col items-center justify-start gap-2">
                            <label
                              htmlFor="value"
                              className="text-md w-full font-semibold"
                            >
                              Details
                            </label>
                            <div className="relative w-full">
                              <textarea
                                id="value"
                                value={value}
                                onChange={e => setValue(e.target.value)}
                                className="min-h-16 w-full rounded-lg border border-slate-300 bg-white py-2 pl-2 pr-8 text-slate-900"
                                placeholder="Details"
                                maxLength={1024}
                              />
                              <small
                                className={
                                  value.length < 1024
                                    ? "pointer-events-none absolute bottom-2 right-2 -translate-y-1/2 text-xs text-gray-400"
                                    : "pointer-events-none absolute bottom-2 right-2 -translate-y-1/2 text-xs font-medium text-red-500"
                                }
                              >
                                {1024 - value.length}
                              </small>
                            </div>
                          </div>
                          <button
                            type="submit"
                            className="w-full rounded-lg bg-violet-700 p-2 transition hover:bg-violet-500 disabled:bg-neutral-500/50"
                            disabled={
                              trackQuery.isPending || updateCredit.isPending
                            }
                          >
                            {trackQuery.isPending || updateCredit.isPending
                              ? "Loading..."
                              : id
                                ? "Save"
                                : "Add"}
                          </button>
                        </form>
                      </div>
                    </DialogPanel>
                  </TransitionChild>
                </div>
              </div>
            </Dialog>
          </Transition>
        </>
      )}
    </>
  );
}
