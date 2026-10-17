// EDIT THESE with your real accounts and prices.
//
// name   = how it appears to students
// code   = what the automatic checker needs. Allowed: cbe, telebirr, dashen, awash, mpesa
// holder = the name on the account
// number = your REAL receiving account. CBE and banks: account number.
//          Telebirr / M-Pesa: your phone number, like 0912345678.
//          The checker uses it to confirm the money reached YOU.
export const BANKS = [
  {
    name: "Commercial Bank of Ethiopia (CBE)",
    code: "cbe",
    holder: "Nafyad Waliyi",
    number: "1000707604615",
  },
  {
    name: "Telebirr",
    code: "telebirr",
    holder: "Nafyad Waliyi",
    number: "0960889388",
  },
];

// Prices in ETB per month. Keep them the same as on your home page.
export const PLANS = [
  { key: "pKids", plan: "kids", amount: 600 },
  { key: "pAdults", plan: "adults", amount: 500 },
  { key: "pOne", plan: "one", amount: 2000 },
];
