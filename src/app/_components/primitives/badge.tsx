"use client";

import classNames from "classnames";

interface BadgeProps {
  text: string;
  color: string;
  dark?: boolean;
  pill?: boolean;
  flat?: boolean;
}

const Badge = ({
  text,
  color,
  dark = false,
  pill = false,
  flat = false,
}: BadgeProps) => {
  const colorClasses = classNames({
    [`bg-${color}-50 text-${color}-700 ring-1 ring-inset ring-${color}-600/10`]:
      !dark && !flat,
    [`bg-${color}-400/10 text-${color}-400 ring-1 ring-inset ring-${color}-400/20`]:
      dark,
    [`bg-${color}-100 text-${color}-700`]: flat,
  });

  return (
    <span
      className={classNames(
        "inline-flex items-center px-2 py-1 text-xs font-medium",
        pill ? "rounded-full" : "rounded-md",
        colorClasses
      )}
    >
      {text}
    </span>
  );
};

export default Badge;
