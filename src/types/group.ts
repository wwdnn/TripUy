export interface GroupMemberSummary {
  id: string;
  name: string;
  groupId: string | null;
}

export interface GroupWithMembers {
  id: string;
  name: string;
  members: GroupMemberSummary[];
}

export interface TripGroupData {
  groups: GroupWithMembers[];
  members: GroupMemberSummary[];
  isOwner: boolean;
}

export interface CreateGroupInput {
  name: string;
  memberIds: string[];
}

export type UpdateGroupInput = Partial<CreateGroupInput>;
