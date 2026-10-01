import { StubRoute, stubMetadata } from "@/components/StubRoute";

export const metadata = stubMetadata("process");

export default function Page() {
  return <StubRoute page="process" />;
}
