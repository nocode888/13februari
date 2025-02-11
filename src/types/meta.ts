export interface DemographicData {
  type: string;
  percentage: number;
  value: string;
}

export interface BehaviorData {
  name: string;
  percentage: number;
  category: string;
}

export interface MetaAudience {
  id: string;
  name: string;
  description?: string;
  size: number;
  estimatedReach?: number;
  path?: string;
  targeting?: {
    age_min?: number;
    age_max?: number;
    genders?: string[];
    interests?: string[];
    behaviors?: string[];
    locations?: string[];
  };
  demographics?: DemographicData[];
  behaviors?: BehaviorData[];
}

export interface MetaAccount {
  id: string;
  name: string;
  currency?: string;
  timezone?: string;
}

export interface MetaAuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  selectedAccount: MetaAccount | null;
  isInitializing: boolean;
  error: string | null;
  login: (token: string) => void;
  logout: () => void;
  setSelectedAccount: (account: MetaAccount | null) => void;
  setError: (error: string | null) => void;
  setInitializing: (isInitializing: boolean) => void;
}

export interface ReachEstimation {
  reach: number;
  cpm: number;
  impressions: number;
}

export interface FilterSettings {
  gender: string;
  age: string;
  budget: string;
  objective: string;
  placement: string;
}