"use client";

import {
  type Dispatch,
  type SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
  startTransition,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const NavigationBlockerContext = createContext<
  [isBlocked: boolean, setBlocked: Dispatch<SetStateAction<boolean>>]
>([
  false,
  () => {
    //
  },
]);

export function NavigationBlockerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const state = useState(false);
  return (
    <NavigationBlockerContext.Provider value={state}>
      {children}
    </NavigationBlockerContext.Provider>
  );
}

export function useIsBlocked() {
  const [isBlocked] = useContext(NavigationBlockerContext);
  return isBlocked;
}

export function Blocker() {
  const [isBlocked, setBlocked] = useContext(NavigationBlockerContext);
  useEffect(() => {
    setBlocked(() => {
      return true;
    });
    return () => {
      setBlocked(() => {
        return false;
      });
    };
  }, [isBlocked, setBlocked]);
  return null;
}

export function BlockLink({
  href,
  children,
  replace,
  ...rest
}: Parameters<typeof Link>[0]) {
  const router = useRouter();
  const isBlocked = useIsBlocked();

  return (
    <Link
      href={href}
      onClick={e => {
        e.preventDefault();

        if (
          isBlocked &&
          !window.confirm(
            "You have unsaved changes. Do you really want to leave?"
          )
        ) {
          return;
        }

        startTransition(() => {
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          const url = href.toString();
          if (replace) {
            router.replace(url);
          } else {
            router.push(url);
          }
        });
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
