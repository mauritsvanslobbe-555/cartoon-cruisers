import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; // Vercel function timeout (seconds)

// Step 1: Gemini 2.5 Flash (free tier) — analyze photo, describe the person
async function describePhoto(photoBase64: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const photoData = photoBase64.replace(/^data:image\/\w+;base64,/, '');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(20000), // 20s max for Gemini
      body: JSON.stringify({
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.3,
          thinkingConfig: { thinkingBudget: 0 },
        },
        contents: [{
          parts: [
            {
              text: `Describe this person for a cartoon character in ONE sentence (max 40 words). Include: age, gender, face shape, hair color+style, skin tone, eye color, glasses (yes/no), and one unique feature. Be specific. Example: "A 9-year-old girl with a round face, long curly red hair, fair freckled skin, green eyes, no glasses, and a big toothy grin." Output ONLY the sentence.`,
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
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini vision error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No description from Gemini');
  // Trim to max 250 chars to keep Pollinations URL safe
  const trimmed = text.trim();
  return trimmed.length > 250 ? trimmed.slice(0, 250) : trimmed;
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

  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(60000),
  });

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

  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(60000),
  });

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
