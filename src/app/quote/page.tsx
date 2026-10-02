import { PageHeader } from "@/components/PageHeader";
import { QuoteList } from "@/components/QuoteList";
import { formsEnabled } from "@/lib/enquiry-server";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Quote list",
  description: "Collect SWEILLEM pipes and fittings in one list and send a single quote request.",
  path: "/quote",
});

export default function QuotePage() {
  return (
    <>
      <PageHeader
        eyebrow="Request a quote"
        title="One request for everything you need"
        lede="Change quantities, add a note and send it to SWEILLEM. Your list stays on this device until you send it."
      />
      <QuoteList enabled={formsEnabled()} />
    </>
  );
}
