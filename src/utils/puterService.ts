import { WorksheetData, Question, QuestionDistribution } from '../types';

// Puter.js is loaded globally via script tag in index.html
declare global {
  interface Window {
    puter: any;
  }
}

export async function generateWorksheetWithPuter(
  className: string,
  topic: string,
  numQuestions: number,
  practiceSetId?: string,
  distribution?: QuestionDistribution
): Promise<WorksheetData> {
  // Extract class number for pedagogy level
  const classMatch = className.match(/\d+/);
  const classNumber = classMatch ? parseInt(classMatch[0]) : 5;
  
  // Determine pedagogy level based on class
  let pedagogyLevel = '';
  let languageStyle = '';
  let difficultyNotes = '';
  
  if (classNumber <= 2) {
    pedagogyLevel = 'early elementary (ages 6-7)';
    languageStyle = 'Use very simple words, short sentences, and concrete examples. Questions should be straightforward and visual.';
    difficultyNotes = 'Focus on basic concepts, recognition, and simple recall. Use familiar objects and everyday situations.';
  } else if (classNumber <= 5) {
    pedagogyLevel = 'elementary (ages 8-11)';
    languageStyle = 'Use clear, simple language with some subject-specific vocabulary. Include relatable examples.';
    difficultyNotes = 'Mix of recall and basic understanding. Questions should build foundational knowledge.';
  } else if (classNumber <= 8) {
    pedagogyLevel = 'middle school (ages 12-14)';
    languageStyle = 'Use age-appropriate academic language. Include some technical terms with explanations.';
    difficultyNotes = 'Focus on understanding, application, and some analysis. Questions should develop critical thinking.';
  } else {
    pedagogyLevel = 'high school (ages 15-18)';
    languageStyle = 'Use formal academic language with subject-specific terminology.';
    difficultyNotes = 'Emphasize analysis, evaluation, and synthesis. Questions should challenge higher-order thinking.';
  }

  // Build distribution requirements
  const distributionRequirements = distribution ? `
EXACT QUESTION TYPE DISTRIBUTION (MUST FOLLOW EXACTLY):
- True/False questions: ${distribution.trueFalse}
- Multiple Choice Questions (MCQs): ${distribution.mcq}
- Fill in the Blanks: ${distribution.fillBlanks}
- One Liner / Short Answer: ${distribution.oneLiner}
- Matching questions: ${distribution.matching}
Total: ${distribution.trueFalse + distribution.mcq + distribution.fillBlanks + distribution.oneLiner + distribution.matching} questions
` : '';

  const prompt = `Create an educational worksheet for ${className} students (pedagogy level: ${pedagogyLevel}) on the topic "${topic}".

IMPORTANT PEDAGOGICAL GUIDELINES:
- ${languageStyle}
- ${difficultyNotes}
- Ensure cognitive load is appropriate for the age group
- Use scaffolding: start with easier questions, progress to more challenging ones
- Make questions engaging and relevant to students' lives
${distributionRequirements}

Generate exactly ${numQuestions} questions that are:
- Age-appropriate for ${className} (${pedagogyLevel})
- Educational, engaging, and fun for kids
- Include clear, kid-friendly explanations for each answer
- For 2-3 questions, suggest an image prompt that would help illustrate the question (make it colorful and appealing for children)

QUESTION TYPES:
1. "true-false": Statement that students mark as True or False
2. "multiple-choice": Question with exactly 4 options (a, b, c, d)
3. "fill-in-blank": Sentence with blank(s) to fill in
4. "one-liner": Question requiring one word or one line answer
5. "match": Matching question with two columns (Column A and Column B) with 4-5 items each

For matching questions, include:
- "matchColumnA": array of items for Column A
- "matchColumnB": array of items for Column B (shuffled, not in matching order)

Format your response as a JSON object with this structure:
{
  "title": "Worksheet title (make it fun and engaging for kids)",
  "subject": "Subject name",
  "instructions": ["instruction 1", "instruction 2", ...],
  "questions": [
    {
      "id": 1,
      "type": "true-false" | "multiple-choice" | "fill-in-blank" | "one-liner" | "match",
      "question": "Question text (age-appropriate language)",
      "options": ["option a", "option b", "option c", "option d"] (ONLY for multiple-choice),
      "matchColumnA": ["item 1", "item 2", "item 3", "item 4"] (ONLY for match type),
      "matchColumnB": ["item a", "item b", "item c", "item d"] (ONLY for match type, shuffled),
      "correctAnswer": "Correct answer",
      "explanation": "Kid-friendly explanation of why this is correct",
      "points": 1,
      "imagePrompt": "Colorful, fun, educational illustration description suitable for children" (optional, for 2-3 questions only)
    }
  ]
}

Make sure all questions are pedagogically appropriate for ${className} level and the topic "${topic}".`;

  try {
    const response = await window.puter.ai.chat(prompt);
    
    // Parse the JSON response
    let aiResponse;
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.message.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', response.message.content);
      throw new Error('Failed to parse AI response. Please try again.');
    }

    // Generate practice set ID (use user-provided one if available)
    const generatedPracticeSetId = practiceSetId || `PSET-${className.replace(/\s/g, '').toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-4)}`;

    // Calculate total marks
    const totalMarks = aiResponse.questions.reduce((sum: number, q: Question) => sum + (q.points || 2), 0);

    // Generate images for questions that have image prompts
    const questionsWithImages = await Promise.all(
      aiResponse.questions.map(async (q: any, idx: number) => {
        const question: any = {
          id: idx + 1,
          type: q.type || 'fill-in-blank',
          question: q.question,
          options: q.options,
          matchColumnA: q.matchColumnA,
          matchColumnB: q.matchColumnB,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: q.points || 1
        };

        // Generate image if prompt is provided
        if (q.imagePrompt) {
          try {
            const imageData = await generateImageWithPuter(q.imagePrompt);
            question.imageUrl = imageData;
          } catch (imgError) {
            console.warn('Failed to generate image for question', idx + 1, imgError);
            // Continue without image
          }
        }

        return question;
      })
    );

    const worksheet: WorksheetData = {
      title: aiResponse.title || `${topic} - Practice Worksheet`,
      practiceSetId: generatedPracticeSetId,
      className,
      subject: aiResponse.subject || topic,
      topic,
      totalMarks,
      timeAllowed: `${Math.max(20, numQuestions * 3)} minutes`,
      instructions: aiResponse.instructions || [
        'Read each question carefully before answering.',
        'Write your answers neatly in the space provided.',
        'Each question carries equal marks as indicated.',
        'Attempt all questions.',
        'Check your answers before submitting.'
      ],
      questions: questionsWithImages
    };

    return worksheet;
  } catch (error: any) {
    console.error('Puter AI error:', error);
    throw new Error(error.message || 'Failed to generate worksheet. Please try again.');
  }
}

export async function generateImageWithPuter(prompt: string): Promise<string> {
  try {
    const response = await window.puter.ai.txt2img(prompt);
    return response; // Returns base64 image data
  } catch (error: any) {
    console.error('Puter image generation error:', error);
    throw new Error('Failed to generate image. Please try again.');
  }
}

export async function analyzeImageWithPuter(imageData: string, question: string): Promise<string> {
  try {
    const response = await window.puter.ai.analyze(imageData, question);
    return response.message.content;
  } catch (error: any) {
    console.error('Puter image analysis error:', error);
    throw new Error('Failed to analyze image. Please try again.');
  }
}
