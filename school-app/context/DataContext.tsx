import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where,  
} from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { Student, User } from '../types/student';
import { students } from '@/app/data/student';



interface AppState {
  currentStudent: Student | null;
  students: Student[];
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Student actions
  setCurrentStudent: (student: Student) => void;
  fetchStudents: () => Promise<void>;
  fetchStudentById: (id: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  currentStudent: null,
  students: [],
  user: null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user's students from Firestore
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('guardian_id', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const students: Student[] = [];
      querySnapshot.forEach((doc) => {
        students.push({ id: doc.id, ...doc.data() } as Student);
      });

      set({ 
        user: {
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName || undefined
        },
        students,
        currentStudent: students[0] || null,
        isLoading: false 
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  register: async (email: string, password: string, name: string) => {
    try {
      set({ isLoading: true, error: null });
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      set({ 
        user: {
          uid: user.uid,
          email: user.email!,
          displayName: name
        },
        isLoading: false 
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      await signOut(auth);
      set({ 
        user: null, 
        currentStudent: null,
        students: [],
        isLoading: false 
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setCurrentStudent: (student: Student) => {
    set({ currentStudent: student });
  },

  // fetchStudents function adjusted for clarity
fetchStudents: async () => {
  try {
    const { user } = get();
    if (!user) return;

    set({ isLoading: true, error: null });
    
    const studentsRef = collection(db, 'students');
    const q = query(studentsRef, where('guardian_id', '==', user.uid));
    
    // Use async/await consistently
    const querySnapshot = await getDocs(q);
    
    // Simplify array creation using map()
    const students: Student[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }) as Student);
    
    set({ students, isLoading: false });
  } catch (error) {
    set({ error: (error as Error).message, isLoading: false });
  }
},


  fetchStudentById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const studentRef = doc(db, 'students', id);
      const studentDoc = await getDoc(studentRef);
      
      if (studentDoc.exists()) {
        const student = { id: studentDoc.id, ...studentDoc.data() } as Student;
        set({ currentStudent: student, isLoading: false });
      } else {
        set({ error: 'Student not found', isLoading: false });
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  }
}));