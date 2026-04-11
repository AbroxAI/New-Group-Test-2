// ====================== AI PERSONA ENGINE v6 (Complete) ======================
// 450+ personas · Realistic avatars · Archetypes · Contextual replies · Clusters · Memory
// Local testimonial images (20) with duplicate avoidance · Reply preview support
// =============================================================================

(function(){
  "use strict";

  const CONFIG = {
    BASE_INTERVAL: 8000,
    BURST_CHANCE: 0.20,
    TRADE_RESULT_INTERVAL: 20000,
    TRADE_RESULT_CHANCE: 0.35,
    TESTIMONIAL_CHANCE: 0.12,
    JOIN_CHANCE: 0.06,
    MAX_BURST_MESSAGES: 4,
    ENABLE_LOGGING: true,
    WATCHER_ACTIVITY_PENALTY: 0.7
  };

  const MessageType = {
    QUESTION: "question", RESULT: "result", REACTION: "reaction", ADVICE: "advice",
    HYPE: "hype", GREETING: "greeting", CONFUSED: "confused", FLEX: "flex",
    COMMUNITY: "community", TESTIMONIAL: "testimonial", JOIN: "join",
    SARCASTIC: "sarcastic", FUNNY: "funny", ANALYTICAL: "analytical"
  };

  const conversationFlow = {
    [MessageType.QUESTION]:   [MessageType.ADVICE, MessageType.REACTION, MessageType.CONFUSED, MessageType.ANALYTICAL],
    [MessageType.ADVICE]:     [MessageType.REACTION, MessageType.RESULT, MessageType.QUESTION],
    [MessageType.RESULT]:     [MessageType.REACTION, MessageType.HYPE, MessageType.FLEX, MessageType.TESTIMONIAL, MessageType.SARCASTIC],
    [MessageType.REACTION]:   [MessageType.QUESTION, MessageType.RESULT, MessageType.GREETING, MessageType.FUNNY],
    [MessageType.HYPE]:       [MessageType.REACTION, MessageType.RESULT, MessageType.FLEX],
    [MessageType.GREETING]:   [MessageType.QUESTION, MessageType.REACTION, MessageType.COMMUNITY],
    [MessageType.CONFUSED]:   [MessageType.ADVICE, MessageType.QUESTION],
    [MessageType.FLEX]:       [MessageType.REACTION, MessageType.HYPE, MessageType.TESTIMONIAL, MessageType.SARCASTIC],
    [MessageType.COMMUNITY]:  [MessageType.REACTION, MessageType.QUESTION, MessageType.GREETING],
    [MessageType.TESTIMONIAL]: [MessageType.REACTION, MessageType.QUESTION, MessageType.HYPE],
    [MessageType.JOIN]:       [MessageType.GREETING, MessageType.REACTION, MessageType.COMMUNITY],
    [MessageType.SARCASTIC]:  [MessageType.REACTION, MessageType.FLEX, MessageType.QUESTION],
    [MessageType.FUNNY]:      [MessageType.REACTION, MessageType.HYPE, MessageType.COMMUNITY],
    [MessageType.ANALYTICAL]: [MessageType.ADVICE, MessageType.QUESTION, MessageType.REACTION]
  };

  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const log = (...args) => CONFIG.ENABLE_LOGGING && console.log('[AI]', ...args);

  // ---------- MULTI-SOURCE AVATAR SYSTEM ----------
  const avatarSources = [
    { type: 'randomuser', url: (name, gender, seed) => `https://randomuser.me/api/portraits/${gender}/${Math.abs(seed) % 100}.jpg`, weight: 80 },
    { type: 'picsum', url: (name, gender, seed) => `https://picsum.photos/id/${100 + (Math.abs(seed) % 300)}/200/200`, weight: 10 },
    { type: 'unsplash', url: (name, gender, seed) => `https://source.unsplash.com/featured/200x200?face,portrait`, weight: 5 },
    { type: 'placeholder', url: null, weight: 5 }
  ];

  function getWeightedAvatarSource() {
    const total = avatarSources.reduce((sum, s) => sum + s.weight, 0);
    let rand = Math.random() * total;
    for (let src of avatarSources) {
      if (rand < src.weight) return src;
      rand -= src.weight;
    }
    return avatarSources[0];
  }

  function getAvatarUrl(name, gender) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);
    const source = getWeightedAvatarSource();
    if (source.url) return source.url(name, gender, seed);
    return null;
  }

  // ---------- GENDER INFERENCE ----------
  const maleNames = new Set([
    "Daniel","Chidi","Olu","Tunde","Emeka","Ifeanyi","Yemi","Bimbo","Segun","Bayo","Obinna","Nnamdi","Uchenna","Chika","Onyeka","Efe","Temi",
    "Oliver","Harry","George","Jack","Charlie","James","Thomas","William","Henry","Oscar","Leo","Alfie",
    "Khalid","Omar","Rashid","Hamza","Saeed","Ali","Ahmed","Yousef","Hassan","Tariq","Faisal","Salem","Majid",
    "Jason","Mike","Chris","David","Kevin","Brian","Matt","Tyler","Justin","Ryan","Brandon","Zach","Josh",
    "Ravi","Amit","Vikram","Raj","Arjun","Suresh","Manoj","Rahul","Sanjay","Aakash","Rohan","Karthik","Varun",
    "Lucas","Paulo","Felipe","Rafael","Gustavo","Marcelo","Rodrigo","Thiago","André","Bruno","Diego","Leonardo","Ricardo",
    "Thabo","Sipho","Mandla","Bongani","Sibusiso","Jabulani","Vusi","Sizwe","Themba","Mpho","Kabelo","Kagiso","Tebogo",
    "Klaus","Hans","Peter","Thomas","Michael","Andreas","Frank","Markus","Stefan","Jan","Tim","Dirk","Sven",
    "Budi","Agus","Eko","Hadi","Adi","Joko","Dedi","Rudi","Wawan","Tono","Andi","Bayu","Hendra",
    "Carlos","Jose","Juan","Luis","Miguel","Francisco","Javier","Ricardo","Fernando","Alejandro","Arturo","Roberto","Sergio"
  ]);
  const femaleNames = new Set([
    "Amara","Ngozi","Folake","Yetunde","Kemi","Chinwe","Adaobi","Ndidi",
    "Maya","Sophie","Emily","Lucy","Amelia","Grace","Alice","Ella","Lily","Mia","Isla","Poppy","Evie",
    "Fatima","Aisha","Layla","Noura","Mona","Reem","Sara","Mariam","Zainab","Lina","Huda","Amal",
    "Jessica","Sarah","Ashley","Brianna","Nicole","Megan","Rachel","Amber","Kayla","Lauren","Taylor","Sam",
    "Priya","Neha","Anjali","Pooja","Kavya","Deepa","Divya","Sunita","Meera","Isha","Ananya","Swati",
    "Ana","Mariana","Carla","Juliana","Fernanda","Camila","Beatriz","Larissa","Vanessa","Gabriela","Patricia","Aline",
    "Lerato","Zinhle","Nandi","Thandi","Nomvula","Precious","Buhle","Lindiwe","Nokuthula","Boitumelo","Palesa","Karabo",
    "Anna","Julia","Laura","Sarah","Lisa","Stefanie","Nicole","Sabine","Kerstin","Nina","Melanie","Katrin",
    "Siti","Dewi","Rina","Maya","Putri","Sari","Nia","Yanti","Lina","Rini","Tina","Fitri",
    "Maria","Guadalupe","Elena","Carmen","Rosa","Alejandra","Veronica","Patricia","Gabriela","Sofia","Daniela","Laura"
  ]);
  function getGenderFromName(firstName) {
    if (maleNames.has(firstName)) return "men";
    if (femaleNames.has(firstName)) return "women";
    return firstName.endsWith("a") || firstName.endsWith("e") ? "women" : "men";
  }

  // ---------- PERSONA ARCHETYPES ----------
  const archetypes = [
    { name: "watcher", activityMult: 0.15, traits: ["quiet","observant"], messageTypes: [MessageType.REACTION, MessageType.COMMUNITY], chance: 0.25 },
    { name: "active", activityMult: 1.0, traits: ["talkative","friendly"], messageTypes: Object.values(MessageType), chance: 0.35 },
    { name: "leader", activityMult: 0.9, traits: ["confident","authority"], messageTypes: [MessageType.ADVICE, MessageType.FLEX, MessageType.HYPE], chance: 0.10 },
    { name: "sarcastic", activityMult: 0.7, traits: ["witty","sarcastic"], messageTypes: [MessageType.SARCASTIC, MessageType.REACTION, MessageType.FLEX], chance: 0.10 },
    { name: "analytical", activityMult: 0.8, traits: ["logical","detailed"], messageTypes: [MessageType.ANALYTICAL, MessageType.ADVICE, MessageType.QUESTION], chance: 0.10 },
    { name: "funny", activityMult: 0.7, traits: ["humorous","joker"], messageTypes: [MessageType.FUNNY, MessageType.REACTION, MessageType.HYPE], chance: 0.10 }
  ];

  function assignArchetype() {
    const total = archetypes.reduce((sum, a) => sum + a.chance, 0);
    let rand = Math.random() * total;
    for (let arch of archetypes) {
      if (rand < arch.chance) return arch;
      rand -= arch.chance;
    }
    return archetypes[1];
  }

  // ---------- LOCAL TESTIMONIAL IMAGES (with duplicate avoidance) ----------
  const TOTAL_TESTIMONIALS = 20;
  let usedTestimonialIndices = [];
  let testimonialRotation = [];

  function initTestimonialRotation() {
    const indices = Array.from({ length: TOTAL_TESTIMONIALS }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    testimonialRotation = indices;
    usedTestimonialIndices = [];
  }

  function getNextTestimonialImage() {
    if (testimonialRotation.length === 0 || usedTestimonialIndices.length >= TOTAL_TESTIMONIALS) {
      initTestimonialRotation();
    }
    let nextIndex = null;
    for (let idx of testimonialRotation) {
      if (!usedTestimonialIndices.includes(idx)) {
        nextIndex = idx;
        break;
      }
    }
    if (nextIndex === null) {
      initTestimonialRotation();
      nextIndex = testimonialRotation[0];
    }
    usedTestimonialIndices.push(nextIndex);
    return `assets/testimonials/testimonial_${nextIndex + 1}.jpg`;
  }

  initTestimonialRotation();

  // ---------- FULL PHRASE BANKS ----------
  const globalPhraseBank = {
    question: [
      "how do you enter this trade?", "is this signal safe?", "what timeframe?",
      "anyone tested this strategy?", "how long have you been trading?",
      "what's the win rate?", "minimum deposit?", "can I use demo first?",
      "is this OTC or real market?", "which pair is best today?",
      "how do I set stop loss?", "when is the next signal?",
      "do you trade full time?", "what broker do you use?",
      "is this app legit?", "how to withdraw profits?",
      "any proof of payments?", "how much capital needed?",
      "can I copy trades?", "what's the risk per trade?",
      "do you have a Telegram group?", "how accurate are signals?",
      "is this suitable for beginners?", "what session do you trade?",
      "any free signals first?", "how to read the chart?",
      "what indicators do you use?", "do you trade news?",
      "what's the max drawdown?", "is this martingale?",
      "how many signals per day?", "do you trade weekends?",
      "what's the best time to trade?", "can I use mobile app?",
      "how fast is withdrawal?", "do you offer coaching?",
      "what's your favorite pair?", "how do you handle losses?",
      "do you use leverage?", "what's your average profit?",
      "is there a signal history?", "how do I know when to exit?",
      "do you trade during news?", "what's your win streak?",
      "can I start with $50?", "how to manage emotions?",
      "do you recommend any books?", "what's your daily goal?",
      "how to avoid revenge trading?", "do you use price action?",
      "is this a scam?", "how long to become profitable?",
      "can I see your trading account?", "do you have a verified track record?",
      "what's the difference between OTC and real?", "how do I improve my accuracy?"
    ],
    result: [
      "just won this 🔥", "loss but next one coming", "easy win guys",
      "took profit at +87%", "hit TP perfectly", "small loss, sticking to plan",
      "recovered yesterday's loss", "three wins in a row", "this signal is fire",
      "broke even today", "scalped a quick 70%", "missed entry but it won",
      "took partial profits", "let it run to full TP", "closed early but still green",
      "tight stop saved me", "overtraded and lost", "discipline pays off",
      "followed the rules and won", "impulsive trade lost", "patience is key",
      "waited for confirmation and won", "entered too early, lost",
      "double bottom worked perfectly", "trend continuation win",
      "caught the reversal", "got stopped out by 1 pip", "that was close",
      "hit my daily target", "two losses, one win, still up", "good risk management",
      "didn't trade today, saved capital", "overtrading is real, took a break",
      "won on EUR/USD", "GBP/USD gave a nice move", "USD/JPY was choppy",
      "traded the news, won", "avoided the news, glad I did", "followed the trend, easy win",
      "counter-trend trade, lost", "waited for pullback, perfect entry",
      "used a tight stop, got stopped", "wider stop would have won",
      "took a small loss, preserved capital", "scalped 5 pips", "swing trade hit TP",
      "held overnight, won", "closed before weekend", "happy with the result",
      "just hit +92% on EUR/USD", "GBP/USD +78%", "USD/JPY +85%", "AUD/USD +73%",
      "EUR/GBP +81%", "USD/CHF +79%", "NZD/USD +77%", "US30 +88%", "GER40 +82%",
      "win streak: 4", "finally a green day", "recovered last week's loss",
      "stuck to the plan and it paid off", "no more FOMO", "trust the process",
      "this is the way", "slow and steady", "compounding works"
    ],
    reaction: [
      "nice!", "🔥🔥", "that was clean", "good stuff", "well done",
      "congrats", "awesome", "solid trade", "keep it up", "impressive",
      "let's gooo", "beautiful", "perfect entry", "you're on fire",
      "respect", "💪", "👏", "🙌", "legend", "killing it",
      "great job", "amazing", "wow", "incredible", "superb",
      "excellent", "fantastic", "brilliant", "outstanding", "top notch",
      "love to see it", "that's how it's done", "inspiring", "motivating",
      "proud of you", "keep grinding", "stay consistent", "you got this",
      "next level", "beast mode", "unstoppable", "champion", "goat",
      "clean execution", "textbook trade", "masterclass", "flawless",
      "this is why we trade", "cheers mate", "big win", "ez money",
      "free pips", "another one", "add to the collection", "banked",
      "secured", "locked in", "print it", "cash out", "good trade",
      "nice call", "well played", "gg", "wp"
    ],
    advice: [
      "wait for confirmation", "don't rush entry", "follow rules",
      "always use stop loss", "manage risk first", "don't revenge trade",
      "stick to the plan", "patience is key", "never risk more than 2%",
      "trade with the trend", "avoid news spikes", "use proper lot size",
      "keep a trading journal", "review your losses", "don't overtrade",
      "take breaks", "emotions are the enemy", "trust the process",
      "learn from mistakes", "stay disciplined", "consistency over home runs",
      "protect your capital", "cut losses quickly", "let winners run",
      "don't chase the market", "wait for your setup", "quality over quantity",
      "know when to sit out", "don't trade tired", "have a routine",
      "backtest your strategy", "forward test first", "use demo to practice",
      "understand market structure", "learn support and resistance",
      "master one pair first", "don't jump between strategies",
      "keep it simple", "overtrading is the enemy", "focus on process, not profit",
      "risk only what you can afford to lose", "never trade under pressure",
      "set daily loss limit", "take profits regularly", "don't be greedy",
      "the market will always be there", "there's always another trade",
      "don't marry a position", "be flexible", "adapt to market conditions",
      "know when to switch pairs", "session matters", "liquidity is key",
      "avoid exotic pairs", "major pairs are more predictable"
    ],
    hype: [
      "this thing too sweet 🔥", "we eating today", "steady wins",
      "market is giving", "easy money", "let's get this bread",
      "profits printing", "green days only", "no losses today",
      "winning streak", "unstoppable", "locked in", "focused",
      "dialed in", "in the zone", "crushing it", "dominating",
      "on a roll", "can't be stopped", "this is our year",
      "making moves", "stacking wins", "pips for days", "money machine",
      "account growing", "compounding", "snowball effect", "momentum",
      "full steam ahead", "no looking back", "leveling up",
      "to the moon", "rocket ship", "all gas no brakes",
      "bull market vibes", "trend is your friend", "riding the wave",
      "catching knives (not today)", "precision entries", "no slippage",
      "perfect execution", "timing on point", "analysis paid off",
      "homework done", "preparation meets opportunity", "luck is for amateurs"
    ],
    greeting: [
      "hey everyone", "good morning", "what's up", "hello traders",
      "good evening", "hi all", "morning", "evening", "yo",
      "how's everyone doing?", "happy trading", "weekend soon",
      "ready for the session", "let's make some pips", "greetings",
      "good afternoon", "hope everyone is well", "welcome new members",
      "great to see activity", "blessed day", "profitable day ahead",
      "stay positive", "good vibes only", "let's get it",
      "what's good fam", "how we feeling today?", "anyone trading?",
      "who's ready for London session?", "NY open soon", "Asian session quiet",
      "just woke up, time to trade", "coffee first, then charts",
      "checking in", "how's the market treating you?", "any big news today?"
    ],
    confused: [
      "please explain", "I am new here", "how to start?", "any tutorial?",
      "what does OTC mean?", "how to read signal?", "confused about entry",
      "where can I learn?", "is this automated?", "do I need experience?",
      "can someone guide me?", "I don't understand the chart",
      "what's a candlestick?", "how do I deposit?", "is there a demo?",
      "what's the difference between buy and sell?", "how do I set take profit?",
      "what is a pip?", "how much is 1 lot?", "do I need to download software?",
      "can I use my phone?", "is there a minimum trade size?",
      "how do I know if signal is valid?", "what if I miss the entry?",
      "can I trade without verification?", "how do I contact support?",
      "I'm lost", "this is overwhelming", "where do I begin?",
      "can someone break it down for me?", "ELI5 please",
      "what's the first step?", "how do I fund my account?",
      "which broker is best for beginners?", "do I need a VPN?",
      "is my country restricted?", "what are the trading hours?",
      "can I trade on weekends?", "how do I read the economic calendar?"
    ],
    flex: [
      "just flipped this 🔥", "called that move", "too easy", "another bag",
      "EZ profit", "that's how it's done", "I told you all", "no sweat",
      "watch and learn", "this is light work", "trading like a boss",
      "can't stop winning", "my strategy is gold", "don't doubt me",
      "another win in the books", "clean sweep today", "haters will say it's fake",
      "results don't lie", "walking the walk", "prove them wrong",
      "silence the doubters", "account speaks for itself", "leveled up",
      "next tier unlocked", "elite status", "built different",
      "different breed", "they ain't ready", "on a whole 'nother level",
      "top of the leaderboard", "who's next?", "challenge accepted",
      "anyone else catch that move?", "I'm just getting started",
      "wait till you see my next trade", "consistency is king",
      "I don't gamble, I calculate", "risk management on point"
    ],
    community: [
      "anyone from Brazil?", "where is everyone from?", "nice to see global traders",
      "we all learning together", "support each other", "good vibes only",
      "let's grow together", "share your wins", "we got this",
      "teamwork makes the dream work", "community strong", "love this group",
      "helpful people here", "appreciate the insights", "learning a lot",
      "great atmosphere", "no negativity", "positive energy", "one family",
      "traders helping traders", "this is what it's about", "knowledge shared",
      "everyone starts somewhere", "no question is stupid", "ask away",
      "we were all beginners once", "stay humble", "help others when you can",
      "pay it forward", "good karma", "what goes around comes around"
    ],
    testimonial: [
      "I was skeptical at first but this signal is legit. Just hit +89% on EUR/USD 🔥",
      "Finally a group that actually delivers. Withdrew my first profit today. Thanks!",
      "Been following for 2 weeks. Accuracy is real. Keep it up!",
      "Honestly the best signal community I've joined. No BS.",
      "Just wanted to share my result. +76% on GBP/USD. Screenshot attached 👇",
      "If you're new, trust the process. I'm up 3 days in a row.",
      "I'm not a bot lol. Real person here. This works.",
      "Took me a while to trust it, but now I'm consistent. Thanks team.",
      "For anyone doubting, just demo first. You'll see.",
      "I've been in many groups. This one is different. Signals are on point.",
      "This is my third withdrawal this month. Can't thank you enough.",
      "I started with $100 and now I'm at $450 in two weeks. Slow and steady.",
      "The support team is also super helpful. Answered all my questions.",
      "I love the community here. Everyone is so supportive.",
      "I was about to give up trading until I found this group.",
      "These signals combined with my own analysis are deadly.",
      "I'm not a pro trader but I'm making consistent profits now.",
      "The accuracy is way higher than any other free signal I've tried.",
      "Just hit 10 wins in a row! This is insane.",
      "I'm recommending this to all my friends. Legit.",
      "Finally a signal service that doesn't disappear after a week.",
      "The transparency is refreshing. Keep doing what you're doing.",
      "I've learned so much just by watching the chat.",
      "This group changed my perspective on trading.",
      "I'm a full-time trader now thanks to the skills I learned here."
    ],
    join: [
      "just joined the group! 👋",
      "hello everyone, new here!",
      "happy to be part of this community 🚀",
      "joined! looking forward to learning.",
      "new member here. excited to trade with you all.",
      "hey guys, just got added. what's up?",
      "finally in the chat! let's get it 💪",
      "hello world! ready to make some pips.",
      "greetings from [country]. newbie here!",
      "added by support. thanks for having me.",
      "new trader here. be gentle 😅",
      "just signed up. any tips for a beginner?",
      "excited to start this journey with you all!",
      "long time lurker, finally joined.",
      "heard great things about this group. happy to be here.",
      "let's make some money together!",
      "ready to learn from the best.",
      "I'm here to soak up all the knowledge.",
      "hope to contribute as I learn.",
      "thanks for the add!"
    ],
    sarcastic: [
      "oh wow, another winner 😏", "sure, that definitely works... not", "easy money they said",
      "I'm sure this time it's different", "great, another loss, just what I needed",
      "my stop loss is my best friend", "trading is so relaxing they said",
      "of course it reversed right after I entered", "classic"
    ],
    funny: [
      "my trading strategy: buy high, sell low 🤡", "I'm not losing, I'm just investing in experience",
      "my stop loss is my wife's patience", "trading is easy, just buy the dip and watch it dip further",
      "I'm in a committed relationship with my losses", "profit? never heard of her",
      "I put the 'fun' in 'funds'", "my account looks like a ski slope 🎿"
    ],
    analytical: [
      "based on the 4H chart, we might see a retracement", "RSI is showing divergence",
      "support at 1.0850, resistance at 1.0920", "volume confirms the move",
      "looking at the order flow, smart money is buying", "fib levels suggest a pullback to 0.618",
      "market structure is bullish above the trendline", "watch for a break of the consolidation"
    ]
  };

  const regionalPhrases = {
    Nigeria: ["how far", "this thing legit?", "make I try am", "abeg", "no wahala", "I dey observe", "na wa", "oya", "chop life", "e choke", "na so", "wetin dey happen?", "I go follow", "e be like say", "no shaking"],
    "United Kingdom": ["cheers", "proper", "mate", "innit", "sorted", "brilliant", "lovely", "fancy that", "spot on", "cracking", "bloody hell", "chuffed", "gobsmacked", "knackered", "taking the piss"],
    UAE: ["inshallah", "mashallah", "yalla", "habibi", "wallah", "akeed", "tamam", "maafi mushkila", "shukran", "afwan", "alhamdulillah", "insha'Allah", "sabah al khair", "masa al khair", "khalas"],
    US: ["y'all", "dope", "lit", "bet", "for real", "no cap", "facts", "sheesh", "vibe", "lowkey", "hella", "finna", "ion know", "deadass", "say less"],
    India: ["namaste", "bhai", "accha", "theek hai", "arre", "yaar", "sahi hai", "kya baat", "badhiya", "ekdum", "kya scene hai?", "mast", "jugaad", "chalo", "fatafat"],
    Brazil: ["boa", "valeu", "beleza", "e aí", "top", "show", "legal", "maneiro", "da hora", "fechou", "tamo junto", "partiu", "galera", "tranquilo", "demorou"],
    SouthAfrica: ["howzit", "sharp", "lekker", "yebo", "shap", "aweh", "dankie", "eish", "jol", "bru", "now now", "just now", "kiff", "dop", "braai"],
    Germany: ["genau", "super", "alles klar", "danke", "bitte", "prima", "mensch", "krass", "geil", "läuft", "servus", "moin", "naja", "doch", "schon"],
    Indonesia: ["mantap", "siap", "terima kasih", "bro", "anjay", "wih", "gokil", "asik", "oke", "santuy", "gas", "cuy", "wkwk", "sabar", "semangat"],
    Mexico: ["órale", "ándale", "qué padre", "wey", "neta", "chido", "no manches", "a huevo", "chingón", "padrísimo", "qué onda", "güey", "chale", "ándale pues", "simón"]
  };

  const firstNames = {
    Nigeria: ["Daniel","Chidi","Amara","Olu","Tunde","Ngozi","Emeka","Folake","Ifeanyi","Yemi","Bimbo","Segun","Yetunde","Kemi","Bayo","Chinwe","Obinna","Adaobi","Nnamdi","Uchenna","Chika","Onyeka","Ndidi","Efe","Temi"],
    "United Kingdom": ["Maya","Oliver","Sophie","Harry","Emily","George","Lucy","Jack","Amelia","Charlie","Grace","James","Alice","Thomas","Ella","William","Lily","Henry","Mia","Oscar","Isla","Leo","Poppy","Alfie","Evie"],
    UAE: ["Khalid","Fatima","Omar","Aisha","Rashid","Layla","Hamza","Noura","Saeed","Mona","Ali","Reem","Ahmed","Sara","Yousef","Mariam","Hassan","Zainab","Tariq","Lina","Faisal","Huda","Salem","Amal","Majid"],
    US: ["Jason","Jessica","Mike","Sarah","Chris","Ashley","David","Brianna","Kevin","Nicole","Brian","Megan","Matt","Rachel","Tyler","Justin","Amber","Ryan","Kayla","Brandon","Lauren","Zach","Taylor","Josh","Sam"],
    India: ["Ravi","Priya","Amit","Neha","Vikram","Anjali","Raj","Pooja","Arjun","Kavya","Suresh","Deepa","Manoj","Divya","Rahul","Sunita","Sanjay","Meera","Aakash","Isha","Rohan","Ananya","Karthik","Swati","Varun"],
    Brazil: ["Lucas","Ana","Paulo","Mariana","Felipe","Carla","Rafael","Juliana","Gustavo","Fernanda","Marcelo","Camila","Rodrigo","Beatriz","Thiago","Larissa","André","Vanessa","Bruno","Gabriela","Diego","Patricia","Leonardo","Aline","Ricardo"],
    SouthAfrica: ["Thabo","Lerato","Sipho","Zinhle","Mandla","Nandi","Bongani","Thandi","Sibusiso","Nomvula","Jabulani","Precious","Vusi","Buhle","Sizwe","Lindiwe","Themba","Nokuthula","Mpho","Kabelo","Boitumelo","Kagiso","Palesa","Tebogo","Karabo"],
    Germany: ["Klaus","Anna","Hans","Julia","Peter","Laura","Thomas","Sarah","Michael","Lisa","Andreas","Stefanie","Frank","Nicole","Markus","Sabine","Stefan","Kerstin","Jan","Nina","Tim","Melanie","Dirk","Katrin","Sven"],
    Indonesia: ["Budi","Siti","Agus","Dewi","Eko","Rina","Hadi","Maya","Adi","Putri","Joko","Sari","Dian","Rudi","Nia","Wawan","Yanti","Tono","Lina","Andi","Rini","Bayu","Tina","Hendra","Fitri"],
    Mexico: ["Carlos","Maria","Jose","Guadalupe","Juan","Elena","Luis","Carmen","Miguel","Rosa","Francisco","Alejandra","Javier","Veronica","Ricardo","Patricia","Fernando","Gabriela","Alejandro","Sofia","Arturo","Daniela","Roberto","Laura","Sergio"]
  };

  const lastNames = {
    Nigeria: ["Okonkwo","Adebayo","Okafor","Eze","Chukwu","Adeyemi","Obi","Nwachukwu","Ogunleye","Balogun"],
    "United Kingdom": ["Smith","Jones","Taylor","Brown","Williams","Davies","Evans","Thomas","Johnson","Roberts"],
    UAE: ["Al-Mansouri","Al-Hashimi","Al-Mazrouei","Al-Qasimi","Al-Nuaimi","Al-Zaabi","Al-Kaabi","Al-Dhaheri","Al-Sharqi","Al-Ketbi"],
    US: ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez"],
    India: ["Patel","Singh","Kumar","Sharma","Gupta","Reddy","Joshi","Verma","Mehta","Nair"],
    Brazil: ["Silva","Santos","Oliveira","Souza","Lima","Pereira","Costa","Carvalho","Ferreira","Rodrigues"],
    SouthAfrica: ["Dlamini","Nkosi","Sithole","Mkhize","Mthembu","Zulu","Khumalo","Mokoena","Mahlangu","Molefe"],
    Germany: ["Müller","Schmidt","Schneider","Fischer","Weber","Meyer","Wagner","Becker","Hoffmann","Schulz"],
    Indonesia: ["Santoso","Wijaya","Pratama","Hidayat","Saputra","Kusuma","Nugroho","Setiawan","Wahyuni","Lestari"],
    Mexico: ["Hernandez","Garcia","Martinez","Lopez","Gonzalez","Perez","Rodriguez","Sanchez","Ramirez","Flores"]
  };

  const basePersonas = [
    { country:"Nigeria", timezone:"Africa/Lagos", type:"beginner", intent:"learner", typing:[900,1800], grammar:"informal", slang:0.7, activity:"high", online:[7,23] },
    { country:"United Kingdom", timezone:"Europe/London", type:"intermediate", intent:"engaged", typing:[1200,2400], grammar:"clean", slang:0.3, activity:"medium", online:[8,22] },
    { country:"UAE", timezone:"Asia/Dubai", type:"advanced", intent:"authority", typing:[600,1200], grammar:"clean", slang:0.1, activity:"low", online:[9,23] },
    { country:"US", timezone:"America/New_York", type:"intermediate", intent:"flex", typing:[700,1500], grammar:"casual", slang:0.8, activity:"high", online:[6,24] },
    { country:"India", timezone:"Asia/Kolkata", type:"beginner", intent:"confused", typing:[1500,3000], grammar:"formal", slang:0.1, activity:"medium", online:[9,23] },
    { country:"Brazil", timezone:"America/Sao_Paulo", type:"intermediate", intent:"community", typing:[1000,2200], grammar:"mixed", slang:0.5, activity:"high", online:[8,24] },
    { country:"SouthAfrica", timezone:"Africa/Johannesburg", type:"intermediate", intent:"engaged", typing:[1100,2000], grammar:"clean", slang:0.4, activity:"medium", online:[7,22] },
    { country:"Germany", timezone:"Europe/Berlin", type:"advanced", intent:"authority", typing:[800,1400], grammar:"clean", slang:0.1, activity:"low", online:[8,23] },
    { country:"Indonesia", timezone:"Asia/Jakarta", type:"beginner", intent:"learner", typing:[1000,1800], grammar:"informal", slang:0.5, activity:"high", online:[8,22] },
    { country:"Mexico", timezone:"America/Mexico_City", type:"intermediate", intent:"community", typing:[900,1700], grammar:"mixed", slang:0.6, activity:"high", online:[8,24] }
  ];

  // ---------- BUILD PERSONAS ----------
  const personas = [];
  let idCounter = 1;

  basePersonas.forEach(base => {
    const fNames = firstNames[base.country];
    const lNames = lastNames[base.country];
    for (let i = 0; i < 45; i++) {
      const firstName = fNames[i % fNames.length];
      const lastName = lNames[Math.floor(i / 5) % lNames.length];
      let displayName;
      const r = Math.random();
      if (r < 0.3) displayName = firstName;
      else if (r < 0.6) displayName = `${firstName} ${lastName}`;
      else if (r < 0.8) displayName = `${firstName} ${lastName.charAt(0)}.`;
      else displayName = `${firstName}${Math.floor(Math.random()*100)}`;
      if (Math.random() < 0.25) displayName += ' ' + pick(['🔥','💸','📈','⭐','🌟','💎','🚀','🎯','🏆']);
      
      const gender = getGenderFromName(firstName);
      const archetype = assignArchetype();
      const avatarUrl = getAvatarUrl(displayName, gender);
      
      personas.push({
        id: `p_${idCounter++}`,
        name: displayName,
        avatar: avatarUrl,
        country: base.country,
        timezone: base.timezone,
        type: base.type,
        intent: base.intent,
        archetype: archetype.name,
        activityMult: archetype.activityMult,
        traits: archetype.traits,
        allowedTypes: archetype.messageTypes,
        typingSpeed: [base.typing[0]+i*5, base.typing[1]+i*10],
        grammar: base.grammar,
        slangLevel: Math.min(1, base.slang + (Math.random()*0.2-0.1)),
        activityLevel: base.activity,
        onlineHours: base.online,
        messageBank: {}
      });
    }
  });

  personas.forEach(p => {
    const bank = { ...globalPhraseBank };
    if (regionalPhrases[p.country]) {
      bank.greeting = [...bank.greeting, ...regionalPhrases[p.country].slice(0,5)];
      bank.reaction = [...bank.reaction, ...regionalPhrases[p.country].slice(2,7)];
    }
    if (p.intent === 'learner') bank.question = [...bank.question, ...globalPhraseBank.confused.slice(0,10)];
    else if (p.intent === 'flex') { bank.flex = [...bank.flex, ...globalPhraseBank.result.slice(5,15)]; bank.hype = [...bank.hype, ...globalPhraseBank.flex]; }
    else if (p.intent === 'authority') bank.advice = [...bank.advice, ...globalPhraseBank.advice];
    if (p.archetype === 'sarcastic') bank.sarcastic = globalPhraseBank.sarcastic;
    if (p.archetype === 'funny') bank.funny = globalPhraseBank.funny;
    if (p.archetype === 'analytical') bank.analytical = globalPhraseBank.analytical;
    p.messageBank = bank;
  });

  // ---------- SIMULATION STATE ----------
  let activeTimeouts = [], lastMessageType = null, lastPersonaId = null, simulationActive = false, tradeResultInterval = null;
  const recentMessages = [];
  const chatAPI = window.chatAPI || {};

  function isPersonaOnline(p){ try{ const h = new Date(new Date().toLocaleString('en-US',{timeZone:p.timezone})).getHours(); return h>=p.onlineHours[0] && h<p.onlineHours[1]; }catch{ return true; } }
  function getActivePersonas(){ return personas.filter(p=>isPersonaOnline(p) && (Math.random() < (1 - CONFIG.WATCHER_ACTIVITY_PENALTY * (p.archetype === 'watcher' ? 1 : 0)))); }
  function pickDifferentPersona(){ const active = getActivePersonas(); if(!active.length) return null; let f = active.filter(p=>p.id!==lastPersonaId); if(!f.length) f=active; return pick(f); }

  function applyTypos(text){
    if(Math.random() > 0.2) return text;
    const words = text.split(' ');
    return words.map(w => {
      if(w.length < 4 || Math.random() > 0.1) return w;
      const pos = Math.floor(Math.random() * (w.length - 1));
      const chars = w.split('');
      [chars[pos], chars[pos+1]] = [chars[pos+1], chars[pos]];
      return chars.join('');
    }).join(' ');
  }

  function generateMessage(persona, forcedType=null){
    let type = forcedType;
    if(!type){
      const allowed = persona.allowedTypes;
      if(lastMessageType && conversationFlow[lastMessageType]){
        const possible = conversationFlow[lastMessageType].filter(t => allowed.includes(t) && persona.messageBank[t]?.length);
        if(possible.length) type = pick(possible);
      }
      if(!type) type = pick(allowed.filter(t => persona.messageBank[t]?.length) || [MessageType.GREETING]);
    }
    if(!persona.messageBank[type]?.length) type = pick(Object.keys(persona.messageBank));
    let text = pick(persona.messageBank[type]);
    if(persona.slangLevel > 0.6 && Math.random() > 0.5) text = text.replace(/going to/g,'gonna').replace(/want to/g,'wanna');
    if(persona.grammar === 'informal' && Math.random() > 0.6) text = text.replace(/you are/g,'you\'re').replace(/I am/g,'I\'m');
    if(Math.random() > 0.4){
      if(persona.archetype === 'sarcastic') text += ' 😏';
      else if(persona.archetype === 'funny') text += ' 😂';
      else if(persona.archetype === 'analytical') text += ' 📊';
      else text += ' ' + pick(['👍','😊','💪','🔥']);
    }
    lastMessageType = type;
    return { text: applyTypos(text), type };
  }

  function getTypingDelay(p, len){ return Math.min(randomBetween(p.typingSpeed[0], p.typingSpeed[1]) * len, 6000); }
  function showTyping(p){ if(chatAPI.showTypingForPersona) chatAPI.showTypingForPersona(p); }
  function hideTyping(){ if(chatAPI.hideTyping) chatAPI.hideTyping(); }
  function shouldAttachImage(p, type){ 
    if(type === MessageType.TESTIMONIAL) return Math.random() < 0.4;
    if(type === MessageType.RESULT && p.intent === 'flex') return Math.random() < 0.3;
    return false;
  }
  function getRandomTestimonialImage(){ return getNextTestimonialImage(); }

  function isGeneralChatActive() { return window.__activeChatRoom === 'general' && chatAPI.isChatRoomActive?.(); }

  function sendPersonaMessage(persona, replyTo=null){
    if (!isGeneralChatActive()) return;
    if(persona.archetype === 'watcher' && Math.random() > 0.15) return;
    const isTestimonial = Math.random() < CONFIG.TESTIMONIAL_CHANCE && persona.messageBank[MessageType.TESTIMONIAL];
    let { text, type } = generateMessage(persona, isTestimonial ? MessageType.TESTIMONIAL : null);
    const now = new Date(); const timeStr = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
    let imageUrl = shouldAttachImage(persona, type) ? getRandomTestimonialImage() : null;
    const msgData = { senderName: persona.name, senderAvatar: persona.avatar, text, time: timeStr, personaId: persona.id, messageType: type, imageUrl };
    if(replyTo) msgData.replyTo = { senderName: replyTo.senderName, text: replyTo.text.substring(0,50) };
    if(chatAPI.addIncomingMessage){
      const el = chatAPI.addIncomingMessage(msgData);
      if(el) { recentMessages.push({ id: persona.id+'_'+Date.now(), personaId: persona.id, senderName: persona.name, text, element: el }); if(recentMessages.length>30) recentMessages.shift(); }
    }
    lastPersonaId = persona.id;
    log(`${persona.name} (${persona.archetype}): ${text}`);
  }

  function simulateJoin(){
    if (!isGeneralChatActive()) return;
    const country = pick(Object.keys(firstNames));
    const firstName = pick(firstNames[country]), lastName = pick(lastNames[country]);
    const name = `${firstName} ${lastName}`;
    const gender = getGenderFromName(firstName);
    const avatar = getAvatarUrl(name, gender);
    const joinText = pick(globalPhraseBank.join).replace('[country]', country);
    const now = new Date(); const timeStr = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
    if(chatAPI.addSystemMessage) chatAPI.addSystemMessage({ text: `🎉 ${name} ${joinText}`, time: timeStr });
    setTimeout(()=>{ if(!simulationActive) return; showTyping({name, avatar}); setTimeout(()=>{ hideTyping(); if(chatAPI.addIncomingMessage) chatAPI.addIncomingMessage({ senderName:name, senderAvatar:avatar, text: pick(["thanks for the warm welcome!","excited to be here","hello everyone!"]), time: new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}), personaId:'join_'+Date.now() }); },1500); },3000);
  }

  let activeCluster = null;
  function maybeSendReply(){
    if(!recentMessages.length || Math.random() > 0.3) return false;
    
    if(activeCluster && activeCluster.count < 4 && Math.random() < 0.6){
      const target = recentMessages[recentMessages.length-1];
      if(target && target.text.toLowerCase().includes(activeCluster.topic)){
        const persona = pickDifferentPersona();
        if(persona && !activeCluster.participants.includes(persona.id)){
          activeCluster.participants.push(persona.id);
          activeCluster.count++;
          const replyText = pick(["same here", "agreed", "what he said", "facts", "this", "exactly", "👆"]);
          const now = new Date(); const timeStr = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
          if(chatAPI.addIncomingMessage){
            chatAPI.addIncomingMessage({
              senderName: persona.name,
              senderAvatar: persona.avatar,
              text: replyText,
              time: timeStr,
              personaId: persona.id,
              replyTo: { senderName: target.senderName, text: target.text.substring(0,50) }
            });
          }
          lastPersonaId = persona.id;
          return true;
        }
      } else { activeCluster = null; }
    }
    
    const candidates = recentMessages.filter(m => m.personaId !== lastPersonaId);
    if(candidates.length === 0) return false;
    const target = pick(candidates);
    const persona = pickDifferentPersona();
    if(!persona) return false;
    
    if(Math.random() < 0.2 && target.text.length > 20 && !activeCluster){
      const keywords = target.text.split(' ').filter(w => w.length > 5);
      if(keywords.length){
        activeCluster = { topic: keywords[0].toLowerCase(), participants: [target.personaId, persona.id], count: 2 };
      }
    }
    
    let replyText = "";
    const lowerText = target.text.toLowerCase();
    if(lowerText.includes("win") || lowerText.includes("profit") || lowerText.includes("%") || lowerText.includes("tp")){
      replyText = pick(["nice win! 🔥", "congrats on that profit", "that's what I'm talking about", "let's gooo", "🚀🚀", "well played"]);
    } else if(lowerText.includes("loss") || lowerText.includes("lost") || lowerText.includes("stop") || lowerText.includes("missed")){
      replyText = pick(["tough one mate", "next trade will be better", "happens to everyone", "keep your head up", "you'll get the next one", "part of the game"]);
    } else if(lowerText.includes("?") || lowerText.includes("how") || lowerText.includes("what")){
      replyText = pick(["good question", "I was wondering the same", "anyone have an answer?", "would like to know too", "curious about that as well"]);
    } else if(lowerText.includes("signal") || lowerText.includes("entry") || lowerText.includes("trade")){
      replyText = pick(["following this 📈", "already in", "looks solid", "agree with the setup", "I'm watching this too"]);
    } else if(lowerText.includes("testimonial") || lowerText.includes("proof") || lowerText.includes("withdrawal")){
      replyText = pick(["nice! keep it up", "love to see it", "inspiring", "motivating", "this is the way"]);
    } else {
      replyText = pick(["exactly!", "well said", "facts 💯", "this 👆", "couldn't agree more", "🔥🔥", "for real", "no cap"]);
    }
    
    const now = new Date(); const timeStr = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
    if(chatAPI.addIncomingMessage){
      chatAPI.addIncomingMessage({
        senderName: persona.name,
        senderAvatar: persona.avatar,
        text: replyText,
        time: timeStr,
        personaId: persona.id,
        replyTo: { senderName: target.senderName, text: target.text.substring(0,50) }
      });
      log(`🤖 ${persona.name} replied to ${target.senderName}: "${replyText}"`);
    }
    lastPersonaId = persona.id;
    return true;
  }

  function triggerBurst(){
    const count = randomBetween(2, CONFIG.MAX_BURST_MESSAGES);
    let sent = 0;
    const int = setInterval(()=>{
      if(sent>=count){ clearInterval(int); return; }
      const p = pickDifferentPersona();
      if(p && !(p.archetype === 'watcher' && Math.random() > 0.2)){
        const {text} = generateMessage(p);
        showTyping(p);
        setTimeout(()=>{ hideTyping(); sendPersonaMessage(p); }, getTypingDelay(p, text.length));
        sent++;
      } else { sent++; }
    }, randomBetween(800, 2000));
    activeTimeouts.push(int);
  }

  function simulationTick(){
    if(!simulationActive || !isGeneralChatActive()) return;
    if(Math.random() < CONFIG.JOIN_CHANCE) simulateJoin();
    if(maybeSendReply()){ activeTimeouts.push(setTimeout(simulationTick, CONFIG.BASE_INTERVAL+randomBetween(-2000,5000))); return; }
    if(Math.random() < CONFIG.BURST_CHANCE) triggerBurst();
    else {
      const p = pickDifferentPersona();
      if(p && !(p.archetype === 'watcher' && Math.random() > 0.2)){
        const {text} = generateMessage(p);
        showTyping(p);
        activeTimeouts.push(setTimeout(()=>{ hideTyping(); sendPersonaMessage(p); }, getTypingDelay(p, text.length)+randomBetween(1000,4000)));
      }
    }
    activeTimeouts.push(setTimeout(simulationTick, CONFIG.BASE_INTERVAL+randomBetween(-2000,5000)));
  }

  function injectTradeResult(){
    if (!isGeneralChatActive()) return;
    const pair = pick(["EUR/USD","GBP/USD","USD/JPY","AUD/USD","EUR/GBP","USD/CHF","NZD/USD","US30","GER40"]);
    const percent = pick(["+92%","+87%","+78%","+95%","+83%","+91%","+76%","+88%","+84%","+79%","+96%","+81%","+73%","+89%"]);
    if(Math.random() > 0.5){
      const p = pickDifferentPersona();
      if(p && !(p.archetype === 'watcher' && Math.random() > 0.2)){
        const text = pick([`just closed ${pair} at ${percent} 🎯`,`${pair} hit TP ${percent}`,`easy ${percent} on ${pair}`]);
        const now = new Date(); const timeStr = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
        if(chatAPI.addIncomingMessage) chatAPI.addIncomingMessage({ senderName: p.name, senderAvatar: p.avatar, text, time: timeStr, personaId: p.id, messageType: MessageType.RESULT });
        lastPersonaId = p.id; lastMessageType = MessageType.RESULT;
        return;
      }
    }
    const text = `📊 Signal Result: ${pair} ${percent} ✅`;
    const now = new Date(); const timeStr = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
    if(chatAPI.addSystemMessage) chatAPI.addSystemMessage({ text, time: timeStr });
    else if(chatAPI.addIncomingMessage) chatAPI.addIncomingMessage({ senderName:"Trade Result", senderAvatar:"📈", text, time: timeStr, personaId:'system' });
  }

  function startSimulation(){ if(simulationActive) return; simulationActive=true; lastMessageType=null; lastPersonaId=null; log('🚀 Simulation started'); simulationTick(); }
  function stopSimulation(){ simulationActive=false; activeTimeouts.forEach(clearTimeout); activeTimeouts=[]; hideTyping(); log('🛑 Simulation stopped'); }
  function startTradeResultInjection(){ if(tradeResultInterval) clearInterval(tradeResultInterval); tradeResultInterval = setInterval(()=>{ if(!simulationActive||!isGeneralChatActive()) return; if(Math.random()<CONFIG.TRADE_RESULT_CHANCE) injectTradeResult(); }, CONFIG.TRADE_RESULT_INTERVAL); }

  function syncSimulationState() {
    const active = isGeneralChatActive();
    if (active && !simulationActive) { startSimulation(); startTradeResultInjection(); }
    else if (!active && simulationActive) { stopSimulation(); }
  }

  window.addEventListener('chat-room-changed', syncSimulationState);
  setInterval(syncSimulationState, 1000);
  syncSimulationState();

  window.AIPersonaSimulator = { isActive: ()=>simulationActive, getPersonas: ()=>personas };

  // ====================== V4: MEMORY & PERSISTENCE ======================
  const STORAGE_KEY = "ai_chat_history_v4";
  const PERSONA_KEY = "ai_persona_state_v4";
  const load = key => { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } };
  const save = (key, data) => { localStorage.setItem(key, JSON.stringify(data)); };
  const personaState = load(PERSONA_KEY);
  const chatHistory = load(STORAGE_KEY) || [];
  personas.forEach(p => { if(!personaState[p.id]) personaState[p.id] = { wins:0, losses:0, streak:0, confidence:Math.random(), lastMessages:[] }; });
  const topTraderIds = personas.sort(()=>Math.random()-0.5).slice(0,10).map(p=>p.id);
  const isTopTrader = id => topTraderIds.includes(id);
  let sentiment = "neutral";
  function updateSentiment(){ let wins=0,losses=0; Object.values(personaState).forEach(s=>{ wins+=s.wins; losses+=s.losses; }); sentiment = wins>losses*1.5?"hype":losses>wins?"fear":"neutral"; }
  function filterRepeat(state, text){ if(state.lastMessages.includes(text)) text += " " + ["again","fr","🔥","no cap"][Math.floor(Math.random()*4)]; state.lastMessages.push(text); if(state.lastMessages.length>6) state.lastMessages.shift(); return text; }
  const originalAddIncoming = chatAPI.addIncomingMessage;
  if(originalAddIncoming){
    chatAPI.addIncomingMessage = function(data){
      const state = personaState[data.personaId];
      if(state){
        data.text = filterRepeat(state, data.text);
        if(state.streak >= 3) data.text += " 🔥 streak";
        if(state.losses > state.wins && Math.random() < 0.3) data.text += " 😤";
        if(isTopTrader(data.personaId) && Math.random() < 0.25) data.text += " 📊";
      }
      const res = originalAddIncoming.call(this, data);
      chatHistory.push(data);
      if(chatHistory.length > 120) chatHistory.shift();
      save(STORAGE_KEY, chatHistory);
      save(PERSONA_KEY, personaState);
      return res;
    };
  }
  const originalInject = injectTradeResult;
  window.AIPersonaSimulator.injectTradeResult = function(){
    originalInject();
    const p = personas[Math.floor(Math.random()*personas.length)];
    const state = personaState[p.id];
    const win = Math.random() > 0.35;
    if(win){ state.wins++; state.streak++; state.confidence += 0.05; }
    else { state.losses++; state.streak = 0; state.confidence -= 0.05; }
    updateSentiment();
    save(PERSONA_KEY, personaState);
  };

  window.onUserMessage = function(msg) {
    recentMessages.push({ id: 'user_'+Date.now(), personaId:'user', senderName:msg.senderName, text:msg.text, element:null });
    if(recentMessages.length > 30) recentMessages.shift();
    log(`User message added: ${msg.text}`);
  };

  log(`🤖 AI Persona Engine v6 loaded with ${personas.length} personas (randomuser 80%, picsum 10%, unsplash 5%, text 5%). Local testimonial images (${TOTAL_TESTIMONIALS}) with duplicate avoidance.`);
})();
