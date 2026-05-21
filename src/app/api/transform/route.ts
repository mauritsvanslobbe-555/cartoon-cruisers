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
              text: `You are creating a detailed description for a Pixar-style cartoon character that must CLOSELY RESEMBLE the real person in this photo. Be very specific and detailed.

Describe ALL of the following in 2-3 sentences:
- GENDER and approximate AGE (be specific: e.g. "7-year-old boy", "35-year-old woman")
- FACE SHAPE: round, oval, square, heart-shaped, long, etc.
- HAIR: exact color (not just "brown" but "warm chestnut brown" or "platinum blonde"), style (messy, neat, spiky, ponytail, braids, buzz cut, parted to the side, bangs, etc.), length, texture (straight, wavy, curly, coily)
- SKIN TONE: be specific (fair/pale, olive, warm beige, light brown, dark brown, etc.)
- EYES: color and shape (big round eyes, narrow almond eyes, droopy eyes, etc.)
- NOSE: small button nose, wide nose, pointy nose, etc.
- MOUTH/LIPS: thin lips, full lips, wide smile, etc.
- BODY BUILD: slim, chubby, stocky, tall, petite, etc.
- GLASSES: describe them if present (round, rectangular, thick-rimmed, color) or explicitly say "no glasses"
- DISTINCTIVE FEATURES: freckles, dimples, gap in teeth, birthmark, braces, beard, mustache, earrings, specific hairstyle details, etc.

The description must capture what makes THIS person look unique and recognizable. Be factual and precise.
Example: "A chubby 8-year-old boy with a round face, messy sandy blonde wavy hair with a cowlick, fair freckled skin, big bright blue round eyes, a small button nose, and a wide toothy grin with a gap between his front teeth. No glasses. He has rosy cheeks and a stocky build."

Output ONLY the description, nothing else.`,
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
    `Pixar-style 3D cartoon character that closely resembles this real person: ${personDescription}`,
    `The character must have the EXACT same face shape, hair style, hair color, skin tone, and distinctive features described above.`,
    `The character is happily riding a colorful vintage Vespa scooter.`,
    `Scene: ${scenePrompt}`,
    `Vibrant colors, fun kid-friendly illustration, motion lines showing movement,`,
    `joyful excited expression, warm lighting, high quality 3D render, character portrait focus.`,
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

// Build contrastive descriptions so the image model doesn't mix up features
function buildContrastiveDescriptions(descriptions: string[]): string {
  // Detect who has glasses
  const hasGlasses = descriptions.map(d => /glass/i.test(d));
  const scooterColors = ['red', 'blue', 'yellow', 'green'];
  const positions = ['far left', 'center-left', 'center-right', 'far right'];

  return descriptions.map((desc, i) => {
    const glassesNote = hasGlasses[i]
      ? 'WEARING GLASSES'
      : 'NO glasses';
    return `[Person ${i + 1} on ${scooterColors[i]} Vespa, positioned ${positions[i]}]: ${desc}. (${glassesNote})`;
  }).join('\n');
}

// Step 2b: Pollinations.ai — generate GROUP cartoon (4 people on scooters)
async function generateGroupCartoon(descriptions: string[], scenePrompt: string): Promise<Buffer> {
  const contrastive = buildContrastiveDescriptions(descriptions);

  // Count who has glasses for explicit note
  const glassesIndices = descriptions
    .map((d, i) => /glass/i.test(d) ? i + 1 : -1)
    .filter(i => i > 0);
  const glassesNote = glassesIndices.length > 0
    ? `CRITICAL: ONLY person ${glassesIndices.join(' and ')} wears glasses. The others have NO glasses.`
    : 'None of the characters wear glasses.';

  const prompt = [
    `Four distinct Pixar-style 3D cartoon characters that each closely resemble a different real person. Each character MUST look unique with their own face shape, hair, build, and features.`,
    `Each character must match their description EXACTLY. Do NOT mix features between characters.`,
    glassesNote,
    contrastive,
    `The characters must look visibly DIFFERENT from each other — different face shapes, different hair, different builds.`,
    `All four riding vintage Vespa scooters side by side, wide angle view.`,
    `Scene: ${scenePrompt}`,
    `Vibrant colors, fun kid-friendly illustration, motion lines, joyful expressions, warm lighting, high quality 3D render.`,
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
