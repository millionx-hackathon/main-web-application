import fs from 'fs';

async function testGoogleTTS() {
    console.log('Starting Google TTS test...');
    const text = 'সালাম বন্ধুরা! আমি শিক্ষা ভাই। তোমাদের পড়াশোনায় সাহায্য করতে আমি চলে এসেছি।';
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=bn&client=tw-ob`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        fs.writeFileSync('test-audio-google.mp3', buffer);
        console.log(`Saved audio to test-audio-google.mp3 (${buffer.length} bytes)`);
    } catch (err) {
        console.error('Error:', err);
    }
}

testGoogleTTS();
