"use client";

import { useState } from "react";
import Link from "next/link";

export default function Login() {
  const [message, setMessage] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // Later we will check the email and password in the database here
    setMessage(
      "Demo only for now. Real login comes after we connect Supabase.",
    );
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
            <input type="email" required className={inputStyle} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input type="password" required className={inputStyle} />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700"
          >
            Log in
          </button>
        </form>

        {message && (
          <p className="mt-4 rounded-lg bg-purple-100 p-3 text-sm text-purple-800">
            {message}
          </p>
        )}

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
