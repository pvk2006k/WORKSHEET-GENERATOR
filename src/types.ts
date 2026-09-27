export interface Question {
  id: number;
  type: 'multiple-choice' | 'fill-in-blank' | 'true-false' | 'match' | 'one-liner';
  question: string;
  imageUrl?: string;
  options?: string[];
  matchColumnA?: string[];
  matchColumnB?: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

export interface QuestionDistribution {
  trueFalse: number;
  mcq: number;
  oneLiner: number;
  matching: number;
  fillBlanks: number;
}

export interface WorksheetData {
  title: string;
  practiceSetId: string;
  className: string;
  subject: string;
  topic: string;
  totalMarks: number;
  timeAllowed: string;
  instructions: string[];
  questions: Question[];
}

export interface WorksheetForm {
  className: string;
  topic: string;
  studentName: string;
  numberOfQuestions: number;
  practiceSetId: string;
  distribution: QuestionDistribution;
}
