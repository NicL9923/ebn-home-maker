import { getAuth, Auth } from 'firebase/auth';
import { deleteDoc, doc, FieldValue, Firestore, getDoc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import { IBudget, Family, GenericObject, Residence, UserProfile, Vehicle } from 'models/types';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: 'our-home-239c1.firebaseapp.com',
  projectId: 'our-home-239c1',
  storageBucket: 'our-home-239c1.appspot.com',
  messagingSenderId: '613377018757',
  appId: '1:613377018757:web:ebbb3c902c79b01aabd2ec',
};

export enum DocTypes {
  budget = 'budgets',
  family = 'families',
  profile = 'profiles',
  residence = 'residences',
  vehicle = 'vehicles',
}

// The idea of this is to hide all the ~slight~ extra syntax and to ~slightly~ abstract things
// - With how common these functions are used, it'll massively increase legibility, and centralize things
export class FirebaseManager {
  auth: Auth;
  db: Firestore;

  constructor() {
    this.auth = getAuth();
    this.db = getFirestore();
  }

  // Document Reference
  getDocRef(docType: DocTypes, docId: string) {
    return doc(this.db, docType, docId);
  }

  // Core Document CRUD ops - Get/Create+Overwrite/Update/Delete
  getDocument(docType: DocTypes, docId: string) {
    return getDoc(this.getDocRef(docType, docId));
  }
  createDocument(docType: DocTypes, docId: string, docData: GenericObject) {
    return setDoc(this.getDocRef(docType, docId), docData);
  }
  overwriteDocument(docType: DocTypes, docId: string, docData: GenericObject) {
    return this.createDocument(docType, docId, docData);
  }
  updateDocumentFields(docType: DocTypes, docId: string, data: GenericObject) {
    return updateDoc(this.getDocRef(docType, docId), data);
  }
  deleteDocument(docType: DocTypes, docId: string) {
    return deleteDoc(this.getDocRef(docType, docId));
  }

  // GET
  getBudget(budgetId: string) {
    return this.getDocument(DocTypes.budget, budgetId);
  }
  getFamily(familyId: string) {
    return this.getDocument(DocTypes.family, familyId);
  }
  getProfile(profileId: string) {
    return this.getDocument(DocTypes.profile, profileId);
  }
  getVehicle(vehicleId: string) {
    return this.getDocument(DocTypes.vehicle, vehicleId);
  }
  getResidence(residenceId: string) {
    return this.getDocument(DocTypes.residence, residenceId);
  }

  // CREATE
  createBudget(budgetId: string, budget: IBudget) {
    return this.createDocument(DocTypes.budget, budgetId, budget);
  }
  createFamily(familyId: string, family: Family) {
    return this.createDocument(DocTypes.family, familyId, family);
  }
  createProfile(profileId: string, profile: UserProfile) {
    return this.createDocument(DocTypes.profile, profileId, profile);
  }
  createVehicle(vehicleId: string, vehicle: Vehicle) {
    return this.createDocument(DocTypes.vehicle, vehicleId, vehicle);
  }
  createResidence(residenceId: string, residence: Residence) {
    return this.createDocument(DocTypes.residence, residenceId, residence);
  }

  // UPDATE
  updateBudget(budgetId: string, fieldData: Partial<IBudget>) {
    return this.updateDocumentFields(DocTypes.budget, budgetId, fieldData);
  }
  updateFamily(familyId: string, fieldData: Partial<Family> | GenericObject<FieldValue>) {
    return this.updateDocumentFields(DocTypes.family, familyId, fieldData);
  }
  updateProfile(profileId: string, fieldData: Partial<UserProfile>) {
    return this.updateDocumentFields(DocTypes.profile, profileId, fieldData);
  }
  updateVehicle(vehicleId: string, fieldData: Partial<Vehicle>) {
    return this.updateDocumentFields(DocTypes.vehicle, vehicleId, fieldData);
  }
  updateResidence(residenceId: string, fieldData: Partial<Residence>) {
    return this.updateDocumentFields(DocTypes.residence, residenceId, fieldData);
  }

  // DELETE
  deleteBudget(budgetId: string) {
    return this.deleteDocument(DocTypes.budget, budgetId);
  }
  deleteFamily(familyId: string) {
    return this.deleteDocument(DocTypes.family, familyId);
  }
  deleteProfile(profileId: string) {
    return this.deleteDocument(DocTypes.profile, profileId);
  }
  deleteVehicle(vehicleId: string) {
    return this.deleteDocument(DocTypes.vehicle, vehicleId);
  }
  deleteResidence(residenceId: string) {
    return this.deleteDocument(DocTypes.residence, residenceId);
  }
}
