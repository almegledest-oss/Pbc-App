import { BoardDirector } from '../types';

export const INITIAL_DIRECTORS: BoardDirector[] = [
  {
    id: 'DIR-100',
    name: 'SHAKIL RANA',
    designation: 'President',
    photoUrl: '',
    location: 'Dhaka Bangladesh',
    mobile: '+8801711008874',
    nationalId: '',
    email: '',
    homeAddress: 'Comilla, Homna',
    village: 'Homna',
    subDistrict: 'Homna',
    district: 'Comilla',
    postalCode: '',
    displayOrder: 1,
    isActive: true,
    allowedAccessUsers: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 'DIR-101',
    name: 'FOKRUL ISLAM MIR',
    designation: 'Director',
    photoUrl: '',
    location: 'Riyadh, Saudi Arabia',
    mobile: '0590647043',
    nationalId: '19889123456789012',
    email: 'fokrulislammir89@gmail.com',
    homeAddress: 'Riyadh, Saudi Arabia',
    village: '',
    subDistrict: '',
    district: 'Riyadh',
    postalCode: '',
    displayOrder: 2,
    isActive: true,
    allowedAccessUsers: [],
    createdAt: new Date().toISOString()
  }
];
