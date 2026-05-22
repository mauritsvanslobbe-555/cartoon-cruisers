import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; // Vercel function timeout (seconds)

// Helper: fetch with timeout (works on all Node.js versions)
function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

// Step 1: Gemini 2.5 Flash (free tier) — analyze photo, describe the person
async function describePhoto(photoBase64: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const photoData = photoBase64.replace(/^data:image\/\w+;base64,/, '');

  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.2,
        },
        contents: [{
          parts: [
            {
              text: `Describe this person in ONE short sentence for a cartoon. Include: age, gender, hair color and style, skin tone, glasses yes/no, and one unique feature. Example: "A 9-year-old girl with long curly red hair, fair freckled skin, green eyes, and no glasses." Only output the sentence.`,
            },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: photoData,
              },
            },
          ],
        }],
      }),
    },
    15000, // 15s timeout for Gemini
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini vision error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No description from Gemini');
  const trimmed = text.trim();
  return trimmed.length > 200 ? trimmed.slice(0, 200) : trimmed;
}

// Step 2: Pollinations.ai (free, no key needed) — generate cartoon image
async function generateCartoon(personDescription: string, scenePrompt: string): Promise<Buffer> {
  const prompt = [
    `Cute Pixar-style 3D cartoon character: ${personDescription}`,
    `Riding a colorful vintage Vespa scooter.`,
    `Scene: ${scenePrompt}`,
    `Vibrant colors, motion lines, joyful expression, warm lighting, high quality 3D render.`,
  ].join(' ');

  const encodedPrompt = encodeURIComponent(prompt);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=960&nologo=true&seed=${Date.now()}`;

  const response = await fetchWithTimeout(url, { redirect: 'follow' }, 40000);

  if (!response.ok) {
    throw new Error(`Pollinations error (${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Step 2b: Pollinations.ai — generate GROUP cartoon (4 people on scooters)
async function generateGroupCartoon(descriptions: string[], scenePrompt: string): Promise<Buffer> {
  const scooterColors = ['red', 'blue', 'yellow', 'green'];
  // Keep each description short for URL safety
  const shortDescs = descriptions.map((d, i) => {
    const short = d.length > 120 ? d.slice(0, 120) : d;
    return `Person ${i + 1} on ${scooterColors[i]} Vespa: ${short}`;
  });

  const prompt = [
    `Four distinct Pixar-style 3D cartoon characters, each looking different, riding Vespa scooters side by side.`,
    ...shortDescs,
    `Scene: ${scenePrompt}`,
    `Vibrant colors, motion lines, joyful expressions, warm lighting, high quality 3D render, wide angle.`,
  ].join(' ');

  const encodedPrompt = encodeURIComponent(prompt);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&nologo=true&seed=${Date.now()}`;

  const response = await fetchWithTimeout(url, { redirect: 'follow' }, 40000);

  if (!response.ok) {
    throw new Error(`Pollinations error (${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

const SCENE_PROMPTS: Record<string, string> = {
  city: 'a charming European city with colorful canal houses, cobblestone streets, warm golden sunset, Amsterdam-style bridges',
  beach: 'a tropical beach boulevard with tall palm trees, sparkling turquoise ocean, golden sand, bright blue sky with fluffy clouds',
  mountain: 'a scenic mountain pass with snow-capped peaks, green pine forests, winding road, crisp blue sky with sunshine',
  school: 'a fun colorful school hallway with lockers, backpacks hanging, posters and drawings on the walls, shiny floor, bright cheerful lighting',
  playground: 'a lively school playground with swings, a climbing frame, colorful painted markings on the ground, green trees, blue sky, kids in the background',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photo, photos, scene, mode } = body as {
      photo?: string;
      photos?: string[];
      scene: string;
      mode?: 'solo' | 'group';
    };

    const isGroup = mode === 'group' && photos && photos.length === 4;

    if ((!photo && !isGroup) || !scene) {
      return NextResponse.json(
        { error: 'Missing photo(s) or scene parameter' },
        { status: 400 }
      );
    }

    const scenePrompt = SCENE_PROMPTS[scene] || SCENE_PROMPTS.city;

    if (isGroup) {
      // GROUP MODE: Describe all 4 people, then generate group cartoon
      const descriptions = await Promise.all(
        photos.map(async (p, i) => {
          try {
            return await describePhoto(p);
          } catch (err) {
            console.error(`Gemini description error for person ${i + 1}:`, err);
            return `A happy child with a big smile (person ${i + 1})`;
          }
        })
      );

      console.log('Group descriptions:', descriptions);

      const imageBuffer = await generateGroupCartoon(descriptions, scenePrompt);
      const base64Image = imageBuffer.toString('base64');

      return NextResponse.json({ image: base64Image });
    } else {
      // SOLO MODE: Original flow
      let description: string;
      try {
        description = await describePhoto(photo!);
      } catch (err) {
        console.error('Gemini description error:', err);
        description = 'A happy child with a big smile';
      }

      console.log('Person description:', description);

      const imageBuffer = await generateCartoon(description, scenePrompt);
      const base64Image = imageBuffer.toString('base64');

      return NextResponse.json({ image: base64Image });
    }
  } catch (error) {
    console.error('Transform error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
