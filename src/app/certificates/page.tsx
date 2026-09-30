import { StubRoute, stubMetadata } from "@/components/StubRoute";

export const metadata = stubMetadata("certificates");

export default function Page() {
  return <StubRoute page="certificates" />;
}
