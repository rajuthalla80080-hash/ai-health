
// ... existing imports
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { UserState, DailyPlan, JunkFoodAdvice, GoalOption, NutritionFact, GeneratedRecipe, PrescriptionItem, CorporateInsightStruct, LocalService, MedicalAnalysis, HealthMode, WearableData, Meal, IngredientCheckResult } from "../types";

const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY || '';
    }
    return '';
  } catch (e) {
    return '';
  }
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

// --- MODEL TIERING STRATEGY ---
const MODEL_LITE = 'gemini-2.5-flash-lite-latest'; // "Fast AI responses" - Low Cost, High Speed
const MODEL_FAST = 'gemini-3-flash-preview';      // Search Grounding, Audio Transcription, Vision - Balanced
const MODEL_INTELLIGENT = 'gemini-3-pro-preview'; // Chat, Thinking Mode, Image Analysis - High Reasoning
const MODEL_IMAGE_EDIT = 'gemini-2.5-flash-image'; // "Nano banana powered app"
const MODEL_MAPS = 'gemini-2.5-flash';            // Maps Grounding
const MODEL_TTS = 'gemini-2.5-flash-preview-tts'; // "Generate speech"

const globalCache = new Map<string, any>();

// Helper to clean JSON strings from Gemini (removes markdown code blocks)
const cleanAndParseJSON = (text: string) => {
    try {
        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        // Sometimes models add a preamble, try to find the first { or [
        const firstBrace = cleanText.indexOf('{');
        const firstBracket = cleanText.indexOf('[');
        const start = (firstBrace === -1) ? firstBracket : (firstBracket === -1) ? firstBrace : Math.min(firstBrace, firstBracket);
        
        if (start > -1) {
            cleanText = cleanText.substring(start);
            const lastBrace = cleanText.lastIndexOf('}');
            const lastBracket = cleanText.lastIndexOf(']');
            const end = Math.max(lastBrace, lastBracket);
            if (end > -1) cleanText = cleanText.substring(0, end + 1);
        }
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("JSON Parse Error:", e, text);
        return {};
    }
};

// ... (Keep existing constants: PRESET_GOALS) ...
const PRESET_GOALS: Record<string, GoalOption[]> = {
  "General Wellness": [
    { label: "Improve Energy", icon: "⚡" },
    { label: "Better Sleep", icon: "😴" },
    { label: "Reduce Stress", icon: "🧘" },
    { label: "Healthy Digestion", icon: "🍃" },
    { label: "Weight Balance", icon: "⚖️" },
    { label: "Immunity Boost", icon: "🛡️" }
  ],
  "Corporate Employee": [
    { label: "Sustained Focus", icon: "🧠" },
    { label: "Prevent Slump", icon: "📉" },
    { label: "Eye Strain", icon: "👀" },
    { label: "Stress Management", icon: "💼" },
    { label: "Quick Digestion", icon: "🥗" },
    { label: "Posture/Back", icon: "🪑" }
  ]
};

export const generateCorporateInsights = async (company: string, domain: string, city: string): Promise<CorporateInsightStruct | null> => {
    if (!apiKey) return null;
    const cacheKey = `corp_struct_${company}_${domain}_${city}`;
    if (globalCache.has(cacheKey)) return globalCache.get(cacheKey);
    const prompt = `Task: Analyze the work environment for a "${domain}" role at "${company}" specifically in the city of "${city}". Use Google Search to find: 1. Local work culture trends. 2. Employee sentiment. 3. Typical weather in ${city} now. Synthesize into 'cultureDesc'. Return JSON.`;
    try {
        const response = await ai.models.generateContent({ model: MODEL_FAST, contents: prompt, config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { cultureEmoji: { type: Type.STRING }, cultureTitle: { type: Type.STRING }, cultureDesc: { type: Type.STRING }, weatherEmoji: { type: Type.STRING }, weatherTitle: { type: Type.STRING }, weatherImpact: { type: Type.STRING }, healthRisks: { type: Type.ARRAY, items: { type: Type.STRING } } } } } });
        const data = cleanAndParseJSON(response.text || "{}");
        globalCache.set(cacheKey, data);
        return data;
    } catch (e) { return null; }
};

