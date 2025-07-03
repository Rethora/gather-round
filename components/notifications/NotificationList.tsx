"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { type Notification, CompleteNotification } from "@/lib/db/schema/notifications";
import Modal from "@/components/shared/Modal";

import { useOptimisticNotifications } from "@/app/(app)/notifications/useOptimisticNotifications";
import { Button } from "@/components/ui/button";
import NotificationForm from "./NotificationForm";
import { PlusIcon } from "lucide-react";

type TOpenModal = (notification?: Notification) => void;

export default function NotificationList({
  notifications,
   
}: {
  notifications: CompleteNotification[];
   
}) {
  const { optimisticNotifications, addOptimisticNotification } = useOptimisticNotifications(
    notifications,
     
  );
  const [open, setOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
  const openModal = (notification?: Notification) => {
    setOpen(true);
    notification ? setActiveNotification(notification) : setActiveNotification(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeNotification ? "Edit Notification" : "Create Notification"}
      >
        <NotificationForm
          notification={activeNotification}
          addOptimistic={addOptimisticNotification}
          openModal={openModal}
          closeModal={closeModal}
          
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>
      {optimisticNotifications.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticNotifications.map((notification) => (
            <Notification
              notification={notification}
              key={notification.id}
              openModal={openModal}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const Notification = ({
  notification,
  openModal,
}: {
  notification: CompleteNotification;
  openModal: TOpenModal;
}) => {
  const optimistic = notification.id === "optimistic";
  const deleting = notification.id === "delete";
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes("notifications")
    ? pathname
    : pathname + "/notifications/";


  return (
    <li
      className={cn(
        "flex justify-between my-2",
        mutating ? "opacity-30 animate-pulse" : "",
        deleting ? "text-destructive" : "",
      )}
    >
      <div className="w-full">
        <div>{notification.type}</div>
      </div>
      <Button variant={"link"} asChild>
        <Link href={ basePath + "/" + notification.id }>
          Edit
        </Link>
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No notifications
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new notification.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Notifications </Button>
      </div>
    </div>
  );
};
