// GLM API Test Script - Full Response Debug
// Run with: npx ts-node scripts/test-glm.ts

import * as fs from 'fs';
import * as path from 'path';

const testGLM = async () => {
    // Read .env.local manually
    let apiKey = process.env.GLM_KEY;

    // Try to read from .env.local if not in env
    if (!apiKey) {
        try {
            const envPath = path.join(process.cwd(), '.env.local');
            const envContent = fs.readFileSync(envPath, 'utf-8');
            const match = envContent.match(/GLM_KEY=(.+)/);
            if (match) {
                apiKey = match[1].trim();
            }
        } catch (e) {
            // Ignore file read errors
        }
    }

    if (!apiKey) {
        console.error('❌ GLM_KEY not found!');
        console.log('Make sure GLM_KEY is set in .env.local');
        process.exit(1);
    }

    console.log('🔑 API Key found:', apiKey.slice(0, 10) + '...');
    console.log('\n📡 Testing GLM-4.7 API...\n');

    try {
        // Test: Basic text completion with thinking disabled
        console.log('Test: Basic Chat Completion');
        console.log('─'.repeat(40));

        const response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'glm-4.7',
                messages: [
                    {
                        role: 'user',
                        content: 'What is 2+2? Answer with just the number.',
                    },
                ],
                thinking: {
                    type: 'disabled'  // Disable thinking mode for simple output
                },
                max_tokens: 100,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error:', response.status, errorText);
            process.exit(1);
        }

        const data = await response.json();
        console.log('📦 Full Response:');
        console.log(JSON.stringify(data, null, 2));

        const message = data.choices?.[0]?.message;
        console.log('\n📝 Message object:', JSON.stringify(message, null, 2));

        if (message?.content) {
            console.log('\n✅ Content:', message.content);
        }
        if (message?.reasoning_content) {
            console.log('\n🧠 Reasoning:', message.reasoning_content);
        }

        console.log('\n\n✅ GLM API Test Complete!');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

testGLM();
