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
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `You are creating a description for an image generation prompt. Look at this photo and describe the person's appearance in ONE short sentence. Include: approximate age (child/teen/adult), hair color and style, skin tone, and any notable features like glasses or freckles. Be brief and factual. Example: "A 8-year-old child with curly brown hair, light skin, and round glasses." Only output the description, nothing else.`,
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
  return text.trim();
}

// Step 2: Pollinations.ai (free, no key needed) — generate cartoon image
async function generateCartoon(personDescription: string, scenePrompt: string): Promise<Buffer> {
  const prompt = [
    `Cute adorable Pixar-style 3D cartoon character based on: ${personDescription}`,
    `The character is happily riding a colorful vintage Vespa scooter.`,
    `Scene: ${scenePrompt}`,
    `Vibrant colors, fun kid-friendly illustration, motion lines showing movement,`,
    `joyful excited expression, big expressive eyes, warm lighting, high quality 3D render.`,
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
  const characterLines = descriptions.map((desc, i) =>
    `Character ${i + 1}: ${desc} riding a ${scooterColors[i]} Vespa`
  ).join('. ');

  const prompt = [
    `Four cute adorable Pixar-style 3D cartoon characters riding together in a row on colorful vintage Vespa scooters.`,
    characterLines + '.',
    `All four riding side by side, wide angle view from slightly in front.`,
    `Scene: ${scenePrompt}`,
    `Vibrant colors, fun kid-friendly illustration, motion lines showing movement,`,
    `joyful excited expressions, big expressive eyes, warm lighting, high quality 3D render, group photo composition.`,
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
