"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

export function LyricsEditor({
  username,
  lyrics,
  canEdit,
}: {
  username: string;
  lyrics: string | null;
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(lyrics ?? "");
  const [localLyrics, setLocalLyrics] = useState(lyrics ?? "");
  const updateLyrics = api.track.updateLyrics.useMutation({
    onSuccess: () => {
      toast.success("Lyrics updated");
      setEditing(false);
      setLocalLyrics(value);
    },
    onError: err => toast.error(err.message),
  });

  if (!canEdit && !localLyrics) return null;

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-lg font-semibold">Lyrics</span>
        {canEdit && !editing && (
          <button
            className="ml-2 text-violet-400 hover:text-violet-200"
            onClick={() => setEditing(true)}
            title="Edit Lyrics"
          >
            <FontAwesomeIcon icon={faPencil} />
          </button>
        )}
      </div>
      {editing ? (
        <form
          onSubmit={e => {
            e.preventDefault();
            updateLyrics.mutate({ username, lyrics: value });
          }}
          className="flex flex-col gap-2"
        >
          <div className="relative w-full">
            <textarea
              className="min-h-32 w-full rounded-lg border border-slate-300 bg-white p-2 pr-16 text-slate-900"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Enter lyrics..."
              maxLength={10000}
              autoFocus
            />
            <small
              className={
                value.length < 10000
                  ? "pointer-events-none absolute bottom-2 right-4 text-xs text-gray-400"
                  : "pointer-events-none absolute bottom-2 right-4 text-xs font-medium text-red-500"
              }
            >
              {10000 - value.length}
            </small>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded bg-violet-700 px-3 py-1 text-white hover:bg-violet-500"
              disabled={updateLyrics.isPending}
            >
              <FontAwesomeIcon icon={faCheck} /> Save
            </button>
            <button
              type="button"
              className="rounded bg-neutral-600 px-3 py-1 text-white hover:bg-neutral-500"
              onClick={() => {
                setEditing(false);
                setValue(localLyrics);
              }}
              disabled={updateLyrics.isPending}
            >
              <FontAwesomeIcon icon={faXmark} /> Cancel
            </button>
          </div>
        </form>
      ) : localLyrics ? (
        <pre className="whitespace-pre-wrap rounded bg-neutral-800 p-3 text-gray-200">
          {localLyrics}
        </pre>
      ) : canEdit ? (
        <span className="text-gray-400">No lyrics yet. Click edit to add.</span>
      ) : null}
    </div>
  );
}
