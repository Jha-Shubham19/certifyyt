import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

interface MCQ {
  question: string;
  options: string[];
  answer: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { videoTitle } = body;
    
    if (!videoTitle || typeof videoTitle !== 'string') {
      return NextResponse.json({ error: "Invalid videoTitle" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const mcqs = await generateMCQsWithGemini(videoTitle);
    return NextResponse.json({ mcqs });
  } catch (error) {
    console.error("MCQ generation failed:", error);
    return NextResponse.json({ error: "Failed to generate MCQs" }, { status: 500 });
  }
}

async function generateMCQsWithGemini(videoTitle: string): Promise<MCQ[]> {
//   const prompt = `Generate exactly 10 unique, relevant, and medium level multiple-choice questions based on the following YouTube video title(s): "${videoTitle}".
// The question must:
// - Be strictly based on the topic of the video title.
// - Be simple and understandable for medium level learners.
// - Not repeat any previous question.
// - Provide exactly 4 unique options.
// - Clearly indicate the correct answer.
// - Use English only.
// - Exactly 10 questions.

// Output strictly and only in valid JSON format as follows:
// [
//   {
//     "question": "...",
//     "options": ["...", "...", "...", "..."],
//     "answer": "..."
//   }
// ]`;
const prompt = `Generate exactly 10 unique, relevant, medium-level multiple-choice questions strictly based on the concepts, topics, acadmic or technical knowledge taught in the content represented by the following YouTube video title(s): "${videoTitle}".

The questions must:
- Be derived only from the subject matter, concepts, and lessons covered in the topic.
- NOT reference the video, its title, the instructor, or any video-related context.
- Be concept-focused, not meta or descriptive of the video.
- Be clear and understandable for medium-level learners.
- Not repeat any question or concept already used.
- Provide exactly 4 distinct answer options.
- Clearly specify the correct answer.
- Use English only.
- Generate exactly 10 questions.
Strict rules:
- Treat the topic as a subject or syllabus, NOT as a video or media content.
- Questions MUST be directly about the topic itself.
- DO NOT mention or imply:
  - videos
  - titles
  - lessons
  - instructors
  - explanations shown anywhere
- Do NOT use phrases like:
  - "based on the video"
  - "as discussed above"
  - "in this lesson"
- Questions must stand alone as pure topic-based knowledge checks.
- Do not repeat questions or concepts.
- Each question must have exactly 4 unique options.
- Use English only.
- Output exactly 10 questions.

Output strictly and only in valid JSON format as shown below:
[
  {
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "answer": "..."
  }
]`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response from Gemini API');
  }

  const generatedText = data.candidates[0].content.parts[0].text;
  
  // Extract JSON from the response (in case there's extra text)
  const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('No valid JSON found in Gemini response');
  }

  try {
    const mcqs = JSON.parse(jsonMatch[0]) as MCQ[];
    
    // Validate the structure
    if (!Array.isArray(mcqs) || mcqs.length === 0) {
      throw new Error('Invalid MCQ structure');
    }

    // Validate each MCQ
    for (const mcq of mcqs) {
      if (!mcq.question || !Array.isArray(mcq.options) || mcq.options.length !== 4 || !mcq.answer) {
        throw new Error('Invalid MCQ format');
      }
    }

    return mcqs;
  } catch (parseError) {
    console.error('Failed to parse Gemini response:', generatedText);
    throw new Error('Failed to parse MCQ response');
  }
}