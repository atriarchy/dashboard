"use client";

import { api } from "@/trpc/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faPencil,
  faQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { CreateCredit } from "@/app/_components/create-credit";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import toast from "react-hot-toast";

export function Credits({
  username,
  access,
  me,
}: {
  username: string;
  access?: "ADMIN" | null;
  me: "MANAGER" | "EDITOR" | "CONTRIBUTOR" | "VIEWER";
}) {
  const credits = api.credit.getTrackCredits.useQuery({
    username: username,
  });

  const deleteCredit = api.credit.deleteTrackCredit.useMutation({
    onSuccess: async () => {
      await credits.refetch();
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  return (
    <>
      {credits.error && (
        <span className="text-lg font-medium">{credits.error.message}</span>
      )}
      {credits.data && (
        <>
          <div className="flex items-start justify-start gap-4">
            <h2 className="bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text text-2xl font-bold text-transparent">
              Credits
            </h2>
            {me !== "VIEWER" && (
              <CreateCredit
                refetch={() => credits.refetch()}
                track={username}
                access={access}
                me={me}
              />
            )}
          </div>
          <div className="flex w-full flex-col items-start justify-start gap-2">
            {credits.data.map(credit => (
              <div
                key={credit.id}
                className="flex w-full items-center justify-between gap-4 rounded-lg bg-neutral-800 p-4"
              >
                <div className="flex items-center justify-center gap-2">
                  <FontAwesomeIcon
                    icon={
                      credit.nameSource === "ATRIARCHY"
                        ? faGlobe
                        : credit.nameSource === "DISCORD"
                          ? faDiscord
                          : credit.nameSource === "MANUAL"
                            ? faPencil
                            : faQuestion
                    }
                    className="mr-2 text-xl"
                  />
                  <div className="flex flex-col items-start justify-start">
                    <div className="flex items-center justify-start gap-2">
                      <h2 className="text-lg font-bold">{credit.name}</h2>
                    </div>
                    <p className="text-md">{credit.type}</p>
                    <p className="text-sm">{credit.value}</p>
                  </div>
                </div>
                {(access === "ADMIN" ||
                  me === "MANAGER" ||
                  me === "EDITOR" ||
                  credit.me) &&
                  me !== "VIEWER" && (
                    <div className="flex items-center justify-start gap-2">
                      <CreateCredit
                        id={credit.id}
                        refetch={() => credits.refetch()}
                        track={username}
                        access={access}
                        me={me}
                        defaultType={credit.type}
                        defaultValue={credit.value}
                      />
                      <button
                        onClick={() =>
                          deleteCredit.mutate({
                            id: credit.id,
                          })
                        }
                        className="w-fit rounded-lg bg-red-500 p-2 transition hover:bg-red-500/50 disabled:bg-red-500/50"
                        disabled={deleteCredit.isPending}
                      >
                        Delete
                      </button>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
