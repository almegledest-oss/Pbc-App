/**
 * PBC Member Email Domain Verification & Typo Correction
 * Restricts sign-ups to trusted, verified mail providers only.
 */

export const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'ymail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'proton.me',
  'protonmail.com',
  'aol.com',
  'pbcclub.org'
] as const;

export const PRIMARY_DOMAIN_CHIPS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com'
] as const;

export const COMMON_DOMAIN_TYPOS: Record<string, string> = {
  // Gmail typos
  'gmil.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmaild.com': 'gmail.com',
  'gmeil.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.cm': 'gmail.com',
  'gmail.cpm': 'gmail.com',
  'gmaik.com': 'gmail.com',
  'gemail.com': 'gmail.com',

  // Yahoo typos
  'yaho.com': 'yahoo.com',
  'yahu.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yaho.co': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  'yahoo.cm': 'yahoo.com',

  // Outlook typos
  'outlok.com': 'outlook.com',
  'outluk.com': 'outlook.com',
  'outloook.com': 'outlook.com',
  'outlook.co': 'outlook.com',
  'outlook.con': 'outlook.com',

  // Hotmail typos
  'hotmial.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'hotamil.com': 'hotmail.com',
  'hotmale.com': 'hotmail.com',
  'hotmail.co': 'hotmail.com',
  'hotmail.con': 'hotmail.com',

  // iCloud typos
  'icloude.com': 'icloud.com',
  'iclud.com': 'icloud.com',
  'icloud.co': 'icloud.com',
  'icloud.con': 'icloud.com'
};

export interface EmailValidationResult {
  valid: boolean;
  domain?: string;
  username?: string;
  normalizedEmail?: string;
  message?: string;
  messageBn?: string;
  suggestion?: string;
}

/**
 * Strictly validates that the email has standard RFC syntax,
 * belongs to an approved trusted domain, and catches common domain typos.
 */
export function validateRestrictedEmail(rawEmail: string): EmailValidationResult {
  const clean = (rawEmail || '').trim().toLowerCase();

  if (!clean) {
    return {
      valid: false,
      message: 'Please enter your email address.',
      messageBn: 'অনুগ্রহ করে আপনার ইমেইল ঠিকানা দিন।'
    };
  }

  // Basic RFC regex
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!regex.test(clean)) {
    return {
      valid: false,
      message: 'Invalid email format (e.g. name@gmail.com).',
      messageBn: 'ইমেইল ফরম্যাট সঠিক নয় (যেমন: name@gmail.com)।'
    };
  }

  const parts = clean.split('@');
  if (parts.length !== 2) {
    return {
      valid: false,
      message: 'Invalid email address structure.',
      messageBn: 'ইমেইল ঠিকানায় সমস্যা রয়েছে।'
    };
  }

  const [username, domain] = parts;

  if (username.length < 2) {
    return {
      valid: false,
      message: 'Email username is too short (at least 2 characters).',
      messageBn: 'ইমেইল ইউজারনেম অত্যন্ত ছোট (কমপক্ষে ২ অক্ষরের হতে হবে)।'
    };
  }

  // Check for common typos
  if (COMMON_DOMAIN_TYPOS[domain]) {
    const correctedDomain = COMMON_DOMAIN_TYPOS[domain];
    const suggestedEmail = `${username}@${correctedDomain}`;
    return {
      valid: false,
      domain,
      username,
      suggestion: suggestedEmail,
      message: `Did you mean @${correctedDomain}?`,
      messageBn: `ডোমেইনের বানান ভুল হয়েছে! আপনি কি @${correctedDomain} দিতে চেয়েছেন?`
    };
  }

  // Check allowed domain list
  const isAllowed = (ALLOWED_EMAIL_DOMAINS as readonly string[]).includes(domain);
  if (!isAllowed) {
    return {
      valid: false,
      domain,
      username,
      message: `Only trusted email providers (${ALLOWED_EMAIL_DOMAINS.map(d => '@' + d).slice(0, 4).join(', ')}, etc.) are accepted.`,
      messageBn: `শুধুমাত্র বিশ্বস্ত ইমেইল সার্ভিস (যেমন: @gmail.com, @yahoo.com, @outlook.com, @hotmail.com, @icloud.com) গ্রহণযোগ্য। অস্তিত্বহীন বা ভুয়া ডোমেইন অনুমোদিত নয়।`
    };
  }

  return {
    valid: true,
    domain,
    username,
    normalizedEmail: `${username}@${domain}`
  };
}
