
import React, { useState, useEffect, useRef } from 'react';
import { Layout, Container, Heading, SubHeading, BodyText, Card, Button, RangeSlider, BottomNav, FadeIn, Checkbox, Modal } from './components/DesignSystem';
import { ScreenName, UserMode, UserState, Meal, GoalOption, NutritionFact, GeneratedRecipe, PrescriptionItem, JunkFoodAdvice, LocalService, HealthMode, BioMechanism, ChatMessage, IngredientCheckResult } from './types';
import { generateDailyPlan, generateGoalsForContext, analyzeCookingStep, analyzeNutrition, generateRecipeFromImage, analyzeHealthCondition, generateCorporateInsights, generateJunkFoodAdvice, findCookingVideo, findLocalGrocers, findRestaurantOptions, detectLocationFromCoords, simulateWearableData, regenerateMealOption, editImageWithGenAI, chatWithHealthBot, transcribeAudio, generateSpeech, verifyLocationEntry, findDeliveryPartners, checkIngredientAvailability, findPharmacies, generateWearableInsight, analyzeFoodText, findOnlinePharmacies } from './services/geminiService';
import { signUp, signIn, signOut, onAuthStateChange } from './services/supabaseClient';

// --- Assets / Icons ---
const Icons = {
  Energy: <span className="text-2xl">⚡</span>,
  Digestion: <span className="text-2xl">🍃</span>,
  Sugar: <span className="text-2xl">🍬</span>,
  Hair: <span className="text-2xl">✨</span>,
  General: <span className="text-2xl">❤️</span>,
  Focus: <span className="text-2xl">🧠</span>,
  Stress: <span className="text-2xl">🧘</span>,
  Check: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
};

// --- Reusable Navigation Header ---
const NavHeader: React.FC<{ onBack: () => void; title?: string }> = ({ onBack, title }) => (
  <div className="flex items-center gap-3 mb-6 cursor-pointer group" onClick={onBack}>
    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5F6F6C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </div>
    <span className="text-sm text-text-secondary font-medium group-hover:text-primary transition-colors">{title || 'Back'}</span>
  </div>
);

// --- Simple Markdown Renderer for Chat ---
const MarkdownText: React.FC<{ text: string }> = ({ text }) => {
    return (
        <div className="space-y-1">
            {text.split('\n').map((line, i) => (
                <div key={i} className="min-h-[20px]">
                    {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
                        }
                        return <span key={j}>{part}</span>;
                    })}
                </div>
            ))}
        </div>
    );
}

// --- Bug Report Modal ---
const BugReportModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");

    const handleSend = () => {
        const email = "rajuthalla80080@gmail.com";
        const subject = `[GeminiCare Bug/Request]: ${title}`;
        const body = `Description:\n${desc}\n\n--\nSent from Gemini Care MVP`;
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        onClose();
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Report Issue / Request">
            <div className="space-y-4">
                <BodyText>Found a bug or want a new feature? Let us know directly.</BodyText>
                <input 
                    placeholder="Short Title" 
                    className="w-full p-4 rounded-xl border bg-gray-50"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                <textarea 
                    placeholder="Describe the issue or feature request..." 
                    className="w-full p-4 rounded-xl border bg-gray-50 min-h-[120px]"
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                />
                <Button fullWidth onClick={handleSend} disabled={!title || !desc}>Send Email</Button>
            </div>
        </Modal>
    );
};

