// Cafeteria small-talk — Karkhana AI edition.
//
// An agent's chai break or tiffin break is an excuse for a quick one-liner in character.
// Two kinds of line:
//   • solo  — one quip shown above a single agent at a break spot
//   • pair  — a multi-beat exchange between two agents at the same table
//
// Lines are kept short so they fit the ThoughtBubble (≈MAX_WIDTH). Character
// keys match OfficeCharacterName; anyone without bespoke lines falls back to the
// shared GENERIC pool so the floor never feels empty.

import type { OfficeCharacterName } from './cast';
import { useStore } from '@/store/store';

/** Where an agent is lingering — picks a contextual line pool. */
export type BreakSpot = 'coffee' | 'vending' | 'snack' | 'table';

export type SupportedLang = 'as' | 'hi' | 'bn' | 'ta' | 'te' | 'en';

export function normalizeLang(lang?: string): SupportedLang {
  const l = String(lang || '').toLowerCase();
  if (l === 'hi' || l.includes('hindi') || l.includes('हिंदी')) return 'hi';
  if (l === 'ta' || l.includes('tamil') || l.includes('தமிழ்')) return 'ta';
  if (l === 'te' || l.includes('telugu') || l.includes('తెలుగు')) return 'te';
  if (l === 'bn' || l.includes('bengali') || l.includes('বাংলা')) return 'bn';
  if (l === 'as' || l.includes('assamese') || l.includes('অসমীয়া')) return 'as';
  return 'en';
}

function getActiveLanguage(): string | undefined {
  try {
    return useStore.getState().selectedLanguage;
  } catch {
    return undefined;
  }
}

const pick = <T,>(arr: readonly T[], seed: number): T =>
  arr[((seed % arr.length) + arr.length) % arr.length];

// ─── solo lines, by spot ─────────────────────────────────────────────────────

