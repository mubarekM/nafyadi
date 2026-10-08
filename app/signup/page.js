"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function Signup() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.get("email"),
      password: form.get("password"),
      options: {
        data: {
          full_name: form.get("full_name"),
          phone: form.get("phone"),
          english_level: form.get("english_level"),
        },
      },
    });

    // Students must wait for approval, so log them out right away
    await supabase.auth.signOut();
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setDone(true);
  }

  const inputStyle =
    "w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none";

  return (
    <main className="flex min-h-screen items-center justify-center bg-purple-50 px-4 py-10 text-gray-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <Link href="/" className="text-sm text-purple-600 hover:underline">
          ← Back to home
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-purple-700">
          Join English with Nafyad
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Fill in your details. Your teacher will approve your account.
        </p>

        {done ? (
          <p className="mt-6 rounded-lg bg-purple-100 p-4 text-purple-800">
            Thank you! Your request was received. Your teacher will approve your
            account soon, then you can log in.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Full name
              </label>
              <input
                name="full_name"
                type="text"
                required
                className={inputStyle}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                name="email"
                type="email"
                required
                className={inputStyle}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Phone number
              </label>
              <input name="phone" type="tel" required className={inputStyle} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                English level
              </label>
              <select
                name="english_level"
                required
                className={inputStyle}
                defaultValue=""
              >
                <option value="" disabled>
                  Choose your level
                </option>
                <option>Beginner</option>
                <option>Elementary</option>
                <option>Intermediate</option>
                <option>Upper-intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className={inputStyle}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
            >
              {loading ? "Please wait..." : "Create account"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-purple-600 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
