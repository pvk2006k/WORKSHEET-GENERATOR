import { useState } from 'react';
import { BookOpen, GraduationCap, PenTool, Hash, LayoutGrid } from 'lucide-react';
import { QuestionDistribution } from '../types';

interface WorksheetFormProps {
  onGenerate: (className: string, topic: string, numQuestions: number, name: string, practiceSetId: string, distribution: QuestionDistribution) => void;
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
  const [practiceSetId, setPracticeSetId] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  
  // Question distribution
  const [trueFalse, setTrueFalse] = useState(2);
  const [mcq, setMcq] = useState(3);
  const [oneLiner, setOneLiner] = useState(2);
  const [matching, setMatching] = useState(1);
  const [fillBlanks, setFillBlanks] = useState(2);

  const totalDistribution = trueFalse + mcq + oneLiner + matching + fillBlanks;
  const isDistributionValid = totalDistribution === numQuestions;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className || !topic) return;
    if (!isDistributionValid) {
      alert(`Total question distribution (${totalDistribution}) must equal number of questions (${numQuestions})`);
      return;
    }
    
    const distribution: QuestionDistribution = {
      trueFalse,
      mcq,
      oneLiner,
      matching,
      fillBlanks
    };
    
    onGenerate(className, topic, numQuestions, studentName, practiceSetId, distribution);
  };

  // Auto-adjust distribution when numQuestions changes
  const handleNumQuestionsChange = (value: number) => {
    setNumQuestions(value);
    // Proportionally adjust distribution
    const ratio = value / totalDistribution;
    if (ratio !== 1) {
      setTrueFalse(Math.round(trueFalse * ratio));
      setMcq(Math.round(mcq * ratio));
      setOneLiner(Math.round(oneLiner * ratio));
      setMatching(Math.round(matching * ratio));
      setFillBlanks(Math.round(fillBlanks * ratio));
    }
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
            placeholder="Leave blank for student to fill"
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
            placeholder="e.g., MATH-001, SCI-PRACTICE-5"
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
        </div>

        {/* Number of Questions */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Hash className="w-4 h-4 text-purple-500" />
            Total Number of Questions
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="5"
              max="30"
              value={numQuestions}
              onChange={(e) => handleNumQuestionsChange(parseInt(e.target.value))}
              className="flex-1 h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <span className="w-12 h-10 flex items-center justify-center bg-purple-100 text-purple-700 font-bold rounded-lg">
              {numQuestions}
            </span>
          </div>
        </div>

        {/* Question Distribution */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border-2 border-purple-200">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-4">
            <LayoutGrid className="w-4 h-4 text-purple-600" />
            Question Type Distribution
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {/* True/False */}
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-green-700">✅ True/False</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">{trueFalse}</span>
              </div>
              <input
                type="range"
                min="0"
                max={numQuestions}
                value={trueFalse}
                onChange={(e) => setTrueFalse(parseInt(e.target.value))}
                className="w-full h-1.5 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
            </div>

            {/* MCQs */}
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-700">🔘 MCQs</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{mcq}</span>
              </div>
              <input
                type="range"
                min="0"
                max={numQuestions}
                value={mcq}
                onChange={(e) => setMcq(parseInt(e.target.value))}
                className="w-full h-1.5 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Fill in the Blanks */}
            <div className="bg-white rounded-lg p-3 border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-yellow-700">✍️ Fill in Blanks</span>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">{fillBlanks}</span>
              </div>
              <input
                type="range"
                min="0"
                max={numQuestions}
                value={fillBlanks}
                onChange={(e) => setFillBlanks(parseInt(e.target.value))}
                className="w-full h-1.5 bg-yellow-100 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
            </div>

            {/* One Liner */}
            <div className="bg-white rounded-lg p-3 border border-pink-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-pink-700">💬 One Liner</span>
                <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-bold">{oneLiner}</span>
              </div>
              <input
                type="range"
                min="0"
                max={numQuestions}
                value={oneLiner}
                onChange={(e) => setOneLiner(parseInt(e.target.value))}
                className="w-full h-1.5 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>

            {/* Matching */}
            <div className="bg-white rounded-lg p-3 border border-orange-200 sm:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-orange-700">🔗 Matching</span>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">{matching}</span>
              </div>
              <input
                type="range"
                min="0"
                max={numQuestions}
                value={matching}
                onChange={(e) => setMatching(parseInt(e.target.value))}
                className="w-full h-1.5 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>
          </div>

          {/* Distribution Summary */}
          <div className={`p-3 rounded-lg border-2 ${
            isDistributionValid 
              ? 'bg-green-50 border-green-300' 
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total Distribution:</span>
              <span className={`text-lg font-bold ${
                isDistributionValid ? 'text-green-600' : 'text-red-600'
              }`}>
                {totalDistribution} / {numQuestions}
              </span>
            </div>
            {!isDistributionValid && (
              <p className="text-xs text-red-600 mt-1">
                ⚠️ Adjust the sliders so total equals {numQuestions}
              </p>
            )}
            {isDistributionValid && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Distribution is correct!
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isDistributionValid}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          ✨ Generate Worksheet with AI
        </button>
      </div>
    </form>
  );
}
