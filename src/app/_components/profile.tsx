"use client";

import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { useState } from "react";
import toast from "react-hot-toast";

export type ProfileType = {
  id: string;
  name: string | null;
  userId: string;
  username: string;
  bio: string | null;
  firstName: string | null;
  lastName: string | null;
  country: string | null;
  ascapNumber: string | null;
  privacy: "PUBLIC" | "PRIVATE";
};

export function Profile({
  onboarding,
  profile,
}: {
  onboarding?: boolean;
  profile?: ProfileType;
}) {
  const router = useRouter();

  const [name, setName] = useState(profile?.name ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [firstName, setFirstName] = useState(profile?.firstName ?? "");
  const [lastName, setLastName] = useState(profile?.lastName ?? "");
  const [country, setCountry] = useState(profile?.country ?? "");
  const [ascapNumber, setAscapNumber] = useState(profile?.ascapNumber ?? "");
  const [privacy, setPrivacy] = useState(profile?.privacy ?? "PRIVATE");

  const updateProfile = api.profile.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated!");
      if (onboarding) {
        router.push("/dashboard");
      }
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  return (
    <div className="flex w-full flex-col items-center justify-start gap-2">
      <form
        onSubmit={e => {
          e.preventDefault();

          updateProfile.mutate({
            username,
            name,
            bio,
            firstName,
            lastName,
            country,
            ascapNumber,
            privacy,
          });
        }}
        className="flex h-full w-full grow flex-col items-center justify-start gap-2"
      >
        <div className="flex w-full flex-col items-center justify-start gap-2">
          <label htmlFor="username" className="text-md w-full font-semibold">
            Username
          </label>
          <div className="relative w-full">
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full rounded-lg bg-gray-700 py-2 pl-2 pr-8"
              placeholder="Name"
              maxLength={64}
              required
            />
            <span
              className={
                username.length < 64
                  ? "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400"
                  : "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-red-500"
              }
            >
              {64 - username.length}
            </span>
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-start gap-2">
          <label htmlFor="name" className="text-md w-full font-semibold">
            Name
          </label>
          <div className="relative w-full">
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-lg bg-gray-700 py-2 pl-2 pr-8"
              placeholder="Name"
              maxLength={256}
              required
            />
            <span
              className={
                name.length < 256
                  ? "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400"
                  : "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-red-500"
              }
            >
              {256 - name.length}
            </span>
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-start gap-2">
          <label htmlFor="bio" className="text-md w-full font-semibold">
            Bio
          </label>
          <div className="relative w-full">
            <textarea
              id="bio"
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="min-h-16 w-full rounded-lg bg-gray-700 py-2 pl-2 pr-8"
              placeholder="Bio"
              maxLength={1024}
            />
            <small
              className={
                bio.length < 1024
                  ? "pointer-events-none absolute bottom-2 right-2 -translate-y-1/2 text-xs text-gray-400"
                  : "pointer-events-none absolute bottom-2 right-2 -translate-y-1/2 text-xs font-medium text-red-500"
              }
            >
              {1024 - bio.length}
            </small>
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-start gap-2">
          <label htmlFor="firstName" className="text-md w-full font-semibold">
            First Name
          </label>
          <div className="relative w-full">
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full rounded-lg bg-gray-700 py-2 pl-2 pr-8"
              placeholder="First Name"
              maxLength={256}
            />
            <span
              className={
                firstName.length < 256
                  ? "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400"
                  : "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-red-500"
              }
            >
              {256 - firstName.length}
            </span>
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-start gap-2">
          <label htmlFor="lastName" className="text-md w-full font-semibold">
            Last Name
          </label>
          <div className="relative w-full">
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="w-full rounded-lg bg-gray-700 py-2 pl-2 pr-8"
              placeholder="Last Name"
              maxLength={256}
            />
            <span
              className={
                lastName.length < 256
                  ? "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400"
                  : "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-red-500"
              }
            >
              {256 - lastName.length}
            </span>
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-start gap-2">
          <label htmlFor="privacy" className="text-md w-full font-semibold">
            Legal Name Privacy
          </label>
          <select
            id="privacy"
            value={privacy}
            onChange={e => {
              setPrivacy(e.target.value as typeof privacy);
            }}
            className="w-full rounded-lg bg-gray-700 py-2 pl-2 pr-8"
          >
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
          </select>
        </div>
        <div className="flex w-full flex-col items-center justify-start gap-2">
          <label htmlFor="country" className="text-md w-full font-semibold">
            Country
          </label>
          <div className="relative w-full">
            <input
              id="country"
              type="text"
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="w-full rounded-lg bg-gray-700 py-2 pl-2 pr-8"
              placeholder="Country"
              maxLength={256}
            />
            <span
              className={
                country.length < 256
                  ? "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400"
                  : "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-red-500"
              }
            >
              {256 - country.length}
            </span>
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-start gap-2">
          <label htmlFor="ascapNumber" className="text-md w-full font-semibold">
            ASCAP Number
          </label>
          <div className="relative w-full">
            <input
              id="ascapNumber"
              type="text"
              value={ascapNumber}
              onChange={e => setAscapNumber(e.target.value)}
              className="w-full rounded-lg bg-gray-700 py-2 pl-2 pr-8"
              placeholder="ASCAP Number"
              maxLength={256}
            />
            <span
              className={
                ascapNumber.length < 256
                  ? "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400"
                  : "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-red-500"
              }
            >
              {256 - ascapNumber.length}
            </span>
          </div>
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-green-500 p-2 transition hover:bg-green-700 disabled:bg-gray-800"
          disabled={updateProfile.isPending}
        >
          {updateProfile.isPending ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
