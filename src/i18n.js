/* ═══════════════════════════════════════════════
   Intent Mirror — i18n (B2C)
   Full EN / हिंदी labels for the personal money copilot.
   Dynamic copy (persona reasoning, activity, suggestions) is
   translated in data/portfolio.js and suggestions.js via `lang`.
═══════════════════════════════════════════════ */

export const LABELS = {
  EN: {
    nav: { money: 'My Money', wealth: 'Wealth Hub', identity: 'Identity', family: 'Family', signOut: 'Sign out' },

    family: {
      // Parent panel
      parentTitle: 'Family — Money Quest for kids',
      parentSub: 'Set up a safe, gamified money journey for your child. They learn by doing — with guardrails you control.',
      kidName: "Child's name", allowance: 'Weekly allowance (₹)',
      goalName: 'Savings goal', goalTarget: 'Goal amount (₹)',
      save: 'Save settings', saved: 'Saved ✓',
      startQuest: '🚀 Start Money Quest',
      whyTitle: 'Why this matters',
      whyBody: "Money isn't taught in most schools, and kids can't open bank accounts — so they reach adulthood having never practised. Money Quest gives every child a safe first wallet and bite-sized lessons, in any language.",
      // Kid view
      greeting: (name) => `Hi ${name}! 👋`,
      questTitle: 'Money Quest',
      level: 'Level', xp: 'XP', streak: 'day streak',
      savingsGoal: 'Your savings goal', savedOf: (s, t) => `₹${s} of ₹${t}`,
      addSavings: '+ Add ₹100 to savings', goalReached: '🎉 Goal reached!',
      missions: 'Your missions', missionsDone: 'missions done',
      doIt: 'Start →', gotIt: "I've got it! ✓", done: 'Done ✓',
      badgeTitle: 'Money Explorer', claimBadge: '🏅 Claim my Money Explorer badge',
      badgeClaimed: 'Your badge is on-chain', badgeBody: 'A soulbound badge that grows with you — proof of what you have learned, owned by you forever.',
      backToParent: '👤 Parent', exitKid: 'Exit Kid Mode',
      pocket: 'Pocket money',
    },

    // Asset classes + persona tags
    assetClass: { Crypto: 'Crypto', Stocks: 'Stocks', 'Mutual Fund': 'Mutual Fund', 'Fixed Deposit': 'Fixed Deposit' },
    personaTag: { Optimizer: 'Return-chaser', Protector: 'Safety-first', 'Anxious Saver': 'Cautious watcher', Exiter: 'Ready to move' },

    money: {
      netWorth: 'Your net worth',
      allTime: 'all-time',
      holdings: 'Your holdings',
      maturesIn: (d) => `matures in ${d}d`,
      moneyPersona: 'Your money persona',
      onChainIdentity: 'On-chain identity',
      credLive: 'Your Intent Credential is live',
      credMint: 'Mint your Intent Credential',
      credLiveBody: 'A soulbound proof of your money persona — owned by you, portable across banks & apps.',
      credMintBody: 'Turn your profile into a credential you own, not the bank. Tap to mint.',
      aboutToDo: "What you're about to do",
      aboutToDoSub: 'Read from your recent behaviour — not just your balances.',
      suggestions: 'Suggestions for you',
      matchedTo: (p) => `Matched to your ${p} profile.`,
    },

    identity: {
      title: 'Your on-chain identity',
      intro: 'The bank version of Intent Mirror watched customers and owned their profile. This flips it: your money persona becomes a soulbound credential you hold in your own wallet — non-transferable, and portable across any bank or app that asks (with your approval).',
      testnetSim: 'TESTNET · SIMULATED', baseSepolia: 'BASE SEPOLIA',
      mintHeadline: "You don't own your Intent Credential yet",
      mintBody: "Mint it once and it's yours forever. We seal your money persona and intent score into a credential only you control. No gas, no signing popups — we sponsor the transaction.",
      mintBtn: 'Mint my Intent Credential →', minting: 'Minting on-chain…',
      soulbound: 'Intent Credential · Soulbound', intentScore: 'INTENT SCORE',
      holder: 'Holder', standard: 'Standard', transferable: 'Transferable', transferableNo: 'No — bound to you',
      issuer: 'Issuer', chain: 'Chain', txHash: 'Tx hash', issued: 'Issued',
      signalsSealed: 'Signals sealed in',
      controlNote: 'You control who reads this. When a bank or app wants to assess you, they request access — you approve in one tap, and they read a verified score without ever seeing your raw transactions. Take it anywhere.',
    },

    wealth: {
      kicker: 'GROW BEYOND YOUR FD', title: 'Wealth Hub',
      subtitle: 'Everything to take your money further — stocks, mutual funds, insurance, and the know-how to use them.',
      stat1: 'Avg equity CAGR', stat2: 'Start a SIP from', stat3: 'Lowest ELSS lock-in',
      tabs: { stocks: '📈 Top Stocks Today', mf: '📊 Mutual Funds', insurance: '🛡️ Insurance & Protection', literacy: '💡 Financial Literacy', pathway: '🧭 Your Pathway' },
      pathwayIntro: (p) => `Based on how you actually behave with money, you're an ${p}. Here's the investment pathway that suits you — and how the other personas compare.`,
    },
  },

  HI: {
    nav: { money: 'मेरा पैसा', wealth: 'वेल्थ हब', identity: 'पहचान', family: 'परिवार', signOut: 'साइन आउट' },

    family: {
      parentTitle: 'परिवार — बच्चों के लिए Money Quest',
      parentSub: 'अपने बच्चे के लिए एक सुरक्षित, मज़ेदार पैसे की यात्रा सेट करें। वे करके सीखते हैं — आपके नियंत्रण में।',
      kidName: 'बच्चे का नाम', allowance: 'साप्ताहिक पॉकेट मनी (₹)',
      goalName: 'बचत लक्ष्य', goalTarget: 'लक्ष्य राशि (₹)',
      save: 'सेटिंग्स सहेजें', saved: 'सहेजा ✓',
      startQuest: '🚀 Money Quest शुरू करें',
      whyTitle: 'यह क्यों ज़रूरी है',
      whyBody: 'ज़्यादातर स्कूलों में पैसा नहीं सिखाया जाता, और बच्चे बैंक खाता नहीं खोल सकते — इसलिए वे बिना अभ्यास के बड़े होते हैं। Money Quest हर बच्चे को एक सुरक्षित पहला वॉलेट और छोटे-छोटे पाठ देता है, किसी भी भाषा में।',
      greeting: (name) => `नमस्ते ${name}! 👋`,
      questTitle: 'Money Quest',
      level: 'लेवल', xp: 'XP', streak: 'दिन की लय',
      savingsGoal: 'आपका बचत लक्ष्य', savedOf: (s, t) => `₹${t} में से ₹${s}`,
      addSavings: '+ बचत में ₹100 डालें', goalReached: '🎉 लक्ष्य पूरा!',
      missions: 'आपके मिशन', missionsDone: 'मिशन पूरे',
      doIt: 'शुरू करें →', gotIt: 'समझ गया! ✓', done: 'पूरा ✓',
      badgeTitle: 'Money Explorer', claimBadge: '🏅 मेरा Money Explorer बैज लें',
      badgeClaimed: 'आपका बैज ऑन-चेन है', badgeBody: 'एक soulbound बैज जो आपके साथ बढ़ता है — आपने जो सीखा उसका प्रमाण, हमेशा आपका।',
      backToParent: '👤 अभिभावक', exitKid: 'किड मोड से बाहर',
      pocket: 'पॉकेट मनी',
    },

    assetClass: { Crypto: 'क्रिप्टो', Stocks: 'शेयर', 'Mutual Fund': 'म्यूचुअल फंड', 'Fixed Deposit': 'फिक्स्ड डिपॉज़िट' },
    personaTag: { Optimizer: 'रिटर्न-खोजी', Protector: 'सुरक्षा-प्रथम', 'Anxious Saver': 'सतर्क पर्यवेक्षक', Exiter: 'जाने को तैयार' },

    money: {
      netWorth: 'आपकी कुल संपत्ति',
      allTime: 'अब तक',
      holdings: 'आपकी होल्डिंग्स',
      maturesIn: (d) => `${d} दिन में मैच्योर`,
      moneyPersona: 'आपका मनी पर्सोना',
      onChainIdentity: 'ऑन-चेन पहचान',
      credLive: 'आपका Intent Credential लाइव है',
      credMint: 'अपना Intent Credential मिंट करें',
      credLiveBody: 'आपके मनी पर्सोना का soulbound प्रमाण — आपका अपना, हर बैंक व ऐप में पोर्टेबल।',
      credMintBody: 'अपनी प्रोफ़ाइल को एक ऐसे credential में बदलें जो आपका हो, बैंक का नहीं। मिंट करने के लिए टैप करें।',
      aboutToDo: 'आप क्या करने वाले हैं',
      aboutToDoSub: 'सिर्फ़ बैलेंस नहीं — आपके हालिया व्यवहार से पढ़ा गया।',
      suggestions: 'आपके लिए सुझाव',
      matchedTo: (p) => `आपके ${p} पर्सोना के अनुसार।`,
    },

    identity: {
      title: 'आपकी ऑन-चेन पहचान',
      intro: 'Intent Mirror का बैंक संस्करण ग्राहकों को देखता था और उनकी प्रोफ़ाइल का मालिक था। यह उसे पलट देता है: आपका मनी पर्सोना एक soulbound credential बन जाता है जो आपके अपने वॉलेट में रहता है — गैर-हस्तांतरणीय, और हर बैंक या ऐप में पोर्टेबल (आपकी मंज़ूरी से)।',
      testnetSim: 'टेस्टनेट · सिम्युलेटेड', baseSepolia: 'BASE SEPOLIA',
      mintHeadline: 'आप अभी तक अपने Intent Credential के मालिक नहीं हैं',
      mintBody: 'एक बार मिंट करें और यह हमेशा के लिए आपका। हम आपके मनी पर्सोना और intent score को एक ऐसे credential में सील करते हैं जिसे केवल आप नियंत्रित करते हैं। कोई गैस नहीं, कोई साइनिंग पॉपअप नहीं — लेन-देन का खर्च हम उठाते हैं।',
      mintBtn: 'मेरा Intent Credential मिंट करें →', minting: 'ऑन-चेन मिंट हो रहा है…',
      soulbound: 'Intent Credential · Soulbound', intentScore: 'INTENT स्कोर',
      holder: 'धारक', standard: 'मानक', transferable: 'हस्तांतरणीय', transferableNo: 'नहीं — आपसे बंधा',
      issuer: 'जारीकर्ता', chain: 'चेन', txHash: 'Tx हैश', issued: 'जारी',
      signalsSealed: 'सील किए गए संकेत',
      controlNote: 'कौन इसे पढ़ सकता है, यह आप तय करते हैं। जब कोई बैंक या ऐप आपका आकलन करना चाहे, वे एक्सेस का अनुरोध करते हैं — आप एक टैप में मंज़ूरी देते हैं, और वे आपके कच्चे लेन-देन देखे बिना एक सत्यापित स्कोर पढ़ते हैं। इसे कहीं भी ले जाएँ।',
    },

    wealth: {
      kicker: 'अपने FD से आगे बढ़ें', title: 'वेल्थ हब',
      subtitle: 'अपने पैसे को आगे ले जाने के लिए सब कुछ — शेयर, म्यूचुअल फंड, बीमा, और इन्हें इस्तेमाल करने की समझ।',
      stat1: 'औसत इक्विटी CAGR', stat2: 'SIP शुरू करें', stat3: 'न्यूनतम ELSS लॉक-इन',
      tabs: { stocks: '📈 आज के टॉप शेयर', mf: '📊 म्यूचुअल फंड', insurance: '🛡️ बीमा व सुरक्षा', literacy: '💡 वित्तीय शिक्षा', pathway: '🧭 आपका रास्ता' },
      pathwayIntro: (p) => `आप पैसे के साथ कैसा व्यवहार करते हैं, उसके आधार पर आप एक ${p} हैं। यहाँ है वह निवेश रास्ता जो आपके लिए सही है — और बाकी पर्सोना कैसे तुलना करते हैं।`,
    },
  },
}
