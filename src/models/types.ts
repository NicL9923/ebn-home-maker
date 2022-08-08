import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

export interface FBContextValue {
  auth: Auth;
  db: Firestore;
}

export interface UserContextValue {
  userId: string | null;
  profile: UserProfile | null;
  family: Family | null;
  isFetchingProfile: boolean;
  isFetchingFamily: boolean;
  getProfile: () => UserProfile;
  getFamily: () => Family;
}

// ID === user.uid
export interface UserProfile {
  budgetId: string;
  familyId: string;
  firstName: string;
  imgLink: string;
}

export interface Family {
  headOfFamily: string;
  location: { lat: number; long: number };
  members: string[];
  name: string;
  openweathermap_api_key: string;
  gmaps_api_key: string;
  pets: Pet[];
  boardMarkdown: string;
  vehicles: Vehicle[];
  residences: Residence[];
}

export interface Pet {
  name: string;
  imgLink: string;
}

export interface Vehicle {
  id: string;
  img: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  engine: string;
  vin: string;
  licensePlate: string;
  miles: number;
  serviceLogEntries: { date: string; note: string };
  maintenanceMarkers: { mileage: string; maintenanceReq: string };
}

export interface Residence {
  id: string;
  name: string;
  img: string;
  yearBuilt: string;
  yearPurchased: string;
  maintenanceMarkers: { houseAgeYears: number; maintenanceReq: string };
}

// ID === same as docID
export interface Budget {
  name: string;
  id: string;
  monthlyNetIncome: number;
  categories: BudgetCategory[];
  editors: string[];
  savingsBlobs: SavingsBlob[];
  transactions: Transaction[];
}

export interface BudgetCategory {
  name: string;
  subcategories: BudgetSubcategory[];
}

export interface BudgetSubcategory {
  name: string;
  currentSpent: number;
  totalAllotted: number;
}

export interface SavingsBlob {
  name: string;
  currentAmt: number;
  // goalAmt: number;
}

export interface Transaction {
  name: string;
  amt: number;
  category: string;
  subcategory: string;
  timestamp: string;
}