const SPOT_POOLS: Record<SupportedLang, Record<BreakSpot, readonly string[]>> = {
  en: {
    coffee: [
      'is this… decaf cutting chai?? who did this',
      'bhai, extra adrak in the chai today please',
      'first cutting chai of the day. and the fifth.',
      'the 4 PM chai tapri break is sacred',
      'who took my ceramic tea mug?',
      'filter coffee here hits different',
      'the kettle is boiling! grab your cups',
      'no code review before cutting chai',
    ],
    vending: [
      'vending machine ate my 20 rupee note',
      'B4… please let it be Kurkure',
      'samosa is stuck in the slot. classic.',
      'shaking it gently… respectful tech touch',
      'one (1) emotional-support Bhujia packet',
      'A1 again. Haldiram’s living dangerously.',
      'out of banana chips? disaster.',
    ],
    snack: [
      'is it Samosa Tuesday?',
      'who finished the South Indian chips??',
      'just a little Mathri break',
      'tiffin boxes are open, share the Parathas!',
      'post-lunch biryani coma setting in…',
      'home-cooked snack hits the spot',
    ],
    table: [
      'big deployment day. lots of PRs.',
      'just five minutes of chai break',
      'pretending to read sprint retrospective notes',
      'I needed this break honestly',
      'do NOT tell Nitya I’m taking an extended break',
      'Bangalore traffic took 2 hours today...',
    ],
  },
  hi: {
    coffee: [
      'क्या यह डिकैफ़ कटिंग चाय है?? किसने किया यह',
      'भाई, आज चाय में एक्स्ट्रा अदरक डालना प्लीज',
      'दिन की पहली कटिंग चाय... और पाँचवीं भी।',
      'शाम 4 बजे का चाय ब्रेक पवित्र है',
      'मेरा चाय का कप किसने लिया?',
      'यहाँ की फ़िल्टर कॉफ़ी का मज़ा ही अलग है',
      'केतली उबल रही है! अपने कप लाओ',
      'कटिंग चाय से पहले कोई कोड रिव्यू नहीं',
    ],
    vending: [
      'वेंडिंग मशीन मेरा 20 रुपये का नोट खा गई',
      'B4... भगवान करे कुरकुरे निकले',
      'समोसा स्लॉट में फँस गया। क्लासिक।',
      'मशीन को हिलाकर ठीक करना... टेक टच!',
      'एक भुजिया पैकेट सहारा देने के लिए',
      'हल्दीराम का पैकेट आ गया!',
      'केले के चिप्स खत्म? भयानक हादसा!',
    ],
    snack: [
      'क्या आज समोसा मंगलवार है?',
      'साउथ इंडियन चिप्स किसने खत्म किए??',
      'बस एक छोटा सा मठरी ब्रेक',
      'टिफ़िन खुल गए हैं, पराठे शेयर करो!',
      'लंच के बाद बिरयानी कोमा शुरू...',
      'घर का बना नाश्ता सबसे बढ़िया है',
    ],
    table: [
      'आज बड़ा डिप्लॉयमेंट का दिन है। बहुत सारे PRs।',
      'बस पाँच मिनट का चाय ब्रेक',
      'स्प्रिंट नोट्स पढ़ने का नाटक कर रहा हूँ',
      'मुझे सच में इस ब्रेक की ज़रूरत थी',
      'नित्या को मत बताना कि मैं लंबा ब्रेक ले रहा हूँ',
      'आज बैंगलोर ट्रैफ़िक में 2 घंटे लग गए...',
    ],
  },
  bn: {
    coffee: [
      'এটা কি... ডিক্যাফ কাটিং চা?? কে করলো এটা',
      'ভাই, আজকের চায়ে একটু বেশি আদা দিও',
      'দিনের প্রথম কাটিং চা... এবং পঞ্চমও।',
      'বিকাল ৪টার চা বিরতি পবিত্র',
      'আমার চায়ের কাপটা কে নিল?',
      'এখানের ফিল্টার কফি সত্যিই দারুণ',
      'কেটলি ফুটছে! সবাই কাপ নাও',
      'কাটিং চায়ের আগে কোনো কোড রিভিউ নয়',
    ],
    vending: [
      'ভেন্ডিং মেশিন আমার ২০ টাকার নোট খেয়ে ফেলল',
      'B4... প্লিজ কুরকুরে হোক',
      'সামোসা স্লটে আটকে গেছে। ক্লাসিক।',
      'মেশিনটাকে হালকা নাড়া দেওয়া... টেকনিক্যাল টাচ',
      'এক প্যাকেট ভুজিয়া ইমোশনাল সাপোর্ট',
      'হলদিরামের প্যাকেট এসে গেছে!',
      'কলা চিপস শেষ? চরম বিপর্যয়!',
    ],
    snack: [
      'আজ কি সিঙাড়া মঙ্গলবার?',
      'সাউথ ইন্ডিয়ান চিপস কে শেষ করল??',
      'একটু মঠরী ব্রেক নিচ্ছি',
      'টিফিন বক্স খুলেছে, পরোটা শেয়ার করো!',
      'দুপুরের বিরিয়ানি কোমা শুরু হচ্ছে...',
      'ঘরের তৈরি জলখাবারই সেরা',
    ],
    table: [
      'আজ বড় ডিপ্লয়মেন্টের দিন। প্রচুর PRs।',
      'মাত্র পাঁচ মিনিটের চা বিরতি',
      'স্প্রিন্ট নোটস পড়ার ভান করছি',
      'সত্যি বলতে এই ব্রেকটা খুব দরকার ছিল',
      'নিত্যাকে বলো না যে আমি লম্বা ব্রেক নিচ্ছি',
      'আজ ব্যাঙ্গালোর ট্র্যাফিকে ২ ঘণ্টা লাগল...',
    ],
  },
  as: {
    coffee: [
      'এইটো কি... ডিকাফ কাটিং চাহ?? কোনে কৰিলে এইটো',
      'ভাই, আজি চাহত অলপ বেছি আদা দিবা',
      'দিনটোৰ প্ৰথম কাটিং চাহ... আৰু পঞ্চমটোও।',
      'বিয়লি ৪ টাৰ চাহৰ ব্ৰেক পবিত্ৰ',
      'মোৰ চাহৰ কাপটো কোনে নিলে?',
      'ইয়াৰ ফিল্টাৰ কফি সঁচাকৈয়ে সুকীয়া',
      'কেটলি উতলিছে! সকলোৱে কাপ লোৱা',
      'কাটিং চাহৰ আগতে কোনো ক\'ড ৰিভিউ নাই',
    ],
    vending: [
      'ভেণ্ডিং মেচিনে মোৰ ২০ টকাৰ নোটটো খালে',
      'B4... অনুগ্ৰহ কৰি কুৰকুৰে হওক',
      'চামোচা স্লটত আৱদ্ধ হৈ পৰিল। ক্লাছিক।',
      'মেচিনটো লাহেকৈ জোকাৰি দিয়া... টেকনিকেল টাচ!',
      'এক প্যাকেট ভুজিয়া মনৰ শান্তিৰ বাবে',
      'হলদিৰামৰ প্যাকেট আহি পালে!',
      'কলৰ চিপছ শেষ? ডাঙৰ বিপত্তি!',
    ],
    snack: [
      'আজি চামোচা মঙ্গলবাৰ নেকি?',
      'চাউথ ইণ্ডিয়ান চিপছ কোনে শেষ কৰিলে??',
      'অলপ মঠৰী ব্ৰেক লৈছোঁ',
      'টিফিন বক্স খুলিছে, পৰঠা শ্বেয়াৰ কৰা!',
      'দুপৰীয়াৰ বিৰিয়ানী কোমা আৰম্ভ হৈছে...',
      'ঘৰৰ বনোৱা জলপানেই শ্ৰেষ্ঠ',
    ],
    table: [
      'আজি ডাঙৰ ডিপ্লয়মেন্টৰ দিন। বহুতো PRs।',
      'কেৱল পাঁচ মিনিটৰ চাহৰ ব্ৰেক',
      'স্প্ৰিন্ট নোট পঢ়াৰ ভান কৰিছোঁ',
      'সঁচাকৈয়ে এই ব্ৰেকটোৰ প্ৰয়োজন আছিল',
      'নিত্যাক নকবা যে মই দীঘলীয়া ব্ৰেক লৈছোঁ',
      'আজি বাংগালুৰু ট্ৰেফিকত ২ ঘণ্টা লাগিল...',
    ],
  },
  ta: {
    coffee: [
      'இது என்ன... டிகேஃப் கட்டிங் டீயா?? யாரு செஞ்சது',
      'பாய், இன்னைக்கு டீல கொஞ்சம் எக்ஸ்ட்ரா இஞ்சி போடுங்க',
      'நாளின் முதல் கட்டிங் டீ... அப்புறம் அஞ்சாவது டீ.',
      'சாயங்காலம் 4 மணி டீ பிரேக் புனிதமானது',
      'என் டீ கப்பை யாரு எடுத்தது?',
      'இங்க பில்டர் காபி வேற லெவல்',
      'டீ கொதிக்குது! எல்லாரும் கப் எடுங்க',
      'கட்டிங் டீ குடிக்காம கோட் ரிவ்யூ இல்லை',
    ],
    vending: [
      'வெண்டிங் மெஷின் என் 20 ரூபாய் நோட்டை முழுங்கிடுச்சு',
      'B4... குருகுரே கிடைச்சா நல்லா இருக்கும்',
      'சமோசா ஸ்லாட்ல மாட்டிக்கிச்சு. கிளாசிக்.',
      'மெஷினை லேசா தட்டுறது... டெக்னிகல் டச்!',
      'ஒரு பாக்கெட் புஜியா மன அமைதிக்கு',
      'ஹல்திராம்ஸ் பாக்கெட் வந்துடுச்சு!',
      'வாழைப்பழ சிப்ஸ் தீர்ந்துடுச்சா? பெரிய பேரழிவு!',
    ],
    snack: [
      'இன்னைக்கு சமோசா செவ்வாய்க்கிழமையா?',
      'சவுத் இந்தியன் சிப்ஸை யாரு காலி பண்ணினது??',
      'சின்னதா ஒரு மட்ரி பிரேக்',
      'டிபன் பாக்ஸ் திறந்தாச்சு, பரோட்டா ஷேர் பண்ணுங்க!',
      'மதிய பிரியாணிக்கு அப்புறம் தூக்கம் வருது...',
      'வீட்டு சாப்பாடு தான் கெத்து',
    ],
    table: [
      'இன்னைக்கு பெரிய டிப்ளாய்மென்ட் நாள். நிறைய PRs.',
      'அஞ்சு நிமிஷம் டீ பிரேக் தான்',
      'ஸ்பிரின்ட் நோட்ஸ் படிக்கிற மாதிரி நடிக்கிறேன்',
      'எனக்கு இந்த பிரேக் உண்மையாவே தேவைப்பட்டுச்சு',
      'நித்யா கிட்ட நான் நீளமான பிரேக் எடுத்தேன்னு சொல்லாதீங்க',
      'இன்னைக்கு பெங்களூர் ட்ராஃபிக்ல 2 மணி நேரம் ஆச்சு...',
    ],
  },
  te: {
    coffee: [
      'ఇది... డికాఫ్ కటింగ్ ఛాయా?? ఎవరు చేశారు ఇది',
      'భాయ్, ఈరోజు ఛాయ్ లో కొంచెం ఎక్స్ట్రా అల్లం వేయండి',
      'రోజులో మొదటి కటింగ్ ఛాయ్... మరియు ఐదవది కూడా.',
      'సాంత్రం 4 గంటల ఛాయ్ బ్రేక్ పవిత్రమైనది',
      'నా టీ కప్పు ఎవరు తీసుకున్నారు?',
      'ఇక్కడ ఫిల్టర్ కాఫీ వేరే లెవెల్',
      'కేటిల్ మరుగుతోంది! అందరూ కప్పులు తీసుకోండి',
      'కటింగ్ ఛాయ్ తాగకుండా కోడ్ రివ్యూ లేదు',
    ],
    vending: [
      'వెండింగ్ మెషిన్ నా 20 రూపాయల నోటు తినేసింది',
      'B4... దయచేసి కుర్కురే అవ్వాలి',
      'సమోసా స్లాట్ లో ఇరుక్కుపోయింది. క్లాసిక్.',
      'మెషిన్ ని నిదానంగా ఊపడం... టెక్నికల్ టచ్!',
      'ఒక భుజియా ప్యాకెట్ మానసిక ప్రశాంతతకు',
      'హల్దీరామ్స్ ప్యాకెట్ వచ్చేసింది!',
      'అరటికాయ చిప్స్ అయిపోయాయా? పెద్ద విపత్తు!',
    ],
    snack: [
      'ఈరోజు సమోసా మంగళవారమా?',
      'సౌత్ ఇండియన్ చిప్స్ ఎవరు ఖాళీ చేశారు??',
      'చిన్న మఠరీ బ్రేక్ తీసుకుంటున్నాను',
      'టిఫిన్ బాక్స్ లు తెరిచారు, పరోటా షేర్ చేయండి!',
      'మధ్యాహ్నం బిరియానీ తిన్నాక నిద్ర వస్తోంది...',
      'ఇంటి వంటకాలే బెస్ట్',
    ],
    table: [
      'ఈరోజు పెద్ద డిప్లాయ్మెంట్ రోజు. చాలా PRs.',
      'కేవలం ఐదు నిమిషాల ఛాయ్ బ్రేక్',
      'స్ప్రింట్ నోట్స్ చదువుతున్నట్లు నటిస్తున్నాను',
      'నాకు ఈ బ్రేక్ నిజంగా అవసరం',
      'నేను పెద్ద బ్రేక్ తీసుకున్నానని నిత్యకు చెప్పకండి',
      'ఈరోజు బెంగళూరు ట్రాఫిక్ లో 2 గంటలు పట్టింది...',
    ],
  },
};

