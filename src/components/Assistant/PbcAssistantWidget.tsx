import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Headphones,
  Sparkles,
  Send,
  X,
  MessageCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
  HelpCircle,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  RefreshCw,
  Sparkle,
  Bot
} from 'lucide-react';

interface AssistantMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
  dataCard?: {
    type: 'pending_deposit' | 'rejected_deposit' | 'accounts' | 'receipt_guide' | 'balance_summary';
    title?: string;
    deposit?: any;
    accounts?: any;
    balanceData?: any;
  };
  actionButtons?: {
    label: string;
    icon?: 'whatsapp' | 'navigate' | 'query';
    actionType?: 'whatsapp' | 'navigate' | 'query';
    whatsappText?: string;
    targetTab?: string;
    queryPrompt?: string;
    variant?: 'primary' | 'success' | 'warning' | 'outline';
  }[];
}

export const PbcAssistantWidget: React.FC = () => {
  const {
    isAssistantOpen,
    setIsAssistantOpen,
    assistantInitialPrompt,
    currentMember,
    deposits,
    systemSettings,
    setActiveTab,
    isLoggedIn,
    language
  } = useApp();

  const { currentTheme } = useTheme();
  const isLight = currentTheme.mode === 'light';

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick Action Buttons definition
  const QUICK_REPLIES = [
    { id: 'pending', label: '💳 ডিপোজিট পেন্ডিং কেন?', prompt: 'আমার ডিপোজিট পেন্ডিং কেন? অনুমোদন হচ্ছে না কেন?' },
    { id: 'rejected', label: '❌ ডিপোজিট রিজেক্ট হলো কেন?', prompt: 'আমার ডিপোজিট রিজেক্ট হলো কেন? কারণ কী?' },
    { id: 'accounts', label: '🏦 ডিপোজিট একাউন্ট নম্বর', prompt: 'ডিপোজিট করার বিকাশ, নগদ ও ব্যাংক একাউন্ট নম্বর দিন' },
    { id: 'receipt', label: '📜 মানি রিসিট ডাউনলোড নিয়ম', prompt: 'মানি রিসিট ডাউনলোড করার নিয়ম কী?' },
    { id: 'balance', label: '📊 আমার ব্যালেন্স ও শেয়ার', prompt: 'আমার অ্যাকাউন্টে মোট জমা কত এবং কয়টি শেয়ার আছে?' },
    { id: 'password', label: '🔑 পাসওয়ার্ড সহায়তা', prompt: 'পাসওয়ার্ড ভুলে গেছি / লগইন সমস্যা' },
    { id: 'whatsapp', label: '👥 অফিসিয়াল WhatsApp গ্রুপ', prompt: 'সরাসরি ক্লাবের অফিসিয়াল WhatsApp গ্রুপে সাপোর্ট টিমের সাথে যোগাযোগ করতে চাই' }
  ];

  // Helper to copy text to clipboard
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to open WhatsApp Group (Sole official support channel)
  const triggerWhatsApp = (messageText?: string) => {
    const groupLink = systemSettings.supportWhatsAppGroupLink || 'https://chat.whatsapp.com/sample-pbc-link';
    if (messageText) {
      try {
        navigator.clipboard.writeText(messageText);
      } catch (_e) {}
    }
    window.open(groupLink, '_blank');
  };

  // Initial welcome message builder
  const getGreetingMessage = (): AssistantMessage => {
    const isMember = isLoggedIn && currentMember && currentMember.id && currentMember.id !== 'PBC-00000';
    const memberName = isMember ? (currentMember.fullName || 'সম্মানিত সদস্য') : 'সম্মানিত সদস্য';
    const memberId = isMember ? currentMember.id : '';

    const text = isMember
      ? `আসসালামু আলাইকুম **${memberName}** ভাই! 🌟\n\nপ্রবাসী বিজনেস ক্লাব (PBC) মেম্বার হেল্পডেস্কে আপনাকে স্বাগতম। আমি আপনার সার্বিক সহায়তায় প্রস্তুত।\n\nডিপোজিট স্ট্যাটাস, ব্যাংক একাউন্ট নম্বর, মানি রিসিট বা ক্লাবের যেকোনো বিষয়ে জানতে সরাসরি লিখুন অথবা নিচের অপশনগুলো থেকে বেছে নিন:`
      : `আসসালামু আলাইকুম! প্রবাসী বিজনেস ক্লাব মেম্বার হেল্পডেস্কে স্বাগতম। 🌟\n\nডিপোজিট একাউন্ট নম্বর, পাসওয়ার্ড বা ক্লাবের যেকোনো তথ্যের জন্য সরাসরি প্রশ্ন করুন:`;

    return {
      id: 'welcome-msg',
      sender: 'assistant',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const [messages, setMessages] = useState<AssistantMessage[]>(() => [getGreetingMessage()]);

  // Update welcome message if member logs in or changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'welcome-msg') {
      setMessages([getGreetingMessage()]);
    }
  }, [currentMember?.id, isLoggedIn]);

  // Handle incoming initial prompt when assistant is opened externally
  useEffect(() => {
    if (isAssistantOpen && assistantInitialPrompt) {
      handleUserSubmit(assistantInitialPrompt);
    }
  }, [isAssistantOpen, assistantInitialPrompt]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isAssistantOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isAssistantOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isAssistantOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isAssistantOpen]);

  // Realistic Intelligent Fallback Generator (if AI server endpoint is temporarily unavailable)
  const generateRealisticFallback = (rawQuery: string): AssistantMessage => {
    const q = rawQuery.toLowerCase().trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const isMember = isLoggedIn && currentMember && currentMember.id && currentMember.id !== 'PBC-00000';
    const memberId = isMember ? currentMember.id : '';
    const memberName = isMember ? (currentMember.fullName || 'সম্মানিত সদস্য') : 'সম্মানিত সদস্য';
    const memberPhone = isMember ? (currentMember.phone || 'N/A') : 'N/A';
    const memberCountry = isMember ? `${currentMember.country || ''}, ${currentMember.city || ''}` : 'N/A';

    const memberDeposits = isMember
      ? deposits.filter(d => d.memberId === memberId || d.memberId?.toLowerCase() === memberId.toLowerCase())
      : [];

    // 1. IDENTITY & NAME INQUIRY ("Tomar nam ki", "who are you", etc.)
    const isIdentityQuery =
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
      q.includes('আপনার নাম');

    if (isIdentityQuery) {
      return {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: `আসসালামু আলাইকুম **${memberName}** ভাই! 😊\n\nআমি **PBC স্মার্ট মেম্বার অ্যাসিস্ট্যান্ট** — প্রবাসী বিজনেস ক্লাব (PBC)-এর অফিসিয়াল এআই হেল্পডেস্ক অ্যাসিস্ট্যান্ট।\n\nআমি সার্বক্ষণিক আপনার ডিপোজিট যাচাই, পেন্ডিং বা রিজেক্ট লেনদেনের খোঁজ, টাকা পাঠানোর অফিসিয়াল ব্যাংক/বিকাশ একাউন্ট প্রদান এবং ক্লাবের প্রজেক্ট ও রিসিট সংক্রান্ত যেকোনো তথ্য জানাতে প্রস্তুত।\n\nআজ আপনাকে কীভাবে সহযোগিতা করতে পারি বলুন?`,
        timestamp: timeStr,
        actionButtons: [
          {
            label: '💳 ডিপোজিট পেন্ডিং কেন?',
            icon: 'query',
            actionType: 'query',
            queryPrompt: 'আমার ডিপোজিট পেন্ডিং কেন? অনুমোদন হচ্ছে না কেন?',
            variant: 'outline'
          },
          {
            label: '🏦 ডিপোজিট একাউন্ট নম্বর',
            icon: 'query',
            actionType: 'query',
            queryPrompt: 'ডিপোজিট করার বিকাশ, নগদ ও ব্যাংক একাউন্ট নম্বর দিন',
            variant: 'outline'
          },
          {
            label: '👥 অফিসিয়াল WhatsApp গ্রুপ',
            icon: 'whatsapp',
            actionType: 'whatsapp',
            whatsappText: `*PBC Club - মেম্বার জিজ্ঞাসা*\n👤 ${memberName} (${memberId})\n📱 ফোন: ${memberPhone}\n💬 জিজ্ঞাসা: ${rawQuery}`,
            variant: 'success'
          }
        ]
      };
    }

    // 2. GREETING & CASUAL INQUIRY (ন্যাচারাল ও বাস্তবসম্মত উত্তর)
    if (q === 'hi' || q === 'hello' || q === 'hy' || q === 'slm' || q === 'salam' || q === 'সালাম' || q === 'হাই' || q.includes('kemon') || q.includes('কেমন আছেন') || q.includes('valo') || q.includes('bhalo')) {
      return {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: `হ্যালো **${memberName}** ভাই, আসসালামু আলাইকুম! \n\nআলহামদুলিল্লাহ, বেশ ভালো আছি। আপনি কেমন আছেন?\n\nপ্রবাসী বিজনেস ক্লাবে আপনার সার্বিক সহযোগিতায় আমি প্রস্তুত। আজ আপনাকে কীভাবে সহায়তা করতে পারি বলুন?`,
        timestamp: timeStr,
        actionButtons: [
          {
            label: '💳 ডিপোজিট পেন্ডিং কেন?',
            icon: 'query',
            actionType: 'query',
            queryPrompt: 'আমার ডিপোজিট পেন্ডিং কেন? অনুমোদন হচ্ছে না কেন?',
            variant: 'outline'
          },
          {
            label: '🏦 ডিপোজিট একাউন্ট নম্বর',
            icon: 'query',
            actionType: 'query',
            queryPrompt: 'ডিপোজিট করার বিকাশ, নগদ ও ব্যাংক একাউন্ট নম্বর দিন',
            variant: 'outline'
          }
        ]
      };
    }

    // 2. PENDING DEPOSIT INQUIRY
    const isPendingIntent =
      q.includes('pending') ||
      q.includes('পেন্ডিং') ||
      q.includes('অনুমোদন') ||
      q.includes('দেরি') ||
      q.includes('approve') ||
      q.includes('delay') ||
      q.includes('waiting');

    if (isPendingIntent) {
      const pendingList = memberDeposits
        .filter(d => d.status === 'Pending')
        .sort((a, b) => new Date(b.depositDate).getTime() - new Date(a.depositDate).getTime());

      if (pendingList.length > 0) {
        const latest = pendingList[0];
        const formattedAmount = Number(latest.amount || 0).toLocaleString('en-IN');
        const trxId = latest.referenceNumber || 'N/A';
        const method = latest.paymentMethod || 'Bank';
        const date = latest.depositDate || 'N/A';

        const waReminderText = `*PBC Club - ডিপোজিট পেন্ডিং রিমাইন্ডার*\nমেম্বার: ${memberName} (${memberId})\nফোন: ${memberPhone}\nপরিমাণ: ৳${formattedAmount} BDT\nTrxID: ${trxId}\nমাধ্যম: ${method}\nতারিখ: ${date}\n\nআসসালামু আলাইকুম অ্যাডমিন, আমার উক্ত ডিপোজিটটি ব্যাংক স্টেটমেন্ট যাচাই করে দ্রুত অনুমোদনের অনুরোধ করছি।`;

        return {
          id: 'bot-' + Date.now(),
          sender: 'assistant',
          text: `আপনার অ্যাকাউন্টে **৳${formattedAmount} BDT** এর একটি পেন্ডিং ডিপোজিট পাওয়া গেছে (TrxID: \`${trxId}\`, জমার তারিখ: ${date})।\n\n🏛️ **ব্যাংকিং যাচাই নিয়মাবলী:**\nপ্রবাসী বিজনেস ক্লাবে ফান্ড সুরক্ষায় প্রতিটি ডিপোজিট ব্যাংক স্টেটমেন্টের সাথে নিখুঁতভাবে মিলিয়ে দেখা হয়। সাধারণত ব্যাংক ক্লিয়ারেন্সে **২৪ থেকে ৪৮ ঘণ্টা** সময় প্রয়োজন হয়। স্টেটমেন্ট মিললেই এটি অনুমোদিত হবে।`,
          timestamp: timeStr,
          dataCard: {
            type: 'pending_deposit',
            title: 'পেন্ডিং ডিপোজিট রেকর্ড',
            deposit: latest
          },
          actionButtons: [
            {
              label: '📲 WhatsApp-এ অ্যাডমিনকে রিমাইন্ডার দিন',
              icon: 'whatsapp',
              actionType: 'whatsapp',
              whatsappText: waReminderText,
              variant: 'success'
            },
            {
              label: '📂 ডিপোজিট স্টেটমেন্ট দেখুন',
              icon: 'navigate',
              actionType: 'navigate',
              targetTab: 'deposits',
              variant: 'outline'
            }
          ]
        };
      } else {
        return {
          id: 'bot-' + Date.now(),
          sender: 'assistant',
          text: `আলহামদুলিল্লাহ **${memberName}** ভাই, আপনার অ্যাকাউন্টে বর্তমানে কোনো **পেন্ডিং ডিপোজিট নেই**! আপনার পূর্ববর্তী সকল ডিপোজিট সফলভাবে অনুমোদিত রয়েছে।`,
          timestamp: timeStr,
          actionButtons: [
            {
              label: '➕ নতুন ডিপোজিট জমা দিন',
              icon: 'navigate',
              actionType: 'navigate',
              targetTab: 'deposits',
              variant: 'primary'
            },
            {
              label: '🏦 ডিপোজিট একাউন্ট নম্বর',
              icon: 'query',
              actionType: 'query',
              queryPrompt: 'ডিপোজিট করার বিকাশ, নগদ ও ব্যাংক একাউন্ট নম্বর দিন',
              variant: 'outline'
            }
          ]
        };
      }
    }

    // 3. REJECTED DEPOSIT INQUIRY
    const isRejectedIntent =
      q.includes('reject') ||
      q.includes('রিজেক্ট') ||
      q.includes('বাতিল') ||
      q.includes('declined') ||
      q.includes('cancelled');

    if (isRejectedIntent) {
      const rejectedList = memberDeposits
        .filter(d => d.status === 'Rejected')
        .sort((a, b) => new Date(b.depositDate).getTime() - new Date(a.depositDate).getTime());

      if (rejectedList.length > 0) {
        const latest = rejectedList[0];
        const formattedAmount = Number(latest.amount || 0).toLocaleString('en-IN');
        const trxId = latest.referenceNumber || 'N/A';
        const reason = latest.rejectionReason || latest.notes || 'ব্যাংক স্টেটমেন্টে ট্রানজেকশন ক্রেডিট হয়নি অথবা ভুল TrxID';

        const waAppealText = `*PBC Club - ডিপোজিট পুনর্বিবেচনা*\nমেম্বার: ${memberName} (${memberId})\nপরিমাণ: ৳${formattedAmount} BDT\nTrxID: ${trxId}\nবাতিলের কারণ: "${reason}"\nআসসালামু আলাইকুম, আমার ব্যাংক অ্যাকাউন্ট থেকে টাকা কাটা হয়েছে এবং ভাউচার রয়েছে। দয়া করে পুনর্বিবেচনা করুন।`;

        return {
          id: 'bot-' + Date.now(),
          sender: 'assistant',
          text: `আপনার সর্বশেষ বাতিলকৃত ডিপোজিট তথ্য:\n\n💰 **পরিমাণ:** ৳${formattedAmount} BDT\n🔢 **TrxID:** \`${trxId}\`\n❌ **বাতিলের কারণ:** "${reason}"\n\nযদি আপনার ব্যাংক থেকে টাকা কেটে নেওয়া হয়ে থাকে কিন্তু ভুলবশত রিজেক্ট হয়ে থাকে, তবে ক্লাবের একমাত্র সাপোর্ট টিম **অফিসিয়াল WhatsApp গ্রুপে** যুক্ত হয়ে আপনার TrxID ও ব্যাংক ভাউচার প্রুফ পাঠিয়ে পুনর্বিবেচনার আবেদন জানাতে পারেন। নিচে দেওয়া বাটনে ক্লিক করলেই সরাসরি গ্রুপ ওপেন হবে।`,
          timestamp: timeStr,
          dataCard: {
            type: 'rejected_deposit',
            title: 'বাতিলকৃত ডিপোজিট তথ্য',
            deposit: latest
          },
          actionButtons: [
            {
              label: '👥 WhatsApp গ্রুপে পুনর্বিবেচনার আবেদন',
              icon: 'whatsapp',
              actionType: 'whatsapp',
              whatsappText: waAppealText,
              variant: 'success'
            }
          ]
        };
      } else {
        return {
          id: 'bot-' + Date.now(),
          sender: 'assistant',
          text: `আলহামদুলিল্লাহ, আপনার অ্যাকাউন্টে কোনো বাতিলকৃত (Rejected) ডিপোজিট পাওয়া যায়নি। আপনার জমা দেওয়া সকল ট্রানজেকশন সঠিক রয়েছে।`,
          timestamp: timeStr
        };
      }
    }

    // 4. ACCOUNTS / PAYMENT NUMBERS
    const isAccountsIntent =
      q.includes('account') ||
      q.includes('একাউন্ট') ||
      q.includes('নম্বর') ||
      q.includes('bkash') ||
      q.includes('বিকাশ') ||
      q.includes('nagad') ||
      q.includes('নগদ') ||
      q.includes('bank') ||
      q.includes('ব্যাংক') ||
      q.includes('টাকা পাঠাব');

    if (isAccountsIntent) {
      const bkash = systemSettings.bkashNumber || '01700000000';
      const nagad = systemSettings.nagadNumber || '01800000000';
      const bankName = systemSettings.bankName || 'Islami Bank Bangladesh PLC';
      const bankAccNo = systemSettings.bankAccountNumber || '2050XXXXXXXXXXXXX';
      const bankAccName = systemSettings.bankAccountName || 'Probashi Business Club';
      const bankBranch = systemSettings.bankBranchName || 'Principal Branch, Dhaka';
      const bankRouting = systemSettings.bankRoutingNumber || '125270000';

      return {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: `প্রবাসী বিজনেস ক্লাবের অফিসিয়াল ডিপোজিট একাউন্ট বিবরণ নিচে দেওয়া হলো:\n\n📱 **বিকাশ:** \`${bkash}\`\n📱 **নগদ:** \`${nagad}\`\n🏛️ **ব্যাংক:** **${bankName}**\n• নাম: ${bankAccName}\n• হিসাব নম্বর: \`${bankAccNo}\`\n• শাখা: ${bankBranch} | রাউটিং: \`${bankRouting}\`\n\nটাকা পাঠানোর পর প্রাপ্ত TrxID দিয়ে অ্যাপে ডিপোজিট সাবমিট করুন।`,
        timestamp: timeStr,
        dataCard: {
          type: 'accounts',
          title: 'অফিসিয়াল পেমেন্ট মেথড',
          accounts: { bkash, nagad, bankName, bankAccNo, bankAccName, bankBranch, bankRouting }
        },
        actionButtons: [
          {
            label: '➕ টাকা পাঠানো শেষে ডিপোজিট জমা দিন',
            icon: 'navigate',
            actionType: 'navigate',
            targetTab: 'deposits',
            variant: 'primary'
          }
        ]
      };
    }

    // 5. APP DEVELOPMENT / TECH TEAM INQUIRY
    const isTechTeamIntent =
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
      q.includes('who made') ||
      q.includes('who develop') ||
      q.includes('বানাইছে') ||
      q.includes('ডেভেলপ') ||
      q.includes('ডেভেলপার') ||
      q.includes('কে তৈরি') ||
      q.includes('তৈরি করেছে') ||
      q.includes('software team') ||
      q.includes('tech team');

    if (isTechTeamIntent) {
      return {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: `প্রবাসী বিজনেস ক্লাব (PBC)-এর এই ডিজিটাল অ্যাপ্লিকেশনটি ডেভেলপ করেছেন **Fokrul Islam Mir**। 😊\n\nতিনি একাধারে একজন সফটওয়্যার ডেভেলপার এবং পাশাপাশি প্রবাসী বিজনেস ক্লাবের একজন গর্বিত সম্মানিত সদস্য (সদস্য আইডি: **00118**)।\n\nসম্মানিত প্রবাসী মেম্বারদের শেয়ার ও ফান্ডের নিখুঁত হিসাব, রিয়েল-টাইম ডিপোজিট ট্র্যাকিং, আন্তর্জাতিক মানের ডেটা সিকিউরিটি এবং আর্থিক স্বচ্ছতা নিশ্চিত করার লক্ষ্যেই তিনি অত্যন্ত দক্ষতার সাথে এই প্ল্যাটফর্মটি ডেভেলপ করেছেন।\n\nঅ্যাপ সম্পর্কিত আপনার কোনো মূল্যবান মতামত, টেকনিক্যাল পরামর্শ বা নতুন ফিচারের প্রস্তাব থাকলে আমাদের সাপোর্ট গ্রুপে জানাতে পারেন!`,
        timestamp: timeStr,
        actionButtons: [
          {
            label: '👥 অফিসিয়াল WhatsApp গ্রুপ',
            icon: 'whatsapp',
            actionType: 'whatsapp',
            whatsappText: `*PBC Club - অ্যাপ ফিডব্যাক ও সহায়তা*\nসদস্য: ${memberName} (${memberId})\nবার্তা: অ্যাপ বিষয়ক পরামর্শ ও ফিডব্যাক।`,
            variant: 'success'
          }
        ]
      };
    }

    // 6. BALANCE & SHARES
    const isBalanceIntent =
      q.includes('balance') ||
      q.includes('ব্যালেন্স') ||
      q.includes('মোট জমা') ||
      q.includes('টাকা কত') ||
      q.includes('share') ||
      q.includes('শেয়ার');

    if (isBalanceIntent && isMember) {
      const totalApproved = Number(currentMember.totalDeposit || 0);
      const sharePrice = systemSettings.shareUnitPrice || 5000;
      const calculatedShares = Math.floor(totalApproved / sharePrice);

      return {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: `**${memberName}** ভাই, আপনার বর্তমান ব্যালেন্স ও শেয়ার তথ্য:\n\n💰 **মোট অনুমোদিত জমা:** **৳${totalApproved.toLocaleString('en-IN')} BDT**\n📈 **শেয়ার সংখ্যা:** **${calculatedShares} টি** (প্রতি শেয়ার ৳${sharePrice.toLocaleString('en-IN')})\n📂 **মোট ট্রানজেকশন:** ${memberDeposits.length} টি`,
        timestamp: timeStr,
        actionButtons: [
          {
            label: '📂 ডিপোজিট বিবরণ দেখুন',
            icon: 'navigate',
            actionType: 'navigate',
            targetTab: 'deposits',
            variant: 'primary'
          }
        ]
      };
    }

    // GENERAL FALLBACK
    return {
      id: 'bot-' + Date.now(),
      sender: 'assistant',
      text: `ধন্যবাদ **${memberName}** ভাই। আমি আপনার প্রশ্নটি বুঝতে পেরেছি।\n\nক্লাবের কার্যক্রম, ডিপোজিট স্ট্যাটাস, টাকা জমার ব্যাংক/বিকাশ একাউন্ট নম্বর বা যেকোনো বিষয়ে আপনাকে সহায়তা করতে প্রস্তুত।\n\nপ্রবাসী বিজনেস ক্লাবের একমাত্র সাপোর্ট টিম হলো আমাদের **অফিসিয়াল WhatsApp গ্রুপ**। যেকোনো জরুরি প্রয়োজনে সরাসরি অফিসিয়াল গ্রুপে যোগ দিতে পারেন।`,
      timestamp: timeStr,
      actionButtons: [
        {
          label: '💳 ডিপোজিট পেন্ডিং কেন?',
          icon: 'query',
          actionType: 'query',
          queryPrompt: 'আমার ডিপোজিট পেন্ডিং কেন? অনুমোদন হচ্ছে না কেন?',
          variant: 'outline'
        },
        {
          label: '🏦 ডিপোজিট একাউন্ট নম্বর',
          icon: 'query',
          actionType: 'query',
          queryPrompt: 'ডিপোজিট করার বিকাশ, নগদ ও ব্যাংক একাউন্ট নম্বর দিন',
          variant: 'outline'
        },
        {
          label: '👥 অফিসিয়াল WhatsApp গ্রুপ',
          icon: 'whatsapp',
          actionType: 'whatsapp',
          whatsappText: `*PBC Club - মেম্বার সহায়তা*\n👤 মেম্বার: ${memberName} (${memberId})\n📱 ফোন: ${memberPhone}\n💬 জিজ্ঞাসা: ${rawQuery}`,
          variant: 'success'
        }
      ]
    };
  };

  // Submit Handler: Calls Server AI API (Gemini 3.8 Flash) with contextual fallback
  const handleUserSubmit = async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed || isTyping) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: AssistantMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: trimmed,
      timestamp: timeStr
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const isMember = isLoggedIn && currentMember && currentMember.id && currentMember.id !== 'PBC-00000';
    const memberId = isMember ? currentMember.id : '';
    const memberName = isMember ? (currentMember.fullName || 'Member') : 'Member';
    const memberPhone = isMember ? (currentMember.phone || 'N/A') : 'N/A';
    const memberCountry = isMember ? `${currentMember.country || ''}, ${currentMember.city || ''}` : 'N/A';

    const memberDeposits = isMember
      ? deposits.filter(d => d.memberId === memberId || d.memberId?.toLowerCase() === memberId.toLowerCase())
      : [];

    const pendingList = memberDeposits.filter(d => d.status === 'Pending');
    const rejectedList = memberDeposits.filter(d => d.status === 'Rejected');
    const approvedList = memberDeposits.filter(d => d.status === 'Approved');

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          chatHistory: messages.slice(-8).map(m => ({ sender: m.sender, text: m.text })),
          memberContext: {
            id: memberId,
            fullName: memberName,
            phone: memberPhone,
            country: memberCountry,
            totalDeposit: currentMember?.totalDeposit || 0,
            role: currentMember?.role || 'member'
          },
          depositsContext: {
            pending: pendingList.map(d => ({
              amount: d.amount,
              depositDate: d.depositDate,
              referenceNumber: d.referenceNumber,
              paymentMethod: d.paymentMethod,
              targetMonth: d.targetMonth
            })),
            rejected: rejectedList.map(d => ({
              amount: d.amount,
              depositDate: d.depositDate,
              referenceNumber: d.referenceNumber,
              rejectionReason: d.rejectionReason || d.notes
            })),
            approved: approvedList.map(d => ({
              amount: d.amount,
              depositDate: d.depositDate
            }))
          },
          settingsContext: systemSettings
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.reply) {
          const replyText = data.reply;
          const qLower = trimmed.toLowerCase();
          const rLower = replyText.toLowerCase();

          let dataCard: AssistantMessage['dataCard'] = undefined;
          let actionButtons: AssistantMessage['actionButtons'] = [];

          // Dynamic card attachments based on question content
          if ((qLower.includes('pending') || qLower.includes('পেন্ডিং') || rLower.includes('পেন্ডিং')) && pendingList.length > 0) {
            dataCard = {
              type: 'pending_deposit',
              title: 'পেন্ডিং ডিপোজিট রেকর্ড',
              deposit: pendingList[0]
            };
            actionButtons.push({
              label: '👥 WhatsApp গ্রুপে সাপোর্ট টিমের দৃষ্টি আকর্ষণ',
              icon: 'whatsapp',
              actionType: 'whatsapp',
              whatsappText: `*PBC Club - ডিপোজিট পেন্ডিং রিমাইন্ডার*\nমেম্বার: ${memberName} (${memberId})\nপরিমাণ: ৳${Number(pendingList[0].amount).toLocaleString('en-IN')} BDT\nTrxID: ${pendingList[0].referenceNumber}\nঅনুরোধ: ব্যাংক স্টেটমেন্ট ভেরিফাই করে দ্রুত অনুমোদনের অনুরোধ করছি।`,
              variant: 'success'
            });
          }

          if ((qLower.includes('reject') || qLower.includes('রিজেক্ট') || qLower.includes('বাতিল') || rLower.includes('রিজেক্ট')) && rejectedList.length > 0) {
            dataCard = {
              type: 'rejected_deposit',
              title: 'বাতিলকৃত ডিপোজিট রেকর্ড',
              deposit: rejectedList[0]
            };
            actionButtons.push({
              label: '👥 WhatsApp গ্রুপে পুনর্বিবেচনার আবেদন',
              icon: 'whatsapp',
              actionType: 'whatsapp',
              whatsappText: `*PBC Club - ডিপোজিট পুনর্বিবেচনা*\nমেম্বার: ${memberName} (${memberId})\nপরিমাণ: ৳${Number(rejectedList[0].amount).toLocaleString('en-IN')} BDT\nTrxID: ${rejectedList[0].referenceNumber}\nবাতিলের কারণ: "${rejectedList[0].rejectionReason || 'স্টেটমেন্ট অমিল'}"\nঅনুরোধ: টাকা কাটা হয়েছে, দয়া করে স্টেটমেন্ট পুনর্বিবেচনা করুন।`,
              variant: 'success'
            });
          }

          if (qLower.includes('account') || qLower.includes('একাউন্ট') || qLower.includes('বিকাশ') || qLower.includes('নগদ') || qLower.includes('ব্যাংক') || qLower.includes('bkash') || qLower.includes('nagad') || qLower.includes('bank') || qLower.includes('টাকা পাঠাব')) {
            const bkash = systemSettings.bkashNumber || '01700000000';
            const nagad = systemSettings.nagadNumber || '01800000000';
            const bankName = systemSettings.bankName || 'Islami Bank Bangladesh PLC';
            const bankAccNo = systemSettings.bankAccountNumber || '2050XXXXXXXXXXXXX';
            const bankAccName = systemSettings.bankAccountName || 'Probashi Business Club';
            const bankBranch = systemSettings.bankBranchName || 'Principal Branch, Dhaka';
            const bankRouting = systemSettings.bankRoutingNumber || '125270000';

            dataCard = {
              type: 'accounts',
              title: 'অফিসিয়াল ডিপোজিট একাউন্ট',
              accounts: { bkash, nagad, bankName, bankAccNo, bankAccName, bankBranch, bankRouting }
            };
          }

          if (qLower.includes('receipt') || qLower.includes('রিসিট') || qLower.includes('রশিদ')) {
            actionButtons.push({
              label: '📂 ডিপোজিট পেইজে যান',
              icon: 'navigate',
              actionType: 'navigate',
              targetTab: 'deposits',
              variant: 'primary'
            });
          }

          if (actionButtons.length === 0) {
            actionButtons.push({
              label: '👥 অফিসিয়াল WhatsApp গ্রুপ',
              icon: 'whatsapp',
              actionType: 'whatsapp',
              whatsappText: `*PBC Club - মেম্বার জিজ্ঞাসা*\n👤 ${memberName} (${memberId})\n💬 জিজ্ঞাসা: ${trimmed}`,
              variant: 'outline'
            });
          }

          const botMsg: AssistantMessage = {
            id: 'bot-' + Date.now(),
            sender: 'assistant',
            text: replyText,
            timestamp: timeStr,
            dataCard,
            actionButtons
          };

          setMessages(prev => [...prev, botMsg]);
          setIsTyping(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Using intelligent fallback generator:', err);
    }

    // Graceful realistic fallback
    const fallbackReply = generateRealisticFallback(trimmed);
    setMessages(prev => [...prev, fallbackReply]);
    setIsTyping(false);
  };

  const handleActionButtonClick = (btn: NonNullable<AssistantMessage['actionButtons']>[0]) => {
    if (btn.actionType === 'whatsapp' && btn.whatsappText) {
      triggerWhatsApp(btn.whatsappText);
    } else if (btn.actionType === 'navigate' && btn.targetTab) {
      setActiveTab(btn.targetTab as any);
      setIsAssistantOpen(false);
    } else if (btn.actionType === 'query' && btn.queryPrompt) {
      handleUserSubmit(btn.queryPrompt);
    }
  };

  // Helper to format text with **bold** highlights and line breaks without raw markdown asterisks
  const renderFormattedText = (text: string, isUserMessage: boolean) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed">
        {lines.map((line, lineIdx) => {
          if (!line.trim()) {
            return <div key={lineIdx} className="h-1.5" />;
          }

          // Split line by bold markdown **text**
          const parts = line.split(/(\*\*[^*]+\*\*)/g);
          return (
            <p key={lineIdx} className="m-0">
              {parts.map((part, partIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  const boldText = part.slice(2, -2);
                  return (
                    <strong
                      key={partIdx}
                      className={
                        isUserMessage
                          ? 'font-black text-slate-950'
                          : 'font-extrabold text-amber-300'
                      }
                    >
                      {boldText}
                    </strong>
                  );
                }
                return <span key={partIdx}>{part}</span>;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* 
        Full-Scene PBC Member Helpdesk View
        Occupies 100% full screen / scene when opened, completely covering background
      */}
      {isAssistantOpen && (
        <div
          id="pbc-assistant-fullscreen-scene"
          className={`fixed inset-0 z-[999999] w-full h-full max-w-full flex flex-col ${
            isLight ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#030816] text-white'
          } overflow-hidden overflow-x-hidden select-none animate-fadeIn`}
        >
          {/* Top Full Screen Header Bar - Safe Area Inset Aware */}
          <header
            style={{
              paddingTop: 'max(env(safe-area-inset-top, 0px), 14px)',
              paddingBottom: '12px'
            }}
            className="relative w-full px-3 sm:px-6 bg-gradient-to-r from-[#07132B] via-[#0D1F3F] to-[#07132B] text-white flex items-center justify-between shadow-2xl shrink-0 border-b border-amber-500/25 z-20"
          >
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              {/* Back button */}
              <button
                onClick={() => setIsAssistantOpen(false)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition cursor-pointer border border-white/10 shrink-0"
                title="ফিরে যান"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Bot Avatar Icon */}
              <div className="relative shrink-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300">
                  <Headphones className="w-5 h-5 stroke-[2.3]" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#07132B] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                </span>
              </div>

              {/* Bot & Member Title */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-sm sm:text-base font-black tracking-tight text-white truncate">
                    PBC মেম্বার হেল্পডেস্ক
                  </h1>
                  <span className="inline-flex px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 items-center gap-1 shrink-0">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>এআই সক্রিয়</span>
                  </span>
                </div>
                <p className="text-[11px] font-medium text-amber-200/90 truncate flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 inline-block"></span>
                  <span className="truncate">
                    সার্বক্ষণিক ডিজিটাল সাপোর্ট ও মেম্বার সার্ভিস
                  </span>
                </p>
              </div>
            </div>

            {/* Header controls: Reset Chat, Close */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={() => setMessages([getGreetingMessage()])}
                title="নতুন চ্যাট শুরু করুন"
                className="h-9 px-2.5 sm:px-3 rounded-xl bg-white/5 hover:bg-white/15 active:scale-95 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">রিসেট</span>
              </button>
              <button
                onClick={() => setIsAssistantOpen(false)}
                title="বন্ধ করুন"
                className="w-9 h-9 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 active:scale-95 text-rose-300 hover:text-rose-100 border border-rose-500/30 transition cursor-pointer flex items-center justify-center shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Quick Reply Scrollable Chips Bar */}
          <div
            className={`px-3 sm:px-6 py-2.5 shrink-0 border-b overflow-x-auto no-scrollbar flex items-center gap-2 ${
              isLight ? 'bg-amber-50/70 border-amber-200/80' : 'bg-[#071328] border-amber-500/20'
            }`}
          >
            {QUICK_REPLIES.map(chip => (
              <button
                key={chip.id}
                onClick={() => handleUserSubmit(chip.prompt)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition duration-150 active:scale-95 cursor-pointer flex items-center gap-1.5 border whitespace-nowrap ${
                  isLight
                    ? 'bg-white hover:bg-amber-100/70 text-slate-800 border-amber-200 shadow-xs'
                    : 'bg-[#0E2042] hover:bg-amber-500/20 text-amber-200 hover:text-amber-100 border-amber-500/30 shadow-xs'
                }`}
              >
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          {/* Main Conversation Feed (Centered with max-w-3xl for optimal readability) */}
          <div
            className={`flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4 select-text ${
              isLight ? 'bg-[#F8FAFC]' : 'bg-[#040A17]'
            }`}
          >
            <div className="max-w-3xl mx-auto w-full space-y-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
                >
                  <div
                    className={`flex items-end gap-2 max-w-[94%] sm:max-w-[85%] ${
                      msg.sender === 'user' ? 'flex-row-reverse self-end' : 'self-start'
                    }`}
                  >
                    {msg.sender === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shrink-0 mb-1 shadow-sm border border-amber-300">
                        <Headphones className="w-3.5 h-3.5 stroke-[2.3]" />
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`rounded-2xl p-3.5 sm:p-4 text-xs sm:text-[13.5px] leading-relaxed shadow-md ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-bold rounded-tr-xs shadow-amber-950/20'
                          : isLight
                          ? 'bg-white text-slate-900 border border-amber-200/90 rounded-tl-xs shadow-sm'
                          : 'bg-[#0A172F] text-slate-100 border border-amber-500/25 rounded-tl-xs shadow-xl'
                      }`}
                    >
                      {/* Markdown bold formatting */}
                      {renderFormattedText(msg.text, msg.sender === 'user')}

                      {/* Custom Data Cards */}
                      {msg.dataCard && (
                        <div className="mt-3 pt-2.5 border-t border-amber-500/30 space-y-2 font-normal">
                          {msg.dataCard.type === 'pending_deposit' && msg.dataCard.deposit && (
                            <div
                              className={`p-3 rounded-xl border ${
                                isLight
                                  ? 'bg-amber-50/80 border-amber-300 text-slate-900'
                                  : 'bg-amber-950/30 border-amber-500/40 text-amber-100'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold text-xs pb-1.5 mb-1.5 border-b border-amber-500/20">
                                <span className="flex items-center gap-1.5 text-amber-400">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>পেন্ডিং ট্রানজেকশন</span>
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">
                                  ভেরিফিকেশন চলমান
                                </span>
                              </div>
                              <div className="text-[11.5px] space-y-1">
                                <div>পরিমাণ: <strong className="text-amber-400">৳{Number(msg.dataCard.deposit.amount).toLocaleString('en-IN')} BDT</strong></div>
                                <div>TrxID: <span className="font-mono font-bold">{msg.dataCard.deposit.referenceNumber}</span></div>
                                <div>মাধ্যম: {msg.dataCard.deposit.paymentMethod}</div>
                                <div>তারিখ: {msg.dataCard.deposit.depositDate}</div>
                              </div>
                            </div>
                          )}

                          {msg.dataCard.type === 'rejected_deposit' && msg.dataCard.deposit && (
                            <div
                              className={`p-3 rounded-xl border ${
                                isLight
                                  ? 'bg-rose-50 border-rose-300 text-slate-900'
                                  : 'bg-rose-950/30 border-rose-500/40 text-rose-100'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold text-xs pb-1.5 mb-1.5 border-b border-rose-500/20">
                                <span className="flex items-center gap-1.5 text-rose-400">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>বাতিলকৃত ডিপোজিট</span>
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px]">
                                  Rejected
                                </span>
                              </div>
                              <div className="text-[11.5px] space-y-1">
                                <div>পরিমাণ: <strong>৳{Number(msg.dataCard.deposit.amount).toLocaleString('en-IN')} BDT</strong></div>
                                <div>TrxID: <span className="font-mono">{msg.dataCard.deposit.referenceNumber}</span></div>
                                <div className="text-rose-400 font-semibold pt-1">
                                  কারণ: "{msg.dataCard.deposit.rejectionReason || 'ব্যাংক স্টেটমেন্ট অমিল'}"
                                </div>
                              </div>
                            </div>
                          )}

                          {msg.dataCard.type === 'accounts' && msg.dataCard.accounts && (
                            <div className="space-y-2 pt-1 text-xs">
                              {/* bKash */}
                              <div
                                className={`p-2.5 rounded-xl border flex items-center justify-between ${
                                  isLight ? 'bg-pink-50 border-pink-300 text-slate-900' : 'bg-pink-950/20 border-pink-500/30 text-pink-200'
                                }`}
                              >
                                <div>
                                  <div className="font-bold text-pink-500">বিকাশ (bKash)</div>
                                  <div className="font-mono font-bold text-sm">{msg.dataCard.accounts.bkash}</div>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(msg.dataCard.accounts.bkash, 'bkash')}
                                  className="px-2.5 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-400/40 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                                >
                                  {copiedId === 'bkash' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedId === 'bkash' ? 'কপি হয়েছে' : 'কপি'}</span>
                                </button>
                              </div>

                              {/* Nagad */}
                              <div
                                className={`p-2.5 rounded-xl border flex items-center justify-between ${
                                  isLight ? 'bg-amber-50 border-amber-300 text-slate-900' : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                                }`}
                              >
                                <div>
                                  <div className="font-bold text-amber-500">নগদ (Nagad)</div>
                                  <div className="font-mono font-bold text-sm">{msg.dataCard.accounts.nagad}</div>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(msg.dataCard.accounts.nagad, 'nagad')}
                                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                                >
                                  {copiedId === 'nagad' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedId === 'nagad' ? 'কপি হয়েছে' : 'কপি'}</span>
                                </button>
                              </div>

                              {/* Bank */}
                              <div
                                className={`p-2.5 rounded-xl border flex items-center justify-between ${
                                  isLight ? 'bg-emerald-50 border-emerald-300 text-slate-900' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                                }`}
                              >
                                <div>
                                  <div className="font-bold text-emerald-500">{msg.dataCard.accounts.bankName}</div>
                                  <div className="font-mono font-bold text-xs">হিসাব: {msg.dataCard.accounts.bankAccNo}</div>
                                  <div className="text-[10.5px] opacity-80">{msg.dataCard.accounts.bankAccName} ({msg.dataCard.accounts.bankBranch})</div>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(msg.dataCard.accounts.bankAccNo, 'bank')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                                >
                                  {copiedId === 'bank' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedId === 'bank' ? 'কপি হয়েছে' : 'কপি'}</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <span
                        className={`text-[10px] block mt-1.5 text-right font-mono ${
                          msg.sender === 'user' ? 'text-slate-950/70 font-semibold' : 'text-slate-400/70'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Action Buttons */}
                  {msg.actionButtons && msg.actionButtons.length > 0 && (
                    <div className="flex flex-wrap gap-2 max-w-[95%] pl-9 pt-0.5">
                      {msg.actionButtons.map((btn, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleActionButtonClick(btn)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition duration-150 active:scale-95 cursor-pointer flex items-center gap-2 shadow-md ${
                            btn.variant === 'success'
                              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-950/30 border border-emerald-400'
                              : btn.variant === 'primary'
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-950/30 border border-amber-200'
                              : isLight
                              ? 'bg-white hover:bg-slate-100 text-slate-800 border border-amber-300 shadow-xs'
                              : 'bg-[#0E2042] hover:bg-[#152e5c] text-amber-200 hover:text-amber-100 border border-amber-500/35 shadow-xs'
                          }`}
                        >
                          {btn.icon === 'whatsapp' && <MessageCircle className="w-4 h-4 fill-current shrink-0" />}
                          {btn.icon === 'navigate' && <ChevronRight className="w-4 h-4 shrink-0" />}
                          <span>{btn.label}</span>
                          {btn.icon === 'whatsapp' && <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-80" />}
                          {btn.icon === 'query' && <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60 ml-0.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#0A172F] border border-amber-500/25 text-xs text-amber-300 w-fit shadow-md ml-9">
                  <Headphones className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>মেম্বার হেল্পডেস্ক উত্তর লিখছে...</span>
                  <span className="flex gap-1 items-center ml-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"></span>
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Full Screen Bottom Input Bar - Safe Area Inset Aware */}
          <footer
            style={{
              paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 14px)'
            }}
            className={`p-2.5 sm:p-4 border-t shrink-0 z-20 ${
              isLight ? 'bg-white border-amber-200/80 shadow-lg' : 'bg-[#071122] border-amber-500/25 shadow-2xl'
            }`}
          >
            <form
              onSubmit={e => {
                e.preventDefault();
                handleUserSubmit(input);
              }}
              className="max-w-3xl mx-auto w-full flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="এখানে লিখুন (যেমন: ডিপোজিট পেন্ডিং কেন, একাউন্ট নম্বর)..."
                enterKeyHint="send"
                style={{ fontSize: '16px' }}
                className={`flex-1 min-w-0 px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-2xl text-[16px] sm:text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition ${
                  isLight
                    ? 'bg-slate-50 border-amber-300 text-slate-900 placeholder-slate-400'
                    : 'bg-[#0D1F3F] border-amber-500/30 text-white placeholder-slate-400'
                }`}
              />

              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="h-[46px] min-w-[46px] px-3.5 sm:px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-950/30 border border-amber-200 transition duration-150 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shrink-0"
              >
                <span className="hidden sm:inline">পাঠান</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </footer>
        </div>
      )}
    </>
  );
};
