"use client";

import { api } from "@/trpc/react";
import { CreateAgreement } from "@/app/_components/create-agreement";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileContract, faPenNib } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function Agreements({
  access,
  project,
}: {
  access?: "ADMIN" | null;
  project: string;
}) {
  const router = useRouter();

  const agreements = api.agreement.getAgreements.useQuery({
    project: project,
  });

  const sign = api.agreement.signAgreement.useMutation({
    onSuccess: async url => {
      router.push(url);
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  return (
    <>
      {agreements.error ? (
        <span className="text-lg font-medium">{agreements.error.message}</span>
      ) : (
        <>
          <div className="flex items-start justify-start gap-4">
            <h1 className="bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text text-3xl font-bold text-transparent">
              Agreements
            </h1>
            {access === "ADMIN" && (
              <CreateAgreement project={project} refetch={agreements.refetch} />
            )}
          </div>
          <div className="flex w-full flex-col items-start justify-start gap-2">
            {agreements.data?.map(agreement => (
              <div
                key={agreement.id}
                className="flex w-full items-center justify-between gap-4 rounded-lg bg-neutral-800 p-4"
              >
                <div className="flex items-center justify-start gap-4">
                  <FontAwesomeIcon icon={faFileContract} className="text-xl" />
                  <div className="flex flex-col items-start justify-start">
                    <div className="flex items-center justify-start gap-2">
                      <h2 className="text-lg font-bold">{agreement.title}</h2>
                    </div>
                    <p className="text-sm text-gray-400">
                      {agreement.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-start gap-2">
                  <span className="rounded-full bg-neutral-950 px-2 py-1 text-sm">
                    {agreement.status}
                  </span>
                  {agreement.status !== "COMPLETED" && (
                    <button
                      onClick={() => {
                        sign.mutate({
                          agreement: agreement.id,
                        });
                      }}
                      className="flex items-center justify-start gap-2 rounded-lg bg-neutral-500 p-2 transition hover:bg-neutral-500/50 disabled:bg-neutral-500/50"
                    >
                      <FontAwesomeIcon icon={faPenNib} />
                      <span>Sign</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
