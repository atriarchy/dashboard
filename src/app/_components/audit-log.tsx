"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faCircleInfo,
  faPlus,
  faPen,
  faTrash,
  faUserPlus,
  faUserEdit,
  faUserMinus,
  faUserCheck,
  faUserXmark,
  faMusic,
} from "@fortawesome/free-solid-svg-icons";

import { useState } from "react";

import { type IconDefinition } from "@fortawesome/fontawesome-svg-core";

function getIconForAction(action: string): IconDefinition {
  switch (action) {
    case "CREATE_TRACK":
      return faPlus;
    case "UPDATE_TRACK":
      return faPen;
    case "UPLOAD_SONG":
      return faMusic;

    case "CREATE_COLLABORATOR":
      return faUserPlus;
    case "UPDATE_COLLABORATOR":
      return faUserEdit;
    case "DELETE_COLLABORATOR":
      return faUserMinus;

    case "CREATE_CREDIT":
      return faPlus;
    case "UPDATE_CREDIT":
      return faPen;
    case "DELETE_CREDIT":
      return faTrash;

    case "ACCEPT_COLLABORATOR_INVITE":
      return faUserCheck;
    case "DECLINE_COLLABORATOR_INVITE":
      return faUserXmark;

    default:
      return faCircleInfo;
  }
}

export function AuditLog({
  log,
  isLast = false,
}: {
  log: {
    id: string;
    action: string;
    title: string;
    date: Date;
    details?: string[];
  };
  isLast?: boolean;
}) {
  const [details, setDetails] = useState(false);

  return (
    <li className="relative pb-8">
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-neutral-700"
        />
      )}
      <div className="relative flex space-x-3">
        <div>
          <span className="flex size-8 items-center justify-center rounded-full bg-violet-700 ring-8 ring-neutral-900">
            <FontAwesomeIcon
              icon={getIconForAction(log.action)}
              className="h-4 w-4 text-white"
            />
          </span>
        </div>
        <div className="flex-1 space-y-1 pt-0.5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-300">{log.title}</p>
            <time
              dateTime={log.date.toISOString()}
              className="whitespace-nowrap text-sm text-gray-500"
            >
              {log.date.toLocaleString()}
            </time>
          </div>

          {log.details && log.details.length > 0 && (
            <div className="mt-1">
              <button
                type="button"
                onClick={() => setDetails(!details)}
                className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-gray-300"
              >
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`h-3 w-3 transform transition duration-200 ${
                    details ? "rotate-180" : ""
                  }`}
                />
                <span>Details</span>
              </button>

              {details && (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-400">
                  {log.details.map((detail, i) => (
                    <li key={i}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
