import Select, {
  components,
  type DropdownIndicatorProps,
  type ClearIndicatorProps,
  type GroupBase,
} from "react-select";
import { faChevronDown, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";

export type Option = {
  label: string;
  value: string;
};

interface SelectInputProps {
  label?: string;
  id?: string;
  value: Option | null;
  onChange: (opt: Option | null) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

const DropdownIndicator = (
  props: DropdownIndicatorProps<Option, false, GroupBase<Option>>
) => (
  <components.DropdownIndicator {...props}>
    <FontAwesomeIcon icon={faChevronDown} className="text-slate-900" />
  </components.DropdownIndicator>
);

const ClearIndicator = (
  props: ClearIndicatorProps<Option, false, GroupBase<Option>>
) => (
  <components.ClearIndicator {...props}>
    <FontAwesomeIcon
      icon={faXmark}
      className="text-slate-400 hover:text-red-600"
    />
  </components.ClearIndicator>
);

const SelectInput = ({
  label,
  id,
  value,
  onChange,
  options,
  placeholder,
  className = "w-full",
}: SelectInputProps) => (
  <div
    className={clsx(
      "flex w-full flex-col items-center justify-start gap-2",
      className
    )}
  >
    {label && <label className="text-md w-full font-semibold">{label}</label>}
    <Select<Option, false>
      unstyled
      id={id}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      isClearable
      classNames={{
        container: () => "w-full",
        control: ({ isFocused }) =>
          clsx(
            "w-full flex items-center rounded-lg border bg-white p-2 text-slate-900",
            isFocused
              ? "border-[#2563eb] ring-1 ring-[#2563eb]"
              : "border-slate-300 hover:border-slate-400"
          ),
        input: () => "text-slate-900 ml-1",
        placeholder: () => "text-slate-400 ml-1",
        valueContainer: () => "flex flex-wrap gap-1 ml-1",
        singleValue: () => "leading-7 text-slate-900",
        indicatorsContainer: () => "flex items-center gap-1 pr-2",
        clearIndicator: () =>
          "p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50",
        dropdownIndicator: () =>
          "p-1 text-slate-500 hover:text-black rounded-md hover:bg-slate-100",
        indicatorSeparator: () => "bg-slate-300 w-px mx-1",
        menu: () =>
          "w-full absolute z-50 mt-1 rounded-lg border border-slate-200 bg-white p-1 shadow-lg",
        option: ({ isFocused, isSelected }) =>
          clsx(
            "cursor-pointer rounded px-3 py-2 text-slate-900",
            isFocused && "bg-slate-100",
            isSelected && "bg-slate-200 font-semibold"
          ),
        noOptionsMessage: () =>
          "text-slate-500 p-2 bg-slate-50 border border-dashed border-slate-200 rounded-sm",
      }}
      styles={{
        input: base => ({
          ...base,
          input: {
            boxShadow: "none !important",
          },
        }),
        control: base => ({
          ...base,
          transition: "none",
        }),
      }}
      components={{
        DropdownIndicator,
        ClearIndicator,
      }}
    />
  </div>
);

export default SelectInput;
