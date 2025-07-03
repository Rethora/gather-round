import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getNotificationById } from "@/lib/api/notifications/queries";
import OptimisticNotification from "./OptimisticNotification";
import { checkAuth } from "@/lib/auth/utils";


import { BackButton } from "@/components/shared/BackButton";
import Loading from "@/app/loading";


export const revalidate = 0;

export default async function NotificationPage({
  params,
}: {
  params: { notificationId: string };
}) {

  return (
    <main className="overflow-auto">
      <Notification id={params.notificationId} />
    </main>
  );
}

const Notification = async ({ id }: { id: string }) => {
  await checkAuth();

  const { notification } = await getNotificationById(id);
  

  if (!notification) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="notifications" />
        <OptimisticNotification notification={notification}  />
      </div>
    </Suspense>
  );
};
