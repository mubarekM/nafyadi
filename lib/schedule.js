// EDIT YOUR CLASS TIMES HERE. "s" = daytime (sun), "m" = night (moon)
export const LIVE = [
  ["EST", "1:00 PM - 3:00 PM", "s"],
  ["PST", "10:00 AM - 12:00 PM", "s"],
  ["EAT", "9:00 PM - 11:00 PM", "m"],
  ["ETH-LT", "ማታ 3:00 - 5:00 ሰዓት", "m"],
];

export const GROUPS = [
  // Group 1: Night (After Isha'a Salat)
  [
    ["EST", "1:00 PM - 3:00 PM", "s"],
    ["PST", "10:00 AM - 12:00 PM", "s"],
    ["EAT", "9:00 PM - 11:00 PM", "m"],
    ["ETH-LT", "ማታ 3:00 - 5:00 ሰዓት", "m"],
  ],
  // Group 2: Morning (After Subh Salat)
  [
    ["EST", "10:00 PM - 12:00 AM", "m"],
    ["PST", "7:00 PM - 9:00 PM", "m"],
    ["EAT", "6:00 AM - 8:00 AM", "s"],
    ["ETH-LT", "ጠዋት 12:00 - 2:00 ሰዓት", "s"],
  ],
];
