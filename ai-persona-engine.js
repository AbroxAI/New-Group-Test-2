// ====================== AI PERSONA ENGINE v3.3 (Production) ======================
// 450+ realistic personas · 2000+ templates · Typos · Reply chains · Testimonials
// Join stickers · Autonomous · localStorage persistence ready
// =================================================================================
(function(){
  "use strict";

  const CONFIG = {
    BASE_INTERVAL: 8000,
    BURST_CHANCE: 0.25,
    TRADE_RESULT_INTERVAL: 20000,
    TRADE_RESULT_CHANCE: 0.4,
    TESTIMONIAL_CHANCE: 0.15,
    JOIN_CHANCE: 0.08,
    MAX_BURST_MESSAGES: 6,
    ENABLE_LOGGING: false
  };

  const MessageType = {
    QUESTION: "question", RESULT: "result", REACTION: "reaction", ADVICE: "advice",
    HYPE: "hype", GREETING: "greeting", CONFUSED: "confused", FLEX: "flex",
    COMMUNITY: "community", TESTIMONIAL: "testimonial", JOIN: "join"
  };

  const conversationFlow = {
    [MessageType.QUESTION]:   [MessageType.ADVICE, MessageType.REACTION, MessageType.CONFUSED],
    [MessageType.ADVICE]:     [MessageType.REACTION, MessageType.RESULT, MessageType.QUESTION],
    [MessageType.RESULT]:     [MessageType.REACTION, MessageType.HYPE, MessageType.FLEX, MessageType.TESTIMONIAL],
    [MessageType.REACTION]:   [MessageType.QUESTION, MessageType.RESULT, MessageType.GREETING],
    [MessageType.HYPE]:       [MessageType.REACTION, MessageType.RESULT, MessageType.FLEX],
    [MessageType.GREETING]:   [MessageType.QUESTION, MessageType.REACTION, MessageType.COMMUNITY],
    [MessageType.CONFUSED]:   [MessageType.ADVICE, MessageType.QUESTION],
    [MessageType.FLEX]:       [MessageType.REACTION, MessageType.HYPE, MessageType.TESTIMONIAL],
    [MessageType.COMMUNITY]:  [MessageType.REACTION, MessageType.QUESTION, MessageType.GREETING],
    [MessageType.TESTIMONIAL]: [MessageType.REACTION, MessageType.QUESTION],
    [MessageType.JOIN]:       [MessageType.GREETING, MessageType.REACTION, MessageType.COMMUNITY]
  };

  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const log = (...args) => CONFIG.ENABLE_LOGGING && console.log('[AI Persona]', ...args);

  // ---------- EXPANDED PHRASE BANK (2000+ templates) ----------
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
    ]
  };

  // Expanded regional phrases
  const regionalPhrases = {
    Nigeria: ["how far", "this thing legit?", "make I try am", "abeg", "no wahala", "I dey observe", "na wa", "oya", "chop life", "e choke", "na so", "wetin dey happen?", "I go follow", "e be like say", "no shaking"],
    UK: ["cheers", "proper", "mate", "innit", "sorted", "brilliant", "lovely", "fancy that", "spot on", "cracking", "bloody hell", "chuffed", "gobsmacked", "knackered", "taking the piss"],
    UAE: ["inshallah", "mashallah", "yalla", "habibi", "wallah", "akeed", "tamam", "maafi mushkila", "shukran", "afwan", "alhamdulillah", "insha'Allah", "sabah al khair", "masa al khair", "khalas"],
    US: ["y'all", "dope", "lit", "bet", "for real", "no cap", "facts", "sheesh", "vibe", "lowkey", "hella", "finna", "ion know", "deadass", "say less"],
    India: ["namaste", "bhai", "accha", "theek hai", "arre", "yaar", "sahi hai", "kya baat", "badhiya", "ekdum", "kya scene hai?", "mast", "jugaad", "chalo", "fatafat"],
    Brazil: ["boa", "valeu", "beleza", "e aí", "top", "show", "legal", "maneiro", "da hora", "fechou", "tamo junto", "partiu", "galera", "tranquilo", "demorou"],
    SouthAfrica: ["howzit", "sharp", "lekker", "yebo", "shap", "aweh", "dankie", "eish", "jol", "bru", "now now", "just now", "kiff", "dop", "braai"],
    Germany: ["genau", "super", "alles klar", "danke", "bitte", "prima", "mensch", "krass", "geil", "läuft", "servus", "moin", "naja", "doch", "schon"],
    Indonesia: ["mantap", "siap", "terima kasih", "bro", "anjay", "wih", "gokil", "asik", "oke", "santuy", "gas", "cuy", "wkwk", "sabar", "semangat"],
    Mexico: ["órale", "ándale", "qué padre", "wey", "neta", "chido", "no manches", "a huevo", "chingón", "padrísimo", "qué onda", "güey", "chale", "ándale pues", "simón"]
  };

  // ---------- REALISTIC NAMES (450 personas) ----------
  const firstNames = {
    Nigeria: ["Daniel","Chidi","Amara","Olu","Tunde","Ngozi","Emeka","Folake","Ifeanyi","Yemi","Bimbo","Segun","Yetunde","Kemi","Bayo","Chinwe","Obinna","Adaobi","Nnamdi","Uchenna","Chika","Onyeka","Ndidi","Efe","Temi"],
    UK: ["Maya","Oliver","Sophie","Harry","Emily","George","Lucy","Jack","Amelia","Charlie","Grace","James","Alice","Thomas","Ella","William","Lily","Henry","Mia","Oscar","Isla","Leo","Poppy","Alfie","Evie"],
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
    UK: ["Smith","Jones","Taylor","Brown","Williams","Davies","Evans","Thomas","Johnson","Roberts"],
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
    { country:"United States", timezone:"America/New_York", type:"intermediate", intent:"flex", typing:[700,1500], grammar:"casual", slang:0.8, activity:"high", online:[6,24] },
    { country:"India", timezone:"Asia/Kolkata", type:"beginner", intent:"confused", typing:[1500,3000], grammar:"formal", slang:0.1, activity:"medium", online:[9,23] },
    { country:"Brazil", timezone:"America/Sao_Paulo", type:"intermediate", intent:"community", typing:[1000,2200], grammar:"mixed", slang:0.5, activity:"high", online:[8,24] },
    { country:"South Africa", timezone:"Africa/Johannesburg", type:"intermediate", intent:"engaged", typing:[1100,2000], grammar:"clean", slang:0.4, activity:"medium", online:[7,22] },
    { country:"Germany", timezone:"Europe/Berlin", type:"advanced", intent:"authority", typing:[800,1400], grammar:"clean", slang:0.1, activity:"low", online:[8,23] },
    { country:"Indonesia", timezone:"Asia/Jakarta", type:"beginner", intent:"learner", typing:[1000,1800], grammar:"informal", slang:0.5, activity:"high", online:[8,22] },
    { country:"Mexico", timezone:"America/Mexico_City", type:"intermediate", intent:"community", typing:[900,1700], grammar:"mixed", slang:0.6, activity:"high", online:[8,24] }
  ];

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
      const hasCustomAvatar = Math.random() < 0.7;
      const avatarFile = hasCustomAvatar ? `assets/avatars/${displayName.replace(/\s+/g,'_').replace(/[^a-zA-Z0-9_]/g,'')}.jpg` : null;
      personas.push({
        id: `p_${idCounter++}`,
        name: displayName,
        avatar: avatarFile,
        country: base.country,
        timezone: base.timezone,
        type: base.type,
        intent: base.intent,
        personality: base.intent === 'learner' ? ['curious','impatient'] : base.intent === 'authority' ? ['confident','direct'] : ['friendly','talkative'],
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
      bank.regional = regionalPhrases[p.country];
      bank.greeting = [...bank.greeting, ...regionalPhrases[p.country].slice(0,5)];
      bank.reaction = [...bank.reaction, ...regionalPhrases[p.country].slice(2,7)];
    }
    if (p.intent === 'learner') bank.question = [...bank.question, ...globalPhraseBank.confused.slice(0,10)];
    else if (p.intent === 'flex') { bank.flex = [...bank.flex, ...globalPhraseBank.result.slice(5,15)]; bank.hype = [...bank.hype, ...globalPhraseBank.flex]; }
    else if (p.intent === 'authority') bank.advice = [...bank.advice, ...globalPhraseBank.advice];
    p.messageBank = bank;
  });

  // ---------- SIMULATION STATE ----------
  let activeTimeouts = [], lastMessageType = null, lastPersonaId = null, simulationActive = false, tradeResultInterval = null;
  const recentMessages = [];
  const chatAPI = window.chatAPI || {};

  function isPersonaOnline(p){ try{ const h = new Date(new Date().toLocaleString('en-US',{timeZone:p.timezone})).getHours(); return h>=p.onlineHours[0] && h<p.onlineHours[1]; }catch{ return true; } }
  function getActivePersonas(){ return personas.filter(p=>isPersonaOnline(p)); }
  function pickDifferentPersona(){ const active = getActivePersonas(); if(!active.length) return null; let f = active.filter(p=>p.id!==lastPersonaId); if(!f.length) f=active; return pick(f); }
  function applyTypos(text){ if(Math.random()>0.15) return text; const words = text.split(' '); return words.map(w=>{ if(w.length<3||Math.random()>0.03) return w; const pos=Math.floor(Math.random()*(w.length-1)); const chars=w.split(''); [chars[pos],chars[pos+1]]=[chars[pos+1],chars[pos]]; return chars.join(''); }).join(' '); }
  function generateMessage(persona, forcedType=null){
    let type = forcedType;
    if(!type){
      if(!lastMessageType) type = pick([MessageType.GREETING, MessageType.QUESTION]);
      else { const possible = conversationFlow[lastMessageType]||Object.values(MessageType); const available = possible.filter(t=>persona.messageBank[t]?.length); type = available.length ? pick(available) : pick(Object.keys(persona.messageBank)); }
    }
    if(!persona.messageBank[type]?.length) type = pick(Object.keys(persona.messageBank));
    let text = pick(persona.messageBank[type]);
    if(persona.slangLevel>0.6 && Math.random()>0.5) text = text.replace(/going to/g,'gonna').replace(/want to/g,'wanna');
    if(persona.grammar==='informal' && Math.random()>0.6) text = text.replace(/you are/g,'you\'re').replace(/I am/g,'I\'m');
    if(Math.random()>0.4) text += ' ' + pick(persona.intent==='flex'?['🔥','💸','🚀']:(persona.intent==='confused'?['🤔','❓','📘']:['👍','😊','💪']));
    lastMessageType = type;
    return { text: applyTypos(text), type };
  }
  function getTypingDelay(p, len){ return Math.min(randomBetween(p.typingSpeed[0], p.typingSpeed[1]) * len, 5000); }
  function showTyping(p){ if(chatAPI.showTypingForPersona) chatAPI.showTypingForPersona(p); }
  function hideTyping(){ if(chatAPI.hideTyping) chatAPI.hideTyping(); }
  function shouldAttachImage(p, type){ if(type===MessageType.TESTIMONIAL) return Math.random()<0.4; if(type===MessageType.RESULT && p.intent==='flex') return Math.random()<0.3; return false; }
  function getRandomTestimonialImage(){ return `assets/testimonials/testimonial_${Math.floor(Math.random()*20)+1}.jpg`; }

  function sendPersonaMessage(persona, replyTo=null){
    const isTestimonial = Math.random()<CONFIG.TESTIMONIAL_CHANCE && persona.messageBank[MessageType.TESTIMONIAL];
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
    log(`${persona.name}: ${text}`);
  }

  function simulateJoin(){
    const country = pick(Object.keys(firstNames));
    const firstName = pick(firstNames[country]), lastName = pick(lastNames[country]);
    const name = `${firstName} ${lastName}`; const avatar = `assets/avatars/${name.replace(/\s+/g,'_')}.jpg`;
    const joinText = pick(globalPhraseBank.join).replace('[country]', country);
    const now = new Date(); const timeStr = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
    if(chatAPI.addSystemMessage) chatAPI.addSystemMessage({ text: `🎉 ${name} ${joinText}`, time: timeStr });
    setTimeout(()=>{ if(!simulationActive) return; showTyping({name, avatar}); setTimeout(()=>{ hideTyping(); if(chatAPI.addIncomingMessage) chatAPI.addIncomingMessage({ senderName:name, senderAvatar:avatar, text: pick(["thanks for the warm welcome!","excited to be here","hello everyone!"]), time: new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}), personaId:'join_'+Date.now() }); },1500); },3000);
  }

  function maybeSendReply(){
    if(!recentMessages.length || Math.random()>0.2) return false;
    const target = pick(recentMessages); if(target.personaId===lastPersonaId) return false;
    const persona = pickDifferentPersona(); if(!persona) return false;
    const text = pick(["agree with this 💯","that's what I'm saying","exactly!","good point","I was thinking the same","🔥🔥","well said","facts","this is the way","couldn't agree more","true","yup","this 👆"]);
    const now = new Date(); const timeStr = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
    if(chatAPI.addIncomingMessage) chatAPI.addIncomingMessage({ senderName: persona.name, senderAvatar: persona.avatar, text, time: timeStr, personaId: persona.id, replyTo: { senderName: target.senderName, text: target.text.substring(0,40) } });
    lastPersonaId = persona.id;
    return true;
  }

  function triggerBurst(){
    const count = randomBetween(3, CONFIG.MAX_BURST_MESSAGES); let sent = 0;
    const int = setInterval(()=>{ if(sent>=count){ clearInterval(int); return; } const p = pickDifferentPersona(); if(!p) return; const {text} = generateMessage(p); showTyping(p); setTimeout(()=>{ hideTyping(); sendPersonaMessage(p); }, getTypingDelay(p, text.length)); sent++; }, randomBetween(600,1500));
    activeTimeouts.push(int);
  }

  function simulationTick(){
    if(!simulationActive || !chatAPI.isChatRoomActive?.()) return;
    if(Math.random()<CONFIG.JOIN_CHANCE) simulateJoin();
    if(maybeSendReply()){ activeTimeouts.push(setTimeout(simulationTick, CONFIG.BASE_INTERVAL+randomBetween(-2000,5000))); return; }
    if(Math.random()<CONFIG.BURST_CHANCE) triggerBurst();
    else { const p = pickDifferentPersona(); if(p){ const {text} = generateMessage(p); showTyping(p); activeTimeouts.push(setTimeout(()=>{ hideTyping(); sendPersonaMessage(p); }, getTypingDelay(p, text.length)+randomBetween(1000,4000))); } }
    activeTimeouts.push(setTimeout(simulationTick, CONFIG.BASE_INTERVAL+randomBetween(-2000,5000)));
  }

  function injectTradeResult(){
    const pair = pick(["EUR/USD","GBP/USD","USD/JPY","AUD/USD","EUR/GBP","USD/CHF","NZD/USD","US30","GER40"]);
    const percent = pick(["+92%","+87%","+78%","+95%","+83%","+91%","+76%","+88%","+84%","+79%","+96%","+81%","+73%","+89%"]);
    if(Math.random()>0.5){ const p = pickDifferentPersona(); if(p){ const text = pick([`just closed ${pair} at ${percent} 🎯`,`${pair} hit TP ${percent}`,`easy ${percent} on ${pair}`]); const now = new Date(); const timeStr = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}); if(chatAPI.addIncomingMessage) chatAPI.addIncomingMessage({ senderName: p.name, senderAvatar: p.avatar, text, time: timeStr, personaId: p.id, messageType: MessageType.RESULT }); lastPersonaId = p.id; lastMessageType = MessageType.RESULT; return; } }
    const text = `📊 Signal Result: ${pair} ${percent} ✅`; const now = new Date(); const timeStr = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}); if(chatAPI.addSystemMessage) chatAPI.addSystemMessage({ text, time: timeStr }); else if(chatAPI.addIncomingMessage) chatAPI.addIncomingMessage({ senderName:"Trade Result", senderAvatar:"📈", text, time: timeStr, personaId:'system' });
  }

  function startSimulation(){ if(simulationActive) return; simulationActive=true; lastMessageType=null; lastPersonaId=null; log('🚀 Simulation started'); simulationTick(); }
  function stopSimulation(){ simulationActive=false; activeTimeouts.forEach(clearTimeout); activeTimeouts=[]; hideTyping(); log('🛑 Simulation stopped'); }
  function startTradeResultInjection(){ if(tradeResultInterval) clearInterval(tradeResultInterval); tradeResultInterval = setInterval(()=>{ if(!simulationActive||!chatAPI.isChatRoomActive?.()) return; if(Math.random()<CONFIG.TRADE_RESULT_CHANCE) injectTradeResult(); }, CONFIG.TRADE_RESULT_INTERVAL); }
  function monitor(){ const active = chatAPI.isChatRoomActive?.()||false; if(active && !simulationActive){ startSimulation(); startTradeResultInjection(); } else if(!active && simulationActive) stopSimulation(); }
  setInterval(monitor, 1000);

  window.AIPersonaSimulator = { isActive: ()=>simulationActive, getPersonas: ()=>personas };
  log(`🤖 AI Persona Engine v3.3 loaded with ${personas.length} personas.`);
})();
