import React, {
  forwardRef,
  type TextareaHTMLAttributes,
  type ChangeEvent,
} from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label?: string;
  value: string;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  readOnly?: boolean;
  required?: boolean;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      id,
      label,
      value,
      onChange,
      placeholder = "",
      maxLength,
      className = "",
      readOnly = false,
      required = false,
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
          <textarea
            ref={ref}
            id={id}
            value={value}
            onChange={onChange}
            className={twMerge(
              clsx(
                "min-h-32 w-full grow rounded-lg border border-slate-300 bg-white p-2 text-slate-900",
                maxLength && "pr-12",
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
                  ? "pointer-events-none absolute bottom-2 right-2 text-xs text-gray-400"
                  : "pointer-events-none absolute bottom-2 right-2 text-xs font-medium text-red-500"
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

TextArea.displayName = "TextArea";

export default TextArea;
