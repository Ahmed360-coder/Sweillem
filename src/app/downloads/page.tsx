import { StubRoute, stubMetadata } from "@/components/StubRoute";

export const metadata = stubMetadata("downloads");

export default function Page() {
  return <StubRoute page="downloads" />;
}
