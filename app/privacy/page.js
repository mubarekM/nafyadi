import LegalPage from "@/components/LegalPage";
import { PRIVACY } from "@/lib/legal";

export const metadata = {
  title: "Privacy Policy | English with Nafyad",
  description:
    "How English with Nafyad collects, uses and protects your information.",
};

export default function PrivacyPage() {
  return <LegalPage doc={PRIVACY} />;
}