// ─── character flavour — overrides generic pool when present ─────────────────

const BY_CHARACTER_EN: Partial<Record<OfficeCharacterName, readonly string[]>> = {
  nitya:   ['I DECLARE… PRODUCTION DEPLOYMENT!', 'that’s what the PR said', 'no meetings before chai. that’s the rule.', 'we are scaling to 10M DAU!'],
  devi:    ['FALSE.', 'pushing to main without test coverage is a crime', 'that PR adheres to security compliance', 'Schrute Tech Hub had better chai'],
  vikram:  ['bears. beets. Bangalore traffic.', 'I moved Devi’s mechanical keyboard again', 'just here for cutting chai & gossip', 'did you push to main without review?'],
  kavi:    ['Karkhana AI, this is Kavi', 'sketching the UI wireframes', 'documentation is 80% of product quality'],
  rudra:   ['system SRE status: 99.999% uptime', 'who dropped the staging database?', 'kubernetes cluster is self-healing'],
  ananya:  ['did you see the new Tailwind design system?', 'making the UI pop!', 'glassmorphism component is ready'],
  arjun:   ['fine-tuning the LLM model on VRAM', 'neural net loss curve looking smooth', 'more GPU memory please'],
  priya:   ['README is updated with deployment steps', 'checking API docs formatting', 'tech writing requires hot chai'],
  sanjay:  ['is it Chai Day yet?', 'sysadmin server reboot done. leave me be.', 'I will retire before legacy migration finishes'],
  aarav:   ['I should file a bug ticket for that…', 'automation test suite is 100% green', 'no one ever sits with compliance'],

  dwight:   ['FALSE.', 'identity theft is not a joke', 'that mug is regulation'],
  jim:      ["...that's what she said", 'bears. beets. Battlestar Galactica.'],
  pam:      ['Dunder Mifflin, this is Pam', 'sketching the vending machine'],
  kevin:    ['the chili is NOT ready', 'why waste time say lot word'],
  angela:   ['this break room is filthy', 'party planning committee, 3pm'],
  oscar:    ['actually, it’s “espresso”', 'well, actually…'],
  stanley:  ['is it Pretzel Day?', 'did I stutter?'],
  phyllis:  ['knitting and a nice cup of tea'],
  andy:     ['rit-dit-dit, coffee break!'],
  kelly:    ['did you HEAR what happened??'],
  ryan:     ['the temp needs caffeine'],
  toby:     ['I should write that up…'],
  meredith: ['is it 5 o’clock yet?'],
};

const BY_CHARACTER_HI: Partial<Record<OfficeCharacterName, readonly string[]>> = {
  nitya:   ['मैं घोषित करता हूँ... प्रोडक्शन डिप्लॉयमेंट!', 'PR में यही लिखा था', 'चाय से पहले कोई मीटिंग नहीं।', 'हम 10M DAU तक स्केल कर रहे हैं!'],
  devi:    ['गलत!', 'बिना टेस्ट कवरेज के मेन में पुश करना अपराध है', 'वह PR सुरक्षा नियमों का पालन करता है', 'स्कूट टेक हब में बेहतर चाय थी'],
  vikram:  ['भालू। चुकंदर। बैंगलोर ट्रैफ़िक।', 'मैंने देवी का कीबोर्ड फिर से छिपा दिया', 'मैं बस कटिंग चाय और गपशप के लिए यहाँ हूँ', 'क्या तुमने बिना रिव्यू के पुश किया?'],
  kavi:    ['कारखाना AI, मैं कवि हूँ', 'UI वायरफ्रेम बना रहा हूँ', 'डॉक्यूमेंटेशन प्रोडक्ट का 80% है'],
  rudra:   ['सिस्टम SRE स्टेटस: 99.999% अपटाइम', 'स्टेजिंग डेटाबेस किसने ड्रॉप किया?', 'कुबेरनेट्स क्लस्टर खुद ठीक हो रहा है'],
  ananya:  ['क्या तुमने नया टेलविंड डिजाइन सिस्टम देखा?', 'UI को शानदार बना रही हूँ!', 'ग्लासमॉर्फिज्म कंपोनेंट तैयार है'],
  arjun:   ['VRAM पर LLM मॉडल फाइन-ट्यून कर रहा हूँ', 'न्यूरल नेट लॉस कर्व बहुत स्मूथ है', 'और GPU मेमोरी चाहिए'],
  priya:   ['README अपडेट हो गया है', 'API डॉक्यूमेंट्स चेक कर रही हूँ', 'टेक राइटिंग के लिए गर्म चाय चाहिए'],
  sanjay:  ['क्या आज चाय दिवस है?', 'सिसाडमिन सर्वर रीबूट हो गया।', 'लेगेसी माइग्रेशन खत्म होने से पहले मैं रिटायर हो जाऊँगा'],
  aarav:   ['मुझे इसके लिए बग टिकट फ़ाइल करना चाहिए...', 'ऑटोमेशन टेस्ट सूट 100% ग्रीन है', 'अनुपालन टीम के साथ कोई नहीं बैठता'],
};

const BY_CHARACTER_BN: Partial<Record<OfficeCharacterName, readonly string[]>> = {
  nitya:   ['আমি ঘোষণা করছি... প্রোডাকশন ডিপ্লয়মেন্ট!', 'PR-এ এটাই লেখা ছিল', 'চায়ের আগে কোনো মিটিং নয়।', 'আমরা ১০M DAU স্কেল করছি!'],
  devi:    ['ভুল!', 'টেস্ট কভারেজ ছাড়া মেইনে পুশ করা অপরাধ', 'ওই PR সিকিউরিটি মেনে চলে', 'স্ক্রুট টেক হাবের চা আরও ভালো ছিল'],
  vikram:  ['ভালুক। বিট। ব্যাঙ্গালোর ট্র্যাফিক।', 'আমি আবার দেবীর কিবোর্ড লুকিয়েছি', 'আমি শুধু চা আর গল্প করার জন্য আছি', 'রিভিউ ছাড়া পুশ করলে নাকি?'],
  kavi:    ['কারখানা AI, আমি কবি', 'UI ওয়্যারফ্রেম আঁকছি', 'ডকুমেন্টেশন প্রোডাক্টের ৮০%'],
  rudra:   ['সিস্টেম SRE স্ট্যাটাস: ৯৯.৯৯৯% আপটাইম', 'স্টেজিং ডাটাবেস কে ড্রপ করল?', 'কুবারেটিস ক্লাস্টার নিজে ঠিক হচ্ছে'],
  ananya:  ['নতুন টেলউইন্ড ডিজাইন সিস্টেম দেখেছ?', 'UI টা দারুণ বানাচ্ছি!', 'গ্লাসমর্ফিজম কম্পোনেন্ট রেডি'],
  arjun:   ['VRAM-এ LLM মডেল ফাইন-টিউন করছি', 'নিউরাল নেট লস কার্ভ বেশ স্মুথ', 'আরও GPU মেমোরি চাই'],
  priya:   ['README আপডেট হয়ে গেছে', 'API ডকুমেন্টস চেক করছি', 'টেক রাইটিংয়ের জন্য গরম চা চাই'],
  sanjay:  ['আজ কি চা দিবস?', 'সার্ভার রিবুট শেষ।', 'লেগাসি মাইগ্রেশন শেষ হওয়ার আগেই আমি অবসর নেব'],
  aarav:   ['এটার জন্য বাগ টিকিট ফাইল করা উচিত...', 'অটোমেশন টেস্ট স্যুট ১০০% গ্রিন', 'কমপ্লায়েন্সের সাথে কেউ বসে না'],
};

const BY_CHARACTER_AS: Partial<Record<OfficeCharacterName, readonly string[]>> = {
  nitya:   ['মই ঘোষণা কৰিছোঁ... প্ৰডাকচন ডিপ্লয়মেন্ট!', 'PR-ত এইটোৱেই লিখা আছিল', 'চাহৰ আগতে কোনো মিটিং নাই।', 'আমি ১০M DAU লৈ স্কেল কৰিছোঁ!'],
  devi:    ['ভুল!', 'টেষ্ট কভাৰেজ নোহোৱাকৈ মেইনত পুছ কৰাটো অপৰাধ', 'সেই PR-টো সুৰক্ষা নিয়ম মানি চলে', 'স্ক্ৰুট টেক হাবত ভাল চাহ আছিল'],
  vikram:  ['ভালুক। বিট। বাংগালুৰু ট্ৰেফিক।', 'মই আকৌ দেৱীৰ কিবৰ্ড লুকুৱাই থলোঁ', 'মই কেৱল চাহ আৰু কথা পাতিবলৈ ইয়াত আছোঁ', 'ৰিভিউ নোহোৱাকৈ পুছ কৰিলা নেকি?'],
  kavi:    ['কাৰখানা AI, মই কবি', 'UI ৱায়াৰফ্ৰেম আঁকি আছোঁ', 'ডকুমেন্তেশন প্ৰডাক্টৰ ৮০%'],
  rudra:   ['চিষ্টেম SRE স্থিতি: ৯৯.৯৯৯% আপটাইম', 'ষ্টেজিং ডাটাবেচ কোনে ড্ৰপ কৰিলে?', 'কুবাৰনেটিছ ক্লাষ্টাৰ নিজে ঠিক হৈছে'],
  ananya:  ['নতুন টেলউইণ্ড ডিজাইন চিষ্টেম দেখিলা?', 'UI টো ধুনীয়া কৰিছোঁ!', 'গ্লাচমৰ্ফিজম কম্পোনেণ্ট ৰেডি'],
  arjun:   ['VRAM-ত LLM মডেল ফাইন-টিউন কৰি আছোঁ', 'নিউৰেল নেট লছ কাৰ্ভ বহুত স্মুথ', 'আৰু GPU মেমৰি লাগে'],
  priya:   ['README আপডেট হৈ গৈছে', 'API ডক্যুমেন্ট চেক কৰি আছোঁ', 'টেক ৰাইটিংৰ বাবে গৰম চাহ লাগে'],
  sanjay:  ['আজি চাহ দিৱস নেকি?', 'চাৰ্ভাৰ ৰিবুট শেষ।', 'লেগেচী মাইগ্ৰেচন শেষ হোৱাৰ আগতেই মই অৱসৰ ল’ম'],
  aarav:   ['ইয়াৰ বাবে এটা বাগ টিকট ফাইল কৰা উচিত...', 'অটোমেচন টেষ্ট চুইট ১০০% গ্ৰীন', 'কমপ্লায়েন্সৰ সৈতে কোনো নবহে'],
};

