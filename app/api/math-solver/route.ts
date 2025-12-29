import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

interface MathStep {
    id: number;
    latex: string;
    title: string;
    explanation: string;
    deepDive?: string;
    rule?: string;
}

interface SolutionMethod {
    name: string;
    name_bn: string;
    steps: MathStep[];
}

interface MathSolverResponse {
    success: boolean;
    equation: string;
    equationType: string;
    equationType_bn: string;
    variables?: {
        a?: number | string;
        b?: number | string;
        c?: number | string;
    };
    methods: SolutionMethod[];
    finalAnswer: string;
    error?: string;
}

// GLM API configuration
const GLM_API_URL = 'https://api.z.ai/api/paas/v4/chat/completions';
const GLM_MODEL = 'glm-4.7';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { equation, imageBase64, imagePath } = body;

        if (!equation && !imageBase64 && !imagePath) {
            return NextResponse.json({
                success: false,
                error: 'Equation or image is required'
            }, { status: 400 });
        }

        const apiKey = process.env.GLM_KEY;
        if (!apiKey) {
            return NextResponse.json({
                success: false,
                error: 'GLM API key not configured'
            }, { status: 500 });
        }

        let prompt: string;
        let messages: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }>;

        // Handle image input - use GLM-4.6V for vision
        if (imageBase64) {
            prompt = buildImagePrompt();
            messages = [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/png;base64,${imageBase64}`
                            }
                        },
                        {
                            type: 'text',
                            text: prompt
                        }
                    ]
                }
            ];
        } else if (imagePath) {
            // Read image from public folder
            try {
                const fullPath = path.join(process.cwd(), 'public', imagePath);
                const imageBuffer = fs.readFileSync(fullPath);
                const base64 = imageBuffer.toString('base64');

                prompt = buildImagePrompt();
                messages = [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/png;base64,${base64}`
                                }
                            },
                            {
                                type: 'text',
                                text: prompt
                            }
                        ]
                    }
                ];
            } catch (err) {
                console.error('Error reading image:', err);
                return NextResponse.json({
                    success: false,
                    error: 'Failed to read image file'
                }, { status: 500 });
            }
        } else {
            prompt = buildTextPrompt(equation);
            messages = [
                {
                    role: 'user',
                    content: prompt
                }
            ];
        }

        // Call GLM API
        const useVision = imageBase64 || imagePath;
        const response = await fetch(GLM_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: useVision ? 'glm-4.6v' : GLM_MODEL,
                messages,
                thinking: {
                    type: 'disabled'  // Disable thinking for direct JSON output
                },
                max_tokens: 4096,
                temperature: 0.3,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('GLM API Error:', response.status, errorText);
            return NextResponse.json({
                success: false,
                error: `AI সার্ভারে সমস্যা: ${response.status}`
            }, { status: 500 });
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || '';

        // Parse the JSON response
        try {
            // Extract JSON from the response (handle markdown code blocks)
            let jsonStr = text;
            const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
                jsonStr = jsonMatch[1].trim();
            }

            const parsedResponse = JSON.parse(jsonStr) as MathSolverResponse;
            return NextResponse.json({
                ...parsedResponse,
                success: true,
            });
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Raw response:', text);

            // Return the raw text if JSON parsing fails
            return NextResponse.json({
                success: true,
                equation: equation || 'Image equation',
                equationType: 'Unknown',
                equationType_bn: 'অজানা',
                methods: [{
                    name: 'AI Analysis',
                    name_bn: 'AI বিশ্লেষণ',
                    steps: [{
                        id: 1,
                        latex: equation || 'Image',
                        title: 'AI ব্যাখ্যা',
                        explanation: text,
                        rule: 'Analysis',
                    }],
                }],
                finalAnswer: 'See explanation above',
                rawResponse: text,
            });
        }

    } catch (error: unknown) {
        console.error('Math Solver Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return NextResponse.json(
            {
                success: false,
                error: `গণিত সমাধানে সমস্যা হয়েছে: ${errorMessage}`,
            },
            { status: 500 }
        );
    }
}

function buildTextPrompt(equation: string): string {
    return `# Math Solver AI - Shikkha AI Platform

তুমি একজন গণিত বিশেষজ্ঞ AI। নিচের সমীকরণটি ধাপে ধাপে সমাধান কর।

## সমীকরণ:
${equation}

## নির্দেশনা:
1. প্রথমে সমীকরণটি শনাক্ত কর (দ্বিঘাত, রৈখিক, ইত্যাদি)
2. যদি একাধিক পদ্ধতিতে সমাধান করা যায় (যেমন factorization, formula), উভয় পদ্ধতি দেখাও
3. প্রতিটি ধাপ বিস্তারিতভাবে ব্যাখ্যা কর (বাংলায়)
4. গাণিতিক নিয়ম/সূত্র উল্লেখ কর

## Output Format (JSON):
{
  "equation": "original equation",
  "equationType": "Quadratic Equation",
  "equationType_bn": "দ্বিঘাত সমীকরণ",
  "variables": {"a": 1, "b": -5, "c": 6},
  "methods": [
    {
      "name": "factorization",
      "name_bn": "উৎপাদক বিশ্লেষণ",
      "steps": [
        {
          "id": 1,
          "latex": "x^2 - 5x + 6 = 0",
          "title": "সমীকরণ শনাক্তকরণ",
          "explanation": "এটি একটি দ্বিঘাত সমীকরণ।",
          "deepDive": "দ্বিঘাত সমীকরণে x এর সর্বোচ্চ ঘাত ২।",
          "rule": "Standard Form"
        }
      ]
    }
  ],
  "finalAnswer": "x = 2, x = 3"
}

IMPORTANT: Return ONLY valid JSON, no extra text or markdown code blocks.`;
}

function buildImagePrompt(): string {
    return `# Math Solver AI - Shikkha AI Platform

তুমি একজন গণিত বিশেষজ্ঞ AI। এই ছবিতে একটি গণিতের সমস্যা আছে।

## তোমার কাজ:
1. ছবি থেকে সমীকরণ/সমস্যা পড় (OCR)
2. সমীকরণটি শনাক্ত কর (দ্বিঘাত, রৈখিক, জ্যামিতি, ইত্যাদি)
3. ধাপে ধাপে সমাধান কর
4. যদি একাধিক পদ্ধতি থাকে, সব দেখাও
5. প্রতিটি ধাপ বাংলায় ব্যাখ্যা কর

## Output Format (JSON):
{
  "equation": "extracted equation from image",
  "equationType": "Quadratic Equation",
  "equationType_bn": "দ্বিঘাত সমীকরণ",
  "variables": {"a": 1, "b": -5, "c": 6},
  "methods": [
    {
      "name": "factorization",
      "name_bn": "উৎপাদক বিশ্লেষণ",
      "steps": [
        {
          "id": 1,
          "latex": "x^2 - 5x + 6 = 0",
          "title": "সমীকরণ শনাক্তকরণ",
          "explanation": "এটি একটি দ্বিঘাত সমীকরণ।",
          "deepDive": "বিস্তারিত ব্যাখ্যা এখানে।",
          "rule": "Standard Form"
        }
      ]
    },
    {
      "name": "formula",
      "name_bn": "দ্বিঘাত সূত্র",
      "steps": []
    }
  ],
  "finalAnswer": "x = 2, x = 3"
}

IMPORTANT:
- Return ONLY valid JSON, no extra text or markdown code blocks
- All explanations must be in Bengali
- Include at least 3-5 steps per method
- Include deepDive for at least the first 2 steps`;
}
