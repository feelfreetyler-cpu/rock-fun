import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "./ui/button";

/**
 * The AuthGate ensures a session exists before rendering its children. It
 * displays a login form with Google OAuth and magic email link when the
 * user is not authenticated. When a session exists it simply renders
 * children.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <div className="min-h-full bg-gradient-to-b from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-3xl bg-white border border-gray-100 p-6 shadow-sm">
          <div className="text-2xl font-extrabold text-gray-900">Rock Fun</div>
          <div className="mt-1 text-sm text-gray-600">Find and share rocks on Michigan beaches.</div>

          <div className="mt-6">
            <Button
              className="w-full bg-green-600"
              onClick={async () => {
                await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: { redirectTo: window.location.origin },
                });
              }}
            >
              Continue with Google
            </Button>

            <div className="mt-4 text-xs text-gray-500">or email link</div>

            <input
              className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button
              className="w-full mt-3 bg-blue-600"
              disabled={!email}
              onClick={async () => {
                const { error } = await supabase.auth.signInWithOtp({
                  email,
                  options: { emailRedirectTo: window.location.origin },
                });
                if (!error) setSent(true);
              }}
            >
              Send magic link
            </Button>

            {sent && (
              <div className="mt-3 text-sm text-green-700">Check your email for the sign-in link.</div>
            )}
          </div>

          <div className="mt-6 text-xs text-gray-500">
            Tip: After you deploy, open on phone → “Add to Home Screen”.
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
