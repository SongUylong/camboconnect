"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@prisma/client';

interface PreviousParticipantsProps {
  participants: User[];
  participantsCount: number;
}

export function PreviousParticipants({ participants, participantsCount }: PreviousParticipantsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Previous Participants</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex -space-x-4">
            {participants.slice(0, 5).map((participant) => (
              <Avatar key={participant.id} className="h-8 w-8 border-2 border-white">
                <AvatarImage src={participant.profileImage || undefined} alt={`${participant.firstName} ${participant.lastName}`} />
                <AvatarFallback>
                  {participant.firstName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {participantsCount > 5 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-sm font-medium text-gray-600">
                +{participantsCount - 5}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {participantsCount} {participantsCount === 1 ? 'person' : 'people'} have participated in this opportunity
          </p>
        </div>
      </CardContent>
    </Card>
  );
}