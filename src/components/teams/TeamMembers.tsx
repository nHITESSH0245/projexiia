
import { TeamMember } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface TeamMembersProps {
  members: TeamMember[];
}

export const TeamMembers = ({ members }: TeamMembersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {members.map((member) => (
            <li key={member.id} className="flex items-center justify-between p-2 border rounded-md">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.profile?.avatar_url || ''} alt={member.profile?.name || 'Team member'} />
                  <AvatarFallback>
                    {member.profile?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{member.profile?.name}</div>
                  <div className="text-sm text-muted-foreground">{member.profile?.email}</div>
                </div>
              </div>
              <Badge variant={member.role === 'leader' ? 'default' : 'outline'}>
                {member.role === 'leader' ? 'Team Leader' : 'Member'}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
