// components/settings/account-settings-form.tsx
// components/settings/account-settings-form.tsx
"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AccountSettingsFormProps = {
  userId: string;
  userEmail: string;
  initialFirstName: string;
  initialLastName: string;
};

export default function AccountSettingsForm({
  userId,
  userEmail,
  initialFirstName,
  initialLastName,
}: AccountSettingsFormProps) {
  const router = useRouter();

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [email, setEmail] = useState(userEmail);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  const [profileError, setProfileError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  async function handleProfileUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSavingProfile) return;

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName) {
      setProfileError("First name is required.");
      setProfileStatus(null);
      return;
    }

    setIsSavingProfile(true);
    setProfileError(null);
    setProfileStatus(null);

    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: trimmedFirstName,
        last_name: trimmedLastName || null,
      })
      .eq("id", userId);

    if (error) {
      setProfileError(error.message);
      setIsSavingProfile(false);
      return;
    }

    setProfileStatus("Profile updated.");
    setIsSavingProfile(false);
    router.refresh();
  }

  async function handleEmailUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSavingEmail) return;

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setEmailError("Email is required.");
      setEmailStatus(null);
      return;
    }

    if (trimmedEmail === userEmail.toLowerCase()) {
      setEmailError(null);
      setEmailStatus("This is already your current email.");
      return;
    }

    setIsSavingEmail(true);
    setEmailError(null);
    setEmailStatus(null);

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      email: trimmedEmail,
    });

    if (error) {
      setEmailError(error.message);
      setIsSavingEmail(false);
      return;
    }

    setEmailStatus("Check your email to confirm the new address.");
    setIsSavingEmail(false);
  }

  async function handlePasswordUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSavingPassword) return;

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      setPasswordStatus(null);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      setPasswordStatus(null);
      return;
    }

    setIsSavingPassword(true);
    setPasswordError(null);
    setPasswordStatus(null);

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordError(error.message);
      setIsSavingPassword(false);
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setPasswordStatus("Password updated.");
    setIsSavingPassword(false);
  }

  return (
    <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6">
        <p className="text-sm font-medium text-black/55">Account controls</p>

        <h3 className="mt-1 text-2xl font-semibold tracking-tight text-black">
          Profile, email, and password
        </h3>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/65">
          Update your visible account name, request an email change, or reset
          your password.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <form
          onSubmit={handleProfileUpdate}
          className="rounded-2xl border border-black/10 bg-[#fafaf7] p-5"
        >
          <p className="text-base font-semibold text-black">Profile name</p>

          <p className="mt-1 text-sm leading-6 text-black/60">
            This controls the name shown in your workspace.
          </p>

          <div className="mt-5 grid gap-4">
            <div className="grid gap-2">
              <label
                htmlFor="first-name"
                className="text-sm font-medium text-black"
              >
                First name
              </label>

              <input
                id="first-name"
                value={firstName}
                onChange={(event) => {
                  setFirstName(event.target.value);
                  setProfileError(null);
                  setProfileStatus(null);
                }}
                className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="last-name"
                className="text-sm font-medium text-black"
              >
                Last name
              </label>

              <input
                id="last-name"
                value={lastName}
                onChange={(event) => {
                  setLastName(event.target.value);
                  setProfileError(null);
                  setProfileStatus(null);
                }}
                className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>

          <FormMessage error={profileError} status={profileStatus} />

          <button
            type="submit"
            disabled={isSavingProfile}
            className="mt-5 inline-flex rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingProfile ? "Saving…" : "Save name"}
          </button>
        </form>

        <form
          onSubmit={handleEmailUpdate}
          className="rounded-2xl border border-black/10 bg-[#fafaf7] p-5"
        >
          <p className="text-base font-semibold text-black">Email address</p>

          <p className="mt-1 text-sm leading-6 text-black/60">
            Supabase may ask you to confirm the new email before it changes.
          </p>

          <div className="mt-5 grid gap-2">
            <label htmlFor="email" className="text-sm font-medium text-black">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setEmailError(null);
                setEmailStatus(null);
              }}
              className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/10"
            />
          </div>

          <FormMessage error={emailError} status={emailStatus} />

          <button
            type="submit"
            disabled={isSavingEmail}
            className="mt-5 inline-flex rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingEmail ? "Sending…" : "Change email"}
          </button>
        </form>

        <form
          onSubmit={handlePasswordUpdate}
          className="rounded-2xl border border-black/10 bg-[#fafaf7] p-5"
        >
          <p className="text-base font-semibold text-black">Password</p>

          <p className="mt-1 text-sm leading-6 text-black/60">
            Choose a new password with at least 8 characters.
          </p>

          <div className="mt-5 grid gap-4">
            <div className="grid gap-2">
              <label
                htmlFor="new-password"
                className="text-sm font-medium text-black"
              >
                New password
              </label>

              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  setPasswordError(null);
                  setPasswordStatus(null);
                }}
                className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="confirm-password"
                className="text-sm font-medium text-black"
              >
                Confirm password
              </label>

              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setPasswordError(null);
                  setPasswordStatus(null);
                }}
                className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>

          <FormMessage error={passwordError} status={passwordStatus} />

          <button
            type="submit"
            disabled={isSavingPassword}
            className="mt-5 inline-flex rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingPassword ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </section>
  );
}

function FormMessage({
  error,
  status,
}: {
  error: string | null;
  status: string | null;
}) {
  if (error) {
    return (
      <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </p>
    );
  }

  if (status) {
    return (
      <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
        {status}
      </p>
    );
  }

  return null;
}