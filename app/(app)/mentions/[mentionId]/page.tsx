import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getMentionById } from "@/lib/api/mentions/queries";
import { getComments } from "@/lib/api/comments/queries";import OptimisticMention from "@/app/(app)/mentions/[mentionId]/OptimisticMention";
import { checkAuth } from "@/lib/auth/utils";


import { BackButton } from "@/components/shared/BackButton";
import Loading from "@/app/loading";


export const revalidate = 0;

export default async function MentionPage({
  params,
}: {
  params: { mentionId: string };
}) {

  return (
    <main className="overflow-auto">
      <Mention id={params.mentionId} />
    </main>
  );
}

const Mention = async ({ id }: { id: string }) => {
  await checkAuth();

  const { mention } = await getMentionById(id);
  const { comments } = await getComments();

  if (!mention) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="mentions" />
        <OptimisticMention mention={mention} comments={comments} />
      </div>
    </Suspense>
  );
};
