# প্রবাসী বিজনেস ক্লাব (PBC) - Android Play Store পাবলিশিং গাইডলাইন

আপনার বিদ্যমান ওয়েবসাইট এবং ক্লাউড ডাটাবেজ (Firebase) অক্ষুণ্ণ রেখে গুগল প্লে-স্টোরের জন্য **Android App (.aab)** তৈরি এবং আপলোড করার সম্পূর্ণ গাইড।

---

## পদ্ধতি ১: PWABuilder (গুগল ও মাইক্রোসফটের অফিসিয়াল ২-মিনিটের সমাধান - সবচেয়ে সহজ)

যেহেতু আপনার পোর্টালে ইতোমধ্যে `manifest.json`, স্প্ল্যাশ স্ক্রিন, লোগো এবং `.well-known/assetlinks.json` সেটআপ করে দেওয়া হয়েছে, তাই কোনো কোড বা জটিলতা ছাড়াই আপনি সরাসরি প্লে স্টোরের ফাইল পেতে পারেন:

1. আপনার লাইভ ওয়েবসাইট ইউআরএল কপি করুন (যেমন: `https://app.probashibusinessclub.com` বা আপনার বর্তমান লাইভ লিঙ্ক)।
2. ব্রাউজারে **[PWABuilder.com](https://www.pwabuilder.com)** ওপেন করুন।
3. আপনার ওয়েবসাইটের URL দিয়ে **Start** বাটনে চাপ দিন।
4. পিডব্লিউএ স্কোর ১০০% দেখাবে। এরপর **Package for Stores** বাটনে ক্লিক করুন।
5. **Google Play (Android)** অপশনে গিয়ে **Generate** বাটনে ক্লিক করুন।
6. সেখানে আপনার:
   - **Package ID:** `com.probashibusinessclub.app`
   - **App Name:** `Probashi Business Club`
   - **Signing key:** নতুন কি-স্টোর অটোমেটিক জেনারেট করে দেবে অথবা নিজের কি-স্টোর দিতে পারবেন।
7. **Download** বাটনে ক্লিক করলেই একটি জিপ ফাইল পাবেন যার ভেতরে আপনার **`app-release.aab`** ফাইল এবং ডিজিটাল অ্যাসেট লিংক থাকবে!

---

## পদ্ধতি ২: Capacitor Android CLI দিয়ে সরাসরি বিল্ড করা

আপনি যদি আপনার লোকাল কম্পিউটারে Android Studio দিয়ে নিজের মতো করে বিল্ড করতে চান:

### ১. ডিপেন্ডেন্সি ইনস্টল করুন:
```bash
npm install @capacitor/core @capacitor/android
npm install -D @capacitor/cli
```

### ২. ওয়েব প্রজেক্ট বিল্ড ও সিঙ্ক করুন:
```bash
npm run build
npx cap add android
npx cap sync android
```

### ৩. Android Studio-তে ওপেন করুন:
```bash
npx cap open android
```

### ৪. Play Store Bundle (.aab) তৈরি করুন:
1. Android Studio মেনু থেকে যান: **Build** ➔ **Generate Signed Bundle / APK...**
2. **Android App Bundle (.aab)** সিলেক্ট করুন এবং **Next** চাপুন।
3. **Key store path** তৈরি করুন এবং পাসওয়ার্ড দিন (পাসওয়ার্ড ও ফাইলটি সংরক্ষণ করুন)।
4. Build Variant নির্বাচন করুন: **release**।
5. ফিনিশ চাপলে আপনার ফোল্ডারে `app-release.aab` ফাইল রেডি হয়ে যাবে।

---

## Google Play Console-এ আপলোড ও পাবলিশ করার ধাপ:

1. **Google Play Console**-এ (`play.google.com/console`) লগইন করুন।
2. **Create app** চাপুন:
   - App Name: **প্রবাসী বিজনেস ক্লাব - Probashi Business Club**
   - Default language: **Bengali (Bangladesh)** বা **English (United States)**
   - App or Game: **App**
   - Free or Paid: **Free**
3. **App Content & Data Safety:**
   - **Privacy Policy:** আপনার ক্লাবের প্রাইভেসি পলিসি লিঙ্ক দিন।
   - **App Access:** একটি ডেমো মেম্বার অ্যাকাউন্ট (যেমন: ID `PBC-1001` এবং পাসওয়ার্ড) প্রদান করুন যাতে গুগলের কর্মীরা লগইন করে টেস্ট করতে পারে।
   - **Financial / Community features:** আপনার ক্লাব সম্পর্কে সাধারণ বিবরণ দিন।
4. **App releases ➔ Production (বা Closed Testing):**
   - আপনার ডাউনলোড করা **`app-release.aab`** ফাইলটি আপলোড করুন।
   - রিলিজ নোট লিখুন (যেমন: *Official mobile portal for Probashi Business Club members*)।
   - **Review and roll out to production** চাপুন।
5. গুগলের সাধারণ রিভিউ (সাধারণত ৩-৫ দিন) শেষ হলেই অ্যাপটি বিশ্বব্যাপী প্লে-স্টোরে লাইভ হয়ে যাবে!
