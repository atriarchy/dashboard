import React, {
  type ChangeEvent,
  forwardRef,
  type InputHTMLAttributes,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type IconDefinition } from "@fortawesome/fontawesome-svg-core";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  value: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  icon?: IconDefinition;
  readOnly?: boolean;
  required?: boolean;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      id,
      label,
      value,
      onChange,
      placeholder = "",
      maxLength,
      className = "",
      icon,
      readOnly = false,
      required = false,
      type = "text",
      ...rest
    },
    ref
  ) => {
    return (
      <div className="flex w-full flex-col items-center justify-start gap-2">
        {label && (
          <label htmlFor={id} className="text-md w-full font-semibold">
            {label}
          </label>
        )}
        <div className="relative w-full">
          {icon && (
            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-900">
              <FontAwesomeIcon icon={icon} fixedWidth />
            </span>
          )}
          <input
            ref={ref}
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            className={twMerge(
              clsx(
                "w-full grow rounded-lg border border-slate-300 bg-white p-2 text-slate-900",
                icon && "pl-8",
                maxLength && "pr-8",
                className
              )
            )}
            placeholder={placeholder}
            maxLength={maxLength}
            required={required}
            readOnly={readOnly}
            {...rest}
          />
          {maxLength && (
            <span
              className={
                value.length < maxLength
                  ? "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400"
                  : "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-red-500"
              }
            >
              {maxLength - value.length}
            </span>
          )}
        </div>
      </div>
    );
  }
);

TextInput.displayName = "TextInput";

export default TextInput;
