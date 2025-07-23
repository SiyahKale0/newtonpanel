import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Patient, 
  CreatePatientRequest, 
  UpdatePatientRequest, 
  PatientFilters, 
  PatientService 
} from '@/types/patient';

class PatientServiceImpl implements PatientService {
  private readonly collection = 'patients';

  async createPatient(patientData: CreatePatientRequest): Promise<Patient> {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, this.collection), {
        ...patientData,
        sessionIds: [],
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      });

      const patient: Patient = {
        id: docRef.id,
        therapistId: '', // Will be set by auth context
        personalInfo: patientData.personalInfo,
        medicalInfo: {
          ...patientData.medicalInfo,
          medicalHistory: []
        },
        customParameters: patientData.customParameters || {},
        sessionIds: [],
        createdAt: now,
        updatedAt: now
      };

      return patient;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw new Error('Failed to create patient');
    }
  }

  async updatePatient(id: string, updates: UpdatePatientRequest): Promise<Patient> {
    try {
      const docRef = doc(db, this.collection, id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      };

      await updateDoc(docRef, updateData);
      
      const updatedDoc = await getDoc(docRef);
      if (!updatedDoc.exists()) {
        throw new Error('Patient not found after update');
      }

      const data = updatedDoc.data();
      return {
        id: updatedDoc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Patient;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw new Error('Failed to update patient');
    }
  }

  async deletePatient(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collection, id));
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw new Error('Failed to delete patient');
    }
  }

  async getPatients(filters?: PatientFilters): Promise<Patient[]> {
    try {
      let q = query(collection(db, this.collection));

      if (filters?.therapistId) {
        q = query(q, where('therapistId', '==', filters.therapistId));
      }

      if (filters?.gender) {
        q = query(q, where('personalInfo.gender', '==', filters.gender));
      }

      if (filters?.diagnosis) {
        q = query(q, where('medicalInfo.diagnosis', '==', filters.diagnosis));
      }

      q = query(q, orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);
      const patients: Patient[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        patients.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Patient);
      });

      return this.applyClientSideFilters(patients, filters);
    } catch (error) {
      console.error('Error getting patients:', error);
      throw new Error('Failed to get patients');
    }
  }

  async getPatientById(id: string): Promise<Patient> {
    try {
      const docRef = doc(db, this.collection, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Patient not found');
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Patient;
    } catch (error) {
      console.error('Error getting patient:', error);
      throw new Error('Failed to get patient');
    }
  }

  private applyClientSideFilters(patients: Patient[], filters?: PatientFilters): Patient[] {
    if (!filters) return patients;

    let filtered = patients;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(patient => 
        patient.personalInfo.firstName.toLowerCase().includes(searchTerm) ||
        patient.personalInfo.lastName.toLowerCase().includes(searchTerm) ||
        patient.medicalInfo.diagnosis.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.ageRange) {
      const [minAge, maxAge] = filters.ageRange;
      filtered = filtered.filter(patient => {
        const age = this.calculateAge(patient.personalInfo.dateOfBirth);
        return age >= minAge && age <= maxAge;
      });
    }

    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange;
      filtered = filtered.filter(patient => 
        patient.createdAt >= startDate && patient.createdAt <= endDate
      );
    }

    return filtered;
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}

export const patientService = new PatientServiceImpl();