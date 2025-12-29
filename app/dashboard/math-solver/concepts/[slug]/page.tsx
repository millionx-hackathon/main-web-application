import React from 'react';
import Link from 'next/link';
import {
    ArrowLeft, BookOpen, FunctionSquare,
    CheckCircle2, AlertTriangle,
    Target, Split, PenTool,
    Clock, Layers,
    Lightbulb, GraduationCap,
    Atom, MoveRight,
    LucideIcon
} from 'lucide-react';

// Enhanced Data Model
const conceptsData: Record<string, {
    title: string;
    subtitle: string;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    duration: string;
    icon: LucideIcon;
    color: string;
    heroGradient: string;
    intro: string;
    keyFormula?: string;
    prerequisites: string[];
    visualExplanation: React.ReactNode;
    sections: {
        title: string;
        content: string;
        points?: string[];
        warning?: string;
        tip?: string;
    }[];
    realWorld: {
        title: string;
        description: string;
        icon: LucideIcon;
    };
}> = {
    "quadratic-formula": {
        title: "দ্বিঘাত সূত্র (Quadratic Formula)",
        subtitle: "যেকোনো দ্বিঘাত সমীকরণ সমাধানের ব্রহ্মাস্ত্র",
        category: "Algebra",
        difficulty: "Medium",
        duration: "১০ মিনিট",
        icon: FunctionSquare,
        color: "indigo",
        heroGradient: "from-indigo-600 to-violet-600",
        prerequisites: ["মান নির্ণয়", "বর্গমূল"],
        intro: "দ্বিঘাত সমীকরণ হলো এমন একটি সমীকরণ যেখানে চলকের সর্বোচ্চ ঘাত ২। এটি বীজগণিতের অন্যতম মৌলিক ভিত্তি। যখন মিডল টার্ম ব্রেক বা অন্য কোনো সহজ পদ্ধতিতে সমাধান সম্ভব হয় না, তখন এই সূত্রটি যেকোনো দ্বিঘাত সমীকরণের সঠিক সমাধান নিশ্চিত করে।",
        keyFormula: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
        visualExplanation: (
            <div className="bg-slate-900 rounded-3xl overflow-hidden relative shadow-2xl border border-slate-700">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
                <div className="p-8 text-center relative z-10">
                    <span className="inline-block px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">Master Equation</span>

                    <div className="mb-8 transform hover:scale-105 transition-transform duration-500">
                        <p className="text-slate-500 text-sm mb-2 font-mono">Standard Form</p>
                        <div className="text-4xl md:text-5xl font-bold text-white font-serif italic mb-2 tracking-wide">
                            ax² + bx + c = <span className="text-indigo-400">0</span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-2 bg-slate-800/50 inline-block px-4 py-1 rounded-full">condition: a ≠ 0</div>
                    </div>

                    <div className="relative">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-900 rounded-full border border-slate-700 flex items-center justify-center">
                            <ArrowLeft className="-rotate-90 w-4 h-4 text-slate-500" />
                        </div>
                        <div className="bg-indigo-900/40 backdrop-blur-sm p-6 rounded-2xl border border-indigo-500/30 mx-auto max-w-lg">
                            <p className="text-indigo-200 text-xs mb-3 uppercase tracking-widest font-bold">Solution Formula</p>
                            <div className="text-2xl md:text-3xl font-bold text-white font-mono leading-relaxed">
                                x = <span className="text-yellow-400">-b</span> ± <span className="text-green-400">√<span className="border-t border-green-400">(b² - 4ac)</span></span>
                                <div className="border-t-2 border-white/20 w-full my-2"></div>
                                <span className="text-blue-400">2a</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] pointer-events-none"></div>
            </div>
        ),
        sections: [
            {
                title: "১. পৃথায়ক বা Discriminant (D)",
                content: "সূত্রের রুটের ভেতরের অংশটিকে (b² - 4ac) 'পৃথায়ক' বা Discriminant বলা হয়। এটি সমীকরণের 'DNA' এর মতো কাজ করে - অর্থাৎ এটি বলে দেয় এর সমাধান বা মূলগুলোর প্রকৃতি কেমন হবে।",
                points: [
                    "D > 0 হলে: দুটি ভিন্ন ও বাস্তব মূল থাকবে। (Real & Distinct)",
                    "D = 0 হলে: দুটি সমান ও বাস্তব মূল থাকবে। (Real & Equal)",
                    "D < 0 হলে: কোনো বাস্তব মূল নেই, এরা কাল্পনিক। (Imaginary)"
                ]
            },
            {
                title: "২. সাধারণ ভুলসমূহ (Common Pitfalls)",
                content: "ছাত্রছাত্রীরা প্রায়ই মান বসানোর সময় চিহ্নের ভুল করে থাকে। এটি এড়াতে সবসময় ব্র্যাকেট ব্যবহার করুন।",
                warning: "সবচেয়ে বেশি ভুল হয় '-b' এর ক্ষেত্রে। যদি b = -5 হয়, তবে সূত্রে -b হবে -(-5) অর্থাৎ +5। মাইনাসে-মাইনাসে প্লাস - এটি মনে রাখবেন!",
                tip: "ক্যালকুলেটরে হিসাব করার আগে খাতায় মানগুলো a, b, c আলাদা করে লিখে নিন।"
            }
        ],
        realWorld: {
            title: "মহাকাশ গবেষণা (Space Science)",
            description: "রকেটের গতিপথ নির্ধারণে এবং গ্রহের কক্ষপথের হিসাব-নিকাশে এই সূত্রের ব্যাপক ব্যবহার রয়েছে।",
            icon: Atom
        }
    },
    "parabolas": {
        title: "পরাবৃত্ত (Parabolas)",
        subtitle: "দ্বিঘাত ফাংশনের জ্যামিতিক রূপ",
        category: "Geometry",
        difficulty: "Hard",
        duration: "১৫ মিনিট",
        icon: Target,
        color: "emerald",
        heroGradient: "from-emerald-600 to-teal-600",
        prerequisites: ["স্থানাঙ্ক জ্যামিতি", "ফাংশন"],
        intro: "প্রতিটি দ্বিঘাত সমীকরণ (Quadratic Equation) গ্রাফ পেপারে আঁকলে একটি বিশেষ বক্ররেখা পাওয়া যায়, যাকে বলা হয় প্যারাবোলা বা পরাবৃত্ত। এটি দেখতে অনেকটা ইংরেজি 'U' অক্ষরের মতো। প্রকৃতির বহু নিয়ম এই আকৃতি মেনে চলে।",
        visualExplanation: (
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200 h-80 relative flex items-center justify-center p-8 group">
                <div className="absolute inset-0 bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                {/* Axes */}
                <div className="absolute w-full h-[1px] bg-slate-800"></div>
                <div className="absolute h-full w-[1px] bg-slate-800"></div>

                {/* Parabola Curve CSS */}
                <div className="w-48 h-48 border-b-4 border-l-4 border-emerald-500 rounded-bl-[100px] -rotate-45 translate-y-[-25%] group-hover:scale-110 transition-transform duration-700 ease-in-out"></div>

                {/* Annotations */}
                <div className="absolute bottom-16 flex gap-12">
                     <div className="flex flex-col items-center gap-1 group/point">
                        <span className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse"></span>
                        <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover/point:opacity-100 transition-opacity whitespace-nowrap">Root (x1)</span>
                     </div>
                     <div className="flex flex-col items-center gap-1 group/point">
                        <span className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse"></span>
                        <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover/point:opacity-100 transition-opacity whitespace-nowrap">Root (x2)</span>
                     </div>
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                     <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                     <span className="text-xs font-bold text-slate-600 bg-white px-2 py-1 rounded shadow-sm border">Vertex (শীর্ষবিন্দু)</span>
                </div>
            </div>
        ),
        sections: [
            {
                title: "শীর্ষবিন্দু বা Vertex কী?",
                content: "পরাবৃত্তের সর্বোচ্চ বা সর্বনিম্ন বিন্দুকে ভার্টেক্স বলে। এটিই হলো পরাবৃত্তের 'টার্নিং পয়েন্ট' যেখানে রেখাটি দিক পরিবর্তন করে।",
                points: [
                    "a > 0 হলে: পরাবৃত্ত উপরের দিকে খোলা (U এর মতো), তাই এখানে সর্বনিম্ন মান (Minima) থাকে।",
                    "a < 0 হলে: পরাবৃত্ত নিচের দিকে খোলা (n এর মতো), তাই এখানে সর্বোচ্চ মান (Maxima) থাকে।"
                ]
            },
            {
                title: "প্রতিসম রেখা (Axis of Symmetry)",
                content: "পরাবৃত্ত সবসময় একটি নির্দিষ্ট সরলরেখার সাপেক্ষে প্রতিসম হয়। এই রেখাটি ভার্টেক্স বা শীর্ষবিন্দু দিয়ে যায়।",
                tip: "প্রতিসম রেখার সমীকরণ হলো: x = -b / (2a)"
            }
        ],
        realWorld: {
            title: "আর্কিটেকচার ও ইঞ্জিনিয়ারিং",
            description: "ঝুলন্ত সেতুর তারগুলো (যেমন গোল্ডেন গেট ব্রিজ) পরাবৃত্তাকার হয়, কারণ এটি ভার বহনের জন্য সবচেয়ে শক্তিশালী গঠন।",
            icon: MoveRight
        }
    },
    "factorization": {
        title: "উৎপাদক বিশ্লেষণ (Factorization)",
        subtitle: "জটিল রাশিকে সরল করার কৌশল",
        category: "Basic Math",
        difficulty: "Easy",
        duration: "৮ মিনিট",
        icon: Split,
        color: "blue",
        heroGradient: "from-blue-600 to-indigo-600",
        prerequisites: ["গুণ", "ভাগ", "লসাগু"],
        intro: "ফ্যাক্টরাইজেশন বা উৎপাদকে বিশ্লেষণ হলো গণিতের 'রিভার্স ইঞ্জিনিয়ারিং'। যেমন ১০ কে ভেঙে ২ × ৫ লেখা হয়, তেমনি কোনো বড় বীজগাণিতিক রাশিকে ছোট ছোট সরল গুণফল আকারে প্রকাশ করাই হলো এর কাজ।",
        visualExplanation: (
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-3xl border border-blue-100 text-center space-y-8 shadow-inner">
                 <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 transform hover:-translate-y-1 transition-transform">
                        <div className="text-xs text-slate-400 font-bold uppercase mb-2 tracking-wider">Expanded Form</div>
                        <div className="text-3xl font-bold text-slate-800 font-mono">x² - 5x + 6</div>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-2 text-blue-500">
                        <ArrowLeft className="rotate-90 md:rotate-0 w-8 h-8" />
                        <span className="text-xs font-bold uppercase bg-blue-100 px-2 py-1 rounded">Process</span>
                    </div>

                    <div className="bg-blue-600 p-6 rounded-2xl shadow-lg transform hover:-translate-y-1 transition-transform">
                        <div className="text-xs text-blue-200 font-bold uppercase mb-2 tracking-wider">Factored Form</div>
                        <div className="text-3xl font-bold text-white font-mono">(x - 2)(x - 3)</div>
                    </div>
                 </div>

                 <p className="text-slate-500 italic max-w-md mx-auto">
                    &quot;একটি বড় সমস্যাকে ছোট ছোট সমাধানযোগ্য অংশে ভাগ করে নেওয়াই হলো উৎপাদক।&quot;
                 </p>
            </div>
        ),
        sections: [
             {
                title: "কৌশল ১: মিডল টার্ম ব্রেক (Middle Term Break)",
                content: "এটি সবচেয়ে জনপ্রিয় পদ্ধতি। এখানে মাঝের পদটিকে এমন দুটি সংখ্যায় ভাঙতে হয়, যাদের গুণফল প্রথম ও শেষ পদের গুণফলের সমান।",
                tip: "চিহ্ন নিয়ে সতর্ক থাকতে হবে। যদি শেষের সংখ্যাটি ধনাত্মক হয়, তবে দুটি সংখ্যাই একই চিহ্নের হবে।"
            },
            {
                title: "কৌশল ২: বীজগাণিতিক সূত্র প্রয়োগ",
                content: "কিছু রাশি সরাসরি সূত্র মেনে চলে। এগুলো চিনতে পারলে চোখের পলকে সমাধান করা সম্ভব।",
                points: [
                    "বর্গের বিয়োগফল: a² - b² = (a + b)(a - b)",
                    "ঘনকের সূত্র: a³ + b³ = (a + b)(a² - ab + b²)"
                ],
                warning: "a² + b² কে উৎপাদকে ভাঙা যায় না (বাস্তব সংখ্যার ক্ষেত্রে)।"
            }
        ],
        realWorld: {
            title: "ক্রিপ্টোগ্রাফি ও নিরাপত্তা",
            description: "বড় বড় সংখ্যার উৎপাদক বের করার কঠিন সমস্যার ওপর ভিত্তি করেই আপনার ফেসবুক বা ব্যাংকের পাসওয়ার্ড সুরক্ষিত থাকে (RSA Algorithm)।",
            icon: CheckCircle2
        }
    }
}

export default async function ConceptPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
    const resolvedParams = await Promise.resolve(params);
    const slug = resolvedParams.slug;
    const data = conceptsData[slug];

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
                    <div className="text-6xl mb-6">🔭</div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">বিষয়বস্তু খুঁজে পাওয়া যায়নি</h1>
                    <p className="text-slate-500 mb-8 max-w-xs mx-auto">দুঃখিত, আপনি যে বিষয়টি খুঁজছেন তা আমাদের ডাটাবেসে নেই।</p>
                    <Link href="/dashboard/math-solver" className="inline-flex items-center gap-2 text-white bg-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                        <ArrowLeft className="w-4 h-4" /> ব্যাক ফিরে যান
                    </Link>
                </div>
            </div>
        )
    }

    const Icon = data.icon;
    const RWIcon = data.realWorld.icon;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* New Professional Hero Section */}
            <div className={`relative bg-gradient-to-br ${data.heroGradient} text-white pt-20 pb-32 px-6 md:px-12 overflow-hidden`}>

                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute -right-20 -top-20 opacity-10 blur-3xl rounded-full bg-white w-96 h-96"></div>

                <div className="max-w-6xl mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                         <Link href="/dashboard/math-solver" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                            <ArrowLeft className="w-3 h-3" /> Back to Solver
                        </Link>

                        <div className="flex items-center gap-3 text-sm font-medium text-white/80">
                            <span className="flex items-center gap-1.5"><Layers className="w-4 h-4" /> {data.category}</span>
                            <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {data.duration}</span>
                            <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${data.difficulty === 'Easy' ? 'bg-green-500/20 text-green-100' : data.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-100' : 'bg-red-500/20 text-red-100'}`}>
                                {data.difficulty}
                            </span>
                        </div>

                        <div>
                            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">{data.title}</h1>
                            <p className="text-xl md:text-2xl text-indigo-100 font-light leading-relaxed max-w-lg">{data.subtitle}</p>
                        </div>
                    </div>

                    <div className="hidden md:flex justify-end">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-[2rem] shadow-2xl skew-y-3 hover:skew-y-2 transition-transform duration-500">
                             <Icon className="w-32 h-32 text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-20">
                <div className="grid grid-cols-12 gap-8">

                    {/* Left Column: Content */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">

                        {/* Intro & Visual Card */}
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                                    <BookOpen className="w-6 h-6 text-indigo-600" />
                                    ধারণা পরিচিতি
                                </h3>
                                <p className="text-slate-600 leading-8 text-lg font-medium">
                                    {data.intro}
                                </p>
                            </div>
                            {data.visualExplanation}
                        </div>

                        {/* Detailed Sections */}
                        {data.sections.map((section, idx) => (
                            <div key={idx} className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-200 group hover:border-indigo-300 transition-all duration-300 hover:shadow-md">
                                <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                    <span className={`w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center text-sm font-black`}>{idx + 1}</span>
                                    {section.title}
                                </h3>
                                <div className="pl-13 md:pl-[3.25rem]">
                                    <p className="text-slate-600 mb-6 leading-relaxed text-lg">
                                        {section.content}
                                    </p>

                                    {section.points && (
                                        <ul className="grid gap-3 mb-6">
                                            {section.points.map((pt, i) => (
                                                <li key={i} className="flex items-start gap-3 text-slate-700 font-medium">
                                                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                                    {pt}
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {section.tip && (
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100 flex gap-4">
                                            <div className="bg-white p-2 rounded-full shadow-sm h-fit">
                                                <Lightbulb className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-blue-900 mb-1">প্রো টিপস (Pro Tip)</h4>
                                                <p className="text-sm text-blue-800 leading-relaxed font-medium">
                                                    {section.tip}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {section.warning && (
                                        <div className="bg-red-50 p-5 rounded-2xl border border-red-100 flex gap-4 mt-4">
                                            <div className="bg-white p-2 rounded-full shadow-sm h-fit">
                                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-red-900 mb-1">সতর্কতা</h4>
                                                <p className="text-sm text-red-800 leading-relaxed font-medium">
                                                    {section.warning}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">

                        {/* Prerequisites Card */}
                        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
                             <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-indigo-600" />
                                পূর্বশর্ত (Prerequisites)
                             </h4>
                             <div className="flex flex-wrap gap-2">
                                {data.prerequisites.map(req => (
                                    <span key={req} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200">
                                        {req}
                                    </span>
                                ))}
                             </div>
                        </div>

                        {/* Real World Application Card */}
                        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity"></div>

                             <div className="relative z-10">
                                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                                    <RWIcon className="w-6 h-6 text-indigo-300" />
                                 </div>
                                 <h4 className="text-lg font-bold mb-2">বাস্তব জীবনে প্রয়োগ</h4>
                                 <h5 className="text-indigo-300 text-sm font-bold uppercase tracking-wider mb-4">{data.realWorld.title}</h5>
                                 <p className="text-slate-300 text-sm leading-relaxed mb-6">
                                     {data.realWorld.description}
                                 </p>
                                 <button className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
                                     আরও জানুন
                                 </button>
                             </div>
                        </div>

                        {/* Practice CTA - Small Version */}
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-8 rounded-3xl text-center text-white shadow-lg">
                            <PenTool className="w-10 h-10 mx-auto mb-4 text-white/80" />
                            <h3 className="font-bold text-xl mb-2">শিখেছ তো?</h3>
                            <p className="text-indigo-100 text-sm mb-6">এবার কয়েকটি সমস্যার সমাধান করে দক্ষতা যাচাই করো।</p>
                            <Link href="/dashboard/practice" className="block w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm shadow-xl hover:scale-105 transition-transform">
                                অনুশীলন শুরু করো
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
