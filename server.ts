import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

interface SmtpOptions {
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPass?: string;
  senderName?: string;
  senderEmail?: string;
}

// Default SMTP Configuration provided for PBC Club
const DEFAULT_SMTP_USER = process.env.SMTP_USER || 'fokrulislammir9897@gmail.com';
const DEFAULT_SMTP_PASS = (process.env.SMTP_PASS || 'tqnt cqlj npjb zpal').replace(/\s+/g, '');
const DEFAULT_SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const DEFAULT_SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const DEFAULT_SENDER_NAME = process.env.SENDER_NAME || 'Probashi Business Club (PBC)';
const DEFAULT_SENDER_EMAIL = process.env.SENDER_EMAIL || DEFAULT_SMTP_USER;

function createTransporter(options?: SmtpOptions) {
  const host = options?.smtpHost || DEFAULT_SMTP_HOST;
  const port = options?.smtpPort ? Number(options.smtpPort) : DEFAULT_SMTP_PORT;
  const secure = options?.smtpSecure !== undefined ? Boolean(options.smtpSecure) : (port === 465);
  const user = options?.smtpUser || DEFAULT_SMTP_USER;
  const pass = (options?.smtpPass || DEFAULT_SMTP_PASS).replace(/\s+/g, '');

  if (!user || !pass) {
    throw new Error('SMTP user or password not configured.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

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

// ----------------------------------------------------
// 1. SMTP Test Endpoint
// ----------------------------------------------------
app.post('/api/email/test', async (req, res) => {
  try {
    const { recipientEmail, config } = req.body;
    if (!recipientEmail || typeof recipientEmail !== 'string' || !recipientEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid recipient email is required.' });
    }

    const transporter = createTransporter(config);
    const senderName = config?.senderName || DEFAULT_SENDER_NAME;
    const senderEmail = config?.senderEmail || config?.smtpUser || DEFAULT_SENDER_EMAIL;

    const testHtml = `
      <div style="background-color: #070D1B; padding: 30px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0C182F; border: 2px solid #D4AF37; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <div style="background: linear-gradient(135deg, #091326 0%, #112244 100%); padding: 25px; text-align: center; border-bottom: 2px solid #D4AF37;">
            <h1 style="margin: 0; color: #F59E0B; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">PROBASHI BUSINESS CLUB</h1>
            <p style="margin: 5px 0 0 0; color: #FCD34D; font-size: 12px; font-weight: bold; letter-spacing: 1px;">TOGETHER WE RISE - SMTP TEST VERIFICATION</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #34D399; margin-top: 0; font-size: 20px;">Email System Connected Successfully!</h2>
            <p style="color: #CBD5E1; font-size: 14px; line-height: 1.6;">
              অভিনন্দন! প্রবাসী বিজনেস ক্লাব (PBC) অ্যাপের অটোমেটেড ইমেইল সার্ভিস এবং SMTP কনফিগারেশন ১০০% নিখুঁতভাবে সক্রিয় হয়েছে।
            </p>
            <div style="background-color: #070D1B; border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 12px; padding: 15px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #E2E8F0;">
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8;">Sender:</td>
                  <td style="padding: 6px 0; font-weight: bold; color: #F59E0B;">${senderName} (${senderEmail})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8;">Recipient:</td>
                  <td style="padding: 6px 0; font-weight: bold; color: #FFFFFF;">${recipientEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8;">Status:</td>
                  <td style="padding: 6px 0; font-weight: bold; color: #34D399;">Active & Ready for Automated Receipts</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8;">Timestamp:</td>
                  <td style="padding: 6px 0; color: #94A3B8;">${new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })} BST</td>
                </tr>
              </table>
            </div>
            <p style="color: #94A3B8; font-size: 12px; line-height: 1.5; margin-bottom: 0;">
              এখন থেকে নতুন মেম্বার রেজিস্ট্রেশনে Welcome Email এবং যেকোনো ডিপোজিট অনুমোদনের পর স্বয়ংক্রিয়ভাবে PDF রসিদ সহ ইমেইল পাঠানো চালু থাকবে।
            </p>
          </div>
          <div style="background-color: #070D1B; padding: 15px; text-align: center; border-top: 1px solid rgba(212, 175, 55, 0.2); font-size: 11px; color: #64748B;">
            © ${new Date().getFullYear()} Probashi Business Club (PBC). All rights reserved.
          </div>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to: recipientEmail,
      subject: `[PBC Test] SMTP Email Setup Verification Successful`,
      html: testHtml
    });

    return res.json({
      success: true,
      messageId: info.messageId,
      message: 'Test email successfully sent!'
    });
  } catch (error: any) {
    console.error('SMTP Test Error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to send test email. Please check your credentials.'
    });
  }
});

// ----------------------------------------------------
// 2. Member Registration: Automated Welcome Email
// ----------------------------------------------------
app.post('/api/email/welcome', async (req, res) => {
  try {
    const { member, settings, config } = req.body;
    if (!member || !member.email) {
      return res.status(400).json({ success: false, error: 'Member email is required' });
    }

    const transporter = createTransporter(config);
    const senderName = config?.senderName || DEFAULT_SENDER_NAME;
    const senderEmail = config?.senderEmail || config?.smtpUser || DEFAULT_SENDER_EMAIL;

    const memberName = member.fullName || 'সম্মানিত সদস্য';
    const memberId = member.id || 'PBC-Applicant';
    const memberPhone = member.phone || 'N/A';
    const memberLocation = `${member.city || ''}${member.city && member.country ? ', ' : ''}${member.country || ''}` || 'Bangladesh';
    const waLink = settings?.supportWhatsAppGroupLink || 'https://chat.whatsapp.com/PBC-Official-Club';

    const welcomeHtml = `
      <div style="background-color: #070D1B; padding: 30px 15px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff;">
        <div style="max-width: 620px; margin: 0 auto; background-color: #0C182F; border: 2px solid #D4AF37; border-radius: 18px; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.6);">
          
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #070D1B 0%, #102040 100%); padding: 30px 20px; text-align: center; border-bottom: 2px solid #D4AF37;">
            <div style="display: inline-block; width: 64px; height: 64px; border-radius: 50%; background: rgba(212,175,55,0.15); border: 2px solid #D4AF37; line-height: 64px; font-size: 28px; margin-bottom: 10px;">
              ✈️
            </div>
            <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
              PROBASHI <span style="color: #F59E0B;">BUSINESS CLUB</span>
            </h1>
            <p style="margin: 6px 0 0 0; color: #FCD34D; font-size: 12px; font-weight: bold; letter-spacing: 2px;">
              TOGETHER WE RISE - বিশ্বস্ত প্রবাসী বিনিয়োগ নেটওয়ার্ক
            </p>
          </div>

          <!-- Body Content -->
          <div style="padding: 30px 25px;">
            <p style="font-size: 16px; color: #F59E0B; font-weight: bold; margin-top: 0;">
              আসসালামু আলাইকুম, ${memberName} ভাই!
            </p>
            <p style="color: #CBD5E1; font-size: 14px; line-height: 1.7; margin-bottom: 20px;">
              প্রবাসী বিজনেস ক্লাবে (PBC) আপনাকে আন্তরিক শুভেচ্ছা ও উষ্ণ স্বাগতম! বিশ্বজুড়ে ছড়িয়ে থাকা প্রবাসী ও দেশীয় উদ্যোক্তাদের সমন্বয়ে গঠিত এই সম্মানজনক পরিবারে আপনার সদস্যপদ আবেদন সফলভাবে গৃহীত হয়েছে।
            </p>

            <!-- Member Card Info Box -->
            <div style="background-color: #070D1B; border: 1.5px solid rgba(212, 175, 55, 0.5); border-radius: 14px; padding: 20px; margin: 25px 0;">
              <div style="border-bottom: 1px solid rgba(212,175,55,0.25); padding-bottom: 10px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #F59E0B; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">সদস্য বিবরণী (Member Profile)</span>
                <span style="background: rgba(245, 158, 11, 0.2); color: #FCD34D; font-size: 10px; padding: 3px 8px; border-radius: 6px; font-weight: bold;">APPLICATION LOGGED</span>
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #E2E8F0;">
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8; width: 40%;">সদস্য আইডি (PBC ID):</td>
                  <td style="padding: 6px 0; font-weight: 800; font-family: monospace; color: #FCD34D; font-size: 15px;">${memberId}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8;">পুরো নাম:</td>
                  <td style="padding: 6px 0; font-weight: bold; color: #FFFFFF;">${memberName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8;">ইমেইল ঠিকানা:</td>
                  <td style="padding: 6px 0; color: #CBD5E1;">${member.email}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8;">মোবাইল নম্বর:</td>
                  <td style="padding: 6px 0; color: #CBD5E1;">${memberPhone}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8;">বর্তমান অবস্থান:</td>
                  <td style="padding: 6px 0; color: #CBD5E1;">${memberLocation}</td>
                </tr>
              </table>
            </div>

            <!-- Official Deposit Accounts -->
            <div style="background-color: #081122; border: 1px solid rgba(59, 130, 246, 0.4); border-radius: 14px; padding: 18px; margin: 25px 0;">
              <h3 style="color: #60A5FA; font-size: 14px; margin-top: 0; margin-bottom: 10px; font-weight: bold;">
                🏛️ ক্লাবের অফিসিয়াল ডিপোজিট একাউন্ট বিবরণ:
              </h3>
              <p style="color: #94A3B8; font-size: 12px; margin-bottom: 12px; line-height: 1.5;">
                আপনার নিয়মিত বা অগ্রিম মাসিক শেয়ার সঞ্চয় জমা করতে নিচের যেকোনো অফিসিয়াল মাধ্যম ব্যবহার করতে পারেন:
              </p>
              <ul style="margin: 0; padding-left: 20px; font-size: 12.5px; color: #E2E8F0; line-height: 1.8;">
                <li><strong>ব্যাংক:</strong> ${settings?.bankName || 'Islami Bank Bangladesh PLC'} (হিসাব: <code>${settings?.bankAccountNumber || '2050XXXXXXXXXXXXX'}</code>)</li>
                <li><strong>বিকাশ:</strong> <code>${settings?.bkashNumber || '01700000000'}</code></li>
                <li><strong>নগদ:</strong> <code>${settings?.nagadNumber || '01800000000'}</code></li>
              </ul>
            </div>

            <!-- WhatsApp Action Button -->
            <div style="text-align: center; margin: 30px 0 15px 0;">
              <a href="${waLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; font-size: 14px; box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);">
                💬 অফিসিয়াল WhatsApp গ্রুপে যুক্ত হোন
              </a>
            </div>
            <p style="text-align: center; font-size: 11.5px; color: #94A3B8; margin-top: 8px;">
              জরুরি তথ্য, ডিপোজিট ট্র্যাকিং ও কমিউনিটি আলোচনার জন্য গ্রুপে যোগ দিন।
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #070D1B; padding: 20px; text-align: center; border-top: 1px solid rgba(212, 175, 55, 0.25); font-size: 11.5px; color: #64748B; line-height: 1.6;">
            <p style="margin: 0 0 5px 0; color: #94A3B8;">
              <strong>প্রবাসী বিজনেস ক্লাব (Probashi Business Club - PBC)</strong>
            </p>
            <p style="margin: 0; font-size: 10.5px;">
              অফিসিয়াল ঠিকানা: ${settings?.clubOfficeAddress || 'লেভেল ৪, গুলশান এভিনিউ, ঢাকা, বাংলাদেশ'}
            </p>
            <p style="margin: 8px 0 0 0; font-size: 10px; color: #475569;">
              এই ইমেইলটি সিস্টেম থেকে স্বয়ংক্রিয়ভাবে তৈরি হয়েছে। কোনো অনুসন্ধানের জন্য আমাদের WhatsApp সাপোর্ট গ্রুপে যোগাযোগ করুন।
            </p>
          </div>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to: member.email,
      subject: `প্রবাসী বিজনেস ক্লাবে (PBC) স্বাগতম! [সদস্য আইডি: ${memberId}]`,
      html: welcomeHtml
    });

    return res.json({
      success: true,
      messageId: info.messageId,
      message: 'Welcome email sent successfully!'
    });
  } catch (error: any) {
    console.error('Welcome Email Error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to send welcome email.'
    });
  }
});

// ----------------------------------------------------
// 3. Deposit Approval: Automated Email with Dynamic PDF Receipt
// ----------------------------------------------------
app.post('/api/email/deposit-receipt', async (req, res) => {
  try {
    const { recipientEmail, recipientName, deposit, member, settings, pdfBase64, filename, config } = req.body;

    if (!recipientEmail || !deposit) {
      return res.status(400).json({ success: false, error: 'Recipient email and deposit data are required.' });
    }

    const transporter = createTransporter(config);
    const senderName = config?.senderName || DEFAULT_SENDER_NAME;
    const senderEmail = config?.senderEmail || config?.smtpUser || DEFAULT_SENDER_EMAIL;

    const memberDisplayName = recipientName || deposit.memberName || member?.fullName || 'সম্মানিত সদস্য';
    const amountFormatted = Number(deposit.amount || 0).toLocaleString('en-IN');
    const sharePrice = deposit.shareUnitPrice || settings?.shareUnitPrice || 5000;
    const shareCount = deposit.shareCount || Math.max(1, Math.round(deposit.amount / sharePrice));
    const receiptNo = `RCP-${deposit.id.replace('DEP-', '')}-${(deposit.depositDate || '').replace(/-/g, '')}`;
    const adminName = deposit.approvedByAdminName || 'Super Admin';
    const waLink = settings?.supportWhatsAppGroupLink || 'https://chat.whatsapp.com/PBC-Official-Club';

    const receiptHtml = `
      <div style="background-color: #070D1B; padding: 30px 15px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff;">
        <div style="max-width: 620px; margin: 0 auto; background-color: #0C182F; border: 2px solid #D4AF37; border-radius: 18px; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.6);">
          
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #070D1B 0%, #102040 100%); padding: 30px 20px; text-align: center; border-bottom: 2px solid #D4AF37;">
            <div style="display: inline-block; width: 64px; height: 64px; border-radius: 50%; background: rgba(52, 211, 153, 0.15); border: 2px solid #34D399; line-height: 64px; font-size: 28px; margin-bottom: 10px;">
              ✓
            </div>
            <h1 style="margin: 0; color: #FFFFFF; font-size: 22px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
              PROBASHI <span style="color: #F59E0B;">BUSINESS CLUB</span>
            </h1>
            <p style="margin: 6px 0 0 0; color: #34D399; font-size: 13px; font-weight: bold; letter-spacing: 1.5px;">
              ★ ডিপোজিট ভাউচার সফলভাবে অনুমোদিত হয়েছে ★
            </p>
          </div>

          <!-- Body Content -->
          <div style="padding: 30px 25px;">
            <p style="font-size: 16px; color: #F59E0B; font-weight: bold; margin-top: 0;">
              আসসালামু আলাইকুম, ${memberDisplayName} ভাই!
            </p>
            <p style="color: #CBD5E1; font-size: 14px; line-height: 1.7; margin-bottom: 20px;">
              আলহামদুলিল্লাহ! প্রবাসী বিজনেস ক্লাবে আপনার জমাকৃত ডিপোজিট অডিট নিরীক্ষা শেষে ক্লাবের হিসাব শাখায় সফলভাবে অনুমোদিত ও পোর্টফোলিওতে ক্রেডিট করা হয়েছে।
            </p>

            <!-- Prominent Amount Display -->
            <div style="background: linear-gradient(135deg, #0B1933 0%, #152C59 100%); border: 2px solid #F59E0B; border-radius: 14px; padding: 22px; text-align: center; margin: 25px 0;">
              <span style="color: #94A3B8; font-size: 11.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 6px;">
                TOTAL APPROVED & CREDITED AMOUNT
              </span>
              <span style="color: #FCD34D; font-size: 32px; font-weight: 900; letter-spacing: 1px; display: block; font-family: 'Segoe UI', Tahoma, sans-serif;">
                ৳${amountFormatted} BDT
              </span>
              <span style="display: inline-block; background: rgba(52, 211, 153, 0.2); border: 1px solid rgba(52, 211, 153, 0.4); color: #34D399; font-size: 11px; font-weight: bold; padding: 3px 12px; border-radius: 20px; margin-top: 10px;">
                +${shareCount} টি শেয়ার ইউনিট অর্জিত
              </span>
            </div>

            <!-- Receipt Breakdown Table -->
            <div style="background-color: #070D1B; border: 1.5px solid rgba(212, 175, 55, 0.4); border-radius: 14px; padding: 20px; margin: 25px 0;">
              <div style="border-bottom: 1px solid rgba(212,175,55,0.25); padding-bottom: 10px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #F59E0B; font-weight: bold; font-size: 12.5px; text-transform: uppercase; letter-spacing: 1px;">লেনদেন ও রসিদ তথ্য</span>
                <span style="font-family: monospace; color: #CBD5E1; font-size: 11px;">${receiptNo}</span>
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #E2E8F0;">
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8; width: 42%;">সদস্যের নাম:</td>
                  <td style="padding: 6px 0; font-weight: bold; color: #FFFFFF;">${memberDisplayName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8;">সদস্য আইডি:</td>
                  <td style="padding: 6px 0; font-weight: bold; font-family: monospace; color: #FCD34D;">${deposit.memberId || member?.id || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8;">পেমেন্ট মেথড:</td>
                  <td style="padding: 6px 0; color: #FFFFFF;">${deposit.paymentMethod || 'Bank'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8;">TrxID / রেফারেন্স:</td>
                  <td style="padding: 6px 0; font-family: monospace; color: #FCD34D; font-weight: bold;">${deposit.referenceNumber || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8;">জমার তারিখ:</td>
                  <td style="padding: 6px 0; color: #CBD5E1;">${deposit.depositDate || new Date().toISOString().split('T')[0]}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8;">অনুমোদনকারী কর্মকর্তা:</td>
                  <td style="padding: 6px 0; color: #34D399; font-weight: bold;">${adminName} (Audit Cleared)</td>
                </tr>
              </table>
            </div>

            <!-- PDF Attachment Callout -->
            <div style="background-color: #061A14; border: 1.5px solid #10B981; border-radius: 14px; padding: 18px; margin: 25px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 40px; vertical-align: top; font-size: 24px;">📎</td>
                  <td style="vertical-align: top;">
                    <h4 style="margin: 0 0 5px 0; color: #34D399; font-size: 13.5px; font-weight: bold;">
                      অফিসিয়াল PDF মানি রসিদ সংযুক্ত রয়েছে!
                    </h4>
                    <p style="margin: 0; font-size: 12px; color: #A7F3D0; line-height: 1.5;">
                      এই ইমেইলের সাথে ক্লাবের সিলমোহর ও অডিট স্বাক্ষরযুক্ত <strong>${filename || 'PBC_Deposit_Receipt.pdf'}</strong> ফাইলটি Attachment হিসেবে যুক্ত করা হয়েছে। আপনি ভবিষ্যতে যেকোনো প্রমাণের জন্য এটি সংরক্ষণ বা প্রিন্ট করতে পারবেন।
                    </p>
                  </td>
                </tr>
              </table>
            </div>

            <!-- WhatsApp Action Button -->
            <div style="text-align: center; margin: 25px 0 10px 0;">
              <a href="${waLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; font-size: 13.5px; box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);">
                💬 অফিসিয়াল WhatsApp হেল্পডেস্ক
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #070D1B; padding: 20px; text-align: center; border-top: 1px solid rgba(212, 175, 55, 0.25); font-size: 11px; color: #64748B; line-height: 1.6;">
            <p style="margin: 0 0 4px 0; color: #94A3B8;">
              <strong>প্রবাসী বিজনেস ক্লাব (Probashi Business Club - PBC)</strong>
            </p>
            <p style="margin: 0; font-size: 10px;">
              অফিসিয়াল ঠিকানা: ${settings?.clubOfficeAddress || 'লেভেল ৪, গুলশান এভিনিউ, ঢাকা, বাংলাদেশ'}
            </p>
            <p style="margin: 8px 0 0 0; font-size: 9.5px; color: #475569;">
              এই কম্পিউটার রসিদটি PBC অ্যাপ দ্বারা জেনারেট করা হয়েছে। এটি বৈধ আর্থিক স্বীকৃতি দলিল।
            </p>
          </div>
        </div>
      </div>
    `;

    // Process attachments
    const mailAttachments: any[] = [];
    if (pdfBase64 && typeof pdfBase64 === 'string') {
      try {
        const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
        mailAttachments.push({
          filename: filename || `PBC_Receipt_${deposit.id}.pdf`,
          content: Buffer.from(cleanBase64, 'base64'),
          contentType: 'application/pdf'
        });
      } catch (attErr) {
        console.warn('PDF attachment buffer conversion error:', attErr);
      }
    }

    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to: recipientEmail,
      subject: `[অনুমোদিত রসিদ] ৳${amountFormatted} BDT ডিপোজিট কনফার্মেশন ও অফিসিয়াল ভাউচার - PBC Club`,
      html: receiptHtml,
      attachments: mailAttachments
    });

    return res.json({
      success: true,
      messageId: info.messageId,
      message: 'Deposit receipt email dispatched successfully with PDF attachment!'
    });
  } catch (error: any) {
    console.error('Deposit Receipt Email Error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to dispatch deposit receipt email.'
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
