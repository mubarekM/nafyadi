"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Icon from "@/components/Icon";
import { PageHead, Panel, Avatar } from "@/components/ui";

export default function AdminAccount() {
  const [me, setMe] = useState(null);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const line = { borderColor: "var(--ln)" };

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;
      if (!user) return;
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      setMe({ email: user.email, name: p?.full_name || "Admin" });
    }
    load();
  }, []);

  async function changePassword(e) {
    e.preventDefault();
    setErr("");
    setOk("");
    if (pw.length < 10) {
      setErr("Use at least 10 characters for the teacher account.");
      return;
    }
    if (pw !== pw2) {
      setErr("The two passwords are not the same.");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) {
      setErr("Could not change the password. " + error.message);
      return;
    }
    setPw("");
    setPw2("");
    setOk("Your password was changed.");
  }

  async function signOutOthers() {
    setErr("");
    setOk("");
    if (
      !confirm(
        "Sign out of all other phones and computers? This device stays logged in.",
      )
    )
      return;
    const supabase = createClient();
    const { error } = await supabase.auth.signOut({ scope: "others" });
    if (error) setErr("Could not do that: " + error.message);
    else setOk("All other devices were signed out.");
  }

  if (!me) return <p className="mu font-semibold">...</p>;

  return (
    <div className="up space-y-6">
      <PageHead
        title="My account"
        sub="Your teacher login, password and devices"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Your login" icon="user">
          <div className="flex items-center gap-3">
            <Avatar name={me.name} size={48} />
            <div className="min-w-0">
              <p className="text-lg font-semibold">{me.name}</p>
              <p className="mu break-all text-sm">{me.email}</p>
            </div>
          </div>
          <div className="callout mt-5 flex items-start gap-3 p-4 text-sm">
            <Icon
              name="shield"
              size={18}
              className="mt-0.5 shrink-0 text-[var(--acc-t)]"
            />
            <p>
              This login can see every student, payment and receipt. Use a long
              password that you do not use anywhere else, and never share it.
            </p>
          </div>
        </Panel>

        <Panel title="Change password" icon="lock">
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className="lbl">New password</label>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoComplete="new-password"
                required
                className="field"
              />
            </div>
            <div>
              <label className="lbl">Repeat the new password</label>
              <input
                type="password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                autoComplete="new-password"
                required
                className="field"
              />
            </div>
            <p className="mu text-xs">At least 10 characters.</p>
            {err && <p className="err">{err}</p>}
            {ok && <p className="ok">{ok}</p>}
            <button type="submit" disabled={busy} className="btn">
              {busy ? "Saving..." : "Save new password"}
            </button>
          </form>
        </Panel>
      </div>

      <Panel title="Devices" icon="monitor">
        <p className="mu">
          If you logged in on a phone or computer that is not yours, or lost a
          device, sign out of everything else. This device stays logged in.
        </p>
        <div className="mt-4 border-t pt-4" style={line}>
          <button onClick={signOutOthers} className="btn-ghost">
            Sign out all other devices
          </button>
        </div>
      </Panel>
    </div>
  );
}
