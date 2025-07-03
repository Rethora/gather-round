import { Suspense } from "react";

import Loading from "@/app/loading";
import MentionList from "@/components/mentions/MentionList";
import { getMentions } from "@/lib/api/mentions/queries";
import { getComments } from "@/lib/api/comments/queries";
import { checkAuth } from "@/lib/auth/utils";

export const revalidate = 0;

export default async function MentionsPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Mentions</h1>
        </div>
        <Mentions />
      </div>
    </main>
  );
}

const Mentions = async () => {
  await checkAuth();

  const { mentions } = await getMentions();
  const { comments } = await getComments();
  return (
    <Suspense fallback={<Loading />}>
      <MentionList mentions={mentions} comments={comments} />
    </Suspense>
  );
};
