import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-purple-100">
        <h1 className="text-xl font-bold text-purple-700">
          English with Nafyad
        </h1>
        <Link
          href="/login"
          className="rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700"
        >
          Student Login
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="text-4xl font-extrabold leading-tight sm:text-5xl">
          Learn English from <span className="text-purple-600">home</span>, step
          by step
        </h2>
        <p className="mt-6 text-lg text-gray-600">
          Lessons, quizzes, and live classes with your own teacher. Join now and
          start speaking with confidence.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-full bg-purple-600 px-8 py-3 font-semibold text-white hover:bg-purple-700"
          >
            Join as a Student
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-purple-300 px-8 py-3 font-semibold text-purple-700 hover:bg-purple-50"
          >
            I already have an account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-100 py-6 text-center text-sm text-gray-500">
        © 2026 English with Nafyad
      </footer>
    </main>
  );
}
