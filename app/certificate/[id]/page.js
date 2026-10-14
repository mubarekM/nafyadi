"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { currentUser } from "@/lib/session";
import Icon from "@/components/Icon";
import Notice from "@/components/Notice";

function Certificate() {
  const { id } = useParams();
  const [s, setS] = useState({ loading: true });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const user = await currentUser(supabase);
      if (!user) {
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
        .eq("id", user.id)
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
      <div className="tx flex min-h-dvh items-center justify-center font-semibold">
        ...
      </div>
    );
  }

  if (s.denied || s.missing) {
    return (
      <Notice
        icon="lock"
        title={s.denied ? "Please log in" : "Certificate not found"}
        text={
          s.denied
            ? "Log in to see this certificate."
            : "This certificate does not exist, or it belongs to someone else."
        }
      >
        <Link href="/login" className="btn w-full">
          Go to login
        </Link>
      </Notice>
    );
  }

  const { cert, name, admin } = s;
  const date = new Date(cert.issued_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const serif = "var(--font-serif), Georgia, 'Times New Roman', serif";
  const green = "#0b4a38";
  const gold = "#c4921a";

  return (
    <div className="cert-page tx min-h-dvh px-4 py-6 sm:py-10">
      <div className="no-print mx-auto mb-6 flex max-w-4xl items-center justify-between gap-3">
        <Link
          href={admin ? "/admin/certificates" : "/student/certificates"}
          className="btn-ghost"
        >
          <Icon name="chevronRight" size={16} className="rotate-180" />
          Back
        </Link>
        <button onClick={() => window.print()} className="btn">
          <Icon name="file" size={16} />
          Print / Save as PDF
        </button>
      </div>

      <div
        className="cert-wrap mx-auto w-full max-w-4xl"
        style={{ containerType: "inline-size" }}
      >
        <div
          className="relative w-full overflow-hidden bg-white shadow-2xl"
          style={{ aspectRatio: "1.414 / 1", color: "#0e1a15" }}
        >
          <div
            style={{
              position: "absolute",
              inset: "2.2cqw",
              border: `0.5cqw solid ${green}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "3.4cqw",
              border: `0.15cqw solid ${gold}`,
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
                fontSize: "1.7cqw",
                letterSpacing: "0.35em",
                fontWeight: 700,
                color: gold,
              }}
            >
              ENGLISH WITH NAFYAD
            </p>
            <h1
              style={{
                fontFamily: serif,
                fontSize: "5.2cqw",
                fontWeight: 600,
                color: green,
                lineHeight: 1.1,
              }}
            >
              Certificate of Completion
            </h1>
            <p
              style={{
                fontSize: "1.8cqw",
                color: "#46564f",
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
                fontWeight: 600,
                padding: "0 3cqw 0.5cqw",
                borderBottom: `0.25cqw solid ${gold}`,
                lineHeight: 1.15,
              }}
            >
              {name}
            </p>
            <p
              style={{
                fontSize: "1.8cqw",
                color: "#46564f",
                marginTop: "1cqw",
              }}
            >
              for successfully completing
            </p>
            <p style={{ fontSize: "3cqw", fontWeight: 700, lineHeight: 1.2 }}>
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
                <p style={{ fontSize: "1.9cqw", fontWeight: 700 }}>{date}</p>
                <p style={{ fontSize: "1.3cqw", color: "#6b7a73" }}>
                  Date of issue
                </p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "1.3cqw", color: "#6b7a73" }}>
                  Certificate ID
                </p>
                <p
                  style={{
                    fontSize: "1.7cqw",
                    fontWeight: 700,
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
                    borderBottom: "0.2cqw solid #0e1a15",
                    padding: "0 2cqw",
                  }}
                >
                  Nafyad WJ
                </p>
                <p style={{ fontSize: "1.3cqw", color: "#6b7a73" }}>
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
        <div className="tx flex min-h-dvh items-center justify-center font-semibold">
          ...
        </div>
      }
    >
      <Certificate />
    </Suspense>
  );
}
