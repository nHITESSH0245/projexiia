
import { supabase } from '@/integrations/supabase/client';
import { Team, TeamMember, TeamInvite } from '@/types';
import { toast } from 'sonner';
import { createNotification } from './notification';

// Team management functions
export const createTeam = async (name: string) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return { error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('teams')
      .insert({
        name,
        creator_id: userData.user.id
      })
      .select()
      .single();

    if (error) {
      toast.error(`Failed to create team: ${error.message}`);
      return { team: null, error };
    }

    // Add creator as team leader
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: data.id,
        user_id: userData.user.id,
        role: 'leader'
      });

    if (memberError) {
      toast.error(`Failed to add user to team: ${memberError.message}`);
      return { team: data as Team, error: memberError };
    }

    toast.success('Team created successfully!');
    return { team: data as Team, error: null };
  } catch (error) {
    console.error('Team creation error:', error);
    toast.error('Failed to create team. Please try again.');
    return { team: null, error };
  }
};

export const getUserTeam = async () => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return { team: null, members: [], error: new Error('User not authenticated') };
    }

    // Get user's team membership
    const { data: memberData, error: memberError } = await supabase
      .from('team_members')
      .select('*, team:teams(*)')
      .eq('user_id', userData.user.id)
      .single();

    if (memberError && memberError.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
      console.error('Fetch team membership error:', memberError);
      return { team: null, members: [], error: memberError };
    }

    if (!memberData) {
      return { team: null, members: [], error: null };
    }

    // Get all team members
    const { data: membersData, error: membersError } = await supabase
      .from('team_members')
      .select(`*`)
      .eq('team_id', memberData.team_id);

    if (membersError) {
      console.error('Fetch team members error:', membersError);
      return { team: memberData.team as Team, members: [], error: membersError };
    }

    // Get profiles for all team members
    const memberIds = membersData.map(member => member.user_id);
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select(`id, name, email, avatar_url`)
      .in('id', memberIds);

    if (profilesError) {
      console.error('Fetch profiles error:', profilesError);
      return { team: memberData.team as Team, members: [], error: profilesError };
    }

    // Merge member data with profiles
    const members = membersData.map(member => {
      const profile = profilesData.find(profile => profile.id === member.user_id);
      return {
        ...member,
        profile: profile ? {
          name: profile.name,
          email: profile.email,
          avatar_url: profile.avatar_url
        } : undefined
      } as TeamMember;
    });

    return { 
      team: memberData.team as Team, 
      members: members, 
      userRole: memberData.role,
      error: null 
    };
  } catch (error) {
    console.error('Fetch user team error:', error);
    return { team: null, members: [], error };
  }
};

export const getTeamProjects = async (teamId: string) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*, tasks(*)')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch team projects error:', error);
      return { projects: [], error };
    }

    return { projects: data, error: null };
  } catch (error) {
    console.error('Fetch team projects error:', error);
    return { projects: [], error };
  }
};

export const inviteToTeam = async (teamId: string, email: string) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return { error: new Error('User not authenticated') };
    }

    // Find user by email
    const { data: inviteeData, error: inviteeError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', email)
      .single();

    if (inviteeError) {
      toast.error(`User with email ${email} not found`);
      return { error: inviteeError };
    }

    if (inviteeData.role !== 'student') {
      toast.error('You can only invite students to join your team');
      return { error: new Error('Only students can be invited to teams') };
    }

    // Check if user is already in a team
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('team_members')
      .select('id')
      .eq('user_id', inviteeData.id);

    if (!memberCheckError && existingMember && existingMember.length > 0) {
      toast.error('This user is already a member of a team');
      return { error: new Error('User is already in a team') };
    }

    // Create invitation
    const { data, error } = await supabase
      .from('team_invites')
      .insert({
        team_id: teamId,
        inviter_id: userData.user.id,
        invitee_id: inviteeData.id
      })
      .select()
      .single();

    if (error) {
      toast.error(`Failed to send invitation: ${error.message}`);
      return { invite: null, error };
    }

    // Get team name for notification
    const { data: teamData } = await supabase
      .from('teams')
      .select('name')
      .eq('id', teamId)
      .single();

    // Create notification for the invitee
    await createNotification(
      inviteeData.id,
      'Team Invitation',
      `You have been invited to join team "${teamData?.name || 'Unknown'}"`,
      'team_invite',
      data.id
    );

    toast.success('Invitation sent successfully!');
    return { invite: data as TeamInvite, error: null };
  } catch (error) {
    console.error('Team invitation error:', error);
    toast.error('Failed to send invitation. Please try again.');
    return { invite: null, error };
  }
};

