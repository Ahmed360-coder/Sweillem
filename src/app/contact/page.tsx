import { StubRoute, stubMetadata } from "@/components/StubRoute";

export const metadata = stubMetadata("contact");

export default function Page() {
  return <StubRoute page="contact" />;
}
