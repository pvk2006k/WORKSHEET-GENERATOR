import { WorksheetData, Question } from '../types';

// Puter.js is loaded globally via script tag in index.html
declare global {
  interface Window {
    puter: any;
  }
}

export async function generateWorksheetWithPuter(
  className: string,
  topic: string,
  numQuestions: number
): Promise<WorksheetData> {
  const prompt = `Create a worksheet for ${className} students on the topic "${topic}".

Generate exactly ${numQuestions} questions that are:
- Age-appropriate for ${className}
- Include a mix of question types (multiple choice, fill-in-the-blank, true/false)
- Educational and engaging
- Include clear explanations for each answer
- For 2-3 questions, suggest an image prompt that would help illustrate the question

Format your response as a JSON object with this structure:
{
  "title": "Worksheet title",
  "subject": "Subject name",
  "instructions": ["instruction 1", "instruction 2", ...],
  "questions": [
    {
      "id": 1,
      "type": "multiple-choice" | "fill-in-blank" | "true-false",
      "question": "Question text",
      "options": ["option a", "option b", "option c", "option d"] (only for multiple-choice),
      "correctAnswer": "Correct answer",
      "explanation": "Detailed explanation of why this is correct",
      "points": 2,
      "imagePrompt": "Detailed description of an educational illustration for this question" (optional, for 2-3 questions only)
    }
  ]
}

Make sure all questions are relevant to ${className} level and the topic "${topic}".`;

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

    // Generate practice set ID
    const practiceSetId = `PSET-${className.replace(/\s/g, '').toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-4)}`;

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
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: q.points || 2
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
      practiceSetId,
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
