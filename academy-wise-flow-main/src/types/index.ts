export type Role = "admin" | "teacher" | "student";

export interface Student {
  id: string;
  name: string;
  schoolName: string;
  class: string;
  subjects: "Science" | "Maths" | "Both";
  studentPhone: string;
  parentPhone: string;
  dob: string;
  joiningDate: string;
  totalFee: number;
  paidAmount: number;
  paidPercentage: number;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  assignedClasses: string[];
  totalChapters: number;
  completedChapters: number;
  chaptersPerWeek: number;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  date: string;
  isEmergency: boolean;
}

export interface Feedback {
  id: string;
  studentName: string;
  teacherName: string;
  subject: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  class: string;
  createdBy: string;
  date: string;
}
