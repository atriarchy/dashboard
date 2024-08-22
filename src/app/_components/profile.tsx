"use client";

import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faApple,
  faSpotify,
  faTwitch,
  faTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

export type ProfileType = {
  id: string;
  name: string | null;
  userId: string;
  username: string;
  bio: string | null;
  legalName: string | null;
  country: string | null;
  email: string;
  phone: string | null;
  links?: {
    type:
      | "SPOTIFY"
      | "APPLE_MUSIC"
      | "YOUTUBE_MUSIC"
      | "YOUTUBE"
      | "TWITTER"
      | "TWITCH";
    url: string;
  }[];
  pro?: {
    member: string;
    country: string;
    name: string;
    number: string;
  };
  privacy: "PRIVATE";
};

export function Profile({
  onboarding,
  profile,
  email,
}: {
  onboarding?: boolean;
  profile?: ProfileType;
  email?: string | null;
}) {
  const router = useRouter();

  const [name, setName] = useState(profile?.name ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [legalName, setLegalName] = useState(profile?.legalName ?? "");
  const [country, setCountry] = useState(profile?.country ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [spotify, setSpotify] = useState(
    profile?.links?.find(link => link.type === "SPOTIFY")?.url ?? ""
  );
  const [appleMusic, setAppleMusic] = useState(
    profile?.links?.find(link => link.type === "APPLE_MUSIC")?.url ?? ""
  );
  const [youtubeMusic, setYoutubeMusic] = useState(
    profile?.links?.find(link => link.type === "YOUTUBE_MUSIC")?.url ?? ""
  );
  const [youtube, setYoutube] = useState(
    profile?.links?.find(link => link.type === "YOUTUBE")?.url ?? ""
  );
  const [twitter, setTwitter] = useState(
    profile?.links?.find(link => link.type === "TWITTER")?.url ?? ""
  );
  const [twitch, setTwitch] = useState(
    profile?.links?.find(link => link.type === "TWITCH")?.url ?? ""
  );
  const [pro, setPro] = useState(!!profile?.pro);
  const [proMember, setProMember] = useState(profile?.pro?.member ?? "");
  const [proCountry, setProCountry] = useState(profile?.pro?.country ?? "");
  const [proName, setProName] = useState(profile?.pro?.name ?? "");
  const [proNumber, setProNumber] = useState(profile?.pro?.number ?? "");

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

          const links: ProfileType["links"] = [];

          if (youtube) {
            try {
              new URL(youtube);
            } catch {
              toast.error("Invalid YouTube URL");
              return;
            }

            links.push({
              type: "YOUTUBE",
              url: youtube,
            });
          }

          if (twitter) {
            try {
              new URL(twitter);
            } catch {
              toast.error("Invalid Twitter URL");
              return;
            }

            links.push({
              type: "TWITTER",
              url: twitter,
            });
          }

          if (twitch) {
            try {
              new URL(twitch);
            } catch {
              toast.error("Invalid Twitch URL");
              return;
            }

            links.push({
              type: "TWITCH",
              url: twitch,
            });
          }

          if (spotify) {
            try {
              new URL(spotify);
            } catch {
              toast.error("Invalid Spotify URL");
              return;
            }

            links.push({
              type: "SPOTIFY",
              url: spotify,
            });
          }

          if (appleMusic) {
            try {
              new URL(appleMusic);
            } catch {
              toast.error("Invalid Apple Music URL");
              return;
            }

            links.push({
              type: "APPLE_MUSIC",
              url: appleMusic,
            });
          }

          if (youtubeMusic) {
            try {
              new URL(youtubeMusic);
            } catch {
              toast.error("Invalid YouTube Music URL");
              return;
            }

            links.push({
              type: "YOUTUBE_MUSIC",
              url: youtubeMusic,
            });
          }

          updateProfile.mutate({
            username,
            name,
            bio: bio || undefined,
            legalName: legalName || undefined,
            country: country || undefined,
            phone: phone || undefined,
            links,
            pro: pro
              ? {
                  member: proMember,
                  country: proCountry,
                  name: proName,
                  number: proNumber,
                }
              : undefined,
          });
        }}
        className="flex h-full w-full grow flex-col items-center justify-start gap-2"
      >
        <h2 className="w-full text-xl font-semibold">Profile</h2>
        <div className="flex w-full items-center justify-start gap-2">
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
              Artist Name
            </label>
            <div className="relative w-full">
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-lg bg-gray-700 py-2 pl-2 pr-8"
                placeholder="Artist Name"
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
        <div className="flex w-full items-center justify-start gap-2">
          <div className="flex w-full flex-col items-center justify-start gap-2">
            <label htmlFor="youtube" className="text-md w-full font-semibold">
              YouTube
            </label>
            <div className="relative w-full">
              <input
                id="youtube"
                type="text"
                value={youtube}
                onChange={e => setYoutube(e.target.value)}
                className="w-full rounded-lg bg-gray-700 py-2 pl-8 pr-2"
                placeholder="YouTube"
              />
              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2">
                <FontAwesomeIcon icon={faYoutube} fixedWidth />
              </span>
            </div>
          </div>
          <div className="flex w-full flex-col items-center justify-start gap-2">
            <label htmlFor="twitter" className="text-md w-full font-semibold">
              Twitter
            </label>
            <div className="relative w-full">
              <input
                id="twitter"
                type="text"
                value={twitter}
                onChange={e => setTwitter(e.target.value)}
                className="w-full rounded-lg bg-gray-700 py-2 pl-8 pr-2"
                placeholder="Twitter"
              />
              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2">
                <FontAwesomeIcon icon={faTwitter} fixedWidth />
              </span>
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-start gap-2">
          <div className="flex w-full flex-col items-center justify-start gap-2">
            <label htmlFor="twitch" className="text-md w-full font-semibold">
              Twitch
            </label>
            <div className="relative w-full">
              <input
                id="twitch"
                type="text"
                value={twitch}
                onChange={e => setTwitch(e.target.value)}
                className="w-full rounded-lg bg-gray-700 py-2 pl-8 pr-2"
                placeholder="Twitch"
              />
              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2">
                <FontAwesomeIcon icon={faTwitch} fixedWidth />
              </span>
            </div>
          </div>
          <div className="flex w-full flex-col items-center justify-start gap-2">
            <label htmlFor="spotify" className="text-md w-full font-semibold">
              Spotify
            </label>
            <div className="relative w-full">
              <input
                id="spotify"
                type="text"
                value={spotify}
                onChange={e => setSpotify(e.target.value)}
                className="w-full rounded-lg bg-gray-700 py-2 pl-8 pr-2"
                placeholder="Spotify"
              />
              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2">
                <FontAwesomeIcon icon={faSpotify} fixedWidth />
              </span>
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-start gap-2">
          <div className="flex w-full flex-col items-center justify-start gap-2">
            <label
              htmlFor="appleMusic"
              className="text-md w-full font-semibold"
            >
              Apple Music
            </label>
            <div className="relative w-full">
              <input
                id="appleMusic"
                type="text"
                value={appleMusic}
                onChange={e => setAppleMusic(e.target.value)}
                className="w-full rounded-lg bg-gray-700 py-2 pl-8 pr-2"
                placeholder="Apple Music"
              />
              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2">
                <FontAwesomeIcon icon={faApple} fixedWidth />
              </span>
            </div>
          </div>
          <div className="flex w-full flex-col items-center justify-start gap-2">
            <label
              htmlFor="youtubeMusic"
              className="text-md w-full font-semibold"
            >
              YouTube Music
            </label>
            <div className="relative w-full">
              <input
                id="youtubeMusic"
                type="text"
                value={youtubeMusic}
                onChange={e => setYoutubeMusic(e.target.value)}
                className="w-full rounded-lg bg-gray-700 py-2 pl-8 pr-2"
                placeholder="YouTube Music"
              />
              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2">
                <FontAwesomeIcon icon={faYoutube} fixedWidth />
              </span>
            </div>
          </div>
        </div>
        <h2 className="mt-6 w-full text-xl font-semibold">Legal Information</h2>
        <div className="flex w-full items-center justify-start gap-2">
          <div className="flex w-full flex-col items-center justify-start gap-2">
            <label htmlFor="legalName" className="text-md w-full font-semibold">
              Legal Name
            </label>
            <div className="relative w-full">
              <input
                id="legalName"
                type="text"
                value={legalName}
                onChange={e => setLegalName(e.target.value)}
                className="w-full rounded-lg bg-gray-700 py-2 pl-2 pr-8"
                placeholder="Legal Name"
                maxLength={256}
              />
              <span
                className={
                  legalName.length < 256
                    ? "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400"
                    : "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-red-500"
                }
              >
                {256 - legalName.length}
              </span>
            </div>
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
        </div>
        <div className="flex w-full items-center justify-start gap-2">
          <div className="flex w-full flex-col items-center justify-start gap-2">
            <label htmlFor="email" className="text-md w-full font-semibold">
              Email
            </label>
            <input
              id="email"
              type="text"
              value={profile?.email ?? email ?? undefined}
              className="w-full rounded-lg bg-gray-700 p-2"
              placeholder="Email"
              readOnly
            />
          </div>
          <div className="flex w-full flex-col items-center justify-start gap-2">
            <label htmlFor="phone" className="text-md w-full font-semibold">
              Phone
            </label>
            <div className="relative w-full">
              <input
                id="phone"
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded-lg bg-gray-700 py-2 pl-2 pr-8"
                placeholder="Phone"
                maxLength={256}
              />
              <span
                className={
                  phone.length < 256
                    ? "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400"
                    : "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-red-500"
                }
              >
                {256 - phone.length}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-6 flex w-full items-center justify-start gap-2">
          <input
            id="pro"
            type="checkbox"
            checked={pro}
            onChange={e => setPro(e.target.checked)}
          />
          <label htmlFor="pro" className="text-md w-full font-semibold">
            I am a member of a Performing Rights Organization (PRO)
          </label>
        </div>
        {pro && (
          <>
            <div className="flex w-full items-center justify-start gap-2">
              <div className="flex w-full flex-col items-center justify-start gap-2">
                <label
                  htmlFor="proMember"
                  className="text-md w-full font-semibold"
                >
                  What PRO are you a member of?
                </label>
                <div className="relative w-full">
                  <input
                    id="proMember"
                    type="text"
                    value={proMember}
                    onChange={e => setProMember(e.target.value)}
                    className="w-full rounded-lg bg-gray-700 py-2 pl-2 pr-8"
                    placeholder="Member"
                    maxLength={256}
                    required
                  />
                  <span
                    className={
                      proMember.length < 256
                        ? "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400"
                        : "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-red-500"
                    }
                  >
                    {256 - proMember.length}
                  </span>
                </div>
              </div>
              <div className="flex w-full flex-col items-center justify-start gap-2">
                <label
                  htmlFor="proCountry"
                  className="text-md w-full font-semibold"
                >
                  In which country does the PRO represent you?
                </label>
                <div className="relative w-full">
                  <input
                    id="proCountry"
                    type="text"
                    value={proCountry}
                    onChange={e => setProCountry(e.target.value)}
                    className="w-full rounded-lg bg-gray-700 py-2 pl-2 pr-8"
                    placeholder="Country"
                    maxLength={256}
                  />
                  <span
                    className={
                      proCountry.length < 256
                        ? "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400"
                        : "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-red-500"
                    }
                  >
                    {256 - proCountry.length}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex w-full items-center justify-start gap-2">
              <div className="flex w-full flex-col items-center justify-start gap-2">
                <label
                  htmlFor="proName"
                  className="text-md w-full font-semibold"
                >
                  Name Registered with PRO
                </label>
                <div className="relative w-full">
                  <input
                    id="proName"
                    type="text"
                    value={proName}
                    onChange={e => setProName(e.target.value)}
                    className="w-full rounded-lg bg-gray-700 py-2 pl-2 pr-8"
                    placeholder="Name"
                    maxLength={256}
                    required
                  />
                  <span
                    className={
                      proName.length < 256
                        ? "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400"
                        : "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-red-500"
                    }
                  >
                    {256 - proName.length}
                  </span>
                </div>
              </div>
              <div className="flex w-full flex-col items-center justify-start gap-2">
                <label
                  htmlFor="proNumber"
                  className="text-md w-full font-semibold"
                >
                  What is your member number?
                </label>
                <div className="relative w-full">
                  <input
                    id="proNumber"
                    type="text"
                    value={proNumber}
                    onChange={e => setProNumber(e.target.value)}
                    className="w-full rounded-lg bg-gray-700 py-2 pl-2 pr-8"
                    placeholder="Membership Number"
                    maxLength={256}
                  />
                  <span
                    className={
                      proNumber.length < 256
                        ? "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400"
                        : "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-red-500"
                    }
                  >
                    {256 - proNumber.length}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
        <button
          type="submit"
          className="mt-6 w-full rounded-lg bg-green-500 p-2 transition hover:bg-green-700 disabled:bg-gray-800"
          disabled={updateProfile.isPending}
        >
          {updateProfile.isPending ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
