import { StubRoute, stubMetadata } from "@/components/StubRoute";

export const metadata = stubMetadata("services");

export default function Page() {
  return <StubRoute page="services" />;
}