export const verifyLocationEntry = async (inputCity: string, inputState: string): Promise<{ city: string; state: string; country: string }> => {
    const fallback = { city: inputCity, state: inputState, country: "India" };
    if(!apiKey) return fallback;
    const cacheKey = `loc_${inputCity.toLowerCase()}_${inputState.toLowerCase()}`;
    if (globalCache.has(cacheKey)) return globalCache.get(cacheKey);
    
    // Updated to use Maps Grounding correctly (No JSON schema)
    // CRITICAL FIX: The Google Maps tool does NOT support responseSchema/JSON mode.
    // We must prompt for structured text and parse it manually.
    const prompt = `Verify the location "${inputCity}, ${inputState}". If it exists, output the official City, State, and Country separated by pipes. 
    Format: City|State|Country
    Example: Mumbai|Maharashtra|India
    If strictly not found, return the input values in the same format.`;

    try {
        const response = await ai.models.generateContent({ 
            model: MODEL_MAPS, 
            contents: prompt, 
            config: { 
                tools: [{ googleMaps: {} }] 
                // DO NOT ADD responseMimeType: "application/json" here
            } 
        });
        
        const text = response.text || "";
        const parts = text.split('|');
        if (parts.length >= 3) {
             const result = { 
                city: parts[0].trim(), 
                state: parts[1].trim(), 
                country: parts[2].trim() 
            };
            globalCache.set(cacheKey, result);
            return result;
        }
        return fallback;
    } catch(e) { 
        console.error("Location verification failed", e);
        return fallback; 
    }
};

export const detectLocationFromCoords = async (lat: number, lng: number): Promise<{ city: string; state: string; country: string }> => {
    if (!apiKey) return { city: "", state: "", country: "" };
    const prompt = `What city, state, and country is at latitude ${lat}, longitude ${lng}? 
    Output ONLY in this format: City|State|Country
    Example: San Francisco|California|USA`;
    
    try {
        const response = await ai.models.generateContent({ 
            model: MODEL_MAPS, 
            contents: prompt, 
            config: { 
                tools: [{ googleMaps: {} }]
            } 
        });
        const text = response.text || "";
        const parts = text.split('|');
        if (parts.length >= 3) {
            return { city: parts[0].trim(), state: parts[1].trim(), country: parts[2].trim() };
        }
        return { city: "Detected Location", state: "", country: "" };
    } catch (e) { return { city: "Detected Location", state: "", country: "" }; }
};

export const findCookingVideo = async (recipeName: string): Promise<string[]> => {
     if (!apiKey) return [];
     const prompt = `Search for 1 high-quality youtube video tutorial for cooking "${recipeName}". Return ONLY Youtube URL in JSON.`;
     try {
        const response = await ai.models.generateContent({ model: MODEL_FAST, contents: prompt, config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" } });
        const urls: string[] = [];
        const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if(grounding) grounding.forEach((c: any) => { if (c.web?.uri?.includes('youtube')) urls.push(c.web.uri); });
        const text = response.text || "";
        const matches = text.matchAll(/https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/g);
        for (const match of matches) { if (!urls.includes(match[0])) urls.push(match[0]); }
        if(urls.length === 0) return [`https://www.youtube.com/results?search_query=${encodeURIComponent(recipeName + ' recipe')}`];
        return urls.slice(0, 3);
     } catch(e) { return [`https://www.youtube.com/results?search_query=${encodeURIComponent(recipeName + ' recipe')}`]; }
};

export const findDeliveryPartners = async (city: string, type: 'GROCERY' | 'FOOD'): Promise<LocalService[]> => {
    if (!apiKey) return [];
    const cacheKey = `partners_${city.toLowerCase()}_${type}`;
    if (globalCache.has(cacheKey)) return globalCache.get(cacheKey);
    const prompt = `Identify top 2 ${type === 'GROCERY' ? 'instant grocery' : 'food delivery'} apps in ${city}. Return JSON with name, url, description, icon.`;
    try {
        const response = await ai.models.generateContent({ model: MODEL_FAST, contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, url: { type: Type.STRING }, description: { type: Type.STRING }, icon: { type: Type.STRING } } } } } });
        const data = cleanAndParseJSON(response.text || "[]");
        globalCache.set(cacheKey, data);
        return data;
    } catch (e) { return []; }
};

