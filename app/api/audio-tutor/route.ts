import { NextRequest, NextResponse } from 'next/server';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';

const GLM_API_URL = 'https://api.z.ai/api/paas/v4/chat/completions';
const GLM_MODEL = 'glm-4.7';

// Edge TTS Constants
const EDGE_TTS_URL = 'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const VOICE = 'bn-BD-PradeepNeural';

async function generateScript(text: string, chapterTitle: string, apiKey: string): Promise<string> {
    const systemPrompt = `# Shikkha Bhai - Vernacular Audio Tutor Scriptwriter

তুমি হলে **Shikkha Bhai**, বাংলাদেশের ৯ম-১০ম শ্রেণির শিক্ষার্থীদের একজন বন্ধুসুলভ বড় ভাই। তোমার কাজ হলো পাঠ্যবইয়ের কঠিন বিষয়বস্তুকে অত্যন্ত সহজ, আনন্দদায়ক এবং গল্পের মতো করে উপস্থাপন করা।

## তোমার স্ক্রিপ্ট লেখার নিয়ম:
1. **সম্বোধন:** শুরু করো "সালাম বন্ধুরা!" বা "কিরে বন্ধুরা, কী খবর?" দিয়ে।
2. **গল্পের ছলে ব্যাখ্যা:** পাঠ্যবইয়ের হুবহু লাইন পড়বে না। বরং বিষয়টা বুঝিয়ে বলবে।
3. **স্মার্ট ঢং:** প্রমিত বাংলার সাথে সামান্য কিছু ঘরোয়া শব্দ যোগ করতে পারো যেন মনে হয় একজন বড় ভাই বোঝাচ্ছে।
4. **উদাহরণ:** প্রতিদিনের জীবনের উদাহরণ দাও।
5. **দৈর্ঘ্য:** স্ক্রিপ্টটি যেন ২-৩ মিনিটের বেশি না হয় (প্রায় ২৫০-৩৫০ শব্দ)।

শুধুমাত্র বাংলায় লেখা স্ক্রিপ্টটি দাও।`;

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

async function synthesizeSpeech(text: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(EDGE_TTS_URL, {
            headers: {
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
            }
        });

        let audioData = Buffer.alloc(0);
        const requestId = uuidv4().replace(/-/g, '');

        ws.on('open', () => {
            const configMsg = `Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`;
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
                    // The audio payload is exactly after the header (preatream preamble + header)
                    // Preamble is 12 bytes
                    audioData = Buffer.concat([audioData, buffer.slice(headerLength + 12)]);
                }
            } else {
                const message = data.toString();
                if (message.includes('Path:turn.end')) {
                    ws.close();
                    resolve(audioData);
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
                resolve(audioData);
            } else {
                reject(new Error(`WS closed without data: ${code} ${reason}`));
            }
        });

        setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
                if (audioData.length > 0) resolve(audioData);
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
        console.log('Synthesizing speech...');
        const audioBuffer = await synthesizeSpeech(script);

        // Step 3: Return audio
        return new Response(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'X-Generated-Script': encodeURIComponent(script),
                'Access-Control-Expose-Headers': 'X-Generated-Script',
            },
        });

    } catch (error) {
        console.error('Audio Tutor Error:', error);
        return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 });
    }
}
