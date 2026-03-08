import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export const PLAN_CONFIGS = {
  free: {
    name: "Free",
    monthlyPostLimit: 3,
    monthlyCaptionLimit: 5,
    features: [
      "3 posts per month",
      "5 AI captions per month",
      "Watermarked images",
      "1 user",
    ],
    price: 0,
    priceId: null,
  },
  starter: {
    name: "Starter",
    monthlyPostLimit: 15,
    monthlyCaptionLimit: 30,
    features: [
      "15 posts per month",
      "30 AI captions per month",
      "No watermark",
      "1 user",
      "Priority support",
    ],
    price: 29,
    priceId: process.env.STRIPE_PRICE_ID_STARTER,
  },
  pro: {
    name: "Pro",
    monthlyPostLimit: 50,
    monthlyCaptionLimit: 100,
    features: [
      "50 posts per month",
      "100 AI captions per month",
      "No watermark",
      "3 users",
      "Custom templates",
      "Priority support",
    ],
    price: 79,
    priceId: process.env.STRIPE_PRICE_ID_PRO,
  },
  team: {
    name: "Team",
    monthlyPostLimit: 200,
    monthlyCaptionLimit: 500,
    features: [
      "200 posts per month",
      "500 AI captions per month",
      "No watermark",
      "10 users",
      "Custom templates",
      "White-label option",
      "Dedicated support",
    ],
    price: 199,
    priceId: process.env.STRIPE_PRICE_ID_TEAM,
  },
} as const;

export type PlanTier = keyof typeof PLAN_CONFIGS;

export function isFreePlan(tier: string): boolean {
  return tier === "free";
}
