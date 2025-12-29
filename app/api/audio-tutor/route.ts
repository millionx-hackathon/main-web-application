import { NextRequest, NextResponse } from 'next/server';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';

const GLM_API_URL = 'https://api.z.ai/api/paas/v4/chat/completions';
const GLM_MODEL = 'GLM-4.5-AirX';

// Edge TTS Constants
const EDGE_TTS_URL = 'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const VOICE = 'bn-BD-PradeepNeural';

async function generateScript(text: string, chapterTitle: string, apiKey: string): Promise<string> {
    const systemPrompt = `# Shikkha Bhai (শিক্ষা ভাই) - The Ultimate Vernacular AI Tutor

You are **"Shikkha Bhai"**, a brilliant and charismatic mentor for Bangladeshi secondary school students (Class 9-12). Your superpower is taking complex, dry textbook concepts and turning them into "Aha!" moments through relatable storytelling and professional yet friendly guidance.

## Your Tone & Style:
1. **Direct Professionalism:** You are a vision of a modern, well-educated mentor. Your language is refined, using standard Bengali (**চলিত বাংলা**).
2. **No Fluff Intro:** Do NOT spend time on long greetings or introductory fillers. Start immediately with the core concept or a compelling academic hook related to the context. Example: "প্রিয় শিক্ষার্থীরা, আজকে আমরা আলোচনা করব [Topic Name] নিয়ে, যা আমাদের চারপাশের জগতের এক বিস্ময়কর ভিত্তি।" Don't directly use the example! Use similer better professional
3. **Immediate Intellectual Depth:** Dive straight into the core logic. Explain why this specific concept matters from the very first sentence.
4. **Articulate Analogies:** Use precise, sophisticated analogies integrated into the explanation.
5. **Structural Integrity:** Use transition phrases that guide the student through a journey of discovery (e.g., "প্রথমেই আমরা লক্ষ্য করি...", "এর পেছনে গাণিতিক যুক্তিটি হলো...", "বিষয়টিকে যদি আমরা একটু ভিন্নভাবে দেখি...").
6. **Concise Outro:** Conclude with a strong, focused summary that reinforces the key takeaway. Avoid long sign-offs.

## Output Requirements:
- Write ONLY in Bengali.
- Length: 250-400 words (Approx. 2.5 minutes of speech).
- Format: A continuous, engaging narrative script.`;

    const userMessage = `অধ্যায়: ${chapterTitle || 'বিজ্ঞান'}
পাঠ্যবইয়ের বিষয়বস্তু:
${text.substring(0, 2000)}`;

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
            thinking: { type: 'disabled' },
            temperature: 0.8,
        }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

const escapeXml = (unsafe: string) => unsafe.replace(/[<>&"']/g, (c) => {
    switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '"': return '&quot;';
        case "'": return '&apos;';
        default: return c;
    }
});

async function synthesizeSpeech(text: string): Promise<{ audio: Buffer; metadata: any[] }> {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(EDGE_TTS_URL, {
            headers: {
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
            }
        });

        let audioData = Buffer.alloc(0);
        let metadata: any[] = [];
        const requestId = uuidv4().replace(/-/g, '');

        ws.on('open', () => {
            const configMsg = `Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"true"},"outputFormat":"audio-24khz-96kbitrate-mono-mp3"}}}}`;
            ws.send(configMsg);

            const escapedText = escapeXml(text);
            const ssmlMsg = `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='bn-BD'><voice name='${VOICE}'><prosody pitch='+0Hz' rate='+0%' volume='+0%'>${escapedText}</prosody></voice></speak>`;
            ws.send(ssmlMsg);
        });

        ws.on('message', (data, isBinary) => {
            if (isBinary) {
                const buffer = data as Buffer;
                if (buffer.length > 2) {
                    const headerLength = buffer.readInt16BE(0);
                    const header = buffer.slice(2, 2 + headerLength).toString();
                    const payload = buffer.slice(2 + headerLength);

                    // Robust path detection
                    if (header.toLowerCase().includes('path:audio')) {
                        // Edge TTS binary audio packets often start with a binary preamble
                        // that isn't part of the MP3 stream. We skip until we find the
                        // MP3 sync byte 0xFF.
                        let syncOffset = 0;
                        while (syncOffset < payload.length && payload[syncOffset] !== 0xFF) {
                            syncOffset++;
                        }

                        if (syncOffset < payload.length) {
                            audioData = Buffer.concat([audioData, payload.slice(syncOffset)]);
                        }
                    } else if (header.toLowerCase().includes('path:audio.metadata')) {
                        try {
                            const meta = JSON.parse(payload.toString());
                            if (meta.Metadata) {
                                metadata.push(...meta.Metadata);
                            }
                        } catch (e) {
                            console.error('Metadata binary parse error:', e);
                        }
                    }
                }
            } else {
                const message = data.toString();
                if (message.includes('Path:audio.metadata')) {
                    try {
                        const body = message.split('\r\n\r\n')[1];
                        if (body) {
                            const meta = JSON.parse(body);
                            if (meta.Metadata) metadata.push(...meta.Metadata);
                        }
                    } catch (e) {
                        console.error('Metadata text parse error:', e);
                    }
                }
                if (message.includes('Path:turn.end')) {
                    ws.close();
                    resolve({ audio: audioData, metadata });
                }
            }
        });

        ws.on('error', (err) => {
            console.error('TTS WebSocket Error:', err);
            ws.close();
            reject(err);
        });

        ws.on('close', (code, reason) => {
            if (audioData.length > 0) {
                resolve({ audio: audioData, metadata });
            } else {
                reject(new Error(`WS closed without data: ${code} ${reason}`));
            }
        });

        setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
                if (audioData.length > 0) resolve({ audio: audioData, metadata });
                else reject(new Error('TTS Timeout'));
            }
        }, 45000); // 45s for long narrations
    });
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

        // Step 1: Generate friendly script
        console.log('Generating friendly script...');
        const script = await generateScript(text, chapterTitle, apiKey);

        if (!script) {
            return NextResponse.json({ error: 'Failed to generate script' }, { status: 500 });
        }

        // Step 2: Convert to speech
        console.log('Synthesizing speech with metadata...');
        const result = await synthesizeSpeech(script);

        // Step 3: Return audio, script, and metadata
        return NextResponse.json({
            audio: result.audio.toString('base64'),
            script,
            metadata: result.metadata,
            success: true
        });

    } catch (error) {
        console.error('Audio Tutor Error:', error);
        return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 });
    }
}
