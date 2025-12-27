
export enum ScreenName {
  WELCOME = 'WELCOME',
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  LANGUAGE = 'LANGUAGE',
  LOCATION = 'LOCATION',
  MODE_SELECTION = 'MODE_SELECTION',
  AUTH = 'AUTH',
  ENTERPRISE_LOGIN = 'ENTERPRISE_LOGIN',
  CONSUMER_LOGIN = 'CONSUMER_LOGIN',
  GOALS = 'GOALS',
  HEALTH_MODE_SELECT = 'HEALTH_MODE_SELECT',
  MEDICINE = 'MEDICINE',
  MEDICINE_VERIFY = 'MEDICINE_VERIFY',
  PREFERENCES = 'PREFERENCES',
  GENERATING = 'GENERATING',
  PLAN_READY = 'PLAN_READY',
  TODAY = 'TODAY',
  JUNK_FOOD = 'JUNK_FOOD',
  PROGRESS = 'PROGRESS',
  EXPLORE = 'EXPLORE',
  BIO_MECHANISM = 'BIO_MECHANISM',
  UPGRADE = 'UPGRADE',
  BUG_REPORT = 'BUG_REPORT'
}

export enum UserMode {
  CONSUMER = 'CONSUMER',
  CORPORATE = 'CORPORATE',
  CUSTOM = 'CUSTOM'
}

export enum HealthMode {
  GENERAL = 'GENERAL',
  DISEASE_FOCUSED = 'DISEASE_FOCUSED',
  MOLECULE_MATCH = 'MOLECULE_MATCH'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isAudio?: boolean;
}

export interface Ingredient {
  name: string;
  quantity: string;
  calories?: string;
  icon?: string; 
  molecularMatch?: string; 
}

export interface IngredientCheckResult {
  available: string[];
  hardToFind: string[];
  localTip: string;
}

export interface Meal {
  id?: string; 
  title: string;
  description: string;
  reason: string;
  tasteProfile: string; 
  calories?: string; 
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  ingredients?: Ingredient[];
  cookingSteps?: string[];
  outsideOption?: string;
  videoLink?: string; 
  bioActiveTag?: string; 
}

export interface MedicineReminder {
  time: string;
  instruction: string;
}

export interface BioMechanism {
  title: string;
  summary: string;
  visualMetaphor: string; 
  steps: string[]; 
  molecularSynergy?: {
    drugMolecule: string;
    foodMolecule: string;
    matchScore: number; 
    source?: string; 
  }[];
}

export interface DailyPlan {
  focus: string;
  localGreeting?: string; 
  meals: Meal[];
  medicineReminders?: MedicineReminder[];
  advice?: string;
  bioMechanism?: BioMechanism; 
  verifiedSources?: string[]; 
}

export interface GoalOption {
  label: string;
  icon: string; 
}

export interface PrescriptionItem {
  name: string;
  dosage?: string;
  purpose?: string;
  verified: boolean;
  type?: string; 
}

export interface MedicalAnalysis {
  condition: string;
  overview: string;
  items: PrescriptionItem[];
  takeaways?: string[]; 
}

export interface CorporateInsightStruct {
  cultureEmoji: string;
  cultureTitle: string;
  cultureDesc: string;
  weatherEmoji: string;
  weatherTitle: string;
  weatherImpact: string;
  healthRisks: string[];
}

export interface LocalService {
  name: string;
  url?: string;
  description: string;
  rating?: string;
  icon?: string;
  address?: string; 
  googleMapsUri?: string; 
}

export interface WearableData {
  steps: number;
  sleepHours: number;
  sleepScore: number; 
  heartRate: number; 
  hrv: number; 
  lastSync: string;
  deviceType: 'Pixel Watch' | 'Fitbit' | 'Oura' | 'Apple Watch' | 'Health Connect';
}

export interface ProgressMetrics {
  junkCalories: number; 
  caloriesTarget: number;
  waterIntake: number; 
  waterTarget: number;
  lastResetDate: string; 
  completedMealIndices: number[]; 
  medicineTakenIndices: number[]; 
  carriedMeds: boolean; 
  molecularSynergyScore: number; 
  lastHydrationTime?: string; 
  nextHydrationTime?: string; 
}

export interface UserState {
  // Auth State
  uid?: string;
  email?: string;
  isAuthenticated: boolean;
  isLocalGuest: boolean;        // New: Tracks if user is in local-only guest mode
  isPremium: boolean;           // New: Freemium logic
  generationsLeft: number;      // New: Credit logic

  mode: UserMode;
  healthMode: HealthMode; 
  customModeInput?: string; 
  
  // Enterprise Fields
  name?: string;
  companyName?: string;
  jobDomain?: string; 
  corporateInsights?: CorporateInsightStruct | null; 

  goals: string[];
  dietType: string;
  tastePreference: string;
  dislikes?: string;
  
  // Physical Details
  height?: string; 
  weight?: string; 
  age?: string; 
  gender?: string;

  // Health & Medicine
  hasMedicine: boolean;
  medicalCondition?: string; 
  prescriptionImage?: string; 
  prescriptionItems: PrescriptionItem[];
  medicalAnalysis?: MedicalAnalysis | null; 

  availableIngredients?: string; 
  scannedFoodImage?: string; 
  language: string;
  
  // Detailed Location
  country: string;
  state: string;
  city: string;
  
  planGenerationMode: 'STANDARD' | 'LOCAL_SEARCH';

  plan: DailyPlan | null;
  progress: ProgressMetrics; 
  wearableData?: WearableData;
}

export interface JunkFoodAdvice {
  message: string;
  adjustment: string;
  estimatedCalories: number; 
}

export interface LoggedFood {
  id: string;
  name: string;
  time: string;
}

export interface NutritionFact {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  healthCheck: string; 
}

export interface GeneratedRecipe {
  title: string;
  difficulty: string;
  time: string;
  ingredients: string[];
  steps: string[];
}
