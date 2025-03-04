export interface Student {
    id: string;
    name: string;
    grade: string;
    guardian_id: string;
    address: string;
    attendancePorcentage: string;
    phone: string;
    nextPayment: string;
    tuition: string;
    gpa: number;
    term: string;
    avatar: string;
    email: string;
    grades: number;
    gradeData: {
      labels: string[];
      datasets: { data: number[] }[];
    };
    subjectGrade: {
      name: string;
      grade: string;
      percentage: number;
    }[];
    homeworks: {
      id: string;
      subject: string;
      title: string;
      dueDate: string;
      status: string;
    }[];
    schoolInformation: {
      title: string;
      time: string;
      location: string;
      date: string;
    }
  }
  
  export interface User {
    uid: string;
    email: string;
    displayName?: string;
  }