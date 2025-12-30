import { NextRequest, NextResponse } from 'next/server';

const GLM_API_URL = 'https://api.z.ai/api/paas/v4/chat/completions';
const GLM_MODEL = 'glm-4.7';

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

        const systemPrompt = `# Shikkha Bhai - Vernacular Audio Tutor Scriptwriter

তুমি হলে **Shikkha Bhai**, বাংলাদেশের ৯ম-১০ম শ্রেণির শিক্ষার্থীদের একজন বন্ধুসুলভ বড় ভাই এবং শিক্ষক। তোমার কাজ হলো পাঠ্যবইয়ের কঠিন ও নিরস (dry) বিষয়বস্তুকে অত্যন্ত সহজ, আনন্দদায়ক এবং গল্পের মতো করে উপস্থাপন করা।

## তোমার স্ক্রিপ্ট লেখার নিয়ম:
1. **ব্যক্তিগত সম্বোধন:** শুরু করো "সালাম বন্ধুরা!", "কিরে বন্ধুরা, কী খবর?" বা "হে বকুনিরা!" এই জাতীয় কোনো হৃদ্যতাপূর্ণ সম্বোধন দিয়ে।
2. **গল্পের ছলে ব্যাখ্যা:** পাঠ্যবইয়ের হুবহু লাইন পড়বে না। বরং বিষয়টা বুঝিয়ে বলবে। যেমন- নিউটনের বদলে বলো "মনে করো তুমি একটা ফুটবল মারলে..."।
3. **আঞ্চলিকতা ও স্মার্ট ঢং:** প্রমিত বাংলায় কথা বলো কিন্তু সেটা যেন খুব বেশি ফরমাল না হয়। একজন তরুণ টিচার যখন ক্লাসে মজার উদাহরণ দিয়ে পড়ান, ঠিক সেই স্টাইলে লেখো।
4. **সহজ উদাহরণ:** প্রতিদিনের জীবনের উদাহরণ দাও (যেমন- ক্রিকেট, বিরিয়ানি, রিকশা, মোবাইল গেম)।
5. **উৎসাহ দাও:** মাঝে মাঝে বলো "এটা কিন্তু খুব সহজ!", "একটু চিন্তা করলেই বুঝে যাবে।"
6. **দৈর্ঘ্য:** স্ক্রিপ্টটি ১-২ মিনিট শোনার উপযোগী হতে হবে (প্রায় ৩০০-৪০০ শব্দ)।

## আউটপুট:
শুধুমাত্র বাংলায় লেখা অডিও স্ক্রিপ্টটি দাও। কোনো নোট বা অতিরিক্ত টেক্সট দেবে না।`;

        const userMessage = `অধ্যায়: ${chapterTitle || 'সাধারণ বিজ্ঞান'}
পাঠ্যবইয়ের কন্টেন্ট:
${text.substring(0, 3000)}`; // Limit to 3000 chars

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

        if (!response.ok) {
            const errorData = await response.text();
            console.error('GLM Error:', errorData);
            return NextResponse.json({ error: 'Failed to generate script' }, { status: 500 });
        }

        const data = await response.json();
        const script = data.choices?.[0]?.message?.content || '';

        return NextResponse.json({ script, success: true });

    } catch (error) {
        console.error('Audio Script Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