const BY_CHARACTER_TA: Partial<Record<OfficeCharacterName, readonly string[]>> = {
  nitya:   ['நான் அறிவிக்கிறேன்... புரொடக்ஷன் டிப்ளாய்மென்ட்!', 'PR-ல அதான் சொல்லியிருந்தது', 'டீ குடிக்காம மீட்டிங் இல்லை.', 'நாம் 10M DAU வரை ஸ்கேல் செய்கிறோம்!'],
  devi:    ['தவறு!', 'டெஸ்ட் கவரேஜ் இல்லாம மெயின்ல புஷ் பண்றது குற்றம்', 'அந்த PR பாதுகாப்பு விதிகளை பின்பற்றுது', 'ஸ்க்ரூட் டெக் ஹப்ல நல்ல டீ இருந்தது'],
  vikram:  ['கரடி. பீட்ரூட். பெங்களூர் ட்ராஃபிக்.', 'நான் மறுபடியும் தேவியோட கீபோர்டை ஒளிச்சு வச்சிட்டேன்', 'நான் டீ குடிக்கவும் காசிப் பேசவும் தான் வந்தேன்', 'ரிவ்யூ இல்லாம புஷ் பண்ணிட்டியா?'],
  kavi:    ['கார்கானா AI, நான் கவி', 'UI வயர்ஃப்ரேம் வரையறேன்', 'டாக்குமென்டேஷன் தான் 80% Product'],
  rudra:   ['சிஸ்டம் SRE ஸ்டேட்டஸ்: 99.999% அப்டைம்', 'ஸ்டேஜிங் டேட்டாபேஸை யாரு டிராப் பண்ணினது?', 'குபெர்னட்டீஸ் கிளஸ்டர் தானா சரியாகுது'],
  ananya:  ['புதிய டெயில்விண்ட் டிசைன் சிஸ்டம் பார்த்தியா?', 'UI கெத்தா மாத்துறேன்!', 'கிளாஸ்மார்ஃபிசம் காம்பொனென்ட் ரெடி'],
  arjun:   ['VRAM-ல LLM மாடலை ஃபைன்-டியூன் பண்றேன்', 'நியூரல் நெட் லாஸ் கர்வ் சூப்பரா இருக்கு', 'இன்னும் அதிக GPU மெமரி வேணும்'],
  priya:   ['README அப்டேட் ஆயிடுச்சு', 'API டாக்குமெண்ட்ஸ் செக் பண்றேன்', 'டெக் ரைட்டிங்குக்கு சூடான டீ வேணும்'],
  sanjay:  ['இன்னைக்கு டீ தினமா?', 'சர்வர் ரீபூட் முடிஞ்சது.', 'லெகசி மைக்ரேஷன் முடியறதுக்குள்ள நான் ரிட்டையர் ஆயிடுவேன்'],
  aarav:   ['இதுக்கு ஒரு பக் டிக்கெட் ஃபைல் பண்ணனும்...', 'ஆட்டோமேஷன் டெஸ்ட் சூட் 100% கிரீன்', 'காம்பிளையன்ஸ் கூட யாரும் உட்கார மாட்டாங்க'],
};

const BY_CHARACTER_TE: Partial<Record<OfficeCharacterName, readonly string[]>> = {
  nitya:   ['నేను ప్రకటిస్తున్నాను... ప్రొడక్షన్ డిప్లాయ్మెంట్!', 'PR లో అదే రాసి ఉంది', 'ఛాయ్ తాగకుండా మీటింగ్ లేదు.', 'మేము 10M DAU కి స్కేల్ చేస్తున్నాము!'],
  devi:    ['తప్పు!', 'టెస్ట్ కవరేజ్ లేకుండా మెయిన్ కి పుష్ చేయడం నేరం', 'ఆ PR సెక్యూరిటీ నిబంధనలను పాటిస్తుంది', 'స్క్రూట్ టెక్ హబ్ లో మంచి ఛాయ్ ఉండేది'],
  vikram:  ['ఎలుగుబంటి. బీట్రూట్. బెంగళూరు ట్రాఫిక్.', 'నేను మళ్ళీ దేవి కీబోర్డ్ దాచిపెట్టాను', 'నేను ఛాయ్ తాగడానికి, కబుర్లు చెప్పడానికే వచ్చాను', 'రివ్యూ లేకుండా పుష్ చేశావా?'],
  kavi:    ['కార్ఖానా AI, నేను కవి', 'UI వైర్ఫ్రేమ్ వేస్తున్నాను', 'డాక్యుమెంటేషన్ ప్రొడక్ట్ లో 80%'],
  rudra:   ['సిస్టమ్ SRE స్టేటస్: 99.999% అప్టైమ్', 'స్టేజింగ్ డేటాబేస్ ఎవరు డ్రాప్ చేశారు?', 'కుబెర్నెటీస్ క్లస్టర్ స్వయంగా బాగుపడుతోంది'],
  ananya:  ['కొత్త టెయిల్విండ్ డిజైన్ సిస్టమ్ చూశారా?', 'UI ని అద్భుతంగా చేస్తున్నాను!', 'గ్లాస్మార్ఫిజం కాంపోనెంట్ రెడీ'],
  arjun:   ['VRAM పై LLM మోడల్ ఫైన్-ట్యూన్ చేస్తున్నాను', 'న్యూరల్ నెట్ లాస్ కర్వ్ బాగుంది', 'ఇంకా ఎక్కువ GPU మెమరీ కావాలి'],
  priya:   ['README అప్డేట్ అయింది', 'API డాక్యుమెంట్స్ చెక్ చేస్తున్నాను', 'టెక్ రైటింగ్ కి వేడి ఛాయ్ కావాలి'],
  sanjay:  ['ఈరోజు ఛాయ్ దినోత్సవమా?', 'సర్వర్ రీబూట్ పూర్తయింది.', 'లెగసీ మైగ్రేషన్ పూర్తయ్యేలోపు నేను రిటైర్ అయిపోతాను'],
  aarav:   ['దీనికి ఒక బగ్ టికెట్ ఫైల్ చేయాలి...', 'ఆటోమేషన్ టెస్ట్ సూట్ 100% గ్రీన్', 'కంప్లయన్స్తో ఎవరూ కూర్చోరు'],
};

const LOCALIZED_BY_CHARACTER: Record<SupportedLang, Partial<Record<OfficeCharacterName, readonly string[]>>> = {
  en: BY_CHARACTER_EN,
  hi: BY_CHARACTER_HI,
  bn: BY_CHARACTER_BN,
  as: BY_CHARACTER_AS,
  ta: BY_CHARACTER_TA,
  te: BY_CHARACTER_TE,
};

/** A solo break-room line. Character flavour ~60% of the time, else the line
 *  fits the spot the agent is standing at. `seed` keeps it deterministic per
 *  call site. */
export function pickSoloLine(character: OfficeCharacterName, spot: BreakSpot, seed: number, lang?: string): string {
  const activeLang = normalizeLang(lang || getActiveLanguage());
  const charPools = LOCALIZED_BY_CHARACTER[activeLang] || LOCALIZED_BY_CHARACTER.en;
  const spotPools = SPOT_POOLS[activeLang] || SPOT_POOLS.en;

  const flavour = charPools[character] || LOCALIZED_BY_CHARACTER.en[character];
  if (flavour && seed % 5 < 3) return pick(flavour, Math.floor(seed / 5));
  return pick(spotPools[spot] || SPOT_POOLS.en[spot], seed);
}

