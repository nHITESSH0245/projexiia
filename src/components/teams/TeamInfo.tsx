
import { useState } from 'react';
import { Team, TeamMember } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { TeamInviteForm } from './TeamInviteForm';
import { TeamMembers } from './TeamMembers';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, UserPlus, LogOut, Loader2 } from 'lucide-react';
import { leaveTeam } from '@/lib/team';

interface TeamInfoProps {
  team: Team;
  members: TeamMember[];
  userRole: string;
  onLeave?: () => void;
}

export const TeamInfo = ({ team, members, userRole, onLeave }: TeamInfoProps) => {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeaveTeam = async () => {
    setIsLeaving(true);
    try {
      const { error } = await leaveTeam(team.id);
      if (!error && onLeave) {
        onLeave();
      }
    } finally {
      setIsLeaving(false);
    }
  };

  const isLeader = userRole === 'leader';

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{team.name}</CardTitle>
              <CardDescription>
                {isLeader ? 'You are the team leader' : 'You are a team member'}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              {isLeader && (
                <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <TeamInviteForm 
                      teamId={team.id} 
                      onSuccess={() => setIsInviteDialogOpen(false)}
                      onCancel={() => setIsInviteDialogOpen(false)} 
                    />
                  </DialogContent>
                </Dialog>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <LogOut className="mr-2 h-4 w-4" />
                    {isLeader ? 'Disband Team' : 'Leave Team'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {isLeader ? 'Disband Team?' : 'Leave Team?'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {isLeader 
                        ? 'This will permanently delete the team and remove all members. This action cannot be undone.'
                        : 'Are you sure you want to leave this team? You may require faculty approval to join another team.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleLeaveTeam}
                      disabled={isLeaving}
                    >
                      {isLeaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        isLeader ? 'Disband Team' : 'Leave Team'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-muted-foreground">
            <Users className="mr-2 h-5 w-5" />
            <span>{members.length} member{members.length !== 1 ? 's' : ''}</span>
          </div>
        </CardContent>
      </Card>

      <TeamMembers members={members} />
    </div>
  );
};
