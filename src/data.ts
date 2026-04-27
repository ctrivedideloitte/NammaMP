import { Report, MLA, Ward, City } from './types';

export const INITIAL_REPORTS: Report[] = [];

export const MLAS: MLA[] = [
  { id: '1', name: 'Kailash Vijayvargiya', ward: 'Indore-1', party: 'BJP', avatar: 'KV', reportCount: 0 },
  { id: '2', name: 'Ramesh Mendola', ward: 'Indore-2', party: 'BJP', avatar: 'RM', reportCount: 0 },
  { id: '3', name: 'Rakesh Shukla (Golu)', ward: 'Indore-3', party: 'BJP', avatar: 'RS', reportCount: 0 },
  { id: '4', name: 'Malini Gaur', ward: 'Indore-4', party: 'BJP', avatar: 'MG', reportCount: 0 },
  { id: '5', name: 'Mahendra Hardia', ward: 'Indore-5', party: 'BJP', avatar: 'MH', reportCount: 0 },
  { id: '6', name: 'Madhu Verma', ward: 'Rau', party: 'BJP', avatar: 'MV', reportCount: 0 },
  { id: '7', name: 'Tulsi Silawat', ward: 'Sanwer', party: 'BJP', avatar: 'TS', reportCount: 0 },
  { id: '8', name: 'Manoj Patel', ward: 'Depalpur', party: 'BJP', avatar: 'MP', reportCount: 0 },
  { id: '9', name: 'Usha Thakur', ward: 'Mhow', party: 'BJP', avatar: 'UT', reportCount: 0 }
];

export const WARDS: Ward[] = [
  { id: '1', number: 1, name: 'Banganga', openReports: 0, resolvedReports: 0 },
  { id: '2', number: 2, name: 'Sanwer Road', openReports: 0, resolvedReports: 0 },
  { id: '3', number: 3, name: 'Nanda Nagar', openReports: 0, resolvedReports: 0 },
  { id: '4', number: 4, name: 'Bagiya', openReports: 0, resolvedReports: 0 },
  { id: '5', number: 5, name: 'Kushwah Colony', openReports: 0, resolvedReports: 0 },
  { id: '12', number: 12, name: 'Vijay Nagar', openReports: 0, resolvedReports: 0 },
  { id: '13', number: 13, name: 'Sukhlia', openReports: 0, resolvedReports: 0 },
  { id: '14', number: 14, name: 'Bhamori', openReports: 0, resolvedReports: 0 },
  { id: '31', number: 31, name: 'Rajwada', openReports: 0, resolvedReports: 0 },
  { id: '32', number: 32, name: 'Sarafa', openReports: 0, resolvedReports: 0 },
  { id: '45', number: 45, name: 'Annapurna', openReports: 0, resolvedReports: 0 },
  { id: '55', number: 55, name: 'Khajrana', openReports: 0, resolvedReports: 0 },
  { id: '60', number: 60, name: 'Bicholi Mardana', openReports: 0, resolvedReports: 0 },
  { id: '70', number: 70, name: 'Sudama Nagar', openReports: 0, resolvedReports: 0 },
  { id: '80', number: 80, name: 'Rau', openReports: 0, resolvedReports: 0 },
  { id: '85', number: 85, name: 'Musakhedi', openReports: 0, resolvedReports: 0 }
];

export const CITIES: City[] = [
  { id: 'indore', name: 'Indore', wardsCount: 85, mlaCount: 9, mpCount: 1, status: 'active', reportsCount: 96 },
  { id: 'bhopal', name: 'Bhopal', wardsCount: 85, mlaCount: 7, mpCount: 2, status: 'coming-soon' }
];
