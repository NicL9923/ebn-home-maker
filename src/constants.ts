import { Family, IBudget, Profile, Residence, Vehicle } from "./models/types";
import { genUuid } from "./utils/utils";

export const FieldTypes = {
  Email: {
    name: 'email',
    regex: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, // Has only one @, and >0 chars before @ and before/after the period + eliminate whitespaces
    valErrMsg: 'Please provide a valid email',
  },
  Password: {
    name: 'password',
    regex: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, // >=8 chars + >0 letter and number
    valErrMsg: 'Password must be a minimum of eight characters, and contain at least one letter and number',
  },
  EntityName: {
    name: 'entityName',
    regex: /^[\s\S]{1,50}$/, // Any (whitespace/non-whitespace) characters, 1-50 chars
    valErrMsg: 'Entity names have a max length of 50 characters',
  },
  // Must be unique
  ItemName: {
    name: 'itemName',
    regex: /^[\s\S]{1,100}$/, // Any (whitespace/non-whitespace) characters, 1-100 chars
    valErrMsg: 'Item names have a max length of 100 characters',
  },
  DecimalNum: {
    name: 'decimalNum',
    regex: /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/, // Optional sign, optional decimal, numbers only *Note: will accept just a period or sign, so handle that too
    valErrMsg: 'Numerical values can only contain numbers, decimals, and signs',
  },
};

export const ValidationErrorMsgs = {
  Empty: 'Field cannot be empty',
  ItemNameUnique: 'Item names must be unique',
};

const openWeatherMapOneCallApiVersion = '2.5';
export const openWeatherMapOneCallApiBaseUrl = `https://api.openweathermap.org/data/${openWeatherMapOneCallApiVersion}/onecall`;
const openWeatherMapGeocodeApiVersion = '1.0';
export const openWeatherMapGeocodeApiBaseUrl = `https://api.openweathermap.org/geo/${openWeatherMapGeocodeApiVersion}/direct`;
export const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const getNewBudgetTemplate = (userId: string): IBudget => ({
  uid: genUuid(),
  editors: [userId],
  monthlyNetIncome: 3000,
  categories: [
    {
      uid: genUuid(),
      name: 'Essentials',
      subcategories: [
        {
          uid: genUuid(),
          name: 'Rent',
          totalAllotted: 1250,
          currentSpent: 0,
        },
        {
          uid: genUuid(),
          name: 'Utilities',
          totalAllotted: 300,
          currentSpent: 0,
        },
      ],
    },
    {
      uid: genUuid(),
      name: 'Lifestyle',
      subcategories: [
        {
          uid: genUuid(),
          name: 'Spending',
          totalAllotted: 300,
          currentSpent: 0,
        },
      ],
    },
  ],
  savingsBlobs: [{ uid: genUuid(), name: 'Default Blob', currentAmt: 1000 }],
  transactions: [
    {
      uid: genUuid(),
      name: 'Default transaction',
      amt: 10,
      category: 'Essentials',
      subcategory: 'Rent',
      timestamp: Date.now().toString(),
    },
  ],
});

export const getNewResidenceTemplate = (name: string, yearBuilt: string, yearPurchased: string): Residence => ({
  uid: genUuid(),
  name,
  yearBuilt,
  yearPurchased,
  maintenanceMarkers: [],
  serviceLogEntries: [],
});

export const getNewVehicleTemplate = (year: string, make: string, model: string, trim: string, engine: string, vin: string, licensePlate: string, miles: number, fuelCapacity: string): Vehicle => ({
  uid: genUuid(),
  year,
  make,
  model,
  trim,
  engine,
  vin,
  licensePlate,
  miles,
  fuelCapacity,
  maintenanceMarkers: [],
  serviceLogEntries: [],
});

export const getNewFamilyTemplate = (name: string, userId: string): Family => ({
  uid: genUuid(),
  name,
  headOfFamily: userId,
  members: [userId],
  boardMarkdown: 'This is the family board!',
  pets: [],
  vehicles: [],
  residences: [],
  groceryList: [],
  cityState: 'Seattle,WA', // This'll be the default, because why not!
  settings: {
    showAllTransactionsOnCurrentMonth: false,
  },
});

export const getNewProfileTemplate = (userId: string, name: string): Profile => ({ uid: userId, firstName: name, familyId: '' });
