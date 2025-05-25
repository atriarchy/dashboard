import { type ChangeEvent, forwardRef } from "react";

interface CheckboxItemProps {
  id: string;
  label: string;
  description: string;
  inline?: boolean;
  checked?: boolean;
  required?: boolean;
  disabled?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

const CheckboxItem = forwardRef<HTMLInputElement, CheckboxItemProps>(
  (
    {
      id,
      label,
      description,
      inline = false,
      checked,
      required = false,
      disabled = false,
      onChange,
      ...rest
    },
    ref
  ) => {
    return (
      <div className="relative flex items-start">
        <div className="flex h-6 items-center">
          <input
            id={id}
            ref={ref}
            type="checkbox"
            aria-describedby={`${id}-description`}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            checked={checked}
            required={required}
            disabled={disabled}
            onChange={onChange}
            {...rest}
          />
        </div>
        <div
          className={`ml-3 text-sm leading-6 ${inline ? "flex items-center" : ""}`}
        >
          <label htmlFor={id} className="font-medium text-white">
            {label}
          </label>
          <span
            id={`${id}-description`}
            className={`text-gray-400 ${inline ? "ml-2" : ""}`}
          >
            {inline ? (
              <>
                <span className="sr-only">{label} </span>
                {description}
              </>
            ) : (
              <p className="whitespace-pre-line">{description}</p>
            )}
          </span>
        </div>
      </div>
    );
  }
);

CheckboxItem.displayName = "CheckboxItem";

export default CheckboxItem;
