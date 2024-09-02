import { redirect } from "next/navigation";
import { Auth } from "@/app/_components/auth";
import { getServerAuthSession } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import Image from "next/image";

import logo from "@/assets/atriarchy-light.png";

export default async function Home() {
  const session = await getServerAuthSession();

  if (session) {
    return redirect("/dashboard");
  }

  return (
    <HydrateClient>
      <main className="flex h-dvh w-full bg-neutral-900 text-gray-200">
        <div className="flex w-1/2 flex-col justify-between bg-neutral-800 p-8">
          <div className="h-auto w-auto">
            <Image
              src={logo}
              alt="Atriarchy Studios Logo"
              width={128}
              height={69}
              objectFit="contain"
            />
          </div>
          <div className="text-md text-left text-white">
            Atriarchy Studios - Release Dashboard
          </div>
        </div>

        <div className="flex w-1/2 flex-col items-center justify-center">
          <div className="flex h-full flex-col items-center justify-center gap-4 p-4">
            <h1 className="mb-8 text-4xl font-bold text-white">Login</h1>
            <Auth session={session} showIcon />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
