"use client";

import {
  Combobox as HeadlessCombobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Label,
} from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import Twemoji from "react-twemoji";

export interface Item {
  id: string;
  name: string;
  emoji?: string;
  imageUrl?: string;
  secondaryText?: string;
}

interface ComboboxProps {
  id: string;
  label?: string;
  value: string;
  onChange?: (value: string) => void;
  items: Item[];
  className?: string;
}

const Combobox = ({
  id,
  label,
  value,
  onChange,
  items,
  className = "w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900",
}: ComboboxProps) => {
  const [query, setQuery] = useState("");

  const filteredItems =
    query === ""
      ? items
      : items.filter(
          item =>
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.id.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <HeadlessCombobox
      as="div"
      value={value}
      onChange={val => {
        setQuery("");
        onChange?.(val ?? "");
      }}
      className="w-full"
    >
      <Label htmlFor={id} className="text-md w-full font-semibold">
        {label}
      </Label>
      <div className="relative mt-2">
        <ComboboxInput
          id={id}
          className={className}
          onChange={event => setQuery(event.target.value)}
          onBlur={() => setQuery("")}
          displayValue={val => items.find(item => item.id === val)?.name ?? ""}
        />
        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <FontAwesomeIcon
            icon={faChevronDown}
            className="h-5 w-5 text-slate-400"
            aria-hidden="true"
          />
        </ComboboxButton>
        {filteredItems.length > 0 && (
          <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-300 bg-white shadow-lg focus:outline-none sm:text-sm">
            {filteredItems.map(item => (
              <ComboboxOption
                key={item.id}
                value={item.id}
                className="group relative cursor-default select-none px-4 py-2 text-slate-900 data-[focus]:bg-violet-600 data-[focus]:text-white"
              >
                <div className="flex items-center">
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-6 w-6 flex-shrink-0 rounded-full"
                    />
                  )}
                  <span className="flex items-center gap-2 truncate group-data-[selected]:font-semibold">
                    {item.emoji && (
                      <Twemoji
                        options={{ className: "h-6 inline-block" }}
                        tag="span"
                      >
                        {item.emoji}
                      </Twemoji>
                    )}
                    <span>{item.name}</span>
                  </span>
                  {item.secondaryText && (
                    <span className="ml-2 truncate text-slate-500 group-data-[focus]:text-indigo-200">
                      {item.secondaryText}
                    </span>
                  )}
                </div>

                <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-violet-600 group-data-[selected]:flex group-data-[focus]:text-white">
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </span>
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        )}
      </div>
    </HeadlessCombobox>
  );
};

export default Combobox;
