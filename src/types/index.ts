export interface User {
    id: string;
    email: string;
    role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
    name?: string;
  }
  
  export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
  }
  
  export interface ActivityLog {
    id: string;
    minute: string;
    status: 'ACTIVE' | 'IDLE' | 'SUSPICIOUS';
    score: number;
  }