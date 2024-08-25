"use client";

import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export function AuditLog({
  log,
}: {
  log: {
    id: string;
    action: string;
    title: string;
    date: Date;
    details?: string[];
  };
}) {
  const [details, setDetails] = useState(false);

  return (
    <div className="flex w-full flex-col items-start justify-start gap-2 rounded-lg bg-neutral-800 p-4">
      <p className="text-lg font-bold">{log.title}</p>
      {log.details && log.details.length > 0 && (
        <div className="flex w-full flex-col items-start justify-start gap-2">
          <button
            type="button"
            className="flex w-fit items-center justify-center gap-2 text-sm text-gray-400"
            onClick={() => setDetails(!details)}
          >
            <FontAwesomeIcon
              icon={faChevronDown}
              className={`transition duration-300 ${
                details ? "rotate-180" : ""
              }`}
            />
            <span>Details</span>
          </button>
          {details && (
            <ul className="flex w-full flex-col items-start justify-start gap-2">
              {log.details.map((detail, i) => (
                <li key={i}>{detail}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      <span className="text-sm text-gray-400">{log.date.toLocaleString()}</span>
    </div>
  );
}
