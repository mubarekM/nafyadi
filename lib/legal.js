// ===== EDIT THESE to match your real situation =====
const L = {
  owner: "Nafyad WJ", // use your full legal name if you prefer
  site: "English with Nafyad",
  siteUrl: "https://nafyadi.vercel.app",
  telegram: "https://t.me/NAFYADWJ",
  phone: "+251960889388",
  updated: "October 11, 2026",
  childAge: 16, // Ethiopian law treats under 16 as a minor
  keepAccount: "12 months after your last activity",
  keepPayments: "5 years",
  replyDays: 30,
  refundDays: 7,
};

// Each section "body" is a list: a string = a paragraph, an array = a bullet list.

export const PRIVACY = {
  title: "Privacy Policy",
  updated: L.updated,
  intro: `This page explains what information ${L.site} collects, why we collect it, and what choices you have. We wrote it in simple words on purpose.`,
  sections: [
    {
      h: "Who we are",
      body: [
        `${L.site} is an online English school run by ${L.owner} (called "the teacher" or "we" on this page). We are responsible for the information you give us on this website (${L.siteUrl}).`,
        `You can contact us on Telegram (${L.telegram}) or by phone (${L.phone}).`,
      ],
    },
    {
      h: "What information we collect",
      body: [
        "We collect only what we need to teach you and run the school:",
        [
          "Your account details: full name, email, phone number, English level, and your password. We cannot see your password; it is stored in a protected form.",
          "Your learning activity: lessons you opened, checklist ticks, quiz answers and scores, the teacher's feedback and notes, your study group, and your attendance in live classes.",
          "Your messages in the class discussion room.",
          "Payment information: the plan and month you paid for, the bank or app you used, the transaction number, and the screenshot of your receipt.",
          "Certificates we issue to you.",
          "If you only used the enroll form on the home page: your name, email and phone number.",
          "Your choices on your device, such as language, dark mode, text size and high contrast. These stay in your own browser.",
        ],
        "We do not ask for your national ID, your bank password, your PIN, or your card number. Never send them to us.",
      ],
    },
    {
      h: "Why we use your information",
      body: [
        [
          "To create your account and let the teacher approve it.",
          "To give you lessons, quizzes, live classes, certificates and feedback.",
          "To confirm your monthly payment and unlock your lessons.",
          "To record attendance and show you your progress.",
          "To contact you about your classes, payments, or your account. For example, a payment reminder.",
          "To keep the school safe, for example by removing harmful messages.",
        ],
        "We do not sell your information. We do not show advertising.",
      ],
    },
    {
      h: "Payments and automatic checking",
      body: [
        "When you send a payment, we keep the transaction number and your receipt screenshot so the teacher can confirm it. The screenshot is kept in private storage. Only you and the teacher can open it.",
        "To confirm payments quickly, we send the transaction number and our own receiving account number to a payment-checking service (Verify.ET). It tells us whether the payment is real and how much was paid. We do not send your password or your lessons to it.",
        "The service may also tell us the name of the person who sent the money. We keep it only to record the payment.",
      ],
    },
    {
      h: `Children (under ${L.childAge})`,
      body: [
        `If you are under ${L.childAge}, your parent or guardian must agree to this policy and the Terms before you use the website. A parent may ask to see, correct or delete a child's information at any time.`,
        "We use children's information only for lessons, progress and payments. We never use it for advertising.",
        "Parents are welcome to sit in on live classes.",
      ],
    },
    {
      h: "Who can see your information",
      body: [
        "The teacher can see all information in your account.",
        "Other students can only see your name and the messages you write in the class discussion room.",
        "We use these companies to run the website. They handle information only to provide their service:",
        [
          "Supabase: stores our database and files. Our data is stored on servers in Germany (Frankfurt).",
          "Vercel: delivers the website to your device.",
          "Verify.ET: checks payment receipts, as explained above.",
          "YouTube: plays lesson videos. YouTube may collect information when you press play.",
          "Zoom, Google Meet or similar tools: used for live classes. They have their own privacy rules.",
        ],
        "We may share information if the law requires it.",
      ],
    },
    {
      h: "Storing your information outside Ethiopia",
      body: [
        "The companies above keep information on servers outside Ethiopia, so your information is sent abroad to run the school. By creating an account or sending the enroll form, you (or your parent or guardian, if you are under 16) agree to this.",
        "We aim to follow Ethiopia's Personal Data Protection Proclamation No. 1321/2024.",
      ],
    },
    {
      h: "How long we keep information",
      body: [
        `We keep your account and learning information until ${L.keepAccount}, or until you ask us to delete it. Payment records are kept for ${L.keepPayments}, because school accounts usually have to be kept for that long.`,
        "After that we delete or anonymize the information.",
      ],
    },
    {
      h: "Your rights",
      body: [
        "You can ask us at any time to:",
        [
          "show you the information we have about you,",
          "correct anything that is wrong,",
          "delete your information (we may keep payment records we must keep),",
          "stop using your information, or take back your consent.",
        ],
        `Message us on Telegram or call us. We will answer within ${L.replyDays} days. If you are not happy with our answer, you may complain to the data protection authority in Ethiopia.`,
      ],
    },
    {
      h: "Keeping your information safe",
      body: [
        "We use a secure (HTTPS) connection, protected passwords, private storage for receipts and lesson files, and rules that stop students from seeing each other's private information.",
        "No website is perfectly safe. If a problem affects your information, we will tell you and the authorities as the law requires, and within 72 hours where required.",
        "Please keep your password private and do not share your account.",
      ],
    },
    {
      h: "Cookies and browser storage",
      body: [
        "We only use what the website needs: your login session, and your choices (language, dark mode, text size, high contrast). We do not use advertising or tracking cookies.",
        "YouTube and meeting tools may use their own cookies when you use them.",
      ],
    },
    {
      h: "Changes to this policy",
      body: [
        "If we change this policy, we will update the date at the top. If the change is important, we will tell you on the website or by message.",
      ],
    },
    {
      h: "Contact us",
      body: [`Telegram: ${L.telegram}`, `Phone: ${L.phone}`],
    },
  ],
};

