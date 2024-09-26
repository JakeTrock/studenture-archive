"use client";

import { EditPostForm } from "~/app/_components/helpers/forms/post/editPostForm";

export default function PostEditStatic({ id }: { id: string }) {
  return <EditPostForm postId={id} />;
}