export const checkIngredientAvailability = async (city: string, ingredients: string[]): Promise<IngredientCheckResult> => {
    if (!apiKey) return { available: ingredients, hardToFind: [], localTip: "Most items should be available." };
    const sortedIng = [...ingredients].sort().join(',');
    const cacheKey = `ing_check_${city.toLowerCase()}_${sortedIng}`;
    if (globalCache.has(cacheKey)) return globalCache.get(cacheKey);
    const prompt = `Local Grocery Expert in ${city}. Analyze ingredients: [${ingredients.join(', ')}]. Identify available vs hard to find. Return JSON.`;
    try {
        const response = await ai.models.generateContent({ model: MODEL_LITE, contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { available: { type: Type.ARRAY, items: { type: Type.STRING } }, hardToFind: { type: Type.ARRAY, items: { type: Type.STRING } }, localTip: { type: Type.STRING } } } } });
        const data = cleanAndParseJSON(response.text || "{}");
        globalCache.set(cacheKey, data);
        return data;
    } catch (e) { return { available: ingredients, hardToFind: [], localTip: "Check local apps for stock." }; }
};

export const findLocalGrocers = async (city: string, ingredients: string[]): Promise<LocalService[]> => { return findDeliveryPartners(city, 'GROCERY'); };

export const findRestaurantOptions = async (city: string, dishName: string): Promise<LocalService[]> => {
    if (!apiKey) return [];
    const cacheKey = `rest_${city.toLowerCase()}_${dishName.toLowerCase()}`;
    if (globalCache.has(cacheKey)) return globalCache.get(cacheKey);
    
    // Updated to use text parsing + Maps
    const prompt = `Find top rated restaurants in ${city} that serve "${dishName}". 
    Output a list. For each restaurant, provide Name, Rating, Address, and Google Maps Link separated by pipes.
    Format: Name|Rating|Address|Link
    Do not use JSON.`;

    try {
        const response = await ai.models.generateContent({ 
            model: MODEL_MAPS, 
            contents: prompt, 
            config: { 
                tools: [{ googleMaps: {} }]
            } 
        });
        
        const text = response.text || "";
        const services: LocalService[] = [];
        const lines = text.split('\n');
        for(const line of lines) {
            if(line.includes('|')) {
                const parts = line.split('|').map(s => s.trim());
                // Expecting Name|Rating|Address|Link
                if(parts.length >= 3) {
                    services.push({
                        name: parts[0],
                        rating: parts[1],
                        address: parts[2],
                        googleMapsUri: parts[3] || undefined,
                        description: `Best for ${dishName}`
                    });
                }
            }
        }

        if (services.length === 0) {
             // Basic fallback extraction if pipes fail but grounding works
             const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
             if(groundingChunks) {
                 groundingChunks.forEach((chunk: any) => {
                     if (chunk.web?.uri && chunk.web?.title) {
                         services.push({
                             name: chunk.web.title,
                             rating: "4.5",
                             address: city,
                             googleMapsUri: chunk.web.uri,
                             description: "Recommended via Search"
                         });
                     }
                 });
             }
        }
        
        if (services.length === 0) throw new Error("No data");
        globalCache.set(cacheKey, services);
        return services;
    } catch (e) { 
        return [{ name: "Zomato Search", description: "Search on Zomato", url: `https://www.zomato.com/${city.toLowerCase()}/restaurants?q=${encodeURIComponent(dishName)}` }, { name: "Swiggy Search", description: "Search on Swiggy", url: `https://www.swiggy.com/search?query=${encodeURIComponent(dishName)}` }];
    }
};

export const findPharmacies = async (city: string): Promise<LocalService[]> => {
    if (!apiKey) return [];
    const cacheKey = `pharma_${city.toLowerCase()}`;
    if (globalCache.has(cacheKey)) return globalCache.get(cacheKey);
    
    const prompt = `Find top rated 24/7 pharmacies in ${city}.
    Output a list. For each, provide Name, Rating, Address, and Google Maps Link separated by pipes.
    Format: Name|Rating|Address|Link`;

    try {
        const response = await ai.models.generateContent({ 
            model: MODEL_MAPS, 
            contents: prompt, 
            config: { 
                tools: [{ googleMaps: {} }]
            } 
        });
        
        const text = response.text || "";
        const services: LocalService[] = [];
        const lines = text.split('\n');
        for(const line of lines) {
            if(line.includes('|')) {
                const parts = line.split('|').map(s => s.trim());
                if(parts.length >= 3) {
                    services.push({
                        name: parts[0],
                        rating: parts[1],
                        address: parts[2],
                        googleMapsUri: parts[3] || undefined,
                        description: "Pharmacy"
                    });
                }
            }
        }
        
        globalCache.set(cacheKey, services);
        return services;
    } catch (e) { return []; }
};

