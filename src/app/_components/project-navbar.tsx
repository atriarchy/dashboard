"use client";

import { useRouter } from "next/navigation";

export function ProjectNavbar({
  selected,
  project,
}: {
  selected: "TRACKS" | "AGREEMENTS";
  project: string;
}) {
  const router = useRouter();

  return (
    <select
      value={selected}
      onChange={e => {
        router.push(
          `/dashboard/projects/${project}/${e.target.value.toLowerCase()}`
        );
      }}
      className="rounded-lg border border-slate-300 bg-white p-2 text-slate-900"
    >
      <option value="TRACKS">Tracks</option>
      <option value="AGREEMENTS">Agreements</option>
    </select>
  );
}