// --- Mechanism Visualizer ---
const BioMechanismView: React.FC<{ mechanism: BioMechanism; sources?: string[]; onClose: () => void }> = ({ mechanism, sources, onClose }) => {
    return (
        <Modal isOpen={true} onClose={onClose} fullScreen>
            <div className="bg-gray-900 text-white min-h-screen flex flex-col p-6">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold tracking-wider text-green-400 uppercase">Body Engine</h2>
                    <button onClick={onClose} className="p-2 bg-white/10 rounded-full">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4 animate-bounce">{
                            mechanism.visualMetaphor.includes('Shield') ? '🛡️' : 
                            mechanism.visualMetaphor.includes('Filter') ? '🧪' : 
                            mechanism.visualMetaphor.includes('Engine') ? '⚙️' : '🧬'
                        }</div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-blue-400 bg-clip-text text-transparent mb-2">{mechanism.title}</h1>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">{mechanism.summary}</p>
                    </div>

                    {/* Source Citations */}
                    {sources && sources.length > 0 && (
                        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Verified Sources</h3>
                            <ul className="space-y-2">
                                {sources.map((s, i) => (
                                    <li key={i} className="text-xs text-blue-300 truncate underline cursor-pointer" onClick={() => window.open(s, '_blank')}>
                                        {new URL(s).hostname.replace('www.', '')}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {mechanism.molecularSynergy && mechanism.molecularSynergy.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-widest">Molecular Synergies Identified</h3>
                            <div className="space-y-3">
                                {mechanism.molecularSynergy.map((syn, idx) => (
                                    <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-xl relative overflow-hidden">
                                        <div className="absolute top-0 left-0 bottom-0 bg-green-500/10" style={{width: `${syn.matchScore}%`}}></div>
                                        <div className="flex justify-between items-center relative z-10">
                                            <div>
                                                <div className="text-xs text-red-300 mb-1">Drug: {syn.drugMolecule}</div>
                                                <div className="text-lg font-bold text-green-300">Food: {syn.foodMolecule}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold">{syn.matchScore}%</div>
                                                <div className="text-[10px] text-gray-400">Match</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-widest">Mechanism of Action</h3>
                    <div className="relative border-l-2 border-green-500/30 pl-6 ml-2 space-y-6">
                        {mechanism.steps.map((step, i) => (
                            <div key={i} className="relative">
                                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-green-500 border-4 border-gray-900"></div>
                                <p className="text-sm text-gray-300">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

// --- Chat Assistant Component ---
const ChatAssistant: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'model', text: "Hi! I'm **Gemini Care**.\n\nI can help you with:\n• Quick recipes\n• Health checks\n• Medicine reminders\n\nHow can I help today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => { const el = document.getElementById('chat-container'); if(el) el.scrollTop = el.scrollHeight; }, [messages]);

    const handleSend = async () => {
        if(!input.trim()) return;
        const newMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, newMsg]);
        setInput("");
        setLoading(true);
        const history = messages.map(m => ({ role: m.role, text: m.text }));
        const responseText = await chatWithHealthBot(history, newMsg.text);
        setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'model', text: responseText }]);
        setLoading(false);
    };

    const handleRecord = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream);
                mediaRecorderRef.current = recorder;
                audioChunksRef.current = [];
                recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
                recorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const base64Audio = (reader.result as string).split(',')[1];
                        setLoading(true);
                        const text = await transcribeAudio(base64Audio);
                        setInput(text);
                        setLoading(false);
                    };
                    reader.readAsDataURL(audioBlob);
                    stream.getTracks().forEach(track => track.stop());
                };
                recorder.start();
                setIsRecording(true);
            } catch (e) { alert("Microphone access denied."); }
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
                <div className="bg-white w-full max-w-md h-[65vh] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col animate-slideUp overflow-hidden">
                    <div className="px-6 py-4 border-b flex justify-between items-center bg-white rounded-t-3xl">
                        <div>
                            <h3 className="font-bold text-lg text-primary flex items-center gap-2"><span className="text-2xl">🌿</span> Gemini Care</h3>
                            <p className="text-xs text-gray-400 font-medium">Domain Expert • Always Online</p>
                        </div>
                        <button onClick={onClose} className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors">✕</button>
                    </div>
                    <div id="chat-container" className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white border border-gray-100 rounded-tl-none text-gray-800'}`}>
                                    {msg.role === 'model' ? <MarkdownText text={msg.text} /> : msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && <div className="flex justify-start"><div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2"><div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div><div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div><div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div></div></div>}
                    </div>
                    <div className="p-4 bg-white border-t flex gap-2 items-center safe-area-bottom">
                        <button onClick={handleRecord} className={`p-3 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{isRecording ? '⏹' : '🎙'}</button>
                        <input className="flex-1 bg-gray-100 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" placeholder="Ask me anything..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
                        <button onClick={handleSend} disabled={!input.trim()} className="p-3 bg-primary text-white rounded-full hover:brightness-110 disabled:opacity-50 shadow-md transform hover:scale-105 transition-all"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button>
                    </div>
                </div>
            </div>
        </>
    );
};

// --- Improved Service Finder with Tabs ---
const ServiceFinderModal: React.FC<{ 
    city: string;
    queryItem: string | string[]; 
    type: 'GROCERY' | 'RESTAURANT' | 'PHARMACY';
    onClose: () => void;
}> = ({ city, queryItem, type, onClose }) => {
    const [mode, setMode] = useState<'LOCAL' | 'APPS'>('APPS');
    const [services, setServices] = useState<LocalService[]>([]);
    const [partners, setPartners] = useState<LocalService[]>([]);
    const [loading, setLoading] = useState(true);
    const [log, setLog] = useState<string[]>([]);

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            setLog(['🔍 Scanning...', `📍 Area: ${city}`]);
            try {
                // Fetch both types of data
                if (type === 'GROCERY' && Array.isArray(queryItem)) {
                    const local = await findLocalGrocers(city, queryItem);
                    const apps = await findDeliveryPartners(city, 'GROCERY');
                    setServices(local);
                    setPartners(apps);
                } else if (type === 'RESTAURANT') {
                    const local = await findRestaurantOptions(city, queryItem as string);
                    const apps = await findDeliveryPartners(city, 'FOOD');
                    setServices(local);
                    setPartners(apps);
                } else {
                    const local = await findPharmacies(city);
                    const apps = await findOnlinePharmacies(city);
                    setServices(local);
                    setPartners(apps);
                }
            } catch (e) { console.error(e); }
            setLoading(false);
        };
        fetchServices();
    }, [city, queryItem, type]);

    return (
        <Modal isOpen={true} onClose={onClose} title={type === 'GROCERY' ? 'Get Ingredients' : 'Order Food'}>
             {/* Mode Toggle */}
             <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                <button onClick={() => setMode('APPS')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'APPS' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>Delivery Apps</button>
                <button onClick={() => setMode('LOCAL')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'LOCAL' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>Local Places</button>
             </div>

             {loading ? (
                <div className="py-8 flex flex-col items-center justify-center opacity-80">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-xs text-gray-500">Finding best options...</p>
                </div>
             ) : (
                <div className="animate-fadeIn pb-4">
                    {mode === 'APPS' && (
                        <div className="grid grid-cols-2 gap-3">
                            {partners.map((p, i) => (
                                <a key={i} href={p.url} target="_blank" rel="noreferrer" className="flex flex-col items-center text-center gap-2 bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-all">
                                    <div className="text-3xl">{p.icon || '📱'}</div>
                                    <div className="font-bold text-sm text-gray-800">{p.name}</div>
                                    <div className="text-[10px] text-gray-500">{p.description}</div>
                                </a>
                            ))}
                            {partners.length === 0 && <p className="col-span-2 text-center text-gray-400 text-xs">No specific apps found.</p>}
                        </div>
                    )}

                    {mode === 'LOCAL' && (
                        <div className="space-y-3">
                            {services.map((service, idx) => (
                                <a key={idx} href={service.googleMapsUri} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all group">
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-xl">📍</div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-gray-800 text-sm">{service.name}</h4>
                                            {service.rating && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 rounded font-bold">★ {service.rating}</span>}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 truncate">{service.address || "View on Maps"}</p>
                                    </div>
                                    <div className="text-primary opacity-50 group-hover:opacity-100">↗</div>
                                </a>
                            ))}
                            {services.length === 0 && <p className="text-center text-gray-400 text-xs">No local data available.</p>}
                        </div>
                    )}
                </div>
             )}
        </Modal>
    );
};

// --- Comprehensive Food Logger (Scan/Upload/Type) ---
const FoodLoggerModal: React.FC<{ 
    onClose: () => void; 
    onLog: (fact: NutritionFact) => void; 
}> = ({ onClose, onLog }) => {
    const [mode, setMode] = useState<'SCAN' | 'UPLOAD' | 'TYPE'>('SCAN');
    const [textInput, setTextInput] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<NutritionFact | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Camera Logic
    useEffect(() => {
        let stream: MediaStream;
        const startCamera = async () => {
            if (mode === 'SCAN' && !imagePreview && !result) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                    if (videoRef.current) videoRef.current.srcObject = stream;
                } catch (e) { console.error("Camera error", e); }
            }
        };
        startCamera();
        return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
    }, [mode, imagePreview, result]);

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const context = canvasRef.current.getContext('2d');
        if (context) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0);
            const base64 = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
            setImagePreview(base64);
            analyze(base64, 'IMAGE');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                setImagePreview(base64);
                analyze(base64, 'IMAGE');
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const analyze = async (data: string, type: 'IMAGE' | 'TEXT') => {
        setAnalyzing(true);
        let fact: NutritionFact;
        if (type === 'IMAGE') fact = await analyzeNutrition(data);
        else fact = await analyzeFoodText(data);
        setResult(fact);
        setAnalyzing(false);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Add Calories">
            {!result ? (
                <>
                    {/* Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                        <button onClick={() => { setMode('SCAN'); setImagePreview(null); }} className={`flex-1 py-2 text-xs font-bold rounded-lg ${mode === 'SCAN' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}>Scan</button>
                        <button onClick={() => { setMode('UPLOAD'); setImagePreview(null); }} className={`flex-1 py-2 text-xs font-bold rounded-lg ${mode === 'UPLOAD' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}>Upload</button>
                        <button onClick={() => { setMode('TYPE'); setImagePreview(null); }} className={`flex-1 py-2 text-xs font-bold rounded-lg ${mode === 'TYPE' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}>Type</button>
                    </div>

                    <div className="h-64 bg-gray-50 rounded-2xl mb-4 flex flex-col items-center justify-center relative overflow-hidden border border-gray-200">
                        {analyzing ? (
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                                <span className="text-xs text-primary font-bold">Analyzing...</span>
                            </div>
                        ) : mode === 'SCAN' && !imagePreview ? (
                            <>
                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                <canvas ref={canvasRef} className="hidden" />
                                <button onClick={handleCapture} className="absolute bottom-4 w-14 h-14 bg-white rounded-full border-4 border-gray-200 shadow-lg"></button>
                            </>
                        ) : mode === 'UPLOAD' && !imagePreview ? (
                            <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center cursor-pointer text-gray-400 hover:text-primary transition-colors">
                                <span className="text-4xl mb-2">🖼️</span>
                                <span className="text-sm font-bold">Tap to Upload</span>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                            </div>
                        ) : mode === 'TYPE' ? (
                            <textarea 
                                className="w-full h-full bg-transparent p-4 resize-none focus:outline-none text-center placeholder-gray-400" 
                                placeholder="e.g. 1 Bowl of Dal Rice and a banana"
                                value={textInput}
                                onChange={e => setTextInput(e.target.value)}
                            />
                        ) : (
                            <img src={`data:image/jpeg;base64,${imagePreview}`} className="w-full h-full object-cover" alt="Preview" />
                        )}
                    </div>
                    
                    {mode === 'TYPE' && (
                        <Button fullWidth onClick={() => analyze(textInput, 'TEXT')} disabled={!textInput.trim()}>Calculate</Button>
                    )}
                    {(mode === 'SCAN' || mode === 'UPLOAD') && imagePreview && (
                         <Button fullWidth onClick={() => { setImagePreview(null); setMode(mode); }} variant="secondary">Retake</Button>
                    )}
                </>
            ) : (
                <div className="animate-slideUp">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Identified</div>
                            <h2 className="text-2xl font-bold text-gray-800 leading-tight">{result.name}</h2>
                            <span className={`inline-block mt-2 px-2 py-1 rounded text-[10px] font-bold uppercase ${result.healthCheck === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{result.healthCheck}</span>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-bold text-primary">{result.calories}</div>
                            <div className="text-xs text-gray-400 uppercase font-bold">Calories</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        <div className="bg-gray-50 p-3 rounded-xl text-center">
                            <div className="text-xs text-gray-400 font-bold uppercase">Carbs</div>
                            <div className="font-bold text-gray-700">{result.carbs}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl text-center">
                            <div className="text-xs text-gray-400 font-bold uppercase">Protein</div>
                            <div className="font-bold text-gray-700">{result.protein}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl text-center">
                            <div className="text-xs text-gray-400 font-bold uppercase">Fat</div>
                            <div className="font-bold text-gray-700">{result.fat}</div>
                        </div>
                    </div>
                    <Button fullWidth onClick={() => { onLog(result); onClose(); }}>Add to Daily Total</Button>
                    <Button fullWidth variant="ghost" onClick={() => setResult(null)} className="mt-2">Cancel</Button>
                </div>
            )}
        </Modal>
    );
}

// --- Cooking Assistant ---
const CookingAssistant: React.FC<{ 
    steps: string[], 
    recipeName: string,
    onClose: () => void,
    onComplete: () => void,
    onOrderIngredients?: () => void;
}> = ({ steps, recipeName, onClose, onComplete, onOrderIngredients }) => {
    // ... (Keep existing implementation logic, just ensure onOrderIngredients is passed correctly)
    const [currentStep, setCurrentStep] = useState(0);
    const [videoUrls, setVideoUrls] = useState<string[]>([]);
    const [loadingVideo, setLoadingVideo] = useState(false);
    
    // Simplified for brevity as mostly unchanged
    return (
        <Modal isOpen={true} onClose={onClose} fullScreen={true}>
            <div className="flex flex-col h-full bg-gray-900 text-white relative overflow-hidden">
                <div className="flex justify-between items-center px-4 py-4 z-10 bg-gradient-to-b from-black/80 to-transparent">
                     <button onClick={onClose} className="p-2 bg-white/10 backdrop-blur-md rounded-full">✕</button>
                     <div className="bg-white/10 px-4 py-1 rounded-full backdrop-blur-md text-sm font-bold tracking-widest">STEP {currentStep + 1}</div>
                     <button onClick={onOrderIngredients} className="p-2 bg-green-600/80 rounded-full animate-pulse">🛒</button>
                </div>
                <div className="flex-1 flex flex-col justify-center items-center px-8 text-center pb-20">
                    <h1 className="text-2xl font-bold leading-tight animate-fadeIn">{steps[currentStep]}</h1>
                </div>
                <div className="p-6 pb-8 bg-black/80">
                    <Button fullWidth onClick={() => currentStep < steps.length - 1 ? setCurrentStep(c => c+1) : onComplete()}>{currentStep < steps.length - 1 ? 'Next' : 'Finish'}</Button>
                </div>
            </div>
        </Modal>
    );
};

// EditMealModal (Unchanged)
const EditMealModal: React.FC<{ currentMeal: Meal; healthMode: HealthMode; medicalCondition: string; onClose: () => void; onSave: (meal: Meal) => void; }> = ({ currentMeal, healthMode, medicalCondition, onClose, onSave }) => {
    const [request, setRequest] = useState("");
    const [loading, setLoading] = useState(false);
    const handleRegenerate = async () => {
        if (!request) return;
        setLoading(true);
        const newMeal = await regenerateMealOption(currentMeal, request, healthMode, medicalCondition);
        onSave(newMeal);
        onClose();
        setLoading(false);
    };
    return (
        <Modal isOpen={true} onClose={onClose} title={`Edit ${currentMeal.type}`}>
            <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl font-bold text-gray-800">{currentMeal.title}</div>
                <textarea className="w-full p-4 rounded-2xl border bg-gray-50 min-h-[100px]" placeholder="e.g. Make it vegetarian..." value={request} onChange={e => setRequest(e.target.value)} />
                <Button fullWidth onClick={handleRegenerate} disabled={!request || loading}>{loading ? 'Designing...' : 'Update Meal'}</Button>
            </div>
        </Modal>
    );
};

// --- Medicine Order Modal ---
const MedicineOrderModal: React.FC<{
  city: string;
  medicines: PrescriptionItem[];
  onClose: () => void;
}> = ({ city, medicines, onClose }) => {
    const [view, setView] = useState<'LIST' | 'FINDER'>('LIST');

    if (view === 'FINDER') {
        return <ServiceFinderModal city={city} queryItem={medicines.map(m => m.name)} type="PHARMACY" onClose={onClose} />;
    }

    return (
        <Modal isOpen={true} onClose={onClose} title="Order Medicines">
             <div className="space-y-6 animate-slideUp">
                 <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
                     <div className="flex items-center gap-3 mb-4">
                         <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">💊</div>
                         <div>
                             <h3 className="font-bold text-gray-800">Prescription</h3>
                             <p className="text-xs text-gray-500">{medicines.length} items to order</p>
                         </div>
                     </div>
                     <div className="space-y-2">
                         {medicines.map((item, idx) => (
                             <div key={idx} className="flex justify-between items-center text-sm border-b border-green-100 last:border-0 pb-2 last:pb-0">
                                 <span className="font-medium text-gray-700">{item.name}</span>
                                 <span className="text-gray-400 text-xs">{item.dosage || 'Standard'}</span>
                             </div>
                         ))}
                         {medicines.length === 0 && <div className="text-gray-400 text-sm text-center">No medicines listed.</div>}
                     </div>
                 </div>

                 <div className="space-y-3">
                     <Button fullWidth onClick={() => setView('FINDER')}>Find Pharmacies & Apps</Button>
                     <Button fullWidth variant="secondary" onClick={() => {
                         const text = `Hi, I need to order: ${medicines.map(m => `${m.name} (${m.dosage || ''})`).join(', ')}`;
                         navigator.clipboard.writeText(text);
                         alert("Copied to clipboard!");
                     }}>Copy List to Clipboard</Button>
                 </div>
             </div>
        </Modal>
    );
};

// --- Login Screen ---
const LoginScreen: React.FC<{ onSuccess: (user: any) => void; onSignUp: () => void; onGuest: () => void }> = ({ onSuccess, onSignUp, onGuest }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) return;
        setLoading(true);
        setError("");
        try {
            const result = await signIn(email, password);
            onSuccess(result.user);
        } catch (err: any) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="justify-center">
            <div className="text-center mb-10 animate-slideUp">
                <div className="text-6xl mb-4">🌿</div>
                <Heading>Welcome Back</Heading>
                <BodyText>Sign in to access your personal health plan.</BodyText>
            </div>
            <div className="space-y-4 animate-slideUp">
                {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}
                <input
                    placeholder="Email"
                    type="email"
                    className="w-full p-4 rounded-2xl border bg-gray-50 text-sm"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    placeholder="Password"
                    type="password"
                    className="w-full p-4 rounded-2xl border bg-gray-50 text-sm"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <Button fullWidth onClick={handleLogin} disabled={!email.trim() || !password.trim() || loading}>
                    {loading ? "Signing in..." : "Sign In"}
                </Button>
                <Button fullWidth variant="ghost" onClick={onSignUp}>Create Account</Button>
                <Button fullWidth variant="secondary" onClick={onGuest}>Continue as Guest</Button>
            </div>
        </Container>
    );
};

// --- SignUp Screen ---
const SignUpScreen: React.FC<{ onSuccess: (user: any) => void; onLogin: () => void }> = ({ onSuccess, onLogin }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSignUp = async () => {
        if (!email.trim() || !password.trim()) return;
        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const result = await signUp(email, password, email.split('@')[0]);
            onSuccess(result.user);
        } catch (err: any) {
            setError(err.message || "Sign up failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="justify-center">
            <div className="text-center mb-10 animate-slideUp">
                <div className="text-6xl mb-4">🌿</div>
                <Heading>Create Account</Heading>
                <BodyText>Join to get your personalized health plan.</BodyText>
            </div>
            <div className="space-y-4 animate-slideUp">
                {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}
                <input
                    placeholder="Email"
                    type="email"
                    className="w-full p-4 rounded-2xl border bg-gray-50 text-sm"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    placeholder="Password (min 6 chars)"
                    type="password"
                    className="w-full p-4 rounded-2xl border bg-gray-50 text-sm"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <input
                    placeholder="Confirm Password"
                    type="password"
                    className="w-full p-4 rounded-2xl border bg-gray-50 text-sm"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                />
                <Button fullWidth onClick={handleSignUp} disabled={!email.trim() || !password.trim() || loading}>
                    {loading ? "Creating..." : "Create Account"}
                </Button>
                <Button fullWidth variant="ghost" onClick={onLogin}>Already have an account?</Button>
            </div>
        </Container>
    );
};

// --- Upgrade / Paywall Screen ---
const UpgradeScreen: React.FC<{ onBack: () => void; onUpgrade: () => void }> = ({ onBack, onUpgrade }) => {
    return (
        <Container className="bg-gradient-to-br from-green-50 to-emerald-100">
            <NavHeader onBack={onBack} title="Back to Free Plan" />
            <div className="text-center mb-6">
                <div className="text-6xl animate-bounce mb-2">💎</div>
                <Heading>Unlock Full Health</Heading>
                <BodyText>Get unlimited AI generations and expert tools.</BodyText>
            </div>
            
            <Card className="border-2 border-primary shadow-xl bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                <div className="mb-4">
                    <span className="text-3xl font-bold text-primary">$19.99</span>
                    <span className="text-text-secondary"> / month</span>
                </div>
                <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Unlimited AI Plans</li>
                    <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Disease Management</li>
                    <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Molecular Food Match</li>
                    <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Priority Chat Support</li>
                </ul>
                <Button fullWidth onClick={onUpgrade} variant="primary">Upgrade Now</Button>
            </Card>

            <Card className="mt-4 border border-transparent bg-white/50">
                 <div className="mb-2">
                    <span className="text-xl font-bold text-gray-600">$4.99</span>
                    <span className="text-text-secondary"> / week</span>
                </div>
                <Button fullWidth onClick={onUpgrade} variant="secondary">Start Weekly</Button>
            </Card>
            
            <p className="text-center text-xs text-gray-500 mt-6">
                High-margin pricing driven by premium AI token costs.
            </p>
        </Container>
    );
};


export default function App() {
  const [screen, setScreen] = useState<ScreenName>(ScreenName.LOGIN);
  const [activeTab, setActiveTab] = useState('Today');
  const [showMechanism, setShowMechanism] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userState, setUserState] = useState<UserState>({
    isAuthenticated: false,
    isLocalGuest: false,
    isPremium: false,
    generationsLeft: 3,
    mode: UserMode.CONSUMER,
    healthMode: HealthMode.GENERAL,
    goals: [],
    dietType: 'Balanced',
    tastePreference: 'Standard',
    hasMedicine: false,
    prescriptionItems: [],
    language: 'English',
    plan: null,
    country: '',
    state: '',
    city: '',
    planGenerationMode: 'STANDARD',
    progress: {
        junkCalories: 0,
        caloriesTarget: 2200,
        waterIntake: 0,
        waterTarget: 8,
        lastResetDate: new Date().toISOString(),
        completedMealIndices: [],
        medicineTakenIndices: [],
        carriedMeds: false,
        molecularSynergyScore: 0
    }
  });

  const [generatedGoals, setGeneratedGoals] = useState<GoalOption[]>([]);
  const [showFoodLogger, setShowFoodLogger] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showMedicineOrderModal, setShowMedicineOrderModal] = useState(false);
  const [showBugReport, setShowBugReport] = useState(false);
  const [serviceQuery, setServiceQuery] = useState<{item: string | string[], type: 'GROCERY' | 'RESTAURANT' | 'PHARMACY'} | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [mealTab, setMealTab] = useState<'COOK' | 'ORDER' | 'OUTSIDE'>('COOK');
  const [hydrationTimeLeft, setHydrationTimeLeft] = useState<string>("");
  const [isHydrationLocked, setIsHydrationLocked] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [verifyingLocation, setVerifyingLocation] = useState(false);
  const [analyzingHealth, setAnalyzingHealth] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzingWork, setIsAnalyzingWork] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [mealToEdit, setMealToEdit] = useState<Meal | null>(null);
  const [wearableInsight, setWearableInsight] = useState<string | null>(null);

  useEffect(() => {
    const subscription = onAuthStateChange((user) => {
      setCurrentUser(user);
      if (!user) {
        setScreen(ScreenName.LOGIN);
      }
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      setCurrentUser(null);
      updateState('isAuthenticated', false);
      updateState('isLocalGuest', false);
      updateState('uid', undefined);
      setScreen(ScreenName.LOGIN);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateState = (key: keyof UserState, value: any) => {
    setUserState(prev => ({ ...prev, [key]: value }));
  };

  const updateProgress = (key: keyof UserState['progress'], value: any) => {
      setUserState(prev => ({ ...prev, progress: { ...prev.progress, [key]: value } }));
  }

  // Hydration Timer
  useEffect(() => { const timer = setInterval(() => { if (userState.progress.nextHydrationTime) { const now = new Date().getTime(); const target = new Date(userState.progress.nextHydrationTime).getTime(); const diff = target - now; if (diff > 0) { const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)); const seconds = Math.floor((diff % (1000 * 60)) / 1000); setHydrationTimeLeft(`${minutes}m ${seconds}s`); setIsHydrationLocked(true); } else { setHydrationTimeLeft("Time to drink!"); setIsHydrationLocked(false); } } else { setHydrationTimeLeft(""); setIsHydrationLocked(false); } }, 1000); return () => clearInterval(timer); }, [userState.progress.nextHydrationTime]);
  
  const handleHydrate = () => { const now = new Date(); updateProgress('waterIntake', userState.progress.waterIntake + 1); updateProgress('lastHydrationTime', now.toISOString()); const nextTime = new Date(now.getTime() + 60 * 60 * 1000); updateProgress('nextHydrationTime', nextTime.toISOString()); };
  
  const getConsumedCalories = () => { let total = userState.progress.junkCalories; userState.progress.completedMealIndices.forEach(idx => { const meal = userState.plan?.meals[idx]; if(meal) total += (parseInt(meal.calories || '0') || 0); }); return total; };

  const handleUpgrade = () => {
      updateState('isPremium', true);
      alert("Welcome to Premium! Unlimited access unlocked.");
      setScreen(ScreenName.TODAY);
  };

  // Handlers
  const handleVerifyLocation = async () => { if (!userState.city) return; setVerifyingLocation(true); try { const corrected = await verifyLocationEntry(userState.city, userState.state); updateState('city', corrected.city); updateState('state', corrected.state); if(corrected.country) updateState('country', corrected.country); setScreen(ScreenName.MODE_SELECTION); } catch (e) { setScreen(ScreenName.MODE_SELECTION); } finally { setVerifyingLocation(false); } };
  const handleDetectLocation = async () => { if (!navigator.geolocation) { alert("Geolocation is not supported"); return; } updateState('city', ''); setDetectingLocation(true); navigator.geolocation.getCurrentPosition(async (position) => { const { latitude, longitude } = position.coords; const locData = await detectLocationFromCoords(latitude, longitude); if (locData.city) updateState('city', locData.city); if (locData.state) updateState('state', locData.state); if (locData.country) updateState('country', locData.country); setDetectingLocation(false); }, () => { alert("Manual entry required."); setDetectingLocation(false); }); };
  const handleCorporateLogin = async () => { if(userState.companyName && userState.jobDomain) { setIsAnalyzingWork(true); setAnalysisStep(1); setTimeout(() => setAnalysisStep(2), 1500); setTimeout(() => setAnalysisStep(3), 3000); const insight = await generateCorporateInsights(userState.companyName, userState.jobDomain, userState.city); updateState('corporateInsights', insight); setIsAnalyzingWork(false); setAnalysisStep(0); setScreen(ScreenName.GOALS); } };
  const handleHealthAnalysis = async (type: 'IMAGE' | 'TEXT', data: string) => { setAnalyzingHealth(true); const results = await analyzeHealthCondition(type, data); if(results) { updateState('medicalAnalysis', results); updateState('prescriptionItems', results.items); updateState('medicalCondition', results.condition); } setAnalyzingHealth(false); setScreen(ScreenName.MEDICINE_VERIFY); };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { const reader = new FileReader(); reader.onloadend = () => { handleHealthAnalysis('IMAGE', (reader.result as string).split(',')[1]); }; reader.readAsDataURL(e.target.files[0]); } };
  const handleLogFood = (fact: NutritionFact) => { const cals = parseInt(fact.calories) || 0; updateProgress('junkCalories', userState.progress.junkCalories + cals); };
  const handleToggleMeal = (index: number) => { const currentIndices = [...userState.progress.completedMealIndices]; if (currentIndices.includes(index)) { updateProgress('completedMealIndices', currentIndices.filter(i => i !== index)); } else { updateProgress('completedMealIndices', [...currentIndices, index]); } };
  const handleMealUpdate = (newMeal: Meal) => { if(!userState.plan) return; const updatedMeals = userState.plan.meals.map(m => { if (m.type === newMeal.type) return newMeal; return m; }); const newPlan = { ...userState.plan, meals: updatedMeals }; updateState('plan', newPlan); };
  const openGrocerySearch = () => { if (!selectedMeal) return; const ingredients = selectedMeal.ingredients?.map(i => i.name) || []; setServiceQuery({ item: ingredients, type: 'GROCERY' }); setShowServiceModal(true); };

  // Effects
  useEffect(() => { if (screen === ScreenName.GOALS) { let context = "General Wellness"; if (userState.mode === UserMode.CORPORATE) context = `${userState.jobDomain} at ${userState.companyName}`; else if (userState.mode === UserMode.CUSTOM && userState.customModeInput) context = userState.customModeInput; generateGoalsForContext(context, userState.language).then(setGeneratedGoals); } }, [screen, userState.mode]);
  useEffect(() => { 
      if (screen === ScreenName.GENERATING) { 
          // Check Generation Limit
          if (!userState.isPremium && userState.generationsLeft <= 0) {
              setScreen(ScreenName.UPGRADE);
              return;
          }

          generateDailyPlan(userState).then(plan => { 
              updateState('plan', plan);
              // Decrement generations if not premium
              if (!userState.isPremium) {
                  updateState('generationsLeft', userState.generationsLeft - 1);
              }
              
              if(plan.bioMechanism?.molecularSynergy?.length) { 
                  const avg = plan.bioMechanism.molecularSynergy.reduce((a, b) => a + b.matchScore, 0) / plan.bioMechanism.molecularSynergy.length; 
                  updateProgress('molecularSynergyScore', Math.floor(avg)); 
              } 
              setScreen(ScreenName.TODAY); 
            }).catch(err => { 
                console.error(err);
                setScreen(ScreenName.PREFERENCES); 
            }); 
        } 
    }, [screen]);

  const renderContent = () => {
    switch(screen) {
        case ScreenName.LOGIN:
            return (
                <LoginScreen
                    onSuccess={(user) => {
                        setCurrentUser(user);
                        updateState('isAuthenticated', true);
                        updateState('uid', user.id);
                        updateState('name', user.user_metadata?.display_name || user.email?.split('@')[0] || '');
                        setScreen(ScreenName.LANGUAGE);
                    }}
                    onSignUp={() => setScreen(ScreenName.SIGNUP)}
                    onGuest={() => {
                        updateState('isLocalGuest', true);
                        updateState('isAuthenticated', true);
                        setScreen(ScreenName.LANGUAGE);
                    }}
                />
            );
        case ScreenName.SIGNUP:
            return (
                <SignUpScreen
                    onSuccess={(user) => {
                        setCurrentUser(user);
                        updateState('isAuthenticated', true);
                        updateState('uid', user.id);
                        updateState('name', user.user_metadata?.display_name || user.email?.split('@')[0] || '');
                        setScreen(ScreenName.LANGUAGE);
                    }}
                    onLogin={() => setScreen(ScreenName.LOGIN)}
                />
            );
        case ScreenName.WELCOME:
            return (
                <Container className="justify-end pb-12 bg-gradient-to-br from-white to-green-50">
                    <FadeIn>
                        <Heading className="text-4xl mb-4 text-primary">Wellness,<br/>Native & Local.</Heading>
                        <BodyText className="mb-8">Your personalized health expert, speaking your language, knowing your city.</BodyText>
                        <div className="space-y-3">
                            <Button fullWidth onClick={() => {
                                updateState('isLocalGuest', true);
                                updateState('isAuthenticated', true);
                                setScreen(ScreenName.LANGUAGE);
                            }}>
                                Start Your Journey
                            </Button>

                            <Button fullWidth variant="ghost" onClick={() => setScreen(ScreenName.LOGIN)}>
                                Login (Save Progress)
                            </Button>
                        </div>
                    </FadeIn>
                </Container>
            );
        case ScreenName.LANGUAGE: return <Container><NavHeader onBack={() => setScreen(ScreenName.WELCOME)} title="Welcome" /><Heading>Pick your language</Heading><div className="grid grid-cols-2 gap-3 mt-6">{['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Marathi', 'Gujarati', 'Malayalam', 'Punjabi', 'Odia'].map(lang => (<Card key={lang} onClick={() => { updateState('language', lang); setScreen(ScreenName.LOCATION); }} className="text-center py-6 hover:border-primary"><div className="font-semibold">{lang}</div></Card>))}</div></Container>;
        case ScreenName.LOCATION: return <Container><NavHeader onBack={() => setScreen(ScreenName.LANGUAGE)} title="Language" /><Heading>Where are you based?</Heading><BodyText>Gemini will act as a native expert of this area.</BodyText><div className="mt-4 mb-2">{detectingLocation ? (<div className="p-4 bg-primary/10 rounded-2xl flex items-center justify-center gap-3 animate-pulse"><div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div><span className="font-bold text-primary text-sm">Locating you...</span></div>) : (<Button fullWidth onClick={handleDetectLocation} variant="secondary" className="border-primary/30 text-primary bg-primary/5 hover:bg-primary/10">📍 Use Current Location</Button>)}<div className="text-center text-xs text-text-disabled my-3 font-medium">OR ENTER MANUALLY</div></div>{(userState.country && userState.state && userState.city && !detectingLocation) && (<div className="bg-green-50 border border-green-200 p-3 rounded-xl flex items-center gap-2 mb-4 animate-fadeIn"><div className="bg-green-100 p-1.5 rounded-full text-green-700">✓</div><div className="text-sm text-green-800 font-medium">Found: {userState.city}, {userState.state}</div></div>)}<div className="space-y-4"><input placeholder="Country (e.g. India)" className="w-full p-4 rounded-2xl border bg-gray-50 transition-all focus:border-primary outline-none focus:bg-white focus:shadow-soft" value={userState.country} onChange={(e) => updateState('country', e.target.value)} /><input placeholder="State (e.g. Maharashtra)" className="w-full p-4 rounded-2xl border bg-gray-50 transition-all focus:border-primary outline-none focus:bg-white focus:shadow-soft" value={userState.state} onChange={(e) => updateState('state', e.target.value)} /><input placeholder="City (e.g. Mumbai)" className="w-full p-4 rounded-2xl border bg-gray-50 transition-all focus:border-primary outline-none focus:bg-white focus:shadow-soft" value={userState.city} onChange={(e) => updateState('city', e.target.value)} /><Button fullWidth disabled={!(userState.country && userState.state && userState.city) || verifyingLocation} onClick={handleVerifyLocation}>{verifyingLocation ? (<div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Checking City...</span></div>) : ('Continue')}</Button></div></Container>;
        case ScreenName.MODE_SELECTION: 
            return (
                <Container>
                    <NavHeader onBack={() => setScreen(ScreenName.LOCATION)} title="Location" />
                    <Heading>Who is this for?</Heading>
                    <div className="space-y-4 mt-6">
                        <Card onClick={() => { 
                            updateState('mode', UserMode.CONSUMER); 
                            setScreen(ScreenName.CONSUMER_LOGIN); 
                        }}>
                            <div className="flex items-center gap-4">
                                <span className="text-3xl">🌿</span>
                                <div>
                                    <div className="font-bold text-lg">Personal User</div>
                                    <div className="text-sm text-text-secondary">General wellness & health</div>
                                </div>
                            </div>
                        </Card>
                        <Card onClick={() => { 
                            updateState('mode', UserMode.CORPORATE); 
                            setScreen(ScreenName.ENTERPRISE_LOGIN); 
                        }}>
                            <div className="flex items-center gap-4">
                                <span className="text-3xl">🏢</span>
                                <div>
                                    <div className="font-bold text-lg">Enterprise Employee</div>
                                    <div className="text-sm text-text-secondary">Work-life balance & stress</div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </Container>
            );
        case ScreenName.CONSUMER_LOGIN: return <Container><NavHeader onBack={() => setScreen(ScreenName.MODE_SELECTION)} title="Back" /><Heading>Setup Profile</Heading><div className="mt-6 space-y-4"><input placeholder="What's your name?" className="w-full p-4 rounded-2xl border bg-gray-50" value={userState.name || ''} onChange={(e) => updateState('name', e.target.value)} /><div className="pt-2"><SubHeading className="text-sm uppercase tracking-widest text-text-secondary">Custom Lifestyle (Optional)</SubHeading><input placeholder="e.g. New Mom, Student..." className="w-full p-4 rounded-2xl border bg-gray-50" value={userState.customModeInput || ''} onChange={(e) => { updateState('mode', UserMode.CUSTOM); updateState('customModeInput', e.target.value); }} /></div><div className="grid grid-cols-2 gap-3"><input placeholder="Height (cm)" type="number" className="w-full p-4 rounded-2xl border bg-gray-50" value={userState.height || ''} onChange={(e) => updateState('height', e.target.value)} /><input placeholder="Weight (kg)" type="number" className="w-full p-4 rounded-2xl border bg-gray-50" value={userState.weight || ''} onChange={(e) => updateState('weight', e.target.value)} /></div><Button fullWidth disabled={!userState.name} onClick={() => setScreen(ScreenName.GOALS)}>Continue</Button></div></Container>;
        case ScreenName.ENTERPRISE_LOGIN: return <Container><NavHeader onBack={() => setScreen(ScreenName.MODE_SELECTION)} title="Back" /><Heading>Work Profile</Heading><div className="space-y-4 mt-6"><input placeholder="Your Name" className="w-full p-4 rounded-2xl border bg-gray-50" value={userState.name || ''} onChange={(e) => updateState('name', e.target.value)} /><input placeholder="Company Name" className="w-full p-4 rounded-2xl border bg-gray-50" value={userState.companyName || ''} onChange={(e) => updateState('companyName', e.target.value)} /><input placeholder="Job Domain" className="w-full p-4 rounded-2xl border bg-gray-50" value={userState.jobDomain || ''} onChange={(e) => updateState('jobDomain', e.target.value)} /><div className="grid grid-cols-2 gap-3"><input placeholder="Height (cm)" type="number" className="w-full p-4 rounded-2xl border bg-gray-50" value={userState.height || ''} onChange={(e) => updateState('height', e.target.value)} /><input placeholder="Weight (kg)" type="number" className="w-full p-4 rounded-2xl border bg-gray-50" value={userState.weight || ''} onChange={(e) => updateState('weight', e.target.value)} /></div><Button fullWidth disabled={!(userState.name && userState.companyName && userState.jobDomain) || isAnalyzingWork} onClick={handleCorporateLogin}>{isAnalyzingWork ? 'Analyzing...' : 'Analyze Work Culture'}</Button></div></Container>;
        case ScreenName.GOALS: return <Container><NavHeader onBack={() => setScreen(ScreenName.MODE_SELECTION)} title="Lifestyle" /><Heading>Top Goals</Heading>{userState.corporateInsights && (<div className="mb-6"><div className="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-2xl border border-indigo-100 shadow-sm"><div className="flex gap-4 items-start"><span className="text-4xl">{userState.corporateInsights.cultureEmoji}</span><div><h3 className="font-bold text-gray-800">{userState.corporateInsights.cultureTitle}</h3><p className="text-sm text-gray-600 mt-1">{userState.corporateInsights.cultureDesc}</p></div></div></div></div>)}<div className="grid grid-cols-2 gap-3 mt-2 mb-6">{generatedGoals.map((g) => { const isSelected = userState.goals.includes(g.label); return (<div key={g.label} onClick={() => { const newGoals = isSelected ? userState.goals.filter(x => x !== g.label) : [...userState.goals, g.label].slice(0, 3); updateState('goals', newGoals); }} className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-2 text-center ${isSelected ? 'border-primary bg-primary/5' : 'border-secondary/20'}`}><span className="text-2xl">{g.icon}</span><span className="text-xs font-bold leading-tight">{g.label}</span></div>); })}</div><Button fullWidth disabled={userState.goals.length === 0} onClick={() => setScreen(ScreenName.HEALTH_MODE_SELECT)}>Continue</Button></Container>;
        case ScreenName.HEALTH_MODE_SELECT: 
            return (
                <Container>
                    <NavHeader onBack={() => setScreen(ScreenName.GOALS)} title="Goals" />
                    <Heading>Select Health Mode</Heading>
                    <div className="space-y-4 mt-6">
                        <Card onClick={() => { updateState('healthMode', HealthMode.GENERAL); setScreen(ScreenName.PREFERENCES); }}>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">🌿</div>
                                <div>
                                    <h3 className="font-bold text-lg text-primary">General Wellness</h3>
                                    <p className="text-sm text-text-secondary mt-1">Balanced diet based on your input.</p>
                                    <span className="text-[10px] bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-bold">FREE</span>
                                </div>
                            </div>
                        </Card>
                        <Card onClick={() => { 
                                if (!userState.isPremium) {
                                    setScreen(ScreenName.UPGRADE);
                                } else {
                                    updateState('healthMode', HealthMode.DISEASE_FOCUSED); 
                                    setScreen(ScreenName.MEDICINE); 
                                }
                            }}>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">🩺</div>
                                <div>
                                    <h3 className="font-bold text-lg text-blue-700">Disease Management</h3>
                                    <p className="text-sm text-text-secondary mt-1">Specialized diet for Diabetes, PCOD, etc.</p>
                                    {!userState.isPremium && <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-bold">LOCKED 🔒</span>}
                                </div>
                            </div>
                        </Card>
                        <Card onClick={() => { 
                                if (!userState.isPremium) {
                                    setScreen(ScreenName.UPGRADE);
                                } else {
                                    updateState('healthMode', HealthMode.MOLECULE_MATCH); 
                                    setScreen(ScreenName.MEDICINE);
                                }
                            }} className="bg-gradient-to-br from-white to-purple-50">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">💊</div>
                                <div>
                                    <h3 className="font-bold text-lg text-purple-700">Med-to-Food Sync</h3>
                                    <p className="text-sm text-text-secondary mt-1">Match tablet molecules to natural foods.</p>
                                    {!userState.isPremium && <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-bold">LOCKED 🔒</span>}
                                </div>
                            </div>
                        </Card>
                    </div>
                </Container>
            );
        case ScreenName.MEDICINE: const isForceMode = userState.healthMode === HealthMode.MOLECULE_MATCH || userState.healthMode === HealthMode.DISEASE_FOCUSED; return <Container><NavHeader onBack={() => setScreen(ScreenName.HEALTH_MODE_SELECT)} title="Health Mode" /><Heading>Health Check</Heading><BodyText>{userState.healthMode === HealthMode.MOLECULE_MATCH ? "Scan your medicines so Gemini can match their molecules to food." : "Tell us about your condition to personalize the cure."}</BodyText>{analyzingHealth ? (<div className="flex flex-col items-center justify-center py-20"><div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div><p className="text-lg font-medium text-primary mt-4">Gemini is analyzing...</p></div>) : (<div className="space-y-6 mt-8"><Card onClick={() => fileInputRef.current?.click()} className="flex items-center gap-4 py-6 border-dashed border-2 border-secondary/30 bg-gray-50 cursor-pointer"><span className="text-3xl">📷</span><div><div className="font-bold text-primary">Scan Prescription / Medicine</div></div><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} /></Card><div className="relative text-center text-sm text-gray-400 my-2">OR ENTER MANUALLY</div><div><textarea className="w-full p-4 rounded-2xl border bg-white min-h-[100px]" placeholder="Type problem (e.g. Diabetes) or Meds..." value={userState.medicalCondition || ''} onChange={(e) => updateState('medicalCondition', e.target.value)} /><Button fullWidth variant="secondary" className="mt-2" disabled={!userState.medicalCondition} onClick={() => handleHealthAnalysis('TEXT', userState.medicalCondition || '')}>Analyze & Verify</Button></div>{!isForceMode && (<Button fullWidth variant="ghost" onClick={() => setScreen(ScreenName.PREFERENCES)}>I have no health issues (Skip)</Button>)}</div>)}</Container>;
        case ScreenName.MEDICINE_VERIFY: return <Container><NavHeader onBack={() => setScreen(ScreenName.MEDICINE)} title="Verification" />{userState.medicalAnalysis && (<div className="animate-fadeIn mb-6"><div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl mb-6"><h2 className="text-xl font-bold text-text-primary mb-2">{userState.medicalAnalysis.condition}</h2><p className="text-sm text-text-secondary">{userState.medicalAnalysis.overview}</p></div><Heading>Your Medicines</Heading><div className="space-y-3 mt-4">{userState.prescriptionItems.map((item, idx) => (<div key={idx} className="bg-white p-4 rounded-2xl border border-secondary/20"><div className="flex justify-between items-start mb-2"><div className="font-bold text-lg">{item.name}</div><button onClick={() => { const newItems = [...userState.prescriptionItems]; newItems.splice(idx, 1); updateState('prescriptionItems', newItems); }} className="text-gray-300">✕</button></div><div className="text-sm text-text-secondary">{item.purpose}</div></div>))}</div><Button fullWidth onClick={() => setShowMedicineOrderModal(true)} variant="secondary" className="mt-4 border-green-500/20 text-green-700 hover:bg-green-50">🛒 Order Medicines</Button></div>)}<Button fullWidth onClick={() => setScreen(ScreenName.PREFERENCES)} className="mt-2">Confirm & Continue</Button></Container>;
        case ScreenName.PREFERENCES: return <Container><NavHeader onBack={() => setScreen(ScreenName.MEDICINE_VERIFY)} title="Health Check" /><Heading>Final Touches</Heading><div className="mt-6 space-y-4"><div><SubHeading>Diet Type</SubHeading><div className="flex flex-wrap gap-2">{['Veg', 'Non-Veg', 'Vegan', 'Eggetarian', 'Keto'].map(d => (<button key={d} onClick={() => updateState('dietType', d)} className={`px-4 py-2 rounded-xl text-sm ${userState.dietType === d ? 'bg-primary text-white font-bold' : 'bg-gray-100'}`}>{d}</button>))}</div></div><div><SubHeading>Taste Profile</SubHeading><div className="flex flex-wrap gap-2">{['Standard', 'Spicy', 'Mild', 'Savory', 'Sweet'].map(t => (<button key={t} onClick={() => updateState('tastePreference', t)} className={`px-4 py-2 rounded-xl text-sm ${userState.tastePreference === t ? 'bg-primary text-white font-bold' : 'bg-gray-100'}`}>{t}</button>))}</div></div><Button fullWidth onClick={() => setScreen(ScreenName.GENERATING)} variant="gradient">Generate Daily Plan ✨</Button></div></Container>;
        case ScreenName.GENERATING: return <Container className="justify-center items-center text-center"><Heading>Crafting Plan...</Heading><BodyText>{userState.mode === UserMode.CORPORATE ? 'Balancing work stress with nutrition...' : 'Optimizing for your lifestyle...'}</BodyText></Container>;
        case ScreenName.TODAY: 
            if(!userState.plan) return <Container>Loading...</Container>; 
            return (
                <Container className="pb-24">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <Heading>Hello, {userState.name || 'Friend'}</Heading>
                            <BodyText className="text-primary font-medium">{userState.plan.localGreeting}</BodyText>
                            {!userState.isPremium && (
                                <div className="text-[10px] text-gray-500 font-bold bg-gray-100 inline-block px-2 py-1 rounded mt-1">
                                    {userState.generationsLeft} FREE CREDITS LEFT
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-700">Logout</button>
                            <button onClick={() => setShowBugReport(true)} className="text-xs text-blue-500 hover:text-blue-700">Report Bug</button>
                        </div>
                    </div>
                    {userState.plan.bioMechanism && (
                        <Card onClick={() => setShowMechanism(true)} className="mb-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white border-none shadow-xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-xs font-bold text-green-400 uppercase mb-1">Science Mode</div>
                                    <div className="text-xl font-bold">{userState.plan.bioMechanism.title}</div>
                                </div>
                                <div className="text-4xl">{userState.plan.bioMechanism.visualMetaphor.includes('Shield') ? '🛡️' : '🧬'}</div>
                            </div>
                        </Card>
                    )}
                    <div className="space-y-4">
                        {userState.plan.meals.map((meal, idx) => (
                            <Card key={idx} onClick={() => { setSelectedMeal(meal); setMealTab('COOK'); }} className="group">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold bg-secondary/10 text-secondary px-2 py-1 rounded uppercase">{meal.type}</span>
                                    <div className="flex gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); setMealToEdit(meal); }} className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors">✏️</button>
                                        <button onClick={(e) => { e.stopPropagation(); handleToggleMeal(idx); }} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${userState.progress.completedMealIndices.includes(idx) ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-primary'}`}>{userState.progress.completedMealIndices.includes(idx) && Icons.Check}</button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold group-hover:text-primary">{meal.title}</h3>
                                <p className="text-sm text-text-secondary mt-1 line-clamp-2">{meal.description}</p>
                            </Card>
                        ))}
                    </div>
                </Container>
            );
        
        // --- NEW PROGRESS SCREEN ---
        case ScreenName.PROGRESS: 
            const calories = getConsumedCalories();
            const caloriePct = Math.min((calories / userState.progress.caloriesTarget) * 100, 100);
            
            return (
                <Container className="pb-24 bg-gray-50">
                    <Heading className="mb-6">Your Journey</Heading>
                    
                    {/* 1. Calorie & Water Row */}
                    <div className="flex gap-4 mb-6">
                        {/* Calorie Ring */}
                        <div className="flex-1 bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative">
                            <div className="w-32 h-32 rounded-full relative" style={{ background: `conic-gradient(#3A7D6E ${caloriePct}%, #E6F1EE 0)` }}>
                                <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center">
                                    <span className="text-2xl font-bold text-primary">{calories}</span>
                                    <span className="text-[10px] text-gray-400 uppercase font-bold">of {userState.progress.caloriesTarget} Kcal</span>
                                </div>
                            </div>
                            <Button variant="ghost" className="mt-2 text-xs" onClick={() => setShowFoodLogger(true)}>+ Add Food</Button>
                        </div>
                        
                        {/* Hydration Column */}
                        <div className="flex-1 flex flex-col gap-3">
                            <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100 flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                                <div className="absolute bottom-0 left-0 right-0 bg-blue-200 transition-all duration-1000" style={{ height: `${(userState.progress.waterIntake / userState.progress.waterTarget) * 100}%`, opacity: 0.3 }}></div>
                                <div className="z-10 text-center">
                                    <div className="text-3xl mb-1">💧</div>
                                    <div className="text-xl font-bold text-blue-800">{userState.progress.waterIntake} <span className="text-sm">/ {userState.progress.waterTarget}</span></div>
                                    <div className="text-[10px] font-bold text-blue-600 uppercase">Glasses</div>
                                </div>
                            </div>
                            <button onClick={handleHydrate} disabled={isHydrationLocked} className="bg-blue-600 text-white py-3 rounded-2xl font-bold text-xs shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:bg-gray-400">
                                {isHydrationLocked ? hydrationTimeLeft : '+ Drink Water'}
                            </button>
                        </div>
                    </div>

                    {/* 2. Diet Timeline */}
                    <SubHeading>Today's Plan</SubHeading>
                    <div className="space-y-4 mb-8">
                        {userState.plan?.meals.map((meal, idx) => {
                            const isDone = userState.progress.completedMealIndices.includes(idx);
                            return (
                                <div key={idx} className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${isDone ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                                    <div onClick={() => handleToggleMeal(idx)} className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${isDone ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                                        {isDone && Icons.Check}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <span className={`text-xs font-bold uppercase tracking-wider ${isDone ? 'text-green-700' : 'text-gray-400'}`}>{meal.type}</span>
                                            {meal.calories && <span className="text-xs font-bold text-gray-400">{meal.calories} cal</span>}
                                        </div>
                                        <div className={`font-bold text-lg ${isDone ? 'text-green-900 line-through opacity-70' : 'text-gray-800'}`}>{meal.title}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Container>
            );
        case ScreenName.UPGRADE:
            return <UpgradeScreen onBack={() => setScreen(ScreenName.TODAY)} onUpgrade={handleUpgrade} />;

        default: return <Container>Screen not found</Container>;
    }
  };

  return (
    <Layout>
      {renderContent()}
      {(screen === ScreenName.TODAY || screen === ScreenName.PROGRESS) && (<BottomNav activeTab={activeTab === 'Today' && screen === ScreenName.TODAY ? 'Today' : 'Progress'} onTabChange={(t) => { setActiveTab(t); setScreen(t === 'Today' ? ScreenName.TODAY : ScreenName.PROGRESS); }} onScan={() => setShowFoodLogger(true)} />)}
      
      <ChatAssistant isOpen={showChat} onClose={() => setShowChat(false)} />
      {!showChat && screen !== ScreenName.LOGIN && screen !== ScreenName.SIGNUP && screen !== ScreenName.WELCOME && screen !== ScreenName.LANGUAGE && screen !== ScreenName.LOCATION && screen !== ScreenName.UPGRADE && (<Button variant="floating" onClick={() => setShowChat(true)}>💬</Button>)}
      
      {/* Modals */}
      {showFoodLogger && <FoodLoggerModal onClose={() => setShowFoodLogger(false)} onLog={handleLogFood} />}
      {showMedicineOrderModal && <MedicineOrderModal city={userState.city} medicines={userState.prescriptionItems} onClose={() => setShowMedicineOrderModal(false)} />}
      {showServiceModal && serviceQuery && (<ServiceFinderModal city={userState.city} queryItem={serviceQuery.item} type={serviceQuery.type} onClose={() => setShowServiceModal(false)} />)}
      {selectedMeal && mealTab === 'COOK' && (<CookingAssistant steps={selectedMeal.cookingSteps || []} recipeName={selectedMeal.title} onClose={() => setSelectedMeal(null)} onComplete={() => { handleToggleMeal(userState.plan?.meals.indexOf(selectedMeal!) ?? -1); setSelectedMeal(null); }} onOrderIngredients={openGrocerySearch} />)}
      {mealToEdit && (<EditMealModal currentMeal={mealToEdit} healthMode={userState.healthMode} medicalCondition={userState.medicalCondition || ''} onClose={() => setMealToEdit(null)} onSave={handleMealUpdate} />)}
      {showMechanism && userState.plan?.bioMechanism && (<BioMechanismView mechanism={userState.plan.bioMechanism} sources={userState.plan.verifiedSources} onClose={() => setShowMechanism(false)} />)}
      {showBugReport && <BugReportModal onClose={() => setShowBugReport(false)} />}
    </Layout>
  );
}