export const findOnlinePharmacies = async (city: string): Promise<LocalService[]> => {
    if (!apiKey) return [];
    const cacheKey = `online_pharma_${city.toLowerCase()}`;
    if (globalCache.has(cacheKey)) return globalCache.get(cacheKey);

    const prompt = `
        Identify top 3 online pharmacy delivery services operating in ${city}.
        For each, provide:
        1. Name
        2. Description (e.g. "Fastest delivery", "Good discounts")
        3. url (the homepage)
        4. searchUrlPattern (The URL used to search for a medicine. Use {QUERY} as placeholder for the medicine name. Example: "https://www.1mg.com/search/all?name={QUERY}")
        Return JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST, // gemini-3-flash-preview
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            url: { type: Type.STRING },
                            searchUrlPattern: { type: Type.STRING, description: "URL with {QUERY} placeholder" }
                        }
                    }
                }
            }
        });
        const data = cleanAndParseJSON(response.text || "[]");
        globalCache.set(cacheKey, data);
        return data;
    } catch (e) {
        return [
            { name: "1mg", description: "Wide range of medicines", url: "https://www.1mg.com", searchUrlPattern: "https://www.1mg.com/search/all?name={QUERY}" },
            { name: "Apollo Pharmacy", description: "Trusted pharmacy chain", url: "https://www.apollopharmacy.in", searchUrlPattern: "https://www.apollopharmacy.in/search-medicines/{QUERY}" },
            { name: "Pharmeasy", description: "Discounts and easy returns", url: "https://pharmeasy.in", searchUrlPattern: "https://pharmeasy.in/search/all?name={QUERY}" }
        ] as any;
    }
};

export const generateGoalsForContext = async (context: string, language: string): Promise<GoalOption[]> => {
  const presetKey = Object.keys(PRESET_GOALS).find(k => context.toLowerCase().includes(k.toLowerCase()));
  if (presetKey) return PRESET_GOALS[presetKey];
  if (!apiKey) return PRESET_GOALS["General Wellness"];
  const prompt = `Context: "${context}". Lang: "${language}". 5 specific health goals. JSON.`;
  try {
    const response = await ai.models.generateContent({ model: MODEL_LITE, contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, icon: { type: Type.STRING } } } } } });
    return cleanAndParseJSON(response.text || "[]");
  } catch (error) { return PRESET_GOALS["General Wellness"]; }
};

export const analyzeHealthCondition = async (inputType: 'IMAGE' | 'TEXT', data: string): Promise<MedicalAnalysis | null> => {
    if (!apiKey) return null;
    const isImage = inputType === 'IMAGE';
    const prompt = isImage ? `Analyze prescription image. Identify condition. Extract meds. Verify purpose. 4 short takeaways. JSON.` : `Condition: "${data}". Standard treatment? Meds? 4 short takeaways. JSON.`;
    const parts: any[] = [{ text: prompt }];
    if (isImage) parts.push({ inlineData: { mimeType: 'image/jpeg', data: data } });
    try {
        const response = await ai.models.generateContent({ model: MODEL_INTELLIGENT, contents: { parts }, config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { condition: { type: Type.STRING }, overview: { type: Type.STRING }, takeaways: { type: Type.ARRAY, items: { type: Type.STRING } }, items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, dosage: { type: Type.STRING }, type: { type: Type.STRING }, purpose: { type: Type.STRING }, verified: { type: Type.BOOLEAN } } } } } } } });
        return cleanAndParseJSON(response.text || "{}");
    } catch (e) { return { condition: "Analysis Failed", overview: "Error", items: [], takeaways: ["Consult a doctor"] }; }
};

export const generateJunkFoodAdvice = async (input: string): Promise<JunkFoodAdvice> => {
  if (!apiKey) return { message: "It's okay.", adjustment: "Drink water.", estimatedCalories: 300 };
  const prompt = `User ate "${input}". Est calories? Kind advice. Adjustment? JSON.`;
  try {
    const response = await ai.models.generateContent({ model: MODEL_LITE, contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { message: { type: Type.STRING }, adjustment: { type: Type.STRING }, estimatedCalories: { type: Type.NUMBER } } } } });
    return cleanAndParseJSON(response.text || "{}");
  } catch (e) { return { message: "Okay.", adjustment: "Hydrate.", estimatedCalories: 250 }; }
};

export const analyzeNutrition = async (imageBase64: string): Promise<NutritionFact> => {
  if (!apiKey) return { name: "Food", calories: "250", protein: "10g", carbs: "30g", fat: "8g", healthCheck: "Healthy" };
  const prompt = `Analyze food image. Estimate nutrition. JSON.`;
  try {
    const response = await ai.models.generateContent({ model: MODEL_INTELLIGENT, contents: { parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }] }, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.STRING }, protein: { type: Type.STRING }, carbs: { type: Type.STRING }, fat: { type: Type.STRING }, healthCheck: { type: Type.STRING } } } } });
    return cleanAndParseJSON(response.text || "{}");
  } catch (e) { return { name: "Unknown", calories: "-", protein: "-", carbs: "-", fat: "-", healthCheck: "-" }; }
};

export const analyzeFoodText = async (foodText: string): Promise<NutritionFact> => {
    if (!apiKey) return { name: foodText, calories: "150", protein: "5g", carbs: "20g", fat: "5g", healthCheck: "Moderate" };
    const prompt = `Estimate nutrition for: "${foodText}". Return JSON.`;
    try {
        const response = await ai.models.generateContent({ model: MODEL_LITE, contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.STRING }, protein: { type: Type.STRING }, carbs: { type: Type.STRING }, fat: { type: Type.STRING }, healthCheck: { type: Type.STRING } } } } });
        return cleanAndParseJSON(response.text || "{}");
    } catch(e) { return { name: foodText, calories: "0", protein: "-", carbs: "-", fat: "-", healthCheck: "Unknown" }; }
};

export const generateRecipeFromImage = async (imageBase64: string): Promise<GeneratedRecipe> => {
  if (!apiKey) return { title: "Simple Dish", difficulty: "Easy", time: "15m", ingredients: ["Food"], steps: ["Cook it"] };
  const prompt = `Identify ingredients. Generate recipe. JSON.`;
  try {
    const response = await ai.models.generateContent({ model: MODEL_INTELLIGENT, contents: { parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }] }, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, difficulty: { type: Type.STRING }, time: { type: Type.STRING }, ingredients: { type: Type.ARRAY, items: { type: Type.STRING } }, steps: { type: Type.ARRAY, items: { type: Type.STRING } } } } } });
    return cleanAndParseJSON(response.text || "{}");
  } catch (e) { return { title: "Dish", difficulty: "Medium", time: "20m", ingredients: [], steps: [] }; }
};

export const simulateWearableData = async (userProfile: UserState, deviceType: string): Promise<WearableData> => {
    const fallbackData: WearableData = { steps: 5240, sleepHours: 7.2, sleepScore: 82, heartRate: 68, hrv: 45, lastSync: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), deviceType: deviceType as any };
    if(!apiKey) return fallbackData;
    const prompt = `Act as a health data generator. User: ${userProfile.jobDomain}, Age ${userProfile.age}. Return JSON.`;
    try {
        const response = await ai.models.generateContent({ model: MODEL_FAST, contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { steps: { type: Type.NUMBER }, sleepHours: { type: Type.NUMBER }, sleepScore: { type: Type.NUMBER }, heartRate: { type: Type.NUMBER }, hrv: { type: Type.NUMBER } } } } });
        const data = cleanAndParseJSON(response.text || "{}");
        return { steps: data.steps || 5000, sleepHours: data.sleepHours || 7, sleepScore: data.sleepScore || 75, heartRate: data.heartRate || 72, hrv: data.hrv || 40, lastSync: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), deviceType: deviceType as any };
    } catch (e) { return fallbackData; }
};

export const generateWearableInsight = async (data: WearableData): Promise<string> => {
    if(!apiKey) return "Great job tracking!";
    const prompt = `Analyze: Steps ${data.steps}, Sleep ${data.sleepHours}. One sentence advice.`;
    try { const response = await ai.models.generateContent({ model: MODEL_LITE, contents: prompt }); return response.text || "Keep moving!"; } catch(e) { return "Stay active!"; }
};

export const regenerateMealOption = async (currentMeal: Meal, userRequest: string, healthMode: HealthMode, medicalCondition: string): Promise<Meal> => {
    if(!apiKey) return currentMeal;
    const prompt = `Redesign meal ${currentMeal.type}. Mode: ${healthMode}, Cond: ${medicalCondition}. Request: ${userRequest}. Return JSON meal.`;
    try {
        const response = await ai.models.generateContent({ model: MODEL_INTELLIGENT, contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, title: { type: Type.STRING }, description: { type: Type.STRING }, bioActiveTag: { type: Type.STRING }, reason: { type: Type.STRING }, calories: { type: Type.STRING }, ingredients: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, quantity: { type: Type.STRING }, icon: { type: Type.STRING }, molecularMatch: { type: Type.STRING } } } }, cookingSteps: { type: Type.ARRAY, items: { type: Type.STRING } }, outsideOption: { type: Type.STRING } } } } });
        return cleanAndParseJSON(response.text || "{}");
    } catch(e) { return currentMeal; }
};

export const generateDailyPlan = async (userState: UserState): Promise<DailyPlan> => {
  const locationFull = `${userState.city}, ${userState.state}, ${userState.country}`;
  let expertPersona = "";
  let taskDescription = "";
  let toolsToUse = [];
  let thinkingBudgetToken = 0;
  // Always use Intelligent or Fast model with search grounding enabled
  let modelToUse = MODEL_INTELLIGENT; 
  
  if (userState.healthMode === HealthMode.MOLECULE_MATCH) {
      expertPersona = `You are a Molecular Biologist and Functional Nutritionist Expert.`;
      taskDescription = `Task: Analyze medicines: [${userState.prescriptionItems.map(p => p.name).join(', ')}]. Identify active chemical molecules. Find Natural Ingredients that mimic this effect. Verify findings with Google Search.`;
      toolsToUse = [{ googleSearch: {} }]; 
      thinkingBudgetToken = 2048; 
  } else if (userState.healthMode === HealthMode.DISEASE_FOCUSED) {
      expertPersona = `You are a specialized Disease Reversal Expert for "${userState.medicalCondition}".`;
      taskDescription = `Task: Create a therapeutic diet plan to manage/reverse ${userState.medicalCondition}. Use Google Search to find recent medical papers/guidelines.`;
      toolsToUse = [{ googleSearch: {} }];
      thinkingBudgetToken = 1024;
  } else {
      modelToUse = MODEL_FAST;
      expertPersona = `You are a Local Lifestyle & Wellness Expert optimizing for "${userState.customModeInput || 'General Wellness'}" in ${locationFull}.`;
      taskDescription = `Task: Create a balanced, energetic 1-day diet plan based on REAL local availability in ${userState.city}. Use Google Search to verify local seasonal foods.`;
      toolsToUse = [{ googleSearch: {} }];
  }

  // UPDATED SYSTEM PROMPT: Domain Specific, Source Oriented
  const systemInstruction = `
    ${expertPersona} 
    CRITICAL INSTRUCTIONS:
    1. You act as an expert domain authority. 
    2. You MUST use 'googleSearch' to verify nutrition facts and local availability.
    3. Generate a structured JSON response.
    4. Provide Verified Sources in the output if you found them.
    5. Use local slang in 'localGreeting'. 
    
    ${taskDescription}
  `;
  
  const promptText = `Profile: - Location: ${locationFull} - Diet: ${userState.dietType} - Meds: ${userState.prescriptionItems.map(p => p.name).join(', ')} - Mode: ${userState.healthMode} - Current Time: ${new Date().getHours()}:00`;
  
  try {
    const response = await ai.models.generateContent({ 
        model: modelToUse, 
        contents: promptText, 
        config: { 
            tools: toolsToUse, 
            systemInstruction: systemInstruction, 
            ...(thinkingBudgetToken > 0 && modelToUse === MODEL_INTELLIGENT ? { thinkingConfig: { thinkingBudget: thinkingBudgetToken } } : {}), 
            responseMimeType: "application/json", 
            responseSchema: { 
                type: Type.OBJECT, 
                properties: { 
                    focus: { type: Type.STRING }, 
                    localGreeting: { type: Type.STRING }, 
                    verifiedSources: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of URLs found during search grounding" }, 
                    bioMechanism: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, summary: { type: Type.STRING }, visualMetaphor: { type: Type.STRING }, steps: { type: Type.ARRAY, items: { type: Type.STRING } }, molecularSynergy: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { drugMolecule: { type: Type.STRING }, foodMolecule: { type: Type.STRING }, matchScore: { type: Type.NUMBER }, source: { type: Type.STRING } } } } } }, 
                    medicineReminders: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { time: { type: Type.STRING }, instruction: { type: Type.STRING } } } }, 
                    meals: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, title: { type: Type.STRING }, description: { type: Type.STRING }, bioActiveTag: { type: Type.STRING }, reason: { type: Type.STRING }, calories: { type: Type.STRING }, ingredients: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, quantity: { type: Type.STRING }, icon: { type: Type.STRING }, molecularMatch: { type: Type.STRING } } } }, cookingSteps: { type: Type.ARRAY, items: { type: Type.STRING } }, outsideOption: { type: Type.STRING } } } } 
            } 
        } 
    });

    const plan = cleanAndParseJSON(response.text || "{}") as DailyPlan;

    // --- Source Extraction Logic ---
    // Grounding chunks are separate from the text/JSON output. We extract them here.
    if (!plan.verifiedSources || plan.verifiedSources.length === 0) {
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const sources: string[] = [];
        if (groundingChunks) {
            groundingChunks.forEach((chunk: any) => {
                if (chunk.web?.uri) {
                    sources.push(chunk.web.uri);
                }
            });
        }
        // Dedupe and assign
        plan.verifiedSources = [...new Set(sources)].slice(0, 5); 
    }

    return plan;
  } catch (error) { throw error; }
};

export const editImageWithGenAI = async (base64Image: string, promptText: string): Promise<string | null> => {
  if (!apiKey) return null;
  try {
    const response = await ai.models.generateContent({ model: MODEL_IMAGE_EDIT, contents: { parts: [ { inlineData: { mimeType: 'image/jpeg', data: base64Image } }, { text: promptText } ] } });
    for (const part of response.candidates?.[0]?.content?.parts || []) { if (part.inlineData && part.inlineData.data) { return part.inlineData.data; } }
    return null;
  } catch (e) { return null; }
};

export const chatWithHealthBot = async (history: { role: string, text: string }[], message: string): Promise<string> => {
    if (!apiKey) return "I'm listening...";
    try {
        const chat = ai.chats.create({ 
            model: MODEL_INTELLIGENT, 
            history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })), 
            config: { 
                // Updated System Instruction for Interactive, Expert output
                systemInstruction: `
                    You are a compassionate, expert health companion called 'Gemini Care'.
                    
                    RULES:
                    1. BE A DOMAIN EXPERT: Give specific, actionable advice (medical, nutritional, lifestyle).
                    2. BE STRUCTURED: Do NOT write long paragraphs. Use Bullet Points, **Bold Text**, and emojis.
                    3. INTERACTIVE: Ask follow-up questions to understand the user better.
                    4. SHORT: Keep responses under 150 words unless asked for details.
                    
                    Example Format:
                    "**Hydration is key!** 💧
                    Here are 3 quick tips:
                    • Drink a glass before coffee
                    • Add lemon for electrolytes
                    • Set a timer every hour
                    
                    Shall I suggest a hydration schedule?"
                `, 
            } 
        });
        const result = await chat.sendMessage({ message });
        return result.text || "I understand.";
    } catch (e) { return "I'm having trouble connecting right now."; }
};

export const transcribeAudio = async (base64Audio: string): Promise<string> => {
    if (!apiKey) return "Error processing audio.";
    try { const response = await ai.models.generateContent({ model: MODEL_FAST, contents: { parts: [ { inlineData: { mimeType: 'audio/mp3', data: base64Audio } }, { text: "Transcribe this audio exactly." } ] } }); return response.text || ""; } catch (e) { return ""; }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
    if (!apiKey) return null;
    try {
        const response = await ai.models.generateContent({ model: MODEL_TTS, contents: { parts: [{ text }] }, config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } } });
        const audioPart = response.candidates?.[0]?.content?.parts?.[0];
        if (audioPart?.inlineData?.data) { return audioPart.inlineData.data; }
        return null;
    } catch (e) { return null; }
};

export const analyzeCookingStep = async (imageBase64: string, currentStepText: string): Promise<string> => {
  if (!apiKey) return "Looks good!";
  const prompt = `User step: "${currentStepText}". Analyze image. One encouraging sentence.`;
  try {
     const response = await ai.models.generateContent({ model: MODEL_FAST, contents: { parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }] }, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { advice: { type: Type.STRING } } } } });
    return cleanAndParseJSON(response.text || "{}").advice || "Looks good!";
  } catch (error) { return "Looks tasty!"; }
};
