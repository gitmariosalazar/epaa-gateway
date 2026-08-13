export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    userId: string;
    username: string;
    email: string;
    roles: {
      id: number;
      name: string;
      description: string;
    }[];
    permissions: {
      id: number;
      name: string;
      description: string;
    }[];
    firstName: string;
    lastName: string;
    isActive: boolean;
    cardId?: string;
    isNaturalPerson?: boolean;
  };
}
