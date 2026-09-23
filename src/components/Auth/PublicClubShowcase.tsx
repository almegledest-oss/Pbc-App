import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  ShieldCheck, 
  Crown, 
  TrendingUp, 
  Globe, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  ArrowUp, 
  Sparkles, 
  HeartHandshake, 
  Briefcase, 
  MessageSquare, 
  MapPin, 
  ExternalLink,
  ChevronDown,
  Layers,
  Lock,
  PhoneCall,
  Quote,
  LogIn
} from 'lucide-react';
import { PbcLogo } from '../Common/PbcLogo';
import { PBCFramedAvatar } from '../Common/PBCFramedAvatar';

interface PublicClubShowcaseProps {
  onScrollToLogin: () => void;
  loginSectionSlot?: React.ReactNode;
}

export const PublicClubShowcase: React.FC<PublicClubShowcaseProps> = ({ onScrollToLogin, loginSectionSlot }) => {
  const { boardDirectors, systemSettings } = useApp();

  const scrollToAbout = () => {
    const el = document.getElementById('about');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Check director list or fallback to safeStorage if freshly edited
  const leader = (boardDirectors && boardDirectors.length > 0)
    ? boardDirectors.find(d => 
        d.isActive !== false &&
        (
          (d.designation && (
            d.designation.toLowerCase().includes('president') || 
            d.designation.includes('প্রেসিডেন্ট') || 
            d.designation.includes('সভাপতি')
          )) ||
          d.name.toUpperCase().includes('SHAKIL')
        )
      ) || boardDirectors.find(d => 
        d.isActive !== false &&
        d.designation && (
          d.designation.toLowerCase().includes('chair') || 
          d.designation.includes('চেয়ারম্যান') || 
          d.designation.includes('চেয়ারম্যান')
        )
      )
    : null;

  const leaderName = leader?.name || 'SHAKIL RANA';
  const leaderDesignation = leader?.designation || 'President';
  const leaderLocation = leader?.location || 'Dhaka Bangladesh';
  const leaderPhotoUrl = leader?.photoUrl || '';
  const leaderMobile = leader?.mobile || '+8801711008874';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-24 text-slate-200">
      
      {/* HERO SPOTLIGHT BANNER */}
      <section className="mb-14 text-center relative">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-4 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
          <PbcLogo variant="gold" className="w-20 h-20 sm:w-24 sm:h-24 mx-auto" />
        </div>

        <div className="flex items-center justify-center gap-2 text-[#E5A93C] text-xs sm:text-sm font-black tracking-[0.3em] uppercase mb-3">
          <span className="text-[11px]">❖</span>
          <span>TOGETHER WE RISE</span>
          <span className="text-[11px]">❖</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
          প্রবাসী বিজনেস ক্লাব
          <span className="block text-xl sm:text-2xl font-bold text-amber-400 mt-2 tracking-wide">
            PROBASHI BUSINESS CLUB (PBC)
          </span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          বিশ্বজুড়ে ছড়িয়ে থাকা প্রবাসী বাংলাদেশি ব্যবসায়ী, উদ্যোক্তা ও মেম্বারদের একটি সুদৃঢ় প্রাতিষ্ঠানিক প্ল্যাটফর্ম। যৌথ পুঁজির নিরাপদ বিনিয়োগ ও পারস্পরিক সহযোগিতার বিশ্বস্ত ঠিকানা।
        </p>

        {/* Primary Call to Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onScrollToLogin}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:via-yellow-300 hover:to-amber-500 text-slate-950 font-black text-sm sm:text-base rounded-xl shadow-[0_0_30px_rgba(212,175,55,0.3)] transition transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <LogIn className="w-5 h-5 text-slate-950" />
            <span>লগইন / সাইন ইন (নিচে যান)</span>
            <ChevronDown className="w-4 h-4 text-slate-950 animate-bounce" />
          </button>

          <button
            type="button"
            onClick={scrollToAbout}
            className="px-6 py-3.5 bg-[#070D1B] hover:bg-[#0E1A33] border border-amber-500/30 text-amber-300 hover:text-white text-sm font-bold rounded-xl transition cursor-pointer flex items-center gap-2 active:scale-95 shadow-md"
          >
            <span>পরিচিতি ও ভিশন</span>
            <ChevronDown className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* 3 Value Pillars Mini Bar */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto text-left">
          <div className="bg-[#070D1B]/80 border border-amber-500/20 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">১০০% স্বচ্ছ তহবিল</div>
              <div className="text-[11px] text-slate-400">নিরাপদ হিসাব ও রিয়েল-টাইম ট্র্যাকিং</div>
            </div>
          </div>

          <div className="bg-[#070D1B]/80 border border-amber-500/20 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">রিয়েল এস্টেট প্রজেক্ট</div>
              <div className="text-[11px] text-slate-400">লাভজনক দীর্ঘমেয়াদী বিনিয়োগ</div>
            </div>
          </div>

          <div className="bg-[#070D1B]/80 border border-amber-500/20 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">ডিজিটাল স্মার্ট কার্ড</div>
              <div className="text-[11px] text-slate-400">মেম্বারদের অফিসিয়াল ভেরিফিকেশন</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: ABOUT & VISION */}
      <section id="about" className="scroll-mt-24 mb-16">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>আমাদের পরিচিতি ও ভিশন • About & Vision</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            প্রবাসী বাংলাদেশি উদ্যোক্তাদের <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
              ঐক্য, আস্থা ও টেকসই সমৃদ্ধির প্ল্যাটফর্ম
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            <strong className="text-white">প্রবাসী বিজনেস ক্লাব (Probashi Business Club - PBC)</strong> বিশ্বজুড়ে ছড়িয়ে থাকা প্রবাসী বাংলাদেশি ব্যবসায়ী, উদ্যোক্তা ও মেম্বারদের একটি সুদৃঢ় প্রাতিষ্ঠানিক প্ল্যাটফর্ম। যৌথ পুঁজির নিরাপদ বিনিয়োগ, পারস্পরিক ব্যবসায়িক নেটওয়ার্কিং এবং রিয়েল এস্টেট প্রজেক্টের মাধ্যমে ভবিষ্যৎ প্রজন্মের জন্য স্থায়ী অর্থনৈতিক ভিত্তি গড়ে তোলাই আমাদের প্রধান অঙ্গীকার।
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#070D1B] border border-amber-500/25 hover:border-amber-500/50 rounded-2xl p-6 transition duration-200 shadow-lg shadow-black/40">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">১০০% স্বচ্ছতা ও তহবিল সুরক্ষা</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              সদস্যদের প্রতিটি ডিপোজিট ও শেয়ার ইউনিট নিখুঁতভাবে ট্র্যাকিং করা হয়। ব্যাংক-গ্রেড সিকিউরিটি ও ভেরিফাইড স্টেটমেন্টের মাধ্যমে জবাবদিহিতা নিশ্চিত থাকে।
            </p>
          </div>

          <div className="bg-[#070D1B] border border-amber-500/25 hover:border-amber-500/50 rounded-2xl p-6 transition duration-200 shadow-lg shadow-black/40">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">রিয়েল এস্টেট ও যৌথ প্রকল্প</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              পরিকল্পিত আবাসন, লাভজনক প্রাইম ল্যান্ড ও বাণিজ্যিক প্রজেক্টে সম্মিলিত মূলধন বিনিয়োগ করে স্থায়ী ও দীর্ঘমেয়াদী মুনাফার নিশ্চয়তা প্রদান।
            </p>
          </div>

          <div className="bg-[#070D1B] border border-amber-500/25 hover:border-amber-500/50 rounded-2xl p-6 transition duration-200 shadow-lg shadow-black/40">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">বিশ্বব্যাপী প্রবাসী নেটওয়ার্ক</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              সৌদি আরব, সংযুক্ত আরব আমিরাত, কাতার, কুয়েত, ওমান, যুক্তরাজ্য, যুক্তরাষ্ট্র ও বাংলাদেশের প্রবাসী ভাইদের মাঝে ব্যবসায়িক সংযোগ ও ভ্রাতৃত্ব।
            </p>
          </div>
        </div>

        {/* Vision & Mission Banner */}
        <div className="mt-8 bg-gradient-to-r from-[#070D1B] via-[#0E1A33] to-[#070D1B] border border-amber-500/30 rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-b md:border-b-0 md:border-r border-amber-500/20 pb-4 md:pb-0 md:pr-6">
              <div className="flex items-center gap-2 text-amber-300 font-black text-sm mb-2 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>আমাদের ভিশন (Our Vision)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                প্রবাসী বাংলাদেশিদের ঘামঝরা উপার্জন যেন অনুৎপাদনশীল খাতে নষ্ট না হয়ে দেশের সম্ভাবনাময় অবকাঠামো, রিয়েল এস্টেট ও ব্যবসায় রূপান্তরের মাধ্যমে একটি স্বনির্ভর ও অর্থনৈতিকভাবে সমৃদ্ধ ভবিষ্যৎ সম্প্রদায় তৈরি করা।
              </p>
            </div>

            <div className="md:pl-6">
              <div className="flex items-center gap-2 text-amber-300 font-black text-sm mb-2 uppercase tracking-wider">
                <HeartHandshake className="w-4 h-4 text-amber-400" />
                <span>আমাদের মূল নীতি (Our Core Values)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                "একসাথে আমাদের সমৃদ্ধি (Together We Rise)" — বিশ্বস্ততা, সততা, শতভাগ ইসলামিক ও নিয়মতান্ত্রিক নীতিমালা অনুসরণ এবং সকল সদস্যের সমঅধিকার ও কল্যাণ নিশ্চিত করা।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PRESIDENT'S MESSAGE & PROFILE */}
      <section id="president" className="scroll-mt-24 mb-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-widest mb-3">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>প্রেসিডেন্টের পরিচিতি ও বার্তা • President's Profile</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">
            সম্মানিত প্রেসিডেন্টের বার্তা ও পরিচিতি
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            প্রবাসী বিজনেস ক্লাবের দূরদর্শী দিকনির্দেশনা ও সার্বিক নেতৃত্ব।
          </p>
        </div>

        {/* President Executive Card */}
        <div className="bg-gradient-to-b from-[#0B152A] to-[#070D1B] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            {/* President Avatar / Photo Frame */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-b from-amber-400/30 via-slate-900 to-[#070D1B] p-1.5 border-2 border-amber-400/60 shadow-[0_0_35px_rgba(212,175,55,0.25)] flex items-center justify-center">
                <PBCFramedAvatar
                  photoUrl={leaderPhotoUrl}
                  name={leaderName}
                  designation={leaderDesignation}
                  className="w-full h-full rounded-2xl shadow-inner"
                  showFrame={true}
                />
                <div className="absolute -bottom-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 px-3.5 py-1 rounded-full border-2 border-[#070D1B] shadow-md flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider z-20">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                  <span>Verified</span>
                </div>
              </div>

              <div className="mt-4 text-center">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide">
                  {leaderDesignation}
                </span>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>{leaderLocation}</span>
                </div>
                {leaderMobile && (
                  <div className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center justify-center gap-1">
                    <PhoneCall className="w-3 h-3 text-emerald-400" />
                    <span>{leaderMobile}</span>
                  </div>
                )}
              </div>
            </div>

            {/* President Message & Introduction */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-amber-400">
                <Quote className="w-7 h-7 rotate-180 opacity-80" />
                <span className="text-xs uppercase tracking-widest font-black text-amber-300">
                  প্রেসিডেন্টের বিশেষ বাণী
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white mb-1">
                {leaderName}
              </h3>
              <p className="text-xs text-amber-400/90 font-bold mb-4">
                {leaderDesignation} • Probashi Business Club (PBC)
              </p>

              <blockquote className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3 bg-[#030816]/70 border border-amber-500/20 rounded-2xl p-5 mb-5 shadow-inner">
                <p>
                  "বিসমিল্লাহির রাহমানির রাহিম। বিশ্বের বিভিন্ন প্রান্তে কর্মরত সকল সম্মানিত প্রবাসী বাংলাদেশি ভাই ও রেমিট্যান্স যোদ্ধাদের জানাই আন্তরিক শুভেচ্ছা ও অভিনন্দন।"
                </p>
                <p>
                  "প্রবাসী বিজনেস ক্লাব (PBC) কেবল একটি বাণিজ্যিক প্ল্যাটফর্ম নয়; এটি প্রবাসীদের সম্মিলিত পুঁজি, মেধা ও বিশ্বাসের এক সুদৃঢ় মিলনমেলা। আমাদের প্রধান অঙ্গীকার হলো—শতভাগ সততা ও স্বচ্ছতা নিশ্চিত করে লাভজনক রিয়েল এস্টেট ও যৌথ প্রকল্পের মাধ্যমে ভবিষ্যৎ প্রজন্মের জন্য একটি স্থায়ী, নিশ্চিন্ত অর্থনৈতিক নিরাপত্তা গড়ে তোলা।"
                </p>
                <p className="text-amber-300/90 font-semibold text-xs">
                  "সততা ও জবাবদিহিতাই আমাদের মূল ভিত্তি — একসাথে এগিয়ে যাওয়ার এই অভিযাত্রায় আপনাদের সবাইকে স্বাগত জানাই।"
                </p>
              </blockquote>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>দূরদর্শী নেতৃত্ব ও স্বচ্ছ প্রশাসন</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>প্রবাসী তহবিলের ১০০% নিরাপত্তা</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: STRATEGIC PROJECTS */}
      <section id="projects" className="scroll-mt-24 mb-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-widest mb-3">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>প্রকল্প ও বিনিয়োগ • Projects & Investments</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">
            চলমান ও ভবিষ্যৎ যৌথ প্রকল্পসমূহ
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            সদস্যদের যৌথ অর্থায়নে টেকসই রিয়েল এস্টেট ও লাভজনক ব্যবসায়িক উদ্যোগ।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#070D1B] border border-amber-500/25 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 font-mono font-bold">
                01
              </div>
              <h3 className="text-base font-black text-white mb-2">পিবিসি ড্রিম সিটি ও আবাসন প্রকল্প</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                ঢাকার সন্নিকটে প্রাইম লোকেশনে মেম্বারদের জন্য পরিকল্পিত আধুনিক আবাসিক প্লট ও অ্যাপার্টমেন্ট প্রকল্প।
              </p>
            </div>
            <div className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 w-fit">
              পরিকল্পিত আবাসন
            </div>
          </div>

          <div className="bg-[#070D1B] border border-amber-500/25 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 font-mono font-bold">
                02
              </div>
              <h3 className="text-base font-black text-white mb-2">বাণিজ্যিক ও পাইকারি ব্যবসা বিনিয়োগ</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                মধ্যপ্রাচ্য ও বাংলাদেশের মধ্যে দ্বিপাক্ষিক বাণিজ্য, খাদ্যপণ্য ও সাপ্লাই চেইন সম্প্রসারণে যৌথ উদ্যোগ।
              </p>
            </div>
            <div className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 w-fit">
              যৌথ বাণিজ্য
            </div>
          </div>

          <div className="bg-[#070D1B] border border-amber-500/25 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 font-mono font-bold">
                03
              </div>
              <h3 className="text-base font-black text-white mb-2">সদস্য কল্যাণ ও মিউচুয়াল এইড ফান্ড</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                যেকোনো সম্মানিত সদস্য বা তাঁর পরিবারের অপ্রত্যাশিত সংকটে তাৎক্ষণিক আর্থিক ও পারস্পরিক সহযোগিতার নিশ্চয়তা।
              </p>
            </div>
            <div className="text-[11px] font-bold text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/20 w-fit">
              মেম্বার ওয়েলফেয়ার
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: SMART DIGITAL PLATFORM FEATURES */}
      <section className="mb-16 bg-[#070D1B] border border-amber-500/30 rounded-3xl p-6 sm:p-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>ডিজিটাল ক্লাব পোর্টাল • Smart Features</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            অত্যাধুনিক প্রযুক্তিতে মেম্বারদের জন্য সহজ সেবা
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#030816] border border-slate-800 p-4 rounded-xl text-center">
            <CreditCard className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white mb-1">ডিজিটাল স্মার্ট কার্ড</h4>
            <p className="text-[11px] text-slate-400">বারকোডসহ অফিসিয়াল মেম্বারশিপ কার্ড ও প্রোফাইল ভেরিফিকেশন।</p>
          </div>

          <div className="bg-[#030816] border border-slate-800 p-4 rounded-xl text-center">
            <FileText className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white mb-1">রিয়েল-টাইম রসিদ</h4>
            <p className="text-[11px] text-slate-400">ডিপোজিট জমা ও সাথে সাথে ভেরিফাইড ডিজিটাল রসিদ ডাউনলোড।</p>
          </div>

          <div className="bg-[#030816] border border-slate-800 p-4 rounded-xl text-center">
            <MessageSquare className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white mb-1">২৪/৭ এআই হেল্পডেস্ক</h4>
            <p className="text-[11px] text-slate-400">যেকোনো প্রশ্ন, ব্যালেন্স যাচাই ও তথ্যের তাৎক্ষণিক সমাধান।</p>
          </div>

          <div className="bg-[#030816] border border-slate-800 p-4 rounded-xl text-center">
            <Lock className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white mb-1">ব্যাংক-গ্রেড নিরাপত্তা</h4>
            <p className="text-[11px] text-slate-400">এন্ড-টু-এন্ড সুরক্ষিত ডেটাবেজ ও ক্লাউড অডিট হিস্টোরি।</p>
          </div>
        </div>
      </section>

      {/* SECTION: LOGIN & REGISTRATION AT THE BOTTOM */}
      {loginSectionSlot && (
        <section id="login-section" className="scroll-mt-24 mb-16">
          <div className="text-center mb-6 max-w-md mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
              <LogIn className="w-3.5 h-3.5" />
              <span>মেম্বার ও এডমিন পোর্টাল</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              মেম্বার সাইন ইন ও এক্সেস
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              আপনার মেম্বার আইডি বা ইমেইল দিয়ে লগইন করুন অথবা নতুন সদস্য হিসেবে আবেদন করুন
            </p>
          </div>
          <div id="embedded-login-card" className="w-full max-w-md mx-auto transition-all duration-500 rounded-3xl">
            {loginSectionSlot}
          </div>
        </section>
      )}

      {/* SECTION 5: CONTACT & ACTION FOOTER */}
      <section className="bg-gradient-to-b from-[#0A1226] to-[#040813] border border-amber-500/40 rounded-3xl p-6 sm:p-10 text-center shadow-2xl">
        <PbcLogo variant="gold" className="w-16 h-16 mx-auto mb-3" />
        <h3 className="text-xl sm:text-2xl font-black text-white">
          প্রবাসী বিজনেস ক্লাবে আপনাকে স্বাগতম
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed">
          আপনি কি একজন সম্মানিত সদস্য? পোর্টালের পূর্ণ সেবা পেতে এখনই সাইন ইন করুন অথবা নতুন সদস্য হিসেবে আবেদন করুন।
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onScrollToLogin}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:via-yellow-300 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <LogIn className="w-4 h-4" />
            <span>লগইন ফর্মে যান (Member Sign In)</span>
          </button>

          <a
            href={`https://wa.me/${(systemSettings.adminWhatsApp || "+8801711000000").replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Assalamu Alaikum, I want to know more about Probashi Business Club (PBC).")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 bg-[#070D1B] hover:bg-[#0E1A33] border border-emerald-500/40 text-emerald-400 hover:text-emerald-300 text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>অফিসিয়াল হোয়াটসঅ্যাপ সাপোর্ট</span>
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} <strong className="text-amber-400">প্রবাসী বিজনেস ক্লাব</strong> (Probashi Business Club). সর্বস্বত্ব সংরক্ষিত।
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>probashibusinessclub.com</span>
            <span>•</span>
            <span>Global Expat Community</span>
          </div>
        </div>
      </section>

      {/* MOBILE FLOATING QUICK ACTION PILL */}
      <div className="fixed bottom-4 right-4 z-40 sm:hidden">
        <button
          type="button"
          onClick={onScrollToLogin}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black text-xs rounded-full shadow-[0_4px_25px_rgba(212,175,55,0.45)] border border-amber-300/40 active:scale-95 transition flex items-center gap-1.5"
        >
          <LogIn className="w-3.5 h-3.5 text-slate-950" />
          <span>লগইন করুন ⌄</span>
        </button>
      </div>

    </div>
  );
};
