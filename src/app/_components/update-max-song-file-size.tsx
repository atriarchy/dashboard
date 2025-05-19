"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import TextInput from "@/app/_components/primitives/text-input";
import toast from "react-hot-toast";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const BYTES_PER_MB = 1048576;

export function UpdateMaxSongFileSize({
  username,
  initialValue,
}: {
  username: string;
  initialValue?: number;
}) {
  const [value, setValue] = useState(
    initialValue ? (initialValue / BYTES_PER_MB).toString() : ""
  );
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const utils = api.useUtils();
  const { data: track, isLoading: trackLoading } = api.track.getTrack.useQuery({
    username,
  });

  const update = api.track.setMaxSongFileSize.useMutation({
    onSuccess: async () => {
      toast.success("Max file size updated");
      setLoading(false);
      setEditing(false);
      if (utils?.track?.getTrack) await utils.track.getTrack.invalidate();
    },
    onError: err => {
      toast.error(err.message);
      setLoading(false);
    },
  });

  useEffect(() => {
    if (track && typeof track.maxSongFileSize === "number") {
      setValue((track.maxSongFileSize / BYTES_PER_MB).toString());
    }
  }, [track?.maxSongFileSize]);

  if (trackLoading || !track) return null;

  return editing ? (
    <form
      className="flex items-center gap-2"
      onSubmit={e => {
        e.preventDefault();
        setLoading(true);
        const mb = parseFloat(value);
        if (isNaN(mb) || mb < 1 || mb > 200) {
          toast.error("Enter a value between 1 and 200 MB");
          setLoading(false);
          return;
        }
        update.mutate({
          username,
          maxSongFileSize: Math.round(mb * BYTES_PER_MB),
        });
      }}
    >
      <TextInput
        id="maxSongFileSize"
        value={value}
        onChange={e => setValue(e.target.value.replace(/[^\d.]/g, ""))}
        placeholder="60"
        className="w-20"
        autoFocus
        type="number"
      />
      <button
        type="submit"
        className="rounded bg-violet-700 px-2 py-1 text-sm text-white hover:bg-violet-500 disabled:bg-neutral-500/50"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save"}
      </button>
      <button
        type="button"
        className="rounded bg-neutral-700 px-2 py-1 text-sm text-white hover:bg-neutral-500/50"
        onClick={() => setEditing(false)}
        disabled={loading}
      >
        Cancel
      </button>
    </form>
  ) : (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400">Max file size: {value} MB</span>
      <button
        type="button"
        className="rounded p-1 text-violet-400 hover:text-violet-200"
        onClick={() => setEditing(true)}
        title="Edit max file size"
      >
        <FontAwesomeIcon icon={faPencil} />
      </button>
    </div>
  );
}
