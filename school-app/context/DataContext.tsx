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
  subjectGrade: { [key: string]: any; id: string; }[]
  homeworks: Student[];
  
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Student actions
  setCurrentStudent: (student: Student) => void;
  fetchStudents: () => Promise<void>;
  fetchStudentById: (id: string) => Promise<void>;
  fetchSubjectGrades: (id: string) => Promise<void>;
  fetchHomework: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  currentStudent: null,
  students: [],
  user: null,
  isLoading: false,
  error: null,
  subjectGrade: [],
  homeworks: [],

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user's students from Firestore     
      const students: Student[] = []; 

      const querySnap = await getDocs(collection(db, "students"));
      querySnap.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        const studentRef = doc.data();
        const guardianRef = studentRef['guardian_id'];
        if(guardianRef) {
          if(typeof guardianRef === 'object' && guardianRef !== null) {
            const pathSegment = guardianRef._key.path.segments[6];

            if(pathSegment === user.uid) {
              students.push({id: doc.id, ...studentRef} as Student)
            }
          }
        }
       
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
      if (!user || !user.uid) {
        set({ error: 'User not authenticated', isLoading: false });
        return;
      }
  

      const students: any[] = [];
      
      const querySnap = await getDocs(collection(db, "students"));
      querySnap.forEach((doc) => {
        const studentRef = doc.data();
        const guardianRef = studentRef['guardian_id'];
        if(guardianRef) {
          if(typeof guardianRef === 'object' && guardianRef !== null) {
            const pathSegment = guardianRef._key.path.segments[6];

            if(pathSegment === user.uid) {
              students.push({id: doc.id, ...studentRef})
            }
          }
        }
       
      });
   
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
  },

  fetchSubjectGrades: async (id: string) => {
    try {
      const studentDoc = await getDoc(doc(db, "students", id)); // Fetch the specific student document
      if (studentDoc.exists()) {
        const studentData = studentDoc.data();
        const grades = studentData.grades; // Extract the grades object
  
        // Transform the grades object into an array of objects
        const gradesData = Object.entries(grades).map(([subjectName, grade], index) => ({
          id: `${id}-${index}`, // Unique ID for each grade
          subjectName,
          grade,
        }));
  
        set({ subjectGrade: gradesData, isLoading: false });
      } else {
        set({ error: "Student not found", isLoading: false });
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchHomework: async() => {
    try{     
      const homework: any[] = [];
      
      const homeworkSnap = await getDocs(collection(db, "homework"));
      homeworkSnap.forEach((doc) => {
        const homeworkRef = doc.data();
        const homeworkId = doc.id;

        homework.push({ id: homeworkId, ...homeworkRef });
      });

      set({ homeworks: homework, isLoading: false });

    } catch(err) {
      set({error : (err as Error).message, isLoading: false});
    }
  }

}));