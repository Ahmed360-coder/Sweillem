import { StubRoute, stubMetadata } from "@/components/StubRoute";

export const metadata = stubMetadata("quality");

export default function Page() {
  return <StubRoute page="quality" />;
}
