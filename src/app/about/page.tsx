import { StubRoute, stubMetadata } from "@/components/StubRoute";

export const metadata = stubMetadata("about");

export default function Page() {
  return <StubRoute page="about" />;
}