export const TERMS = {
  title: "Terms of Service",
  updated: L.updated,
  intro: `These are the rules for using ${L.site}. By creating an account, you agree to them. We wrote them in simple words on purpose.`,
  sections: [
    {
      h: "Who can use the website",
      body: [
        `You can use ${L.site} if you are 16 or older, or if your parent or guardian agrees for you. The teacher approves every new account and may refuse one.`,
      ],
    },
    {
      h: "Your account",
      body: [
        [
          "Give true information when you sign up.",
          "Keep your password private. Do not share your account with other people.",
          "You are responsible for what happens in your account.",
          "Tell us at once if someone else is using your account.",
        ],
      ],
    },
    {
      h: "Classes and lessons",
      body: [
        "We teach English through live classes, lessons, quizzes and feedback. Class times can change. We will tell you when they do.",
        "Lessons, files, quizzes and recordings are only for your own learning. Please do not copy, record, share, sell or post them without the teacher's written permission.",
        "We cannot promise a particular exam score or result. Your progress depends on your practice too.",
      ],
    },
    {
      h: "Fees and payments",
      body: [
        "Fees are shown in Ethiopian birr (ETB) on the website. We may change prices. A change never affects a month you already paid for.",
        "You pay by bank transfer or Telebirr, then send the transaction number and your receipt screenshot on the Payments page.",
        "Each transaction number can be used only once. Fake, edited or reused receipts are not allowed, and we may close the account.",
        "Lessons and quizzes unlock when your payment for the month is confirmed. You get a few days at the start of each month to pay before they lock. Live classes, your grades and the discussion room stay open.",
        `If you paid by mistake, or we cancel a class and cannot replace it, message us within ${L.refundDays} days. We will look at each case fairly and decide about a refund.`,
      ],
    },
    {
      h: "Good behaviour",
      body: [
        "Be kind and respectful in live classes and in the discussion room. These are not allowed:",
        [
          "bullying, insults, hate, or threats,",
          "adult or violent content,",
          "spam, advertising, or links to other websites,",
          "sharing other people's private information,",
          "trying to break into the website or see other people's data,",
          "cheating in quizzes.",
        ],
        "The teacher may delete messages, remove someone from a class, or pause an account that breaks these rules.",
      ],
    },
    {
      h: "Certificates",
      body: [
        "The teacher decides when to give a certificate. We may cancel a certificate that was given by mistake or got by cheating.",
      ],
    },
    {
      h: "The website may not always work",
      body: [
        "We try to keep the website working, but it may be down sometimes, for example for repairs, internet problems, or problems at the companies we use. We are not responsible for losses caused by this, as far as the law allows.",
      ],
    },
    {
      h: "Our responsibility",
      body: [
        "As far as the law allows, we are not responsible for indirect losses that come from using the website. Nothing in these Terms removes rights that the law gives you.",
      ],
    },
    {
      h: "Ending your account",
      body: [
        "You can stop at any time. Message us if you want your account and information deleted. We may close an account that breaks these Terms. How we handle your information is explained in the Privacy Policy.",
      ],
    },
    {
      h: "Changes to these Terms",
      body: [
        "We may update these Terms. We will change the date at the top and tell you about important changes. If you keep using the website after a change, it means you accept it.",
      ],
    },
    {
      h: "Law",
      body: ["These Terms follow the laws of Ethiopia."],
    },
    {
      h: "Contact us",
      body: [`Telegram: ${L.telegram}`, `Phone: ${L.phone}`],
    },
  ],
};
