export type Status = 'open' | 'resolved';
export type Severity = 'Minor' | 'Moderate' | 'Severe' | 'Critical';
export type WasteType = 'Mixed Waste' | 'Plastic' | 'Organic' | 'Construction';

export interface Report {
  id: string;
  lat: number;
  lng: number;
  status: Status;
  severity: Severity;
  severityLevel: number; // 1-10
  wasteType: WasteType;
  ward: string;
  location: string;
  timestamp: string;
  photoUrl?: string;
  seenCount: number;
  reportCount: number;
  mla: {
    name: string;
    ward: string;
    party: string;
    avatar: string;
  };
}

export interface MLA {
  id: string;
  name: string;
  ward: string;
  party: 'BJP' | 'INC' | 'IND';
  avatar: string;
  reportCount: number;
}

export interface Ward {
  id: string;
  number: number;
  name: string;
  openReports: number;
  resolvedReports: number;
}

export interface City {
  id: string;
  name: string;
  wardsCount: number;
  mlaCount: number;
  mpCount: number;
  status: 'active' | 'coming-soon';
  reportsCount?: number;
}
