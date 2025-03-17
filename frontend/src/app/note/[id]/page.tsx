import NoteEditorClient from "@/components/NoteEditorClient";

export default async function NoteEditorPage({
  params,
}: {
  params: { id: string };
}) {
  // Here you can use params safely because it's server component
  const noteId = params.id;

  return <NoteEditorClient noteId={noteId} />;
}