export const getPendingInvites = async () => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return { invites: [], error: new Error('User not authenticated') };
    }

    // Get team invites
    const { data: invitesData, error: invitesError } = await supabase
      .from('team_invites')
      .select(`
        *,
        team:teams(*)
      `)
      .eq('invitee_id', userData.user.id)
      .eq('status', 'pending');

    if (invitesError) {
      console.error('Fetch pending invites error:', invitesError);
      return { invites: [], error: invitesError };
    }

    // Get profiles for inviters
    const inviterIds = invitesData.map(invite => invite.inviter_id);
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select(`id, name, email, avatar_url`)
      .in('id', inviterIds);

    if (profilesError) {
      console.error('Fetch profiles error:', profilesError);
      return { invites: [], error: profilesError };
    }

    // Merge invite data with profiles
    const invites = invitesData.map(invite => {
      const inviterProfile = profilesData.find(profile => profile.id === invite.inviter_id);
      return {
        ...invite,
        inviter: inviterProfile ? {
          name: inviterProfile.name,
          email: inviterProfile.email,
          avatar_url: inviterProfile.avatar_url
        } : undefined
      } as TeamInvite;
    });

    return { invites, error: null };
  } catch (error) {
    console.error('Fetch pending invites error:', error);
    return { invites: [], error };
  }
};

export const respondToInvite = async (inviteId: string, accept: boolean) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return { error: new Error('User not authenticated') };
    }

    const status = accept ? 'accepted' : 'rejected';
    
    // Update invitation status
    const { data, error } = await supabase
      .from('team_invites')
      .update({ status })
      .eq('id', inviteId)
      .eq('invitee_id', userData.user.id)
      .select('*, team:teams(*)')
      .single();

    if (error) {
      toast.error(`Failed to respond to invitation: ${error.message}`);
      return { error };
    }

    if (accept) {
      // Add user to team members
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: data.team_id,
          user_id: userData.user.id,
          role: 'member'
        });

      if (memberError) {
        toast.error(`Failed to join team: ${memberError.message}`);
        return { error: memberError };
      }

      // Notify team leader
      await createNotification(
        data.team.creator_id,
        'Team Member Joined',
        `A new member has joined your team "${data.team.name}"`,
        'team_update',
        data.team_id
      );

      toast.success(`You've joined team "${data.team.name}"`);
    } else {
      toast.info('Invitation declined');
    }

    return { invite: data as TeamInvite, error: null };
  } catch (error) {
    console.error('Respond to invite error:', error);
    toast.error('Failed to process invitation. Please try again.');
    return { error };
  }
};

export const leaveTeam = async (teamId: string) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return { error: new Error('User not authenticated') };
    }

    // Check if user is the team leader
    const { data: memberData, error: memberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', userData.user.id)
      .single();

    if (memberError) {
      toast.error(`Failed to check team membership: ${memberError.message}`);
      return { error: memberError };
    }

    if (memberData.role === 'leader') {
      // Check if team has projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id')
        .eq('team_id', teamId);

      if (projectsError) {
        toast.error(`Failed to check team projects: ${projectsError.message}`);
        return { error: projectsError };
      }

      if (projectsData && projectsData.length > 0) {
        toast.error('Cannot disband team with active projects. Please contact faculty for assistance.');
        return { error: new Error('Cannot disband team with active projects') };
      }

      // Delete the team (will cascade delete members due to foreign key constraint)
      const { error: deleteError } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (deleteError) {
        toast.error(`Failed to disband team: ${deleteError.message}`);
        return { error: deleteError };
      }

      toast.success('Team disbanded successfully');
    } else {
      // Remove the member from the team
      const { error: leaveError } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userData.user.id);

      if (leaveError) {
        toast.error(`Failed to leave team: ${leaveError.message}`);
        return { error: leaveError };
      }

      toast.success('You have left the team');
    }

    return { error: null };
  } catch (error) {
    console.error('Leave team error:', error);
    toast.error('Failed to leave team. Please try again.');
    return { error };
  }
};
