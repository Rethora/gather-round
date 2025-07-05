'use client';

import { Rsvp } from '@/lib/db/schema/rsvps';
import { RsvpStatus } from '@prisma/client';
import { updateRsvpAction } from '@/lib/actions/rsvps';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, HelpCircle, Clock } from 'lucide-react';

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

export default function RsvpStatusComponent({ rsvp }: { rsvp: Rsvp }) {
  const currentStatus = rsvp.status;
  const config = statusConfig[currentStatus];
  const Icon = config.icon;

  const handleStatusUpdate = async (newStatus: RsvpStatus) => {
    console.log('newStatus', newStatus);
    await updateRsvpAction({
      id: rsvp.id,
      eventId: rsvp.eventId,
      inviteeId: rsvp.inviteeId,
      status: newStatus,
    });
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

      {currentStatus === 'PENDING' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Please respond to this invitation:
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => handleStatusUpdate('YES')}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Yes, I&apos;ll be there
            </Button>
            <Button
              onClick={() => handleStatusUpdate('MAYBE')}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Maybe
            </Button>
            <Button
              onClick={() => handleStatusUpdate('NO')}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              No, I can&apos;t make it
            </Button>
          </div>
        </div>
      )}

      {currentStatus !== 'PENDING' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">You can update your response:</p>
          <div className="flex gap-2">
            {currentStatus !== 'YES' && (
              <Button
                onClick={() => handleStatusUpdate('YES')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Yes, I&apos;ll be there
              </Button>
            )}
            {currentStatus !== 'MAYBE' && (
              <Button
                onClick={() => handleStatusUpdate('MAYBE')}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Maybe
              </Button>
            )}
            {currentStatus !== 'NO' && (
              <Button
                onClick={() => handleStatusUpdate('NO')}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                No, I can&apos;t make it
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
