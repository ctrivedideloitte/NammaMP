import { Report, MLA, Ward, City } from './types';

export const INITIAL_REPORTS: Report[] = [
  {
    id: '1',
    lat: 22.7196,
    lng: 75.8577,
    status: 'open',
    ward: 'Ward 12 · Vijay Nagar',
    location: 'Scheme No. 54, AB Road',
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
    ward: 'Ward 31 · Rajwada',
    location: 'Rajwada Chowk, Old City',
    timestamp: '1 day ago',
    mla: {
      name: 'Sudarshan Gupta',
      ward: 'Indore-1',
      party: 'BJP',
      avatar: 'SS'
    }
  },
  {
    id: '3',
    lat: 22.7050,
    lng: 75.8680,
    status: 'open',
    ward: 'Ward 47 · Palasia',
    location: 'Palasia Square, MG Road',
    timestamp: '4 hours ago',
    mla: {
      name: 'Akash Vijayvargiya',
      ward: 'Indore-3',
      party: 'BJP',
      avatar: 'AK'
    }
  },
  {
    id: '4',
    lat: 22.7310,
    lng: 75.8750,
    status: 'open',
    ward: 'Ward 58 · Geeta Bhawan',
    location: 'Geeta Bhawan Chowk',
    timestamp: '6 hours ago',
    mla: {
      name: 'Mahendra Hardia',
      ward: 'Indore-4',
      party: 'BJP',
      avatar: 'MK'
    }
  }
];

export const MLAS: MLA[] = [
  { id: '1', name: 'Ramesh Mendola', ward: 'Indore-2 · Vijay Nagar', party: 'BJP', avatar: 'RM', reportCount: 23 },
  { id: '2', name: 'Akash Vijayvargiya', ward: 'Indore-3 · Palasia', party: 'BJP', avatar: 'AK', reportCount: 18 },
  { id: '3', name: 'Sudarshan Gupta', ward: 'Indore-1 · Rajwada', party: 'BJP', avatar: 'SG', reportCount: 14 },
  { id: '4', name: 'Mahendra Hardia', ward: 'Indore-4 · Geeta Bhawan', party: 'BJP', avatar: 'MH', reportCount: 11 },
  { id: '5', name: 'Sanjay Sharma', ward: 'Indore-5 · Khajrana', party: 'INC', avatar: 'SK', reportCount: 9 }
];

export const WARDS: Ward[] = [
  { id: '12', number: 12, name: 'Vijay Nagar', openReports: 5, resolvedReports: 2 },
  { id: '31', number: 31, name: 'Rajwada', openReports: 1, resolvedReports: 2 },
  { id: '47', number: 47, name: 'Palasia', openReports: 3, resolvedReports: 1 },
  { id: '58', number: 58, name: 'Geeta Bhawan', openReports: 2, resolvedReports: 0 }
];

export const CITIES: City[] = [
  { id: 'indore', name: 'Indore', wardsCount: 85, mlaCount: 29, mpCount: 1, status: 'active', reportsCount: 47 },
  { id: 'bhopal', name: 'Bhopal', wardsCount: 85, mlaCount: 28, mpCount: 2, status: 'coming-soon' },
  { id: 'jabalpur', name: 'Jabalpur', wardsCount: 79, mlaCount: 26, mpCount: 1, status: 'coming-soon' },
  { id: 'gwalior', name: 'Gwalior', wardsCount: 66, mlaCount: 22, mpCount: 1, status: 'coming-soon' }
];
