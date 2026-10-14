import Link from "next/link";

export const metadata = { title: "Page not found | English with Nafyad" };

export default function NotFound() {
  return (
    <main className="tx grid min-h-dvh place-items-center px-4">
      <div className="max-w-md text-center">
        <p className="overline">404</p>
        <h1 className="display mt-2 text-4xl">This page was not found</h1>
        <p className="mu mt-3">
          The address may be wrong, or the page was moved. Let&apos;s get you
          back on track.
        </p>
        <p className="mu mt-1 text-sm">ገጹ አልተገኘም · Fuulli hin argamne</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn">
            Go to the home page
          </Link>
          <Link href="/login" className="btn2">
            Student login
          </Link>
        </div>
      </div>
    </main>
  );
}
