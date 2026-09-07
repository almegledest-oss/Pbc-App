export interface ClubRuleItem {
  id: string;
  number: string; // e.g. "১.১", "১.২"
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
}

export interface ClubRuleCategory {
  id: string;
  categoryNumber: string; // e.g. "১", "২"
  nameBn: string;
  nameEn: string;
  iconName: string; // lucide icon name reference
  rules: ClubRuleItem[];
}

export const DEFAULT_CLUB_RULES: ClubRuleCategory[] = [
  {
    id: 'cat_membership',
    categoryNumber: '১',
    nameBn: 'সদস্যপদ লাভ ও সাধারণ শর্তাবলী',
    nameEn: 'Membership & Eligibility Rules',
    iconName: 'UserCheck',
    rules: [
      {
        id: 'r_1_1',
        number: '১.১',
        titleBn: 'সদস্যপদ লাভের যোগ্যতা',
        titleEn: 'Eligibility for Membership',
        descriptionBn: '১৮ বছর বা তদূর্ধ্ব যেকোনো প্রবাসী বাংলাদেশি নাগরিক অথবা বৈধ বাংলাদেশি উদ্যোক্তা/পেশাজীবী ক্লাবের সদস্য হতে পারবেন। ক্লাবের মূল লক্ষ্য ও শরিয়াহভিত্তিক হালাল ব্যবসায় বিশ্বাসী হতে হবে।',
        descriptionEn: 'Any non-resident Bangladeshi citizen aged 18+ or legitimate entrepreneur committed to ethical, Shariah-compliant business practices is eligible to apply.'
      },
      {
        id: 'r_1_2',
        number: '১.২',
        titleBn: 'রেজিস্ট্রেশন ও এনআইডি/পাসপোর্ট যাচাইকরণ',
        titleEn: 'Registration & Identity Verification',
        descriptionBn: 'সকল সদস্যকে ক্লাবের নির্ধারিত অ্যাপে সঠিক নাম, এনআইডি বা পাসপোর্ট নম্বর, বৈধ মোবাইল নম্বর এবং স্পষ্ট ছবি প্রদান করতে হবে। তথ্য যাচাই সাপেক্ষে পরিচালনা পর্ষদের অনুমোদনে মেম্বারশিপ সক্রিয় হবে।',
        descriptionEn: 'All applicants must submit valid NID or Passport details, verified phone number, and a clear photo. Membership is activated upon admin board verification.'
      },
      {
        id: 'r_1_3',
        number: '১.৩',
        titleBn: 'মেম্বার আইডি কার্ড ও গোপনীয়তা',
        titleEn: 'Member ID Card & Confidentiality',
        descriptionBn: 'প্রতিটি সক্রিয় সদস্য একটি স্বতন্ত্র ক্লাবে মেম্বার আইডি কার্ড ও নম্বর প্রাপ্ত হবেন। সদস্য নিজ অ্যাকাউন্ট এবং ক্লাবের অভ্যন্তরীণ নীতিমালার গোপনীয়তা রক্ষা করতে বাধ্য থাকবেন।',
        descriptionEn: 'Every verified member receives an official Club ID. Members must maintain the confidentiality of club internal documents and access.'
      }
    ]
  },
  {
    id: 'cat_deposit',
    categoryNumber: '২',
    nameBn: 'মাসিক সঞ্চয় ও ডিপোজিট নীতিমালা',
    nameEn: 'Monthly Deposit & Savings By-Laws',
    iconName: 'Wallet',
    rules: [
      {
        id: 'r_2_1',
        number: '২.১',
        titleBn: 'নিয়মিত মাসিক ডিপোজিট প্রদানের সময়সীমা',
        titleEn: 'Deposit Timeline & Deadlines',
        descriptionBn: 'প্রত্যেক সদস্যকে প্রতি ইংরেজি মাসের ১ থেকে ১০ তারিখের মধ্যে তাঁর নির্ধারিত মাসিক কিস্তি/সঞ্চয় ক্লাবের অফিশিয়াল ব্যাংক বা বিকাশ/নগদ অ্যাকাউন্টে জমা করতে হবে।',
        descriptionEn: 'Every member must deposit their fixed monthly installment between the 1st and 10th of every calendar month via official club channels.'
      },
      {
        id: 'r_2_2',
        number: '২.২',
        titleBn: 'সঠিক ট্রানজেকশন আইডি ও রসিদ আপলোড',
        titleEn: 'Transaction ID & Voucher Upload',
        descriptionBn: 'টাকা পাঠানোর পর অ্যাপে সঠিক ট্রানজেকশন আইডি (TrxID) এবং ব্যাংক স্লিপ/স্ক্রিনশট দিয়ে ডিপোজিট রিকোয়েস্ট সাবমিট করতে হবে। ভাউচার যাচাই শেষে অনুমোদিত হলে তা মেম্বার লেজারে জমা হবে।',
        descriptionEn: 'Submit deposit requests with exact TrxID and receipt/screenshot. Funds are credited to member balance after financial audit approval.'
      },
      {
        id: 'r_2_3',
        number: '২.৩',
        titleBn: 'ধারাবাহিক কিস্তি খেলাপ সংক্রান্ত নিয়ম',
        titleEn: 'Consecutive Installment Default Rules',
        descriptionBn: 'যৌক্তিক কারণ ও পূর্বানুমতি ছাড়া পরপর ৩ মাস কিস্তি বকেয়া পড়লে সদস্যপদ সাময়িকভাবে স্থগিত হতে পারে। পরবর্তীতে পরিচালনা পর্ষদের সাথে আলোচনা করে বকেয়া পরিশোধ সাপেক্ষে পুনরায় সক্রিয় করা যাবে।',
        descriptionEn: 'Defaulting on monthly deposits for 3 consecutive months without prior notice may lead to temporary suspension until dues are settled.'
      }
    ]
  },
  {
    id: 'cat_investment',
    categoryNumber: '৩',
    nameBn: 'বিনিয়োগ, ফান্ড ব্যবস্থাপনা ও প্রকল্প পরিচালনা',
    nameEn: 'Investment & Project Governance',
    iconName: 'Building2',
    rules: [
      {
        id: 'r_3_1',
        number: '৩.১',
        titleBn: 'শুধুমাত্র হালাল ও উৎপাদনশীল খাতে বিনিয়োগ',
        titleEn: '100% Halal & Asset-Backed Investment',
        descriptionBn: 'ক্লাবের সমস্ত যৌথ তহবিল শুধুমাত্র ইসলামি শরিয়াহসম্মত, সুদ ও জুয়ামুক্ত, বাস্তব সম্পদভিত্তিক খাতে (যেমন: রিয়েল এস্টেট, জমি ক্রয়, আবাসন, এগ্রো ফার্মিং বা সেবা) বিনিয়োগ করা হবে।',
        descriptionEn: 'All pooled funds must strictly be invested in ethical, Shariah-compliant, interest-free, asset-backed tangible ventures.'
      },
      {
        id: 'r_3_2',
        number: '৩.২',
        titleBn: 'পরিচালনা পর্ষদের অনুমোদন ও সম্ভাব্যতা যাচাই',
        titleEn: 'Board Feasibility Study & Approvals',
        descriptionBn: 'যেকোনো নতুন প্রকল্প গ্রহণের পূর্বে পূর্ণাঙ্গ সম্ভাব্যতা যাচাই (Feasibility Study) ও পরিচালনা পর্ষদের সাধারণ সংখ্যাগরিষ্ঠতার অনুমোদন গ্রহণ বাধ্যতামূলক।',
        descriptionEn: 'Before undertaking any new venture, thorough feasibility studies and approval by the board of directors are mandatory.'
      },
      {
        id: 'r_3_3',
        number: '৩.৩',
        titleBn: 'স্বচ্ছ হিসাবরক্ষণ ও নিয়মিত রিপোর্ট প্রকাশ',
        titleEn: 'Transparent Financial Audit & Reports',
        descriptionBn: 'প্রতিটি প্রকল্পের আয়-ব্যয়, ভাউচার ও প্রগ্রেস রিপোর্ট নিয়মিত ক্লাবের অ্যাপে আপডেট করা হবে যাতে সব সদস্য নিজ ফোনে কাজের অগ্রগতি পর্যবেক্ষণ করতে পারেন।',
        descriptionEn: 'Income, expenditures, receipts, and construction/project progress reports will be updated regularly in the app for member review.'
      }
    ]
  },
  {
    id: 'cat_profit_loss',
    categoryNumber: '৪',
    nameBn: 'লভ্যাংশ বন্টন ও ব্যবসায়িক ঝুঁকি নীতি',
    nameEn: 'Profit Distribution & Risk Sharing',
    iconName: 'TrendingUp',
    rules: [
      {
        id: 'r_4_1',
        number: '৪.১',
        titleBn: 'মুনাফা বা লভ্যাংশ হিসাবের ভিত্তি',
        titleEn: 'Basis of Profit Calculation',
        descriptionBn: 'প্রকল্প থেকে অর্জিত নিট মুনাফা (Net Profit) সদস্যদের মোট জমাকৃত শেয়ার অনুপাত অনুযায়ী বন্টন করা হবে। বার্ষিক বা ত্রৈমাসিক ভিত্তিতে হিসাব সমাপনী করা হবে।',
        descriptionEn: 'Net profit generated from active projects will be distributed among members strictly proportionate to their total contributed capital shares.'
      },
      {
        id: 'r_4_2',
        number: '৪.২',
        titleBn: 'ব্যবসায়িক লাভ-লোকসান অংশীদারিত্ব',
        titleEn: 'Loss Sharing & Business Risk',
        descriptionBn: 'ব্যবসায় লাভ ও ঝুঁকি উভয়ই বিদ্যমান। প্রাকৃতিক দুর্যোগ বা অনিচ্ছাকৃত ব্যবসায়িক মন্দাজনিত লোকসান হলে শরিয়াহ মুদারাবা/মুশারাকা নীতি অনুযায়ী সকল অংশীদারকে আনুপাতিক হারে বহন করতে হবে।',
        descriptionEn: 'Business inherently entails market risks. Unavoidable losses will be borne proportionately according to partnership capital ratios.'
      },
      {
        id: 'r_4_3',
        number: '৪.৩',
        titleBn: 'রিজার্ভ ফান্ড ও ক্লাবের উন্নয়ন তহবিল',
        titleEn: 'Reserve & Maintenance Fund',
        descriptionBn: 'অর্জিত মোট লভ্যাংশ থেকে একটি নির্দিষ্ট ক্ষুদ্রাংশ (সাধারণত ৩-৫%) জরুরি ব্যবস্থাপনা, ট্যাক্স ও জরুরি রিজার্ভ ফান্ড হিসেবে ক্লাবের ভবিষ্যৎ নিরাপত্তার জন্য সংরক্ষিত থাকবে।',
        descriptionEn: 'A minor percentage (3-5%) of profits may be allocated to an emergency contingency reserve fund for club sustainability.'
      }
    ]
  },
  {
    id: 'cat_exit',
    categoryNumber: '৫',
    nameBn: 'সদস্যপদ প্রত্যাহার, হস্তান্তর ও অর্থ ফেরত',
    nameEn: 'Membership Withdrawal & Refunds',
    iconName: 'LogOut',
    rules: [
      {
        id: 'r_5_1',
        number: '৫.১',
        titleBn: 'সদস্যপদ প্রত্যাহারের নোটিশ প্রদান',
        titleEn: 'Withdrawal Notice Period',
        descriptionBn: 'কোনো সদস্য স্বেচ্ছায় ক্লাব ত্যাগ করতে চাইলে কমপক্ষে ৬০ থেকে ৯০ দিন পূর্বে লিখিত বা অ্যাপের মাধ্যমে পরিচালনা পর্ষদ বরাবরে আবেদন করতে হবে।',
        descriptionEn: 'Any member wishing to voluntarily resign must submit a written notice to the board at least 60 to 90 days in advance.'
      },
      {
        id: 'r_5_2',
        number: '৫.২',
        titleBn: 'আসল সঞ্চিত অর্থ ফেরত প্রক্রিয়া',
        titleEn: 'Capital Refund Procedures',
        descriptionBn: 'চলমান প্রকল্পে অর্থ লগ্নি থাকা সাপেক্ষে ক্লাবের আর্থিক তারল্য বজায় রেখে পরিচালনা পর্ষদ নির্ধারিত কিস্তিতে বা নির্দিষ্ট সময়সীমার মধ্যে সদস্যের সম্পূর্ণ আসল সঞ্চিত অর্থ বুঝিয়ে দেবে।',
        descriptionEn: 'Depending on project liquidity, the invested principal capital will be refunded in structured installments without hurting club operations.'
      },
      {
        id: 'r_5_3',
        number: '৫.৩',
        titleBn: 'সদস্যপদ বা শেয়ার হস্তান্তর (Transfer)',
        titleEn: 'Share Transfer to Nominee or Heir',
        descriptionBn: 'কোনো সদস্য চাইলে পরিচালনা পর্ষদের সম্মতিক্রমে নিজ মনোনীত ব্যক্তি (Nominee) বা অন্য কোনো যোগ্য প্রবাসী সদস্যের নিকট নিজের সদস্যপদ হস্তান্তর করতে পারবেন।',
        descriptionEn: 'A member may transfer their membership and accumulated shares to their designated nominee or another qualified member with board approval.'
      }
    ]
  },
  {
    id: 'cat_discipline',
    categoryNumber: '৬',
    nameBn: 'শৃঙ্খলা, আচরণবিধি ও সদস্যপদ বাতিল',
    nameEn: 'Discipline, Code of Conduct & Termination',
    iconName: 'ShieldAlert',
    rules: [
      {
        id: 'r_6_1',
        number: '৬.১',
        titleBn: 'পারস্পরিক শ্রদ্ধা ও ক্লাবের সুনাম রক্ষা',
        titleEn: 'Mutual Respect & Club Integrity',
        descriptionBn: 'সকল সদস্যকে ক্লাবের অফিশিয়াল গ্রুপ, সামাজিক যোগাযোগ মাধ্যম ও মিটিংয়ে ভদ্র ও গঠনমূলক আচরণ করতে হবে। ক্লাবের ভাবমূর্তি ক্ষুণ্ণকারী কোনো কাজে লিপ্ত হওয়া যাবে না।',
        descriptionEn: 'Members must maintain exemplary conduct in meetings, discussions, and public media. Defamation of the club is strictly prohibited.'
      },
      {
        id: 'r_6_2',
        number: '৬.২',
        titleBn: 'অর্থ আত্মসাৎ ও জালিয়াতির বিরুদ্ধে শূন্য সহনশীলতা',
        titleEn: 'Zero Tolerance for Fraud',
        descriptionBn: 'ভুয়া ভাউচার সাবমিট করা, অর্থ জালিয়াতি করা বা ক্লাবের ফান্ড আত্মসাতের চেষ্টা করলে সদস্যপদ তাৎক্ষণিক বাতিলসহ আইনানুগ ব্যবস্থা গ্রহণ করা হবে।',
        descriptionEn: 'Submitting forged payment slips, fraudulent activity, or misappropriating club assets will result in immediate termination and legal action.'
      },
      {
        id: 'r_6_3',
        number: '৬.৩',
        titleBn: 'নীতিমালা সংশোধন ও পরিচালনা পর্ষদের ক্ষমতা',
        titleEn: 'Amendments to By-Laws',
        descriptionBn: 'ক্লাবের উন্নয়ন ও কল্যাণের স্বার্থে যেকোনো সময় সাধারণ সভার সিদ্ধান্তের ভিত্তিতে পরিচালনা পর্ষদ নীতিমালার যেকোনো ধারা সংযোজন, বিয়োজন বা পরিমার্জন করার অধিকার সংরক্ষণ করে।',
        descriptionEn: 'The executive board reserves the right to amend, update, or revise any clause of these by-laws in consultation with general members.'
      }
    ]
  }
];
