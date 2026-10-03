import { MedicalInfoScreen } from "@/components/app/MedicalInfoScreen";

export default async function MedicalInfoPage({
  searchParams,
}: {
  searchParams: Promise<{ addNote?: string; memberId?: string }>;
}) {
  const resolvedParams = await searchParams;
  return (
    <MedicalInfoScreen
      initialAddNoteOpen={resolvedParams.addNote === "true"}
      memberId={resolvedParams.memberId}
    />
  );
}
