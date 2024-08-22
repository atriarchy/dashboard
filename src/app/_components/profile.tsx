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
import { faLink } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import TextInput from "./primitives/text-input";

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
  as,
}: {
  onboarding?: boolean;
  profile?: ProfileType;
  email?: string | null;
  as?: string;
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
  const [currentUsername, setCurrentUsername] = useState(profile?.username);

  const updateProfile = api.profile.updateProfile.useMutation({
    onSuccess: data => {
      toast.success("Profile updated!");
      if (onboarding) {
        router.push("/dashboard");
      }
      setCurrentUsername(data.username);
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  return (
    <div className="flex w-full flex-col items-start justify-start gap-2">
      {currentUsername && (
        <Link
          href={`/@${currentUsername}`}
          className="mb-6 flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faLink} fixedWidth />
          <span>@{currentUsername}</span>
        </Link>
      )}
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
            as: as ?? undefined,
          });
        }}
        className="flex h-full w-full grow flex-col items-center justify-start gap-2"
      >
        <h2 className="w-full text-xl font-semibold">Profile</h2>
        <div className="flex w-full flex-col items-center justify-start gap-2 md:flex-row">
          <TextInput
            id="username"
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Name"
            maxLength={64}
            required
          />
          <TextInput
            id="name"
            label="Artist Name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Artist Name"
            maxLength={64}
            required
          />
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
              className="min-h-16 w-full rounded-lg border border-slate-300 bg-white py-2 pl-2 pr-8 text-slate-900"
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
        <div className="flex w-full flex-col items-center justify-start gap-2 md:flex-row">
          <div className="flex w-full flex-col items-center justify-start gap-2">
            <TextInput
              id="youtube"
              label="YouTube"
              value={youtube}
              onChange={e => setYoutube(e.target.value)}
              placeholder="https://youtube.com/@username"
              icon={faYoutube}
            />
            <TextInput
              id="twitter"
              label="Twitter"
              value={twitter}
              onChange={e => setTwitter(e.target.value)}
              placeholder="https://x.com/username"
              icon={faTwitter}
            />
            <TextInput
              id="twitch"
              label="Twitch"
              value={twitch}
              onChange={e => setTwitch(e.target.value)}
              placeholder="https://twitch.tv/username"
              icon={faTwitch}
            />
          </div>
          <div className="flex w-full flex-col items-center justify-start gap-2">
            <TextInput
              id="spotify"
              label="Spotify"
              value={spotify}
              onChange={e => setSpotify(e.target.value)}
              placeholder="https://open.spotify.com/artist/5B7d27dL276bbzzQ360IYN"
              icon={faSpotify}
            />
            <TextInput
              id="appleMusic"
              label="Apple Music"
              value={appleMusic}
              onChange={e => setAppleMusic(e.target.value)}
              placeholder="https://music.apple.com/us/artist/the-atriarchy/1746651813"
              icon={faApple}
            />
            <TextInput
              id="youtubeMusic"
              label="YouTube Music"
              value={youtubeMusic}
              onChange={e => setYoutubeMusic(e.target.value)}
              placeholder="https://music.youtube.com/channel/UCloFxuJiFwCSCxmpnQl7ArA"
              icon={faYoutube}
            />
          </div>
        </div>
        <h2 className="mt-6 w-full text-xl font-semibold">Legal Information</h2>
        <div className="flex w-full flex-col items-center justify-start gap-2 md:flex-row">
          <TextInput
            id="legalName"
            label="Legal Name"
            value={legalName}
            onChange={e => setLegalName(e.target.value)}
            placeholder="Legal Name"
            maxLength={256}
          />
          <TextInput
            id="country"
            label="Country"
            value={country}
            onChange={e => setCountry(e.target.value)}
            placeholder="Country"
            maxLength={256}
          />
        </div>
        <div className="flex w-full flex-col items-center justify-start gap-2 md:flex-row">
          <TextInput
            id="email"
            label="Email"
            value={profile?.email ?? email ?? ""}
            placeholder="Email"
            readOnly
          />
          <TextInput
            id="phone"
            label="Phone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Phone"
            maxLength={256}
          />
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
            <div className="flex w-full flex-col items-center justify-start gap-2 md:flex-row">
              <TextInput
                id="proMember"
                label="What PRO are you a member of?"
                value={proMember}
                onChange={e => setProMember(e.target.value)}
                placeholder="Member"
                maxLength={256}
                required
              />
              <TextInput
                id="proCountry"
                label="In which country does the PRO represent you?"
                value={proCountry}
                onChange={e => setProCountry(e.target.value)}
                placeholder="Country"
                maxLength={256}
              />
            </div>
            <div className="flex w-full flex-col items-center justify-start gap-2 md:flex-row">
              <TextInput
                id="proName"
                label="Name Registered with PRO"
                value={proName}
                onChange={e => setProName(e.target.value)}
                placeholder="Name"
                maxLength={256}
                required
              />
              <TextInput
                id="proNumber"
                label="What is your member number?"
                value={proNumber}
                onChange={e => setProNumber(e.target.value)}
                placeholder="Membership Number"
                maxLength={256}
              />
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
