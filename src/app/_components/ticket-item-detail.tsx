"use client";

import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export function TicketItemDetails({ details }: { details: string[] }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <button
        type="button"
        className="mt-1 flex w-fit items-center justify-center gap-2 text-xs text-gray-400"
        onClick={() => setShowDetails(!showDetails)}
      >
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`transition duration-300 ${showDetails ? "rotate-180" : ""}`}
        />
        <span>Details</span>
      </button>
      {showDetails && (
        <ul className="mt-2 flex w-full flex-col items-start justify-start gap-1 text-xs">
          {details.map((detail, i) => (
            <li key={i}>{detail}</li>
          ))}
        </ul>
      )}
    </>
  );
}