// ─── paired exchanges (two agents at one table) ──────────────────────────────

type Exchange = readonly string[];

const EXCHANGES_EN: readonly Exchange[] = [
  ['world’s best CTO.', 'you are. I had the mug custom printed.', 'and I cherish it.'],
  ['would an amateur push to main?', '...if yes, I don’t.', 'that’s my tech lead.'],
  ['question. how many microservices?', 'one.', 'that’s a monolith.'],
  ['fact: Bangalore traffic builds character.', 'and delays standup.', 'precisely.'],
  ['what’s the staging server smell like?', 'victory. and burnt filter coffee.'],
  ['is a samosa a sandwich?', 'it is a savory pastry.', 'close enough.'],
  ['standup ran 45 minutes.', 'could’ve been a 2-line Slack message.'],
  ['is the build green yet?', '...don’t look at CI right now.'],
  ['who reply-all’d the engineering team?', 'we don’t talk about it.'],
  ['I wrapped your mouse in Jello.', 'I’ll eat around it.', 'fair.'],
  ['bhai, cutting chai ready hai!', 'coming right now, save a samosa.'],
  ['post-lunch biryani coma?', '100%. cannot read code now.'],
  ['did you push without running tests?', 'CI will catch it.', 'CI is failing.'],
  ['who took the last samosa?', 'Devi.', 'never mind then.'],
  ['deploying to production on Friday?', 'living dangerously.', 'always.'],
  ['did you read the PR description?', 'no.', 'me neither.'],
];

const TWSS_EXCHANGES: readonly Exchange[] = [
  ['taking way longer than I expected.', 'that’s what the tech lead said.'],
  ['it’s too big, can’t fit it in memory.', 'that’s what the SRE said.'],
  ['you really need to slow down.', 'that’s what compliance said.'],
  ['gonna need a bigger cluster.', 'that’s what DevOps said.'],
  ['I can’t do this all night.', 'that’s what the reviewer said.'],
  ['it’s not that hard if you just push.', 'that’s what git said.'],
  ['hours in and barely halfway done.', 'that’s what the sprint said.'],
  ['surprisingly heavy for its size.', 'that’s what the bundle said.'],
];

const EXCHANGES_HI: readonly Exchange[] = [
  ['दुनिया का सबसे अच्छा CTO।', 'आप ही हैं। मैंने कप प्रिंट करवाया था।', 'और मैं इसकी कद्र करता हूँ।'],
  ['क्या कोई शौकिया मेन में पुश करेगा?', '...अगर हाँ, तो मैं नहीं।', 'यह मेरा टेक लीड है।'],
  ['सवाल। कितने माइक्रोसर्विसेज?', 'एक।', 'वह तो मोनोलिथ है।'],
  ['बैंगलोर ट्रैफ़िक धैर्य बढ़ाता है।', 'और स्टैंडअप में देरी करता है।', 'बिल्कुल सही।'],
  ['स्टेजिंग सर्वर से किसकी खुशबू आ रही है?', 'जीत की। और जली हुई फ़िल्टर कॉफ़ी की।'],
  ['क्या समोसा एक सैंडविच है?', 'यह एक नमकीन पेस्ट्री है।', 'काफ़ी करीब।'],
  ['स्टैंडअप 45 मिनट चला।', 'यह 2 लाइन का स्लैग मैसेज हो सकता था।'],
  ['क्या बिल्ड ग्रीन हुआ?', '...अभी CI की तरफ मत देखो।'],
];

const EXCHANGES_BN: readonly Exchange[] = [
  ['বিশ্বের সেরা CTO।', 'আপনিই তো। আমি মগটা প্রিন্ট করিয়েছিলাম।', 'আর আমি ওটা যত্ন করে রাখি।'],
  ['কোনো অ্যামেচার কি মেইনে পুশ করবে?', '...যদি করে, আমি করি না।', 'উনিই আমার টেক লিড।'],
  ['প্রশ্ন। কতগুলো মাইক্রোসার্ভিস?', 'একটা।', 'সেটা তো মনোলিথ।'],
  ['ব্যাঙ্গালোর ট্র্যাফিক ধৈর্য বাড়ায়।', 'আর স্ট্যান্ডআপে দেরি করায়।', 'একদম তাই।'],
  ['সামোসা কি একটা স্যান্ডউইচ?', 'এটা একটা চাটপাটা পেস্ট্রি।', 'কাছাকাছি গেছে।'],
  ['স্ট্যান্ডআপ ৪৫ মিনিট চলল।', 'স্ল্যাকে ২ লাইনে লেখা যেত।'],
  ['বিল্ড কি গ্রিন হয়েছে?', '...এখন CI-এর দিকে তাকিয়ো না।'],
];

const EXCHANGES_AS: readonly Exchange[] = [
  ['বিশ্বৰ শ্ৰেষ্ঠ CTO।', 'আপুনিয়েই তো। মই মগটো প্ৰিন্ট কৰাইছিলোঁ।', 'আৰু মই ইয়াক আদৰ কৰোঁ।'],
  ['কোনো অপশাদারী কৰ্মচাৰীয়ে মেইনত পুছ কৰিবনে?', '...যদি কৰে, মই নকৰোঁ।', 'ই মোৰ টেক লিড।'],
  ['প্ৰশ্ন। কেইটা মাইক্ৰ’চাৰ্ভিছ?', 'এটা।', 'সেইটো তো মনোলিথ।'],
  ['বাংগালুৰু ট্ৰেফিকে ধৈৰ্য্য বঢ়ায়।', 'আৰু ষ্টেণ্ডআপত দেৰি কৰায়।', 'একেবাৰে শুদ্ধ।'],
  ['চামোচা এটা চেণ্ডউইচ নেকি?', 'এইটো এটা মচলাদাৰ পেষ্ট্ৰি।', 'ওচৰা-ওচৰি।'],
  ['ষ্টেণ্ডআপ ৪৫ মিনিট চলিল।', 'স্লেকৰ ২ শাৰীৰ বাৰ্তাতেই হৈ গ’লহেঁতেন।'],
  ['বিল্ড গ্ৰীন হ’লনে?', '...এতিয়া CI-ৰ ফালে নাচাবা।'],
];

