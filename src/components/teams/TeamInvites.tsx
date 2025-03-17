
import { useState } from 'react';
import { TeamInvite } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, Loader2 } from 'lucide-react';
import { respondToInvite } from '@/lib/team';

interface TeamInvitesProps {
  invites: TeamInvite[];
  onResponse?: () => void;
}

export const TeamInvites = ({ invites, onResponse }: TeamInvitesProps) => {
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  const handleResponse = async (inviteId: string, accept: boolean) => {
    setRespondingTo(inviteId);
    try {
      await respondToInvite(inviteId, accept);
      if (onResponse) onResponse();
    } finally {
      setRespondingTo(null);
    }
  };

  if (invites.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Invitations</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {invites.map((invite) => (
            <li key={invite.id} className="p-3 border rounded-md">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={invite.inviter?.avatar_url || ''} alt={invite.inviter?.name || 'Inviter'} />
                    <AvatarFallback>
                      {invite.inviter?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {invite.inviter?.name} invites you to join
                    </div>
                    <div className="text-md font-semibold">
                      Team "{invite.team?.name}"
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleResponse(invite.id, false)}
                    disabled={!!respondingTo}
                  >
                    {respondingTo === invite.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleResponse(invite.id, true)}
                    disabled={!!respondingTo}
                  >
                    {respondingTo === invite.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
