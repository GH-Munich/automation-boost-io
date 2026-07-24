import { BedarfWizard } from "../components/BedarfWizard";
import { getContent } from "../lib/content";

export const dynamic = "force-dynamic";

export default function BedarfPage() {
  const content = getContent();
  return (
    <div className="mx-auto max-w-wrap px-4 py-8 sm:px-8 sm:py-10">
      <BedarfWizard bedarf={content.bedarf} />
    </div>
  );
}
