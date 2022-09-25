export type GenericObject<T = any> = { [key: string]: T };

export interface UserContextValue {
  userId?: string;
  profile?: UserProfile;
  family?: Family;
  isFetchingProfile: boolean;
  isFetchingFamily: boolean;
  getProfile: () => void;
  getFamily: () => void;
  setFamily: (newFamily: Family) => void;
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
  groceryList: GroceryItem[];
}

export interface Pet {
  name: string;
  imgLink?: string;
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
export interface IBudget {
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

export interface GroceryItem {
  name: string;
  isBought: boolean;
}

export interface BudgetContextValue {
  budget: IBudget;
  moveCategory: (srcIdx: number, destIdx: number) => void;
  moveSubCategory: (srcCat: string, destCat: string, srcIdx: number, destIdx: number) => void;
  setSubCatProperty: (newValue: string | undefined, oldName: string, catName: string, propName: string) => void;
  removeSubCategory: (catName: string, subCatName: string) => void;
  setAddingTransaction: (newIs: boolean) => void;
  setCatSubcatKey: (newCatSubcatKey: string) => void;
  setCategoryName: (newName: string | undefined, curCatName: string) => void;
  addNewSubCategory: (catName: string) => void;
  removeCategory: (catName: string) => void;
}

export interface SnackbarData {
  msg: string;
  severity: 'error' | 'warning' | 'info' | 'success';
}

export interface AppContextValue {
  setSnackbarData: (snackbarData: SnackbarData | undefined) => void;
}
