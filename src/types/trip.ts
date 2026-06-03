export type TripStatus = "ACTIVE" | "ARCHIVED";

export type TripRole = "OWNER" | "MEMBER";

export interface Trip {
  id: string;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  currency: string;
  inviteCode: string;
  status: TripStatus;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TripMember {
  id: string;
  tripId: string;
  userId: string;
  role: TripRole;
  joinedAt: Date;
}

export interface TripWithMembers extends Trip {
  members: TripMember[];
}

export interface TripListItem extends Trip {
  memberCount: number;
  currentUserRole: TripRole;
}

export interface TripInvitePreview {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date | null;
  currency: string;
  status: TripStatus;
  memberCount: number;
  ownerName: string;
  isAlreadyMember: boolean;
}

export interface CreateTripInput {
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  currency: string;
}

export type UpdateTripInput = Partial<CreateTripInput>;
