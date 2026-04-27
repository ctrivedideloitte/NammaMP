import { Report, MLA, Ward, City } from './types';

export const INITIAL_REPORTS: Report[] = [
  {
    id: '1',
    lat: 22.7196,
    lng: 75.8577,
    status: 'open',
    severity: 'high',
    ward: 'Ward 12 · Vijay Nagar',
    location: 'Scheme No. 54, Near AB Road',
    timestamp: '2 hours ago',
    mla: {
      name: 'Ramesh Mendola',
      ward: 'Indore-2',
      party: 'BJP',
      avatar: 'RM'
    }
  },
  {
    id: '2',
    lat: 22.7245,
    lng: 75.8672,
    status: 'resolved',
    severity: 'medium',
    ward: 'Ward 31 · Rajwada',
    location: 'Rajwada Chowk, Old City Area',
    timestamp: '1 day ago',
    mla: {
      name: 'Golu Shukla',
      ward: 'Indore-3',
      party: 'BJP',
      avatar: 'GS'
    }
  }
];

export const MLAS: MLA[] = [
  { id: '1', name: 'Ramesh Mendola', ward: 'Indore-2 · Vijay Nagar', party: 'BJP', avatar: 'RM', reportCount: 12 },
  { id: '2', name: 'Golu Shukla', ward: 'Indore-3 · Rajwada', party: 'BJP', avatar: 'GS', reportCount: 8 },
  { id: '3', name: 'Kailash Vijayvargiya', ward: 'Indore-1 · Banganga', party: 'BJP', avatar: 'KV', reportCount: 5 },
  { id: '4', name: 'Malini Gaur', ward: 'Indore-4 · Annapurna', party: 'BJP', avatar: 'MG', reportCount: 7 }
];

export const WARDS: Ward[] = [
  { id: '12', number: 12, name: 'Vijay Nagar', openReports: 2, resolvedReports: 1 },
  { id: '31', number: 31, name: 'Rajwada', openReports: 0, resolvedReports: 2 },
  { id: '1', number: 1, name: 'Banganga', openReports: 1, resolvedReports: 0 }
];

export const CITIES: City[] = [
  { id: 'indore', name: 'Indore', wardsCount: 85, mlaCount: 29, mpCount: 1, status: 'active', reportsCount: 27 },
  { id: 'bhopal', name: 'Bhopal', wardsCount: 85, mlaCount: 28, mpCount: 2, status: 'coming-soon' }
];
