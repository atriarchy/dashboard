"use client";

import clsx from "clsx";
import { type IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface BadgeProps {
  text: string;
  color: string;
  icon?: IconDefinition;
  dark?: boolean;
  pill?: boolean;
  flat?: boolean;
}

const Badge = ({
  text,
  color,
  icon,
  dark = false,
  pill = false,
  flat = false,
}: BadgeProps) => {
  const baseClasses = clsx(
    "inline-flex items-center px-2 py-1 text-xs font-medium",
    pill ? "rounded-full" : "rounded-md"
  );

  const colorClasses = clsx({
    [`bg-${color}-50 text-${color}-700 ring-1 ring-inset ring-${color}-600/10`]:
      !dark && !flat,
    [`bg-${color}-400/10 text-${color}-400 ring-1 ring-inset ring-${color}-400/20`]:
      dark,
    [`bg-${color}-100 text-${color}-700`]: flat,
  });

  return (
    <span className={clsx(baseClasses, colorClasses)}>
      {icon && <FontAwesomeIcon icon={icon} className="mr-1 text-xs" />}
      {text}
    </span>
  );
};

export default Badge;
