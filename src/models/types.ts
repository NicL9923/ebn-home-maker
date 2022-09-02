export type GenericObject<T = any> = { [key: string]: T };

export interface UserContextValue {
  userId?: string;
  profile?: UserProfile;
  family?: Family;
  isFetchingProfile: boolean;
  isFetchingFamily: boolean;
  getProfile: () => void;
  getFamily: () => void;
}

// ID === user.uid
export interface UserProfile {
  familyId: string;
  firstName: string;
  imgLink?: string;
}

export interface Family {
  headOfFamily: string;
  location?: { lat: string; long: string };
  budgetId?: string;
  members: string[];
  name: string;
  openweathermap_api_key?: string;
  gmaps_api_key?: string;
  pets: Pet[];
  boardMarkdown: string;
  vehicles: string[]; // IDs
  residences: string[]; // IDs
}

export interface Pet {
  name: string;
  imgLink: string;
}

export interface Vehicle {
  id: string;
  img?: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  engine: string;
  vin: string;
  licensePlate: string;
  miles: number;
  serviceLogEntries: { date: string; note: string }[];
  maintenanceMarkers: { mileage: string; maintenanceReq: string }[];
}

export interface Residence {
  id: string;
  name: string;
  img?: string;
  yearBuilt: string;
  yearPurchased: string;
  serviceLogEntries: { date: string; note: string }[];
  maintenanceMarkers: { houseAgeYears: number; maintenanceReq: string }[];
}

// ID === same as docID
export interface BudgetIF {
  name: string;
  id: string;
  monthlyNetIncome: number;
  categories: BudgetCategory[];
  editors: string[];
  savingsBlobs: SavingsBlob[];
  transactions: Transaction[];
  totalSpent?: number;
  totalAllotted?: number;
}

export interface BudgetCategory {
  name: string;
  subcategories: BudgetSubcategory[];
  currentSpent?: number;
  totalAllotted?: number;
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
  id?: number;
  name: string;
  amt: number;
  category: string;
  subcategory: string;
  timestamp: string;
}
