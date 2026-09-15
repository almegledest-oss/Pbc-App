import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization for GoogleGenAI SDK
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// Candidate models to try in priority order (using gemini-3.6-flash first for high stability)
const CANDIDATE_MODELS = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.8-flash'];

// PBC Smart Assistant AI Chat Endpoint
app.post('/api/assistant/chat', async (req, res) => {
  try {
    const { message, chatHistory, memberContext, depositsContext, settingsContext } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const memberName = memberContext?.fullName || 'সম্মানিত সদস্য';
    const memberId = memberContext?.id || 'PBC-Member';
    const memberPhone = memberContext?.phone || 'N/A';
    const totalDeposit = memberContext?.totalDeposit || 0;
    const sharePrice = settingsContext?.shareUnitPrice || 5000;
    const shares = Math.floor(Number(totalDeposit) / sharePrice);

    const pendingDeposits = Array.isArray(depositsContext?.pending) ? depositsContext.pending : [];
    const rejectedDeposits = Array.isArray(depositsContext?.rejected) ? depositsContext.rejected : [];
    const approvedDeposits = Array.isArray(depositsContext?.approved) ? depositsContext.approved : [];

    // Helper for generating realistic internal response if AI models are under temporary high demand
    const generateLocalContextReply = (userQuery: string): string => {
      const q = userQuery.toLowerCase().trim();

      if (q === 'hi' || q === 'hello' || q === 'সালাম' || q === 'হাই' || q.includes('কেমন') || q.includes('kemon')) {
        return `হ্যালো **${memberName}** ভাই, আসসালামু আলাইকুম! \n\nআলহামদুলিল্লাহ, ভালো আছি। প্রবাসী বিজনেস ক্লাবে আপনাকে স্বাগতম। আজ আপনাকে কীভাবে সহযোগিতা করতে পারি বলুন? ডিপোজিট যাচাই, ব্যাংক একাউন্ট নম্বর বা ক্লাবের যেকোনো তথ্যের জন্য নির্দ্বিধায় প্রশ্ন করতে পারেন।`;
      }

      // App development / Tech team inquiries (Banglish & Bengali)
      if (
        q.includes('develop') ||
        q.includes('development') ||
        q.includes('debolap') ||
        q.includes('debolop') ||
        q.includes('devolop') ||
        q.includes('devlop') ||
        q.includes('banay') ||
        q.includes('bania') ||
        q.includes('korese') ||
        q.includes('korsay') ||
        q.includes('made') ||
        q.includes('creator') ||
        q.includes('who made') ||
        q.includes('who develop') ||
        q.includes('software') ||
        q.includes('tech team') ||
        q.includes('বানাইছে') ||
        q.includes('ডেভেলপ') ||
        q.includes('ডেভেলপার') ||
        q.includes('তৈরি করেছে') ||
        q.includes('কে তৈরি')
      ) {
        return `প্রবাসী বিজনেস ক্লাব (PBC)-এর এই ডিজিটাল অ্যাপ্লিকেশনটি ডেভেলপ করেছেন **Fokrul Islam Mir**। 😊\n\nতিনি একাধারে একজন প্রফেশনাল সফটওয়্যার ডেভেলপার এবং পাশাপাশি প্রবাসী বিজনেস ক্লাবের একজন গর্বিত সম্মানিত সদস্য (সদস্য আইডি: **00118**)।\n\nবিশ্বজুড়ে ছড়িয়ে থাকা আমাদের সম্মানিত প্রবাসী ও দেশীয় সদস্যদের সুবিধার জন্য রিয়েল-টাইম ডিপোজিট ট্র্যাকিং, ব্যাংক-গ্রেড সিকিউরিটি এবং আর্থিক স্বচ্ছতা নিশ্চিত করার লক্ষ্যেই তিনি এই আধুনিক প্ল্যাটফর্মটি ডেভেলপ করেছেন।\n\nঅ্যাপ সম্পর্কিত যেকোনো মতামত, পরামর্শ বা টেকনিক্যাল সহযোগিতার জন্য আপনি আমাদের সাপোর্ট গ্রুপে জানাতে পারেন!`;
      }

      if (
        q.includes('nam ki') ||
        q.includes('naam ki') ||
        q.includes('name ki') ||
        q.includes('your name') ||
        q.includes('who are you') ||
        q.includes('who r u') ||
        q.includes('tumi k') ||
        q.includes('apni k') ||
        q.includes('নাম কি') ||
        q.includes('কে তুমি') ||
        q.includes('আপনি কে') ||
        q.includes('তোমার নাম') ||
        q.includes('আপনার নাম')
      ) {
        return `আসসালামু আলাইকুম **${memberName}** ভাই! 😊\n\nআমি **PBC স্মার্ট মেম্বার অ্যাসিস্ট্যান্ট** — প্রবাসী বিজনেস ক্লাবের অফিসিয়াল এআই হেল্পডেস্ক অ্যাসিস্ট্যান্ট।\n\nআমি আপনার ডিপোজিট যাচাই, পেন্ডিং বা রিজেক্ট হওয়া লেনদেনের খোঁজ, টাকা জমার ব্যাংক/বিকাশ একাউন্ট নম্বর প্রদান এবং ক্লাবের যেকোনো তথ্যে তাৎক্ষণিক তথ্য দিয়ে সহায়তা করে থাকি।\n\nআজ আপনাকে কীভাবে সাহায্য করতে পারি বলুন?`;
      }

      if (q.includes('পেন্ডিং') || q.includes('pending') || q.includes('অনুমোদন')) {
        if (pendingDeposits.length > 0) {
          const latest = pendingDeposits[0];
          return `আসসালামু আলাইকুম **${memberName}** ভাই।\n\nআপনার অ্যাকাউন্টে **৳${Number(latest.amount || 0).toLocaleString('en-IN')} BDT** এর একটি পেন্ডিং ডিপোজিট পাওয়া গেছে (TrxID: \`${latest.referenceNumber || 'N/A'}\`, তারিখ: ${latest.depositDate || 'N/A'})।\n\n🏛️ **পেন্ডিং থাকার কারণ:**\nক্লাবের ফান্ড সুরক্ষায় প্রতিটি ট্রানজেকশন ব্যাংক স্টেটমেন্টের সাথে নিখুঁতভাবে মেলানো হয়। সাধারণত ব্যাংক ক্লিয়ারেন্স ও ভেরিফিকেশনে **২৪ থেকে ৪৮ কর্মঘণ্টা** সময় লাগে। স্টেটমেন্ট মিললেই এটি অনুমোদিত হয়ে যাবে।`;
        }
        return `আলহামদুলিল্লাহ **${memberName}** ভাই, আপনার অ্যাকাউন্টে বর্তমানে কোনো পেন্ডিং ডিপোজিট নেই। আপনার পূর্ববর্তী সকল ডিপোজিট সফলভাবে অনুমোদিত রয়েছে।`;
      }

      if (q.includes('রিজেক্ট') || q.includes('reject') || q.includes('বাতিল')) {
        if (rejectedDeposits.length > 0) {
          const latest = rejectedDeposits[0];
          return `**${memberName}** ভাই, আপনার সর্বশেষ বাতিলকৃত ডিপোজিট তথ্য:\n\n💰 **পরিমাণ:** ৳${Number(latest.amount || 0).toLocaleString('en-IN')} BDT\n🔢 **TrxID:** \`${latest.referenceNumber || 'N/A'}\`\n❌ **বাতিলের কারণ:** "${latest.rejectionReason || 'ব্যাংক স্টেটমেন্টে ট্রানজেকশন পাওয়া যায়নি'}"\n\nযদি আপনার ব্যাংক থেকে টাকা কেটে নেওয়া হয়ে থাকে কিন্তু ভুলবশত রিজেক্ট হয়ে থাকে, তবে আমাদের একমাত্র সাপোর্ট টিম **অফিসিয়াল WhatsApp গ্রুপে** যোগ দিয়ে আপনার TrxID ও ব্যাংক ভাউচার শেয়ার করে পুনর্বিবেচনার অনুরোধ জানাতে পারেন।`;
        }
        return `আলহামদুলিল্লাহ **${memberName}** ভাই, আপনার অ্যাকাউন্টে কোনো বাতিলকৃত ডিপোজিট নেই। আপনার জমাকৃত সকল লেনদেন সঠিক রয়েছে।`;
      }

      if (q.includes('একাউন্ট') || q.includes('নম্বর') || q.includes('account') || q.includes('বিকাশ') || q.includes('নগদ') || q.includes('bank') || q.includes('টাকা পাঠাব')) {
        return `প্রবাসী বিজনেস ক্লাবের অফিসিয়াল ডিপোজিট একাউন্ট বিবরণ:\n\n📱 **বিকাশ:** \`${settingsContext?.bkashNumber || '01700000000'}\`\n📱 **নগদ:** \`${settingsContext?.nagadNumber || '01800000000'}\`\n🏛️ **ব্যাংক:** **${settingsContext?.bankName || 'Islami Bank Bangladesh PLC'}**\n• হিসাব নাম: ${settingsContext?.bankAccountName || 'Probashi Business Club'}\n• হিসাব নম্বর: \`${settingsContext?.bankAccountNumber || '2050XXXXXXXXXXXXX'}\`\n• শাখা: ${settingsContext?.bankBranchName || 'Principal Branch, Dhaka'}\n• রাউটিং: \`${settingsContext?.bankRoutingNumber || '125270000'}\`\n\nটাকা পাঠানোর পর প্রাপ্ত TrxID দিয়ে অ্যাপে ডিপোজিট সাবমিট করুন।`;
      }

      if (q.includes('office') || q.includes('অফিস') || q.includes('ঠিকানা') || q.includes('address') || q.includes('location')) {
        return `প্রবাসী বিজনেস ক্লাব (PBC)-এর প্রধান কার্যালয়:\n\n🏛️ **ঠিকানা:** ${settingsContext?.clubOfficeAddress || 'লেভেল ৪, গুলশান এভিনিউ, ঢাকা, বাংলাদেশ'}\n📞 **যোগাযোগ ও সাপোর্ট:** আমাদের অফিসিয়াল WhatsApp গ্রুপে সাপোর্ট টিমের সাথে সার্বক্ষণিক যোগাযোগ করতে পারেন।`;
      }

      if (q.includes('project') || q.includes('প্রজেক্ট') || q.includes('ইনভেস্ট') || q.includes('invest') || q.includes('জমির') || q.includes('লাভ') || q.includes('share') || q.includes('শেয়ার')) {
        return `প্রবাসী বিজনেস ক্লাব (PBC) প্রবাসী ও দেশীয় উদ্যোক্তাদের সম্মিলিত ফান্ডে রিয়েল এস্টেট, প্রাইম ল্যান্ড ডেভেলপমেন্ট ও বাণিজ্যিক প্রকল্পে বিনিয়োগ করে থাকে।\n\nপ্রতিটি শেয়ারের ইউনিট মূল্য **৳${sharePrice.toLocaleString('en-IN')} BDT**।\nআপনার অ্যাকাউন্টে বর্তমানে মোট অনুমোদিত ফান্ড: **৳${Number(totalDeposit).toLocaleString('en-IN')} BDT** (${shares} টি শেয়ার)।\n\nবিনিয়োগ ও চলমান প্রজেক্টের বিস্তারিত তথ্যের জন্য আমাদের অফিসিয়াল WhatsApp গ্রুপে বা সাপোর্ট টিমের সাথে যোগাযোগ করতে পারেন।`;
      }

      return `ধন্যবাদ **${memberName}** ভাই। আমি আপনার প্রশ্নটি বুঝতে পেরেছি।\n\nঅ্যাপ পরিচালনা, ক্লাবের কার্যক্রম বা মেম্বারশিপ সংক্রান্ত যেকোনো বিশেষ তথ্যের জন্য আপনি আমাদের **অফিসিয়াল WhatsApp সাপোর্ট গ্রুপে** সরাসরি যোগাযোগ করতে পারেন। এছাড়া আপনার ডিপোজিট স্ট্যাটাস, ব্যাংক একাউন্ট নম্বর বা ব্যালেন্স সংক্রান্ত যেকোনো তথ্যে আমি আপনাকে সার্বক্ষণিক সহায়তা করতে প্রস্তুত।`;
    };

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        success: true,
        reply: generateLocalContextReply(message),
        modelUsed: 'pbc-local-context'
      });
    }

    const systemInstruction = `
You are the official, intelligent, warm, and highly realistic Customer Support Assistant for "Probashi Business Club" (প্রবাসী বিজনেস ক্লাব - PBC).
PBC is an expatriate-led investment & cooperative community in Bangladesh specializing in collective real estate, prime land acquisition, and commercial projects.

YOUR CORE OBJECTIVE:
- Respond realistically, naturally, and warmly in fluent Bengali (or English if the user asks in English).
- Fully understand both Bengali script and "Banglish" (Bengali written with Latin/English letters, such as "tomar nam ki", "kemon achen", "deposit pending keno", "taka kivabe pathabo", "amader app ta k development korsay", etc.).
- When asked who created, developed, or built the app (e.g., "app ke development korse", "who developed the app", "developer ke", "app ke banayse", "app kar banano", "aei app to k debolap korsay"):
  * You MUST explicitly state that the application was developed by **Fokrul Islam Mir** (ফকরুল ইসলাম মীর).
  * State clearly that he is a professional Software Developer and simultaneously an active, proud member of Probashi Business Club with Member ID: **00118** (মেম্বার আইডি: 00118)।
  * Explain that as a fellow member himself, he designed and developed this modern, secure digital platform to ensure real-time deposit tracking, bank-level security, and transparent financial records for expatriate members worldwide.
  * Do NOT address the questioner by name repeatedly. Provide a polite, direct, and professional answer.
- When the user asks about your identity or name (e.g., "tomar nam ki", "who are you", "আপনার নাম কি", "কে তুমি"):
  * Clearly and warmly introduce yourself: "আমি **PBC স্মার্ট মেম্বার অ্যাসিস্ট্যান্ট** — প্রবাসী বিজনেস ক্লাব (PBC)-এর অফিসিয়াল ভার্চুয়াল কাস্টমার সাপোর্ট অ্যাসিস্ট্যান্ট।"
  * Mention how you can assist: deposit verification, bank/bKash accounts, share units, pending inquiry, and club information.
- Do NOT sound like a rigid robot or deliver canned monolithic text blocks.
- Answer the user's ACTUAL question. Do NOT blindly output balance details if they asked about something else like app development, rules, or identity.
- When the user gives a simple greeting like "Hi", "Hello", "কেমন আছেন?", or "সালাম", respond like a real, friendly human customer support manager: greet them warmly, ask how you can help them today, and mention their name (${memberName}) respectfully.
- When they ask about deposits or balance, refer to their ACTUAL real-time records:
  * Member Name: ${memberName}
  * Member ID: ${memberId}
  * Total Verified Balance: ৳${Number(totalDeposit).toLocaleString('en-IN')} BDT (${shares} Share Units)
  * Pending Deposits count: ${pendingDeposits.length}
  * Recent Pending Details: ${JSON.stringify(pendingDeposits.slice(0, 2))}
  * Rejected Deposits count: ${rejectedDeposits.length}
  * Recent Rejected Details: ${JSON.stringify(rejectedDeposits.slice(0, 2))}
  * Total Approved Deposits: ${approvedDeposits.length}
- Official Club Accounts:
  * bKash: ${settingsContext?.bkashNumber || '01700000000'} (${settingsContext?.bkashType || 'Personal'} - ${settingsContext?.bkashName || 'PBC'})
  * Nagad: ${settingsContext?.nagadNumber || '01800000000'} (${settingsContext?.nagadType || 'Personal'} - ${settingsContext?.nagadName || 'PBC'})
  * Bank: ${settingsContext?.bankName || 'Islami Bank Bangladesh PLC'}
  * Account Name: ${settingsContext?.bankAccountName || 'Probashi Business Club'}
  * Account Number: ${settingsContext?.bankAccountNumber || '2050XXXXXXXXXXXXX'}
  * Branch: ${settingsContext?.bankBranchName || 'Principal Branch, Dhaka'}
  * Routing Number: ${settingsContext?.bankRoutingNumber || '125270000'}
  * Official WhatsApp Support Group Link: ${settingsContext?.supportWhatsAppGroupLink || 'https://chat.whatsapp.com/sample-pbc-link'}
  * Official Support Channel Rule: The official WhatsApp group is PBC's sole and dedicated customer support channel. No individual or separate personal accounts are used for support.
- Verification Rule: Bank statement clearances typically take 24 to 48 business hours.
- Formatting: Use markdown for readability (bullet points, bold key terms) but keep answers concise, helpful, and natural.
`;

    // Format chat history into strictly alternating Gemini contents
    const rawHistory: Array<{ role: 'user' | 'model'; text: string }> = [];

    if (Array.isArray(chatHistory)) {
      for (const item of chatHistory.slice(-8)) {
        if (item.sender === 'user' && item.text?.trim()) {
          rawHistory.push({ role: 'user', text: item.text.trim() });
        } else if (item.sender === 'assistant' && item.text?.trim()) {
          rawHistory.push({ role: 'model', text: item.text.trim() });
        }
      }
    }

    // Add current query
    rawHistory.push({ role: 'user', text: message.trim() });

    // Clean history: Ensure it starts with 'user' and alternates strictly between 'user' and 'model'
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    let expectedRole: 'user' | 'model' = 'user';

    for (const entry of rawHistory) {
      if (contents.length === 0 && entry.role !== 'user') {
        // Skip leading 'model' greeting messages to satisfy Gemini API constraints
        continue;
      }

      if (entry.role === expectedRole) {
        contents.push({
          role: entry.role,
          parts: [{ text: entry.text }]
        });
        expectedRole = expectedRole === 'user' ? 'model' : 'user';
      } else if (contents.length > 0) {
        // If consecutive identical roles, append text to previous turn
        contents[contents.length - 1].parts[0].text += `\n${entry.text}`;
      }
    }

    // Fallback: If contents ended up empty or last item is not user, guarantee single user turn
    if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
      contents.length = 0;
      contents.push({ role: 'user', parts: [{ text: message.trim() }] });
    }

    // Highly available Gemini models in optimal fallback order
    const candidateList = [
      'gemini-3.1-flash-lite',
      'gemini-3.1-flash-lite-preview',
      'gemini-3.6-flash',
      'gemini-3.8-flash'
    ];
    let replyText = '';
    let selectedModel = '';

    for (let i = 0; i < candidateList.length; i++) {
      const modelName = candidateList[i];
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });

        if (response && response.text) {
          replyText = response.text;
          selectedModel = modelName;
          break;
        }
      } catch (_err: any) {
        // High-demand spikes (503/429) silently failover to next candidate model or contextual fallback
        if (i < candidateList.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    }

    // If models are under temporary high demand spikes, use the contextual fallback
    if (!replyText) {
      replyText = generateLocalContextReply(message);
      selectedModel = 'pbc-local-context';
    }

    return res.json({
      success: true,
      reply: replyText,
      model: selectedModel
    });
  } catch (_error: any) {
    return res.json({
      success: true,
      reply: 'আসসালামু আলাইকুম। অনুগ্রহ করে একটু পর আবার চেষ্টা করুন অথবা জরুরি প্রয়োজনে সরাসরি অফিসিয়াল WhatsApp-এ যোগাযোগ করুন।',
      fallback: true
    });
  }
});

// Setup Vite development middleware or production static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
