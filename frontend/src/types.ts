export type UserStatus = 'active' | 'coffee' | 'watch' | 'right-back';

export interface User {
  id: string;
  name: string;
  isObserver: boolean;
  isHost?: boolean;
  status?: UserStatus;
}

export interface Vote {
  userId: string;
  value: string;
  hasVoted: boolean;
  isOwnVote?: boolean;
}

export interface RoomStats {
  avg: string;
  min: number;
  max: number;
  count: number;
  distribution?: { [key: string]: number };
}

export interface Room {
  id: string;
  name: string;
  users: User[];
  votes: Vote[];
  revealed: boolean;
  currentStory: string;
  stats: RoomStats | null;
  hostId?: string;
  isHost?: boolean;
  accessCode?: string;
}

export interface RoomListItem {
  id: string;
  name: string;
  userCount: number;
}