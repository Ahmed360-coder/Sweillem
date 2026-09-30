import { StubRoute, stubMetadata } from "@/components/StubRoute";

export const metadata = stubMetadata("projects");

export default function Page() {
  return <StubRoute page="projects" />;
}