const EXCHANGES_TA: readonly Exchange[] = [
  ['உலகின் சிறந்த CTO.', 'நீங்க தான். நான் தான் கப் பிரிண்ட் பண்ணினேன்.', 'நான் அதை மதிக்கிறேன்.'],
  ['யாராவது டெஸ்ட் பண்ணாம மெயின்ல புஷ் பண்ணுவாங்களா?', '...அப்படி பண்ணினா, நான் இல்லை.', 'இவர்தான் என் டெக் லீட்.'],
  ['கேள்வி. எத்தனை மைக்ரோசர்வீசస్?', 'ஒன்று.', 'அது மோனோலித்.'],
  ['பெங்களூர் ட்ராஃபிக் பொறுமையை வளர்க்கும்.', 'ஸ்டாண்ட்அப் லேட் ஆகும்.', 'சரியா சொன்னீங்க.'],
  ['சமோசா ஒரு சாண்ட்விச்சா?', 'அது ஒரு காரமான பேஸ்ட்ரி.', 'கிட்டத்தட்ட ஒன்னுதான்.'],
  ['ஸ்டாண்ட்அப் 45 நிமிஷம் போச்சு.', 'ஸ்லேக்ல 2 லைன்ல முடிச்சிருக்கலாம்.'],
  ['பில்ட் கிரீன் ஆயிடுச்சா?', '...இப்போ CI பக்கம் பார்க்காதீங்க.'],
];

const EXCHANGES_TE: readonly Exchange[] = [
  ['ప్రపంచంలోనే ఉత్తమ CTO.', 'మీరే. నేను కప్పు ప్రింట్ చేయించాను.', 'నేను దాన్ని గౌరవిస్తాను.'],
  ['ఎవరైనా టెస్ట్ చేయకుండా మెయిన్ కి పుష్ చేస్తారా?', '...ఒకవేళ చేస్తే, నేను కాదు.', 'ఈయనే నా టెక్ లీడ్.'],
  ['ప్రశ్న. ఎన్ని మైక్రోసర్వీసెస్?', 'ఒకటి.', 'అది మోనోలిత్.'],
  ['బెంగళూరు ట్రాఫిక్ సహనాన్ని పెంచుతుంది.', 'మరియు స్టాండప్ ఆలస్యం చేస్తుంది.', 'ఖచ్చితంగా.'],
  ['సమోసా ఒక శాండ్విచ్ ఆ?', 'అది ఒక కారమైన పేస్ట్రీ.', 'దగ్గరలోనే ఉంది.'],
  ['స్టాండప్ 45 నిమిషాలు నడిచింది.', 'స్లాక్లో 2 లైన్ల మెసేజ్లో అయిపోయేది.'],
  ['బిల్డ్ గ్రీన్ అయిందా?', '...ఇప్పుడు CI వైపు చూడకండి.'],
];

const PAIR_POOLS: Record<SupportedLang, readonly Exchange[]> = {
  en: [...EXCHANGES_EN, ...TWSS_EXCHANGES],
  hi: [...EXCHANGES_HI, ...TWSS_EXCHANGES],
  bn: [...EXCHANGES_BN, ...TWSS_EXCHANGES],
  as: [...EXCHANGES_AS, ...TWSS_EXCHANGES],
  ta: [...EXCHANGES_TA, ...TWSS_EXCHANGES],
  te: [...EXCHANGES_TE, ...TWSS_EXCHANGES],
};

const KEYED_EXCHANGES_EN: Partial<Record<OfficeCharacterName, Exchange>> = {
  nitya:   ['that’s what the PR said.', '...there it is.'],
  devi:    ['pushing to main without tests is a crime.', 'nobody bypassed CI, Devi.'],
  vikram:  ['bears. beets. Bangalore traffic.', 'just merge it already.'],
  kavi:    ['did you check the user stories?', 'we’re agile, Kavi.'],
  rudra:   ['kubernetes cluster is down.', 'did you try restarting it?'],
  ananya:  ['the UI needs more padding.', 'it already has 32px!'],
  arjun:   ['we need more GPUs.', 'we don’t have budget for A100s.'],
  priya:   ['is the API doc updated?', 'it will be after release.'],
  sanjay:  ['is it Chai Day?', 'every day is Chai Day, Sanjay.'],
  aarav:   ['I’m filing a ticket.', '...for a typo?'],

  dwight:  ['FALSE.', 'identity theft is not a joke.'],
  jim:     ['bears. beets. Battlestar Galactica.', 'question: which bear is best?'],
  pam:     ['Dunder Mifflin, this is Pam.', 'can you put me through to Jim?'],
  kevin:   ['the chili is ready.', 'is it actually ready Kevin?'],
  angela:  ['the break room is filthy.', 'I literally just cleaned it.'],
  oscar:   ['actually, it’s espresso.', 'well, actually...'],
  stanley: ['is it Pretzel Day?', 'it’s Tuesday Stanley.'],
  phyllis: ['I knitted a sweater.', 'it looks very warm Phyllis.'],
  andy:    ['rit-dit-dit-di-doo!', 'please stop singing Andy.'],
  kelly:   ['OMG did you hear??', 'what happened Kelly?'],
  ryan:    ['it’s about the algorithm.', 'sure Ryan.'],
  toby:    ['I’m writing a novel.', 'that’s nice Toby.'],
};

const KEYED_EXCHANGES_HI: Partial<Record<OfficeCharacterName, Exchange>> = {
  nitya:   ['PR में यही लिखा था।', '...हाँ वही।'],
  devi:    ['बिना टेस्ट के मेन में पुश करना अपराध है।', 'किसी ने CI बायपास नहीं किया, देवी।'],
  vikram:  ['भालू। चुकंदर। बैंगलोर ट्रैफ़िक।', 'बस अब मर्ज कर दो।'],
  kavi:    ['क्या तुमने यूजर स्टोरीज़ चेक कीं?', 'हम एजाइल हैं, कवि।'],
  rudra:   ['कुबेरनेट्स क्लस्टर डाउन है।', 'क्या तुमने रीस्टार्ट करके देखा?'],
  ananya:  ['UI में और पैडिंग चाहिए।', 'इसमें पहले से ही 32px है!'],
  arjun:   ['हमें और GPUs चाहिए।', 'हमारे पास A100s का बजट नहीं है।'],
  priya:   ['क्या API डॉक्यूमेंट अपडेट है?', 'रिलीज़ के बाद हो जाएगा।'],
  sanjay:  ['क्या आज चाय दिवस है?', 'हर दिन चाय दिवस है, संजय।'],
  aarav:   ['मैं एक टिकट फ़ाइल कर रहा हूँ।', '...एक टाइपो के लिए?'],
};

const KEYED_EXCHANGES_BN: Partial<Record<OfficeCharacterName, Exchange>> = {
  nitya:   ['PR-এ এটাই লেখা ছিল।', '...এই তো কথা।'],
  devi:    ['টেস্ট ছাড়া মেইনে পুশ করা অপরাধ।', 'কেউ CI বাইপাস করেনি, দেবী।'],
  vikram:  ['ভালুক। বিট। ব্যাঙ্গালোর ট্র্যাফিক।', 'এবার মার্জ করে দাও।'],
  kavi:    ['ইউজার স্টোরিগুলো দেখেছ?', 'আমরা অ্যাজাইল, কবি।'],
  rudra:   ['কুবারেটিস ক্লাস্টার ডাউন।', 'রিস্টার্ট করে দেখেছ?'],
  ananya:  ['UI-তে আরও প্যাডিং লাগবে।', 'ইতিমধ্যেই ৩২px আছে!'],
  arjun:   ['আমাদের আরও GPU লাগবে।', 'A100s-এর বাজেট নেই।'],
  priya:   ['API ডকুমেন্ট কি আপডেট হয়েছে?', 'রিলাইজের পর হয়ে যাবে।'],
  sanjay:  ['আজ কি চা দিবস?', 'প্রতিদিনই চা দিবস, সঞ্জয়।'],
  aarav:   ['আমি একটা টিকিট ফাইল করছি।', '...একটা বানান ভুলের জন্য?'],
};

