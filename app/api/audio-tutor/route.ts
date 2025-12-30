import { NextRequest, NextResponse } from 'next/server';
import { EdgeTTS } from 'edge-tts-universal';
import { v4 as uuidv4 } from 'uuid';

const GLM_API_URL = 'https://api.z.ai/api/paas/v4/chat/completions';
const GLM_MODEL = 'GLM-4.5-AirX';
const VOICE = 'bn-BD-PradeepNeural';

async function generateScript(text: string, chapterTitle: string, apiKey: string): Promise<string> {
    const systemPrompt = `# Shikkha Bhai (শিক্ষা ভাই) - The Ultimate Vernacular AI Tutor

You are **"Shikkha Bhai"**, a brilliant and charismatic mentor for Bangladeshi secondary school students (Class 9-12). Your superpower is taking complex, dry textbook concepts and turning them into "Aha!" moments through relatable storytelling and professional yet friendly guidance.

## Your Pedagogical Approach:
1. **The Hook:** Start with a warm, standard "Cholito" Bengali greeting. Then immediately jump into a compelling real-world hook related to the topic.
2. **Standard Bengali (Cholito):** Use polished, academic yet friendly "Cholito" Bengali. Talk like a respected "Boro Bhai".
3. **Deep Analogy:** This is CRITICAL. Explain every conceptual hurdle with multiple brilliant analogies. Don't just mention an analogy; walk the student through it in detail.
4. **Interactive Dialogue:** Use rhetorical questions to keep the listener engaged.
5. **Detailed Explanation:** Break down the provided text into logical parts. Explain the "Why" behind the "What".

## Your Voice/Tone:
- **Direct & Professional:** Be authoritative yet accessible.
- **Encouraging:** "Tumi parbe," "Eita kintu khub shohoj."
- **Bengali & English Mixed:** Use English academic terms (e.g., "Momentum") alongside Bengali explanations.

## Length & Depth:
- **IMPORTANT:** Keep it CONCISE. Aim for **200-300 words** (under 2 minutes of audio).
- Focus on the core concept with one brilliant analogy. Don't over-explain.

## Output:
ONLY the Bengali script. No titles, no "Script:", no translation.`;

    const userMessage = `Chapter: ${chapterTitle}
Content:
${text.substring(0, 4000)}`;

    const response = await fetch(GLM_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: GLM_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            temperature: 0.8,
        }),
    });

    if (!response.ok) {
        throw new Error(`GLM API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
}

interface AudioMetadata {
    Type: string;
    Data: {
        Offset: number;
        Duration: number;
        text?: {
            Text: string;
        };
    };
}

async function synthesizeSpeech(text: string): Promise<{ audio: Buffer; metadata: AudioMetadata[] }> {
    try {
        console.log('Using edge-tts-universal with DRM handling...');

        // Use edge-tts-universal which has built-in DRM/Sec-MS-GEC handling
        const tts = new EdgeTTS(text, VOICE, {
            rate: '+0%',
            volume: '+0%',
            pitch: '+0Hz',
        });

        const result = await tts.synthesize();

        // Get audio buffer
        const audioBuffer = Buffer.from(await result.audio.arrayBuffer());

        // Convert subtitle data to our metadata format
        const metadata: AudioMetadata[] = result.subtitle.map((sub) => ({
            Type: 'WordBoundary',
            Data: {
                Offset: sub.offset,
                Duration: sub.duration,
                text: { Text: sub.text }
            }
        }));

        console.log(`Edge TTS success: ${audioBuffer.length} bytes, ${metadata.length} word boundaries`);
        return { audio: audioBuffer, metadata };

    } catch (error) {
        console.warn('Edge TTS (edge-tts-universal) failed, using fallback Google TTS:', error);

        // Google TTS fallback - split text into chunks and concatenate
        const chunks: string[] = [];
        const words = text.split(' ');
        let currentChunk = '';

        for (const word of words) {
            if ((currentChunk + ' ' + word).length > 180) {
                if (currentChunk) chunks.push(currentChunk.trim());
                currentChunk = word;
            } else {
                currentChunk += ' ' + word;
            }
        }
        if (currentChunk.trim()) chunks.push(currentChunk.trim());

        try {
            const audioBuffers: Buffer[] = [];

            for (const chunk of chunks) {
                const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=bn&client=tw-ob`;
                const resp = await fetch(googleTtsUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    }
                });
                if (!resp.ok) throw new Error(`Google TTS failed: ${resp.status}`);
                const arrayBuffer = await resp.arrayBuffer();
                audioBuffers.push(Buffer.from(arrayBuffer));
            }

            return {
                audio: Buffer.concat(audioBuffers),
                metadata: []
            };
        } catch (e) {
            console.error('All TTS services failed:', e);
            throw error;
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        const { text, chapterTitle } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const apiKey = process.env.GLM_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'GLM API key not configured' }, { status: 500 });
        }

        console.log('Generating friendly script...');
        const script = await generateScript(text, chapterTitle || 'General Topic', apiKey);

        console.log('Synthesizing speech with edge-tts-universal...');
        const { audio, metadata } = await synthesizeSpeech(script);

        // Convert audio buffer to base64
        const audioBase64 = audio.toString('base64');

        return NextResponse.json({
            success: true,
            audio: audioBase64,
            script,
            metadata
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        console.error('Audio Tutor Error:', error);
        return NextResponse.json({
            error: errorMessage,
            success: false
        }, { status: 500 });
    }
}
