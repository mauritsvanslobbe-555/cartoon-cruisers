import { NextRequest, NextResponse } from 'next/server';

const GEMINI_MODEL = 'gemini-2.5-flash-image';

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  error?: { message: string; code: number };
}

async function callGemini(parts: GeminiPart[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data: GeminiResponse = await response.json();

  if (data.error) {
    throw new Error(`Gemini error: ${data.error.message}`);
  }

  const candidate = data.candidates?.[0];
  if (!candidate?.content?.parts) {
    throw new Error('No content in Gemini response');
  }

  const imagePart = candidate.content.parts.find(p => p.inlineData?.mimeType?.startsWith('image/'));
  if (!imagePart?.inlineData) {
    throw new Error('No image in Gemini response');
  }

  return imagePart.inlineData.data;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photo, scene } = body as { photo: string; scene: string };

    if (!photo || !scene) {
      return NextResponse.json(
        { error: 'Missing photo or scene parameter' },
        { status: 400 }
      );
    }

    const photoData = photo.replace(/^data:image\/\w+;base64,/, '');

    // Step 1: Convert photo to cartoon style
    const cartoonImage = await callGemini([
      {
        text: 'Transform this photo of a person into a cute Pixar-style 3D cartoon character. Keep the person\'s key facial features recognizable but make them adorable, colorful, and cartoonish with big expressive eyes. Render the character from roughly the same angle as the original photo. Output only the cartoon character on a clean white background, no other elements.',
      },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: photoData,
        },
      },
    ]);

    // Step 2: Place cartoon character on scooter in scene
    const sceneDescriptions: Record<string, string> = {
      city: 'a charming European city street with canals, colorful historic buildings, cobblestone roads, and warm golden sunset lighting. The style should be vibrant and fun, like a Pixar movie scene.',
      beach: 'a tropical beach boulevard with tall palm trees, sparkling turquoise ocean waves, golden sand dunes, and a bright blue sky with fluffy white clouds. The style should be vibrant and fun, like a Pixar movie scene.',
      mountain: 'a scenic mountain pass with majestic snow-capped peaks, lush green pine forests, a winding mountain road, and a crisp blue sky with rays of sunlight. The style should be vibrant and fun, like a Pixar movie scene.',
    };

    const sceneDesc = sceneDescriptions[scene] || sceneDescriptions.city;

    const finalImage = await callGemini([
      {
        text: `Take this cartoon character and place them happily riding a colorful vintage Vespa scooter in ${sceneDesc}. The character should be sitting on the scooter, looking excited and joyful. Show some motion lines or wind effects to suggest movement. The final image should be a fun, vibrant, kid-friendly illustration in a consistent Pixar 3D cartoon style. Make it a complete scene with the character as the star.`,
      },
      {
        inlineData: {
          mimeType: 'image/png',
          data: cartoonImage,
        },
      },
    ]);

    return NextResponse.json({ image: finalImage });
  } catch (error) {
    console.error('Transform error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