const KEYED_EXCHANGES_AS: Partial<Record<OfficeCharacterName, Exchange>> = {
  nitya:   ['PR-ত এইটোৱেই লিখা আছিল।', '...এইটোৱেই কথা।'],
  devi:    ['টেষ্ট নোহোৱাকৈ মেইনত পুছ কৰাটো অপৰাধ।', 'কোনেও CI বাইপাছ কৰা নাই, দেৱী।'],
  vikram:  ['ভালুক। বিট। বাংগালুৰু ট্ৰেফিক।', 'এতিয়া মাৰ্জ কৰি দিয়া।'],
  kavi:    ['ইউজাৰ ষ্টৰি বোৰ চালা নেকি?', 'আমি এজাইল, কবি।'],
  rudra:   ['কুবাৰনেটিছ ক্লাষ্টাৰ ডাউন হৈছে।', 'ৰীষ্টাৰ্ট কৰি চোৱা নাইনে?'],
  ananya:  ['UI-ত আৰু পেডিং লাগে।', 'ইতিমধ্যে ৩২px আছেই!'],
  arjun:   ['আমাৰ আৰু GPU লাগে।', 'A100s-ৰ বাবে বাজেট নাই।'],
  priya:   ['API ডক্যুমেন্ট আপডেট হ’লনে?', 'ৰিৰ্লিছৰ পিছত হৈ যাব।'],
  sanjay:  ['আজি চাহ দিৱস নেকি?', 'প্ৰতিদিনেই চাহ দিৱস, সঞ্জয়।'],
  aarav:   ['মই এটা টিকট ফাইল কৰিছোঁ।', '...এটা বানান ভুলৰ বাবে?'],
};

const KEYED_EXCHANGES_TA: Partial<Record<OfficeCharacterName, Exchange>> = {
  nitya:   ['PR-ல அதான் சொல்லியிருந்தது.', '...அவ்வளவுதான்.'],
  devi:    ['டெஸ்ட் இல்லாம மெயின்ல புஷ் பண்றது குற்றம்.', 'யாரும் CI பைபாஸ் பண்ணலை, தேவி.'],
  vikram:  ['கரடி. பீட்ரூட். பெங்களூர் ட்ராஃபிக்.', 'சீக்கிரம் மெர்ஜ் பண்ணுப்பா.'],
  kavi:    ['யூசர் ஸ்டோரிஸ் பார்த்தியா?', 'நாம அஜைல், கவி.'],
  rudra:   ['குபெர்னட்டீஸ் கிளஸ்டர் டவுன்.', 'ரீஸ்டார்ட் பண்ணி பார்த்தியா?'],
  ananya:  ['UI-க்கு இன்னும் பேடிங் வேணும்.', 'ஏற்கனவே 32px இருக்கு!'],
  arjun:   ['நமக்கு இன்னும் GPU வேணும்.', 'A100s வாங்க பட்ஜெட் இல்லை.'],
  priya:   ['API டாக்குமெண்ட் அப்டேட் ஆயிடுச்சா?', 'ரிலீஸுக்கு அப்புறம் ஆயிடும்.'],
  sanjay:  ['இன்னைக்கு டீ தினமா?', 'எல்லா நாளும் டீ தினம் தான், சஞ்சய்.'],
  aarav:   ['நான் ஒரு டிக்கெட் ஃபைல் பண்றேன்.', '...ஒரு டைப்போவுக்கா?'],
};

const KEYED_EXCHANGES_TE: Partial<Record<OfficeCharacterName, Exchange>> = {
  nitya:   ['PR లో అదే రాసి ఉంది.', '...అంతే మరి.'],
  devi:    ['టెస్ట్ లేకుండా మెయిన్ కి పుష్ చేయడం నేరం.', 'ఎవరూ CI బైపాస్ చేయలేదు, దేవి.'],
  vikram:  ['ఎలుగుబంటి. బీట్రూట్. బెంగళూరు ట్రాఫిక్.', 'ఇక మెర్జ్ చేసేయ్.'],
  kavi:    ['యూజర్ స్టోరీస్ చూశారా?', 'మేము అజైల్, కవి.'],
  rudra:   ['కుబెర్నెటీస్ క్లస్టర్ డౌన్ అయింది.', 'రీస్టార్ట్ చేసి చూశారా?'],
  ananya:  ['UI లో ఇంకా ప్యాడింగ్ కావాలి.', 'ఇప్పటికే 32px ఉంది!'],
  arjun:   ['మాకు ఇంకా ఎక్కువ GPUs కావాలి.', 'A100s కి బడ్జెట్ లేదు.'],
  priya:   ['API డాక్యుమెంట్ అప్డేట్ అయిందా?', 'రిలీజ్ తర్వాత అవుతుంది.'],
  sanjay:  ['ఈరోజు ఛాయ్ దినోత్సవమా?', 'ప్రతీ రోజు ఛాయ్ దినోత్సవమే, సంజయ్.'],
  aarav:   ['నేను ఒక టికెట్ ఫైల్ చేస్తున్నాను.', '...ఒక స్పెల్లింగ్ తప్పు కా?'],
};

const LOCALIZED_KEYED_EXCHANGES: Record<SupportedLang, Partial<Record<OfficeCharacterName, Exchange>>> = {
  en: KEYED_EXCHANGES_EN,
  hi: KEYED_EXCHANGES_HI,
  bn: KEYED_EXCHANGES_BN,
  as: KEYED_EXCHANGES_AS,
  ta: KEYED_EXCHANGES_TA,
  te: KEYED_EXCHANGES_TE,
};

/** Pick a paired conversation exchange, incorporating language preference. */
export function pickExchange(speaker: OfficeCharacterName, seed: number, lang?: string): Exchange {
  const activeLang = normalizeLang(lang || getActiveLanguage());
  const keyed = LOCALIZED_KEYED_EXCHANGES[activeLang] || LOCALIZED_KEYED_EXCHANGES.en;
  const pool = PAIR_POOLS[activeLang] || PAIR_POOLS.en;

  if (keyed[speaker] && seed % 4 === 0) {
    return keyed[speaker]!;
  }
  return pick(pool, seed);
}
