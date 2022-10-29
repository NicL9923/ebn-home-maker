export type GenericObject<T = any> = { [key: string]: T };

// ID === user.uid
export interface UserProfile {
  familyId: string;
  firstName: string;
  imgLink?: string;
}

export interface Family {
  headOfFamily: string;
  budgetId?: string;
  members: string[];
  name: string;
  pets: Pet[];
  boardMarkdown: string;
  vehicles: string[]; // IDs
  residences: string[]; // IDs
  groceryList: GroceryItem[];
  cityState: string; // Format: 'cityName,stateCode'
}

export interface Pet {
  name: string;
  imgLink?: string;
}

export interface ServiceLogEntry {
  date: string;
  note: string;
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
  serviceLogEntries: ServiceLogEntry[];
  maintenanceMarkers: { mileage: string; maintenanceReq: string }[];
}

export interface Residence {
  id: string;
  name: string;
  img?: string;
  yearBuilt: string;
  yearPurchased: string;
  serviceLogEntries: ServiceLogEntry[];
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
