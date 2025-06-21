import { arrayUnion, doc, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { getNewBudgetTemplate } from './constants';
import { FsCol, db, storage } from './firebase';
import { Family, IBudget, Profile, Residence, Vehicle } from './models/types';
import { genUuid } from './utils/utils';

class Client {
    static async uploadImageAndGetUrl(imgFile: File) {
        const storageObject = await uploadBytes(ref(storage, genUuid()), imgFile);
        const url = await getDownloadURL(storageObject.ref);

        return url;
    }

    static async updateProfile(profileId: string, data: Partial<Profile>) {
        return updateDoc(doc(db, FsCol.Profiles, profileId), data);
    }

    static async updateFamily(familyId: string, data: Partial<Family>) {
        return updateDoc(doc(db, FsCol.Families, familyId), data);
    }

    static async updateBudget(budgetId: string, data: Partial<IBudget>) {
        return updateDoc(doc(db, FsCol.Budgets, budgetId), data);
    }

    static async updateVehicle(vehicleId: string, data: Partial<Vehicle>) {
        return updateDoc(doc(db, FsCol.Vehicles, vehicleId), data);
    }

    static async updateResidence(residenceId: string, data: Partial<Residence>) {
        return updateDoc(doc(db, FsCol.Residences, residenceId), data);
    }

    static async leaveFamily(userId: string, familyId: string, family: Family) {
        const batch = writeBatch(db);

        const newMembers = family.members.filter((member) => member !== userId);

        // Make first member in family new headOfFamily (if curUser is hoF)
        const updatedFamily: Partial<Family> = { members: newMembers };
        if (family.headOfFamily === userId) {
            updatedFamily.headOfFamily = newMembers[0];
        }

        batch.update(doc(db, FsCol.Families, familyId), updatedFamily);
        batch.update(doc(db, FsCol.Profiles, userId), { familyId: '' });

        return batch.commit();
    }

    static async deleteFamily(userId: string, familyId: string, family: Family) {
        const batch = writeBatch(db);

        // Set each profile in family.members familyId property to ''
        family.members.forEach((member) => {
            batch.update(doc(db, FsCol.Profiles, member), { familyId: '' });
        });

        // Delete residences and vehicles
        family.residences.forEach((resId) => {
            batch.delete(doc(db, FsCol.Residences, resId));
        });

        family.vehicles.forEach((vehId) => {
            batch.delete(doc(db, FsCol.Vehicles, vehId));
        });

        // Delete family doc
        batch.delete(doc(db, FsCol.Families, familyId));
        batch.update(doc(db, FsCol.Profiles, userId), { familyId: '' });

        return batch.commit();
    }

    static async deleteResidence(family: Family, residenceId: string) {
        const batch = writeBatch(db);

        const newResIdArr = family.residences.filter((res) => res !== residenceId);

        batch.update(doc(db, FsCol.Families, family.uid), { residences: newResIdArr });
        batch.delete(doc(db, FsCol.Residences, residenceId));

        return batch.commit();
    }

    static async deleteVehicle(family: Family, vehicleId: string) {
        const batch = writeBatch(db);

        const newVehIdArr = family.vehicles.filter((res) => res !== vehicleId);

        batch.update(doc(db, FsCol.Families, family.uid), { vehicles: newVehIdArr });
        batch.delete(doc(db, FsCol.Vehicles, vehicleId));

        return batch.commit();
    }

    static async deleteImage(imgLink: string) {
        const imgRef = ref(storage, imgLink);
        return deleteObject(imgRef);
    }

    static async createNewBudget(userId: string, familyId: string) {
        const batch = writeBatch(db);

        const newBudgetTemplate = getNewBudgetTemplate(userId);

        batch.update(doc(db, FsCol.Families, familyId), { budgetId: newBudgetTemplate.uid });
        batch.set(doc(db, FsCol.Budgets, newBudgetTemplate.uid), newBudgetTemplate);

        return batch.commit();
    }

    static async createNewResidence(familyId: string, family: Family, newResidence: Residence) {
        const batch = writeBatch(db);

        const newResIdArr: string[] = [];
        if (family.residences) {
            newResIdArr.push(...family.residences);
        }
        newResIdArr.push(newResidence.uid);

        batch.set(doc(db, FsCol.Residences, newResidence.uid), newResidence);
        batch.update(doc(db, FsCol.Families, familyId), {
            residences: newResIdArr,
        });

        return batch.commit();
    }

    static async createNewVehicle(familyId: string, family: Family, newVehicle: Vehicle) {
        const batch = writeBatch(db);

        const newVehIdArr: string[] = [];
        if (family.vehicles) {
            newVehIdArr.push(...family.vehicles);
        }
        newVehIdArr.push(newVehicle.uid);

        batch.set(doc(db, FsCol.Vehicles, newVehicle.uid), newVehicle);
        batch.update(doc(db, FsCol.Families, familyId), {
            vehicles: newVehIdArr,
        });

        return batch.commit();
    }

    static async createNewFamily(userId: string, family: Family) {
        const batch = writeBatch(db);

        batch.set(doc(db, FsCol.Families, family.uid), family);
        batch.update(doc(db, FsCol.Profiles, userId), { familyId: family.uid });

        return batch.commit();
    }

    static async createNewProfile(newProfile: Profile) {
        return setDoc(doc(db, FsCol.Profiles, newProfile.uid), newProfile);
    }

    static async addUserToFamily(userId: string, familyId: string) {
        const batch = writeBatch(db);

        batch.update(doc(db, FsCol.Families, familyId), { members: arrayUnion(userId) });
        batch.update(doc(db, FsCol.Profiles, userId), { familyId });

        return batch.commit();
    }
}

export default Client;
