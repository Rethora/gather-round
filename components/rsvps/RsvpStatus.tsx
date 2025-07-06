'use client';

import { Rsvp } from '@/lib/db/schema/rsvps';
import { RsvpStatus } from '@prisma/client';
import {
  updateRsvpAction,
  checkEventCapacityAction,
} from '@/lib/actions/rsvps';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, HelpCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const statusConfig = {
  PENDING: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  YES: {
    label: 'Yes',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  NO: {
    label: 'No',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
  MAYBE: {
    label: 'Maybe',
    color: 'bg-blue-100 text-blue-800',
    icon: HelpCircle,
  },
};

type CapacityInfo = {
  effectiveGuests: number;
  maxGuests: number;
  availableSpots: number;
  canAddGuests: boolean;
} | null;

export default function RsvpStatusComponent({
  rsvp,
  capacityInfo,
}: {
  rsvp: Rsvp;
  capacityInfo: CapacityInfo;
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const currentStatus = rsvp.status;
  const config = statusConfig[currentStatus];
  const Icon = config.icon;

  const handleStatusUpdate = async (newStatus: RsvpStatus) => {
    setIsUpdating(true);

    try {
      // Only check capacity when changing from NO to other statuses (since NO doesn't reserve a spot)
      if (
        currentStatus === RsvpStatus.NO &&
        (newStatus === RsvpStatus.YES ||
          newStatus === RsvpStatus.MAYBE ||
          newStatus === RsvpStatus.PENDING)
      ) {
        const capacityResult = await checkEventCapacityAction(rsvp.eventId, 1);

        if (capacityResult.error) {
          toast.error('Error checking capacity', {
            description: capacityResult.error,
          });
          setIsUpdating(false);
          return;
        }

        if (!capacityResult.canAddGuests) {
          toast.error('Cannot change status', {
            description: `Event is at capacity (${capacityResult.effectiveGuests}/${capacityResult.maxGuests} reserved spots). You cannot change your status from NO to ${newStatus}.`,
          });
          setIsUpdating(false);
          return;
        }
      }

      console.log('newStatus', newStatus);
      await updateRsvpAction({
        id: rsvp.id,
        eventId: rsvp.eventId,
        inviteeId: rsvp.inviteeId,
        status: newStatus,
      });

      toast.success(`Status updated to ${statusConfig[newStatus].label}`);
    } catch (error) {
      console.error('Error updating RSVP status:', error);
      toast.error('Failed to update status', {
        description:
          error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Determine if buttons should be shown based on capacity and current status
  const shouldShowButtons = () => {
    // If event is at capacity and user is currently NO, don't show buttons to change to YES/MAYBE/PENDING
    if (
      capacityInfo &&
      !capacityInfo.canAddGuests &&
      currentStatus === RsvpStatus.NO
    ) {
      return false;
    }

    return true;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-medium">Your RSVP Status</h3>
        <Badge className={config.color}>
          <Icon className="w-4 h-4 mr-1" />
          {config.label}
        </Badge>
      </div>

      {currentStatus === 'PENDING' && shouldShowButtons() && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Please respond to this invitation:
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => handleStatusUpdate('YES')}
              className="bg-green-600 hover:bg-green-700"
              disabled={isUpdating}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isUpdating ? 'Checking...' : "Yes, I'll be there"}
            </Button>
            <Button
              onClick={() => handleStatusUpdate('MAYBE')}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
              disabled={isUpdating}
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              {isUpdating ? 'Checking...' : 'Maybe'}
            </Button>
            <Button
              onClick={() => handleStatusUpdate('NO')}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
              disabled={isUpdating}
            >
              <XCircle className="w-4 h-4 mr-2" />
              {isUpdating ? 'Updating...' : "No, I can't make it"}
            </Button>
          </div>
        </div>
      )}

      {currentStatus !== 'PENDING' && shouldShowButtons() && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">You can update your response:</p>
          <div className="flex gap-2">
            {currentStatus !== 'YES' && (
              <Button
                onClick={() => handleStatusUpdate('YES')}
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-500"
                disabled={isUpdating}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isUpdating ? 'Checking...' : "Yes, I'll be there"}
              </Button>
            )}
            {currentStatus !== 'MAYBE' && (
              <Button
                onClick={() => handleStatusUpdate('MAYBE')}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-500"
                disabled={isUpdating}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                {isUpdating ? 'Checking...' : 'Maybe, I might be there'}
              </Button>
            )}
            {currentStatus !== 'NO' && (
              <Button
                onClick={() => handleStatusUpdate('NO')}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-500"
                disabled={isUpdating}
              >
                <XCircle className="w-4 h-4 mr-2" />
                {isUpdating ? 'Updating...' : "No, I can't make it"}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Show message when buttons are hidden due to capacity */}
      {!shouldShowButtons() && (
        <div className="space-y-3">
          <p className="text-sm text-red-600">
            Event is at capacity. You can&apos;t change your status at this
            time.
          </p>
        </div>
      )}
    </div>
  );
}
