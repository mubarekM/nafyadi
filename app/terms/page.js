import LegalPage from "@/components/LegalPage";
import { TERMS } from "@/lib/legal";

export const metadata = {
  title: "Terms of Service | English with Nafyad",
  description: "The rules for using English with Nafyad.",
};

export default function TermsPage() {
  return <LegalPage doc={TERMS} />;
}
