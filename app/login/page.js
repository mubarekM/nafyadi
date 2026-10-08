"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email: form.get("email"),
        password: form.get("password"),
      },
    );

    if (signInError) {
      setError("Wrong email or password.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("status, role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role === "admin") {
      await supabase.auth.signOut();
      setError("Please use the teacher login page.");
      setLoading(false);
      return;
    }

    if (profile?.status === "pending") {
      await supabase.auth.signOut();
      setError(
        "Your account is waiting for your teacher's approval. Please try again later.",
      );
      setLoading(false);
      return;
    }

    if (profile?.status === "rejected") {
      await supabase.auth.signOut();
      setError("Your account was not approved. Please contact your teacher.");
      setLoading(false);
      return;
    }

    router.push("/student");
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
          Student Login
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back! Log in to continue learning.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input name="email" type="email" required className={inputStyle} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              name="password"
              type="password"
              required
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
            {loading ? "Please wait..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          New here?{" "}
          <Link
            href="/signup"
            className="font-semibold text-purple-600 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
