import React, { forwardRef, type ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectInputProps {
  id: string;
  label?: string;
  value: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  className?: string;
  icon?: IconDefinition;
  readOnly?: boolean;
  required?: boolean;
  options: SelectOption[];
}

const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  (
    {
      id,
      label,
      value,
      onChange,
      placeholder = "",
      className = "w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 grow",
      icon,
      readOnly = false,
      required = false,
      options,
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
          <select
            ref={ref}
            id={id}
            value={value}
            onChange={onChange}
            className={`${className} ${icon ? "pl-8" : ""}`}
            required={required}
            disabled={readOnly}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map(opt => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }
);

SelectInput.displayName = "SelectInput";

export default SelectInput;
