export interface Student {
    id: string;
    name: string;
    grade: string;
    attendance: string;
    nextPayment: string;
    amount: string;
    avatar: string;
    gradeData: {
      labels: string[];
      datasets: { data: number[] }[];
    };
    subjects: {
      name: string;
      grade: string;
      percentage: number;
    }[];
    homework: {
      subject: string;
      title: string;
      dueDate: string;
      status: string;
    }[];
  }
  
  export interface User {
    uid: string;
    email: string;
    displayName?: string;
  }