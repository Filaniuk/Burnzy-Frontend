export const PROMO_ACTIVE = true;

export const PLANS = [
  // -----------------------------
  // FREE PLAN
  // -----------------------------
  {
    name: "Free",
    price: 0,
    promoPrice: 0,
    description: "Perfect to try out Burnzy with limited monthly access.",
    features: [
      "3 Topic Analyses / month",
      "3 Channel Analyses / month",
      "3 Channel Insights reports / month",
      "4 Trend Idea generations / month",
      "4 Content Plans / month",
      "4 Detailed Video Breakdowns / month",
      "4 AI Video Scripts / month",
      "6 Thumbnail generations / month",
      "Basic community support",
    ],
    buttonText: "Start for Free",
    highlight: false,
  },

  // -----------------------------
  // PRO PLAN
  // -----------------------------
  {
    name: "Pro",
    price: 34.99,          
    promoPrice: 14.99,     
    description:
      "For creators & marketers producing content consistently.",
    features: [
      "20 Topic Analyses / month",
      "50 Channel Analyses / month",
      "70 Channel Insights reports / month",
      "50 Trend Idea generations / month",
      "50 Content Plans / month",
      "50 Detailed Video Breakdowns / month",
      "50 AI Video Scripts / month",
      "100 Thumbnail generations / month",
      "Faster processing priority",
      "Access to all AI features",
      "Email support",
    ],
    buttonText: "Upgrade to Pro",
    highlight: true,
  },

  // -----------------------------
  // BUSINESS PLAN
  // -----------------------------
  {
    name: "Business",
    price: 149.99,         
    promoPrice: 84.99,     
    description:
      "For agencies, production teams, and businesses scaling content output.",
    features: [
      "120 Topic Analyses / month",
      "300 Channel Analyses / month",
      "420 Channel Insights reports / month",
      "300 Trend Idea generations / month",
      "300 Content Plans / month",
      "300 Detailed Video Breakdowns / month",
      "300 AI Video Scripts / month",
      "600 Thumbnail generations / month",
      "Highest processing priority",
      "Advanced analytics & reporting",
      "Dedicated account manager",
      "Priority support",
    ],
    buttonText: "Upgrade to Business",
    highlight: false,
  },
];
