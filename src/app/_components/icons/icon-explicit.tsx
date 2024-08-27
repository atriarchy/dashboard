import { BaseIcon, type IconProps } from "@/app/_components/icons/base-icon";

export default function IconExplicit(props: IconProps) {
  return (
    <BaseIcon viewBox="0 0 48 48" {...props}>
      <path
        fill="currentColor"
        d="m38 6h-28c-2.2 0-4 1.8-4 4v28c0 2.2 1.8 4 4 4h28c2.2 0 4-1.8 4-4v-28c0-2.2-1.8-4-4-4zm-8 12h-8v4h8v4h-8v4h8v4h-12v-20h12z"
      />
    </BaseIcon>
  );
}
