import Groq from 'groq-sdk';
import { WorksheetData, Question } from '../types';

let groq: Groq | null = null;

export function initializeGroq(apiKey: string) {
  groq = new Groq({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  });
}

export function isGroqConfigured(): boolean {
  return groq !== null;
}

export async function generateWorksheetWithGroq(
  className: string,
  topic: string,
  numQuestions: number
): Promise<WorksheetData> {
  if (!groq) {
    throw new Error('Groq API not configured. Please enter your API key.');
  }

  const prompt = `Create a worksheet for ${className} students on the topic "${topic}".

Generate exactly ${numQuestions} questions that are:
- Age-appropriate for ${className}
- Include a mix of question types (multiple choice, fill-in-the-blank, true/false)
- Educational and engaging
- Include clear explanations for each answer

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
      "points": 2
    }
  ]
}

Make sure all questions are relevant to ${className} level and the topic "${topic}".`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert educational content creator specializing in creating engaging, age-appropriate worksheets for students. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 4000,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // Parse the JSON response
    let aiResponse;
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      throw new Error('Failed to parse AI response. Please try again.');
    }

    // Generate practice set ID
    const practiceSetId = `PSET-${className.replace(/\s/g, '').toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-4)}`;

    // Calculate total marks
    const totalMarks = aiResponse.questions.reduce((sum: number, q: Question) => sum + (q.points || 2), 0);

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
      questions: aiResponse.questions.map((q: any, idx: number) => ({
        id: idx + 1,
        type: q.type || 'fill-in-blank',
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        points: q.points || 2
      }))
    };

    return worksheet;
  } catch (error: any) {
    console.error('Groq API error:', error);
    if (error.message?.includes('API key')) {
      throw new Error('Invalid API key. Please check your Groq API key.');
    }
    if (error.message?.includes('rate limit')) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    }
    throw new Error(error.message || 'Failed to generate worksheet. Please try again.');
  }
}
