export interface Patient {
  id: string;
  therapistId: string;
  personalInfo: PersonalInfo;
  medicalInfo: MedicalInfo;
  customParameters: Record<string, any>;
  sessionIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  contactInfo: ContactInfo;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface MedicalInfo {
  diagnosis: string;
  medications: string[];
  allergies: string[];
  notes: string;
  medicalHistory: MedicalRecord[];
}

export interface MedicalRecord {
  date: Date;
  type: 'diagnosis' | 'treatment' | 'medication' | 'note';
  description: string;
  provider: string;
}

export interface CreatePatientRequest {
  personalInfo: Omit<PersonalInfo, 'id'>;
  medicalInfo: Omit<MedicalInfo, 'medicalHistory'>;
  customParameters?: Record<string, any>;
}

export interface UpdatePatientRequest {
  personalInfo?: Partial<PersonalInfo>;
  medicalInfo?: Partial<MedicalInfo>;
  customParameters?: Record<string, any>;
}

export interface PatientFilters {
  search?: string;
  gender?: string;
  ageRange?: [number, number];
  diagnosis?: string;
  therapistId?: string;
  dateRange?: [Date, Date];
}

export interface PatientService {
  createPatient(patient: CreatePatientRequest): Promise<Patient>;
  updatePatient(id: string, updates: UpdatePatientRequest): Promise<Patient>;
  deletePatient(id: string): Promise<void>;
  getPatients(filters?: PatientFilters): Promise<Patient[]>;
  getPatientById(id: string): Promise<Patient>;
}