"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { type Rsvp, CompleteRsvp } from "@/lib/db/schema/rsvps";
import Modal from "@/components/shared/Modal";
import { type Event, type EventId } from "@/lib/db/schema/events";
import { useOptimisticRsvps } from "@/app/(app)/rsvps/useOptimisticRsvps";
import { Button } from "@/components/ui/button";
import RsvpForm from "./RsvpForm";
import { PlusIcon } from "lucide-react";

type TOpenModal = (rsvp?: Rsvp) => void;

export default function RsvpList({
  rsvps,
  events,
  eventId 
}: {
  rsvps: CompleteRsvp[];
  events: Event[];
  eventId?: EventId 
}) {
  const { optimisticRsvps, addOptimisticRsvp } = useOptimisticRsvps(
    rsvps,
    events 
  );
  const [open, setOpen] = useState(false);
  const [activeRsvp, setActiveRsvp] = useState<Rsvp | null>(null);
  const openModal = (rsvp?: Rsvp) => {
    setOpen(true);
    rsvp ? setActiveRsvp(rsvp) : setActiveRsvp(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeRsvp ? "Edit Rsvp" : "Create Rsvp"}
      >
        <RsvpForm
          rsvp={activeRsvp}
          addOptimistic={addOptimisticRsvp}
          openModal={openModal}
          closeModal={closeModal}
          events={events}
        eventId={eventId}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>
      {optimisticRsvps.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticRsvps.map((rsvp) => (
            <Rsvp
              rsvp={rsvp}
              key={rsvp.id}
              openModal={openModal}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const Rsvp = ({
  rsvp,
  openModal,
}: {
  rsvp: CompleteRsvp;
  openModal: TOpenModal;
}) => {
  const optimistic = rsvp.id === "optimistic";
  const deleting = rsvp.id === "delete";
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes("rsvps")
    ? pathname
    : pathname + "/rsvps/";


  return (
    <li
      className={cn(
        "flex justify-between my-2",
        mutating ? "opacity-30 animate-pulse" : "",
        deleting ? "text-destructive" : "",
      )}
    >
      <div className="w-full">
        <div>{rsvp.status}</div>
      </div>
      <Button variant={"link"} asChild>
        <Link href={ basePath + "/" + rsvp.id }>
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
        No rsvps
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new rsvp.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Rsvps </Button>
      </div>
    </div>
  );
};
