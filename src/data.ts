import { Report, MLA, Ward, City } from './types';

export const INITIAL_REPORTS: Report[] = [
  {
    id: '1',
    lat: 22.7533,
    lng: 75.8937,
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
    lat: 22.7153,
    lng: 75.8537,
    status: 'resolved',
    severity: 'medium',
    ward: 'Ward 31 · Rajwada',
    location: 'Rajwada Chowk, Old City Area',
    timestamp: '1 day ago',
    mla: {
      name: 'Rakesh Shukla (Golu)',
      ward: 'Indore-3',
      party: 'BJP',
      avatar: 'RS'
    }
  },
  {
    id: '3',
    lat: 22.7441,
    lng: 75.8361,
    status: 'open',
    severity: 'high',
    ward: 'Ward 1 · Banganga',
    location: 'Near Banganga Railway Crossing',
    timestamp: '5 hours ago',
    mla: {
      name: 'Kailash Vijayvargiya',
      ward: 'Indore-1',
      party: 'BJP',
      avatar: 'KV'
    }
  },
  {
    id: '4',
    lat: 22.6958,
    lng: 75.8322,
    status: 'open',
    severity: 'medium',
    ward: 'Ward 45 · Annapurna',
    location: 'Annapurna Mandir Backside',
    timestamp: 'Just now',
    mla: {
      name: 'Malini Gaur',
      ward: 'Indore-4',
      party: 'BJP',
      avatar: 'MG'
    }
  }
];

export const MLAS: MLA[] = [
  { id: '1', name: 'Kailash Vijayvargiya', ward: 'Indore-1 · Banganga', party: 'BJP', avatar: 'KV', reportCount: 15 },
  { id: '2', name: 'Ramesh Mendola', ward: 'Indore-2 · Vijay Nagar', party: 'BJP', avatar: 'RM', reportCount: 22 },
  { id: '3', name: 'Rakesh Shukla (Golu)', ward: 'Indore-3 · Rajwada', party: 'BJP', avatar: 'RS', reportCount: 9 },
  { id: '4', name: 'Malini Gaur', ward: 'Indore-4 · Annapurna', party: 'BJP', avatar: 'MG', reportCount: 11 },
  { id: '5', name: 'Mahendra Hardia', ward: 'Indore-5 · Khajrana', party: 'BJP', avatar: 'MH', reportCount: 14 },
  { id: '6', name: 'Madhu Verma', ward: 'Rau', party: 'BJP', avatar: 'MV', reportCount: 7 },
  { id: '7', name: 'Tulsi Silawat', ward: 'Sanwer', party: 'BJP', avatar: 'TS', reportCount: 18 }
];

export const WARDS: Ward[] = [
  { id: '1', number: 1, name: 'Banganga', openReports: 3, resolvedReports: 1 },
  { id: '12', number: 12, name: 'Vijay Nagar', openReports: 5, resolvedReports: 8 },
  { id: '31', number: 31, name: 'Rajwada', openReports: 2, resolvedReports: 4 },
  { id: '45', number: 45, name: 'Annapurna', openReports: 1, resolvedReports: 3 },
  { id: '55', number: 55, name: 'Khajrana', openReports: 4, resolvedReports: 2 }
];

export const CITIES: City[] = [
  { id: 'indore', name: 'Indore', wardsCount: 85, mlaCount: 9, mpCount: 1, status: 'active', reportsCount: 96 },
  { id: 'bhopal', name: 'Bhopal', wardsCount: 85, mlaCount: 7, mpCount: 2, status: 'coming-soon' }
];
