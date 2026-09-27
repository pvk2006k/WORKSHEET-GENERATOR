# Kids Knowledge Nest - AI Worksheet Generator

A beautiful, AI-powered worksheet generator for creating professional educational worksheets for students from Class 1 to Class 12.

## Features

✨ **AI-Powered Question Generation**
- Uses OpenAI GPT-4o-mini to generate contextually relevant questions
- Creates age-appropriate content based on class level
- Generates multiple question types: multiple-choice, fill-in-the-blank, true/false
- Includes detailed explanations for each answer

🎨 **Professional Worksheet Design**
- Beautiful A4-sized layouts with decorative borders
- Custom watermarks (www.kidsknowledgenest.com)
- Professional headers with student info, class, topic, practice set ID
- Corner decorations and gradient accents
- Print-ready formatting

📚 **Comprehensive Content**
- Supports multiple subjects: Math, Science, English, General Knowledge
- Topic-specific question generation
- Automatic difficulty adjustment based on class level
- Answer key with explanations on the last page

📄 **Export Options**
- Print worksheets directly from the browser
- Download as PDF with proper pagination
- Each worksheet includes cover page, questions, and answer key

## Setup & Usage

### 1. OpenAI API Key (Required for AI Generation)

To use the AI-powered question generation:

1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Open the application
3. Enter your API key in the "OpenAI API Key" section at the top
4. Click "Save Key"
5. Your key is stored locally in your browser (never sent to any server except OpenAI)

**Note:** Without an API key, the app will use a local question bank as a fallback.

### 2. Creating a Worksheet

1. **Enter Student Name** (optional)
2. **Select Class** from the dropdown (Class 1 to Class 12)
3. **Choose a Topic** - either:
   - Click a quick subject button (Mathematics, Science, English, etc.)
   - Type a specific topic (e.g., "Addition", "Photosynthesis", "Nouns")
4. **Adjust Number of Questions** using the slider (5-20 questions)
5. Click **"Generate Worksheet with AI"**

### 3. Worksheet Structure

Each generated worksheet includes:

**Page 1 - Cover Page:**
- Student Name
- Class
- Worksheet Title
- Practice Set ID (auto-generated)
- Subject
- Total Marks
- Time Allowed
- Number of Questions
- Date
- General Instructions

**Page 2 - Questions:**
- All generated questions with proper formatting
- Multiple choice options (when applicable)
- Answer spaces for fill-in-the-blank questions
- Marks indicated for each question

**Page 3 - Answer Key:**
- Correct answers for all questions
- Detailed explanations for each answer
- Educational context to help students learn

### 4. Export Options

**Print:**
- Click "Print Worksheet" button
- Optimized for A4 paper
- Clean print layout without UI elements

**Download PDF:**
- Click "Download PDF" button
- Multi-page PDF with proper pagination
- Preserves all formatting and design elements

## Technical Details

### Built With
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **OpenAI API** - AI question generation
- **html2canvas** - HTML to image conversion
- **jsPDF** - PDF generation
- **Lucide React** - Icons

### File Structure
```
src/
├── components/
│   ├── APIKeySettings.tsx      # API key management
│   ├── WorksheetForm.tsx       # Input form
│   └── WorksheetPreview.tsx    # Worksheet display
├── utils/
│   ├── aiGenerator.ts          # Local question generator (fallback)
│   └── openAIService.ts        # OpenAI API integration
├── types.ts                    # TypeScript definitions
├── App.tsx                     # Main app component
└── index.css                   # Global styles
```

### API Key Security

- API keys are stored in browser localStorage
- Keys are only sent to OpenAI's API endpoint
- No keys are transmitted to any other server
- Users can delete their key at any time

### Question Generation

**With OpenAI API:**
- Generates unique, contextually relevant questions
- Adapts to specific topics and class levels
- Provides detailed explanations
- Takes 10-20 seconds to generate

**Without API Key (Fallback):**
- Uses predefined question banks
- Limited to Math, Science, English, and GK
- Faster generation (instant)
- Less topic-specific

## Tips for Best Results

1. **Be Specific with Topics:**
   - ✅ "Multiplication tables" instead of just "Math"
   - ✅ "Parts of a plant" instead of just "Science"
   - ✅ "Nouns and verbs" instead of just "English"

2. **Choose Appropriate Question Count:**
   - Class 1-3: 5-10 questions
   - Class 4-7: 8-15 questions
   - Class 8-12: 10-20 questions

3. **Review Generated Content:**
   - Always review AI-generated questions before distribution
   - Verify accuracy and age-appropriateness
   - Modify as needed for your specific requirements

## Troubleshooting

**"Invalid API key" error:**
- Check that your API key starts with "sk-"
- Verify the key is active in your OpenAI account
- Ensure you have available credits

**"Rate limit exceeded" error:**
- Wait a few minutes before trying again
- Check your OpenAI usage limits

**Questions not relevant to topic:**
- Be more specific in your topic description
- Include the subject area (e.g., "Math: Fractions")

**PDF download issues:**
- Ensure pop-ups are allowed for the site
- Try using the print option instead
- Check browser console for errors

## Privacy & Data

- **API Keys:** Stored locally in your browser only
- **Generated Content:** Not stored or transmitted anywhere
- **Student Data:** Only used for display on worksheets, not stored
- **No Tracking:** No analytics or user tracking implemented

## Future Enhancements

- [ ] Support for more question types (matching, diagram-based)
- [ ] Image generation for questions
- [ ] Custom worksheet templates
- [ ] Batch generation for multiple topics
- [ ] Export to Word/DOCX format
- [ ] Question difficulty levels
- [ ] Multi-language support

## License

This project is created for Kids Knowledge Nest (www.kidsknowledgenest.com)

## Support

For issues or questions:
- Check the troubleshooting section above
- Verify your OpenAI API key is valid
- Ensure you have sufficient API credits
- Try the fallback generator without API key

---

**Made with ❤️ for educators and students**
