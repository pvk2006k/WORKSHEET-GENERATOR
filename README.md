# Kids Knowledge Nest - AI Worksheet Generator

A beautiful, AI-powered worksheet generator for creating professional educational worksheets for students from Class 1 to Class 12. **No API keys required!** Powered by Puter.js for serverless AI.

## Features

✨ **AI-Powered Question Generation**
- Uses **Puter.js** (serverless AI) - no API keys needed!
- Optional support for Groq (Llama 3.3) and OpenAI (GPT-4o-mini)
- Creates age-appropriate content based on class level
- Generates multiple question types: multiple-choice, fill-in-the-blank, true/false
- Includes detailed explanations for each answer
- **AI-generated images** for visual questions using Puter.js txt2img

🎨 **Professional Worksheet Design**
- Beautiful A4-sized layouts with decorative borders
- Custom watermarks (www.kidsknowledgenest.com)
- Professional headers with student info, class, topic, practice set ID
- Corner decorations and gradient accents
- **AI-generated images** for visual questions
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

### 1. No Setup Required! 🎉

The app uses **Puter.js** - a serverless AI solution that requires:
- ❌ No API keys
- ❌ No backend setup
- ❌ No server infrastructure
- ✅ Just open and use!

Puter.js provides free AI capabilities directly in the browser.

### 2. Optional: Alternative AI Providers

For advanced users, you can also configure:

#### Groq (Fast & Free Tier)
1. Get an API key from [Groq Console](https://console.groq.com/keys)
2. Select **Groq** in the API Key section
3. Enter your key (starts with `gsk_...`)
- Uses **Llama 3.3 70B** model

#### OpenAI (Premium)
1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Select **OpenAI** in the API Key section
3. Enter your key (starts with `sk-...`)
- Uses **GPT-4o-mini** model

**Priority:** Puter.js → Groq → OpenAI → Local fallback

Your API keys (if added) are stored locally in your browser.

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
- **Puter.js** - Serverless AI (text + image generation)
- **Groq API** - Alternative AI (Llama 3.3)
- **OpenAI API** - Alternative AI (GPT-4o-mini)
- **html2canvas** - HTML to image conversion
- **jsPDF** - PDF generation
- **Lucide React** - Icons

### File Structure
```
src/
├── components/
│   ├── APIKeySettings.tsx      # Optional API key management
│   ├── WorksheetForm.tsx       # Input form
│   └── WorksheetPreview.tsx    # Worksheet display with images
├── utils/
│   ├── aiGenerator.ts          # Local question generator (fallback)
│   ├── puterService.ts         # Puter.js AI (text + images)
│   ├── groqService.ts          # Groq API integration (optional)
│   └── openAIService.ts        # OpenAI API integration (optional)
├── types.ts                    # TypeScript definitions
├── App.tsx                     # Main app component
└── index.css                   # Global styles
```

### API Key Security

- API keys are stored in browser localStorage
- Keys are only sent to the selected AI provider's API endpoint (Groq or OpenAI)
- No keys are transmitted to any other server
- Users can delete their key at any time
- Supports both Groq and OpenAI providers

### Question Generation

**With Puter.js (Default - No API Key):**
- Serverless AI - no setup required
- Generates unique, contextually relevant questions
- Adapts to specific topics and class levels
- Provides detailed explanations
- **Generates AI images** for visual questions using txt2img
- Takes 10-30 seconds to generate (includes image generation)
- Completely free

**With Groq API (Optional):**
- Uses Llama 3.3 70B Versatile model
- Very fast inference (5-15 seconds)
- Free tier available
- Text only (no image generation)

**With OpenAI API (Optional):**
- Uses GPT-4o-mini model
- High quality responses
- Paid API (requires credits)
- Text only (no image generation)

**Without AI (Fallback):**
- Uses predefined question banks
- Limited to Math, Science, English, and GK
- Instant generation
- Less topic-specific
- No images

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

**Puter.js not loading:**
- Ensure you have an internet connection
- Try refreshing the page
- Check browser console for errors
- Puter.js requires internet to load the AI models

**"Failed to parse AI response" error:**
- The AI may have returned invalid JSON
- Try again - this is usually temporary
- If persistent, try switching to Groq or OpenAI

**"Invalid API key" error (for Groq/OpenAI):**
- For Groq: Check that your key starts with "gsk_"
- For OpenAI: Check that your key starts with "sk-"
- Verify the key is active in your account
- Ensure you have available credits (OpenAI) or are within free tier limits (Groq)

**"Rate limit exceeded" error:**
- Wait a few minutes before trying again
- Check your usage limits
- Groq has generous free tier limits
- OpenAI requires sufficient credits
- Puter.js has its own rate limits - try again after a short wait

**Questions not relevant to topic:**
- Be more specific in your topic description
- Include the subject area (e.g., "Math: Fractions")

**PDF download issues:**
- Ensure pop-ups are allowed for the site
- Try using the print option instead
- Check browser console for errors

## Privacy & Data

- **API Keys:** Stored locally in your browser only
- **Generated Content:** Not stored or transmitted anywhere except to the selected AI provider
- **Student Data:** Only used for display on worksheets, not stored
- **No Tracking:** No analytics or user tracking implemented
- **Provider Choice:** Use either Groq (free tier) or OpenAI (paid)

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
- Verify your API key is valid (Groq or OpenAI)
- Ensure you have sufficient API credits or are within free tier limits
- Try switching between Groq and OpenAI providers
- Try the fallback generator without API key

---

**Made with ❤️ for educators and students**
