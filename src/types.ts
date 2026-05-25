// Alert type from API response
export interface Alert {
  id: number;
  timestamp: string;
  source_ip: string;
  dest_ip: string;
  port: number;
  protocol: string;
  threat_type: string;
  is_suspicious: boolean;
  confidence: number;
  raw_log: string;
}

// Statistics type from API response
export interface Stats {
  total_alerts: number;
  suspicious: number;
  normal: number;
  suspicious_percentage: number;
}

// Login request type
export interface LoginCredentials {
  username: string;
  password: string;
}

// Register request type
export interface RegisterData {
  username: string;
  password: string;
}

// Token response type
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Make it a module
export {};