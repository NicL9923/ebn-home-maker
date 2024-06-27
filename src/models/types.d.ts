// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type GenericObject<T = any> = { [key: string]: T };

// ID === user.uid
export interface Profile {
  uid: string;
  familyId: string;
  firstName: string;
  imgLink?: string;
}

export interface FamilySettings {
  showAllTransactionsOnCurrentMonth?: boolean;
}

export interface Family {
  uid: string;
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
  settings: FamilySettings;
}

export interface Pet {
  uid: string;
  name: string;
  imgLink?: string;
}

export interface ServiceLogEntry {
  uid: string;
  date: string;
  note: string;
}

export interface Vehicle {
  uid: string;
  img?: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  engine: string;
  vin: string;
  licensePlate: string;
  miles: number;
  fuelCapacity: string;
  serviceLogEntries: ServiceLogEntry[];
  maintenanceMarkers: { mileage: string; maintenanceReq: string }[];
}

export interface Residence {
  uid: string;
  name: string;
  img?: string;
  yearBuilt: string;
  yearPurchased: string;
  serviceLogEntries: ServiceLogEntry[];
  maintenanceMarkers: { houseAgeYears: number; maintenanceReq: string }[];
}

export interface IBudget {
  uid: string;
  monthlyNetIncome: number;
  categories: BudgetCategory[];
  editors: string[];
  savingsBlobs: SavingsBlob[];
  transactions: Transaction[];
  totalSpent?: number;
  totalAllotted?: number;
}

export interface BudgetCategory {
  uid: string;
  name: string;
  subcategories: BudgetSubcategory[];
  currentSpent?: number;
  totalAllotted?: number;
}

export interface BudgetSubcategory {
  uid: string;
  name: string;
  currentSpent: number;
  totalAllotted: number;
}

export interface SavingsBlob {
  uid: string;
  name: string;
  currentAmt: number;
  // goalAmt: number;
}

export interface Transaction {
  uid: string;
  name: string;
  amt: number;
  category: string;
  subcategory: string;
  timestamp: string;
}

export interface GroceryItem {
  uid: string;
  name: string;
  isBought: boolean;
}

export interface BudgetContextValue {
  budget: IBudget;
  moveCategory: (srcIdx: number, destIdx: number) => void;
  moveSubCategory: (srcCat: string, destCat: string, srcIdx: number, destIdx: number) => void;
  setSubCatProperty: (newValue: string | undefined, oldName: string, catName: string, propName: string) => void;
  setAddingTransaction: (newIs: boolean) => void;
  setCatSubcatKey: (newCatSubcatKey: string) => void;
  setCategoryName: (newName: string | undefined, curCatName: string) => void;
  addNewSubCategory: (catName: string) => void;
  setItemToRemove: (item: [string, string | undefined]) => void; // [catName, subcatName]
}
