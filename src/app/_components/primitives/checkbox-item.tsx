interface CheckboxItemProps {
  id: string;
  name: string;
  label: string;
  description: string;
  inline?: boolean;
  defaultChecked?: boolean;
  required?: boolean;
}

const CheckboxItem = ({
  id,
  name,
  label,
  description,
  inline = false,
  defaultChecked = false,
  required = false,
}: CheckboxItemProps) => {
  return (
    <div className="relative flex items-start">
      <div className="flex h-6 items-center">
        <input
          id={id}
          name={name}
          type="checkbox"
          aria-describedby={`${id}-description`}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
          defaultChecked={defaultChecked}
          required={required}
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
            <p>{description}</p>
          )}
        </span>
      </div>
    </div>
  );
};

export default CheckboxItem;
