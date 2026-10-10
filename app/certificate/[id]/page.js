"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

function Certificate() {
  const { id } = useParams();
  const [s, setS] = useState({ loading: true });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        setS({ loading: false, denied: true });
        return;
      }
      const { data: cert } = await supabase
        .from("certificates")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!cert) {
        setS({ loading: false, missing: true });
        return;
      }
      const { data: stu } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", cert.student_id)
        .maybeSingle();
      const { data: me } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", u.user.id)
        .maybeSingle();
      setS({
        loading: false,
        cert,
        name: stu?.full_name || "",
        admin: me?.role === "admin",
      });
    }
    load();
  }, [id]);

  if (s.loading) {
    return (
      <div className="tx flex min-h-dvh items-center justify-center font-bold">
        ...
      </div>
    );
  }

  if (s.denied || s.missing) {
    return (
      <div className="tx flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-xl font-extrabold">
          {s.denied
            ? "Please log in to see this certificate."
            : "Certificate not found."}
        </p>
        <Link href="/login" className="btn">
          Go to login
        </Link>
      </div>
    );
  }

  const { cert, name, admin } = s;
  const date = new Date(cert.issued_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const serif = "Georgia, 'Times New Roman', serif";

  return (
    <div className="cert-page tx min-h-dvh px-4 py-6 sm:py-10">
      <div className="no-print mx-auto mb-6 flex max-w-4xl items-center justify-between gap-3">
        <Link
          href={admin ? "/admin/certificates" : "/student/progress"}
          className="btn-ghost"
        >
          ← Back
        </Link>
        <button onClick={() => window.print()} className="btn">
          🖨️ Print / Save as PDF
        </button>
      </div>

      <div
        className="cert-wrap mx-auto w-full max-w-4xl"
        style={{ containerType: "inline-size" }}
      >
        <div
          className="relative w-full overflow-hidden bg-white shadow-2xl"
          style={{ aspectRatio: "1.414 / 1", color: "#0f172a" }}
        >
          <div
            style={{
              position: "absolute",
              inset: "2.2cqw",
              border: "0.7cqw double #1d4ed8",
            }}
          />
          <div
            style={{
              position: "relative",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "5cqw 9cqw",
              gap: "1.2cqw",
            }}
          >
            <p
              style={{
                fontSize: "1.9cqw",
                letterSpacing: "0.35em",
                fontWeight: 800,
                color: "#f97316",
              }}
            >
              ENGLISH WITH NAFYAD
            </p>
            <h1
              style={{
                fontFamily: serif,
                fontSize: "5.4cqw",
                fontWeight: 800,
                color: "#1d4ed8",
                lineHeight: 1.1,
              }}
            >
              Certificate of Completion
            </h1>
            <p
              style={{
                fontSize: "1.8cqw",
                color: "#475569",
                marginTop: "1cqw",
              }}
            >
              This certificate is proudly presented to
            </p>
            <p
              style={{
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: "6cqw",
                fontWeight: 700,
                padding: "0 3cqw 0.5cqw",
                borderBottom: "0.25cqw solid #f97316",
                lineHeight: 1.15,
              }}
            >
              {name}
            </p>
            <p
              style={{
                fontSize: "1.8cqw",
                color: "#475569",
                marginTop: "1cqw",
              }}
            >
              for successfully completing
            </p>
            <p style={{ fontSize: "3cqw", fontWeight: 800, lineHeight: 1.2 }}>
              {cert.title}
            </p>

            <div
              style={{
                marginTop: "2.4cqw",
                width: "100%",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: "2cqw",
              }}
            >
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: "1.9cqw", fontWeight: 800 }}>{date}</p>
                <p style={{ fontSize: "1.3cqw", color: "#64748b" }}>
                  Date of issue
                </p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "1.3cqw", color: "#64748b" }}>
                  Certificate ID
                </p>
                <p
                  style={{
                    fontSize: "1.7cqw",
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                  }}
                >
                  {cert.code}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontFamily: serif,
                    fontStyle: "italic",
                    fontSize: "3cqw",
                    borderBottom: "0.2cqw solid #0f172a",
                    padding: "0 2cqw",
                  }}
                >
                  Nafyad WJ
                </p>
                <p style={{ fontSize: "1.3cqw", color: "#64748b" }}>
                  English Teacher
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="tx flex min-h-dvh items-center justify-center font-bold">
          ...
        </div>
      }
    >
      <Certificate />
    </Suspense>
  );
}
