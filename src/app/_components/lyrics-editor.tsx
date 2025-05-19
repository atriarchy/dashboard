"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import TextArea from "@/app/_components/primitives/text-area";

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
  const [lyricsState, setLyricsState] = useState(lyrics ?? "");
  const updateLyrics = api.track.updateLyrics.useMutation({
    onSuccess: () => {
      toast.success("Lyrics updated");
      setEditing(false);
    },
    onError: err => toast.error(err.message),
  });

  if (!canEdit && !lyricsState) return null;

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-lg font-semibold">Lyrics</span>
        {canEdit && !editing && (
          <button
            className="ml-2 text-violet-400 hover:text-violet-200"
            onClick={() => {
              setEditing(true);
              setLyricsState(lyricsState);
            }}
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
            updateLyrics.mutate({ username, lyrics: lyricsState });
          }}
          className="flex flex-col gap-2"
        >
          <TextArea
            id="lyrics-editor-textarea"
            value={lyricsState}
            onChange={e => setLyricsState(e.target.value)}
            placeholder="Enter lyrics..."
            maxLength={10000}
            autoFocus
            className="min-h-32 pr-16"
          />
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
                setLyricsState(lyrics ?? "");
              }}
              disabled={updateLyrics.isPending}
            >
              <FontAwesomeIcon icon={faXmark} /> Cancel
            </button>
          </div>
        </form>
      ) : lyricsState ? (
        <pre className="whitespace-pre-wrap rounded bg-neutral-800 p-3 text-gray-200">
          {lyricsState}
        </pre>
      ) : canEdit ? (
        <span className="text-gray-400">No lyrics yet. Click edit to add.</span>
      ) : null}
    </div>
  );
}
