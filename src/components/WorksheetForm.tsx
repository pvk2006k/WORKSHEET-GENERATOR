import { useState } from 'react';
import { BookOpen, GraduationCap, PenTool, Hash } from 'lucide-react';

interface WorksheetFormProps {
  onGenerate: (className: string, topic: string, numQuestions: number, name: string, practiceSetId: string) => void;
}

const classes = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12'
];

const subjects = [
  'Mathematics', 'Science', 'English', 'General Knowledge',
  'Physics', 'Chemistry', 'Biology', 'History', 'Geography'
];

export default function WorksheetForm({ onGenerate }: WorksheetFormProps) {
  const [className, setClassName] = useState('');
  const [topic, setTopic] = useState('');
  const [studentName, setStudentName] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [practiceSetId, setPracticeSetId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className || !topic) return;
    onGenerate(className, topic, numQuestions, studentName || 'Student', practiceSetId);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-purple-100 p-8 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-100/50 to-transparent rounded-bl-full"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100/50 to-transparent rounded-tr-full"></div>
      
      <div className="space-y-6 relative z-10">
        {/* Student Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <PenTool className="w-4 h-4 text-purple-500" />
            Student Name (Optional)
          </label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Enter student name"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-gray-700"
          />
        </div>

        {/* Practice Set ID */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Hash className="w-4 h-4 text-purple-500" />
            Practice Set ID (Optional)
          </label>
          <input
            type="text"
            value={practiceSetId}
            onChange={(e) => setPracticeSetId(e.target.value)}
            placeholder="e.g., MATH-001, SCI-PRACTICE-5, etc."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-gray-700"
          />
          <p className="text-xs text-gray-400 mt-1">
            Leave blank to auto-generate, or enter your own custom ID
          </p>
        </div>

        {/* Class Selection */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <GraduationCap className="w-4 h-4 text-purple-500" />
            Select Class *
          </label>
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-gray-700 bg-white"
            required
          >
            <option value="">-- Select Class --</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        {/* Subject Quick Select */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <BookOpen className="w-4 h-4 text-purple-500" />
            Quick Subject Select
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {subjects.map(sub => (
              <button
                key={sub}
                type="button"
                onClick={() => setTopic(sub)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  topic === sub 
                    ? 'bg-purple-500 text-white shadow-md' 
                    : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Topic Input */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <BookOpen className="w-4 h-4 text-purple-500" />
            Topic / Subject *
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Addition, Photosynthesis, Grammar, Plants, Fractions..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-gray-700"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            Tip: Be specific for better results. E.g., "Multiplication tables", "Parts of a plant", "Nouns and verbs"
          </p>
        </div>

        {/* Number of Questions */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Hash className="w-4 h-4 text-purple-500" />
            Number of Questions
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="5"
              max="20"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              className="flex-1 h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <span className="w-12 h-10 flex items-center justify-center bg-purple-100 text-purple-700 font-bold rounded-lg">
              {numQuestions}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          ✨ Generate Worksheet with AI
        </button>
      </div>
    </form>
  );
}
