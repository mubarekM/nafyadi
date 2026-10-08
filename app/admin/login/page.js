"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [message, setMessage] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // Later we will check that this is really the teacher, using the database
    setMessage(
      "Demo only for now. Real admin login comes after we connect Supabase.",
    );
  }

  const inputStyle =
    "w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-purple-400 focus:outline-none";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-10 text-gray-100">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-purple-400">
          Teacher area
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">Admin Login</h1>
        <p className="mt-1 text-sm text-gray-400">Authorized access only.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Admin email
            </label>
            <input type="email" required className={inputStyle} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Password
            </label>
            <input type="password" required className={inputStyle} />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-purple-600 py-3 font-semibold text-white hover:bg-purple-500"
          >
            Sign in
          </button>
        </form>

        {message && (
          <p className="mt-4 rounded-lg bg-gray-800 p-3 text-sm text-purple-300">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
