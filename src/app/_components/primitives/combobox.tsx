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

interface Item {
  id: string | number;
  name: string;
  imageUrl?: string;
  secondaryText?: string;
}

interface ComboboxProps {
  items: Item[];
  label: string;
}

const Combobox = ({ items, label }: ComboboxProps) => {
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const filteredItems =
    query === ""
      ? items
      : items.filter(item =>
          item.name.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <HeadlessCombobox
      as="div"
      value={selectedItem}
      onChange={(item: Item) => {
        setQuery("");
        setSelectedItem(item);
      }}
    >
      <Label className="text-md block font-semibold text-slate-900">
        {label}
      </Label>
      <div className="relative mt-2">
        <ComboboxInput
          className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-3 pr-10 text-slate-900 shadow-sm focus:border-slate-500 focus:ring-2 focus:ring-slate-500 sm:text-sm sm:leading-6"
          onChange={event => setQuery(event.target.value)}
          onBlur={() => setQuery("")}
          displayValue={(item: Item | null) => item?.name ?? ""}
        />
        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <FontAwesomeIcon
            icon={faChevronDown}
            className="h-5 w-5 text-slate-400"
            aria-hidden="true"
          />
        </ComboboxButton>

        {filteredItems.length > 0 && (
          <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-300 bg-white py-1 text-base shadow-lg focus:outline-none sm:text-sm">
            {filteredItems.map(item => (
              <ComboboxOption
                key={item.id}
                value={item}
                className="group relative cursor-default select-none py-2 pl-3 pr-9 text-slate-900 data-[focus]:bg-indigo-500 data-[focus]:text-white"
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
                  <span
                    className={`ml-3 truncate group-data-[selected]:font-semibold ${
                      item.imageUrl ? "" : "ml-0"
                    }`}
                  >
                    {item.name}
                  </span>
                  {item.secondaryText && (
                    <span className="ml-2 truncate text-slate-500 group-data-[focus]:text-indigo-200">
                      {item.secondaryText}
                    </span>
                  )}
                </div>

                <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-indigo-600 group-data-[selected]:flex group-data-[focus]:text-white">
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
