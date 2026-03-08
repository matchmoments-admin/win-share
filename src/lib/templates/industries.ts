// =============================================================================
// Industry Definitions
// Maps to industryEnum from schema.ts
// =============================================================================

/**
 * Industry configuration with default brand colours and suggested content.
 * The `id` must match one of the industryEnum values in the DB schema.
 */
export type IndustryConfig = {
  id:
    | "mortgage_broker"
    | "real_estate"
    | "insurance"
    | "financial_planning"
    | "cleaning"
    | "landscaping"
    | "trades"
    | "automotive"
    | "health_wellness"
    | "other";
  name: string;
  defaultColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  defaultActionVerbs: string[];
  suggestedCategories: string[];
};

// -----------------------------------------------------------------------------
// Industry Definitions
// -----------------------------------------------------------------------------

const mortgageBroker: IndustryConfig = {
  id: "mortgage_broker",
  name: "Mortgage Broker",
  defaultColors: {
    primary: "#1e3a5f",
    secondary: "#c9a84c",
    accent: "#ffffff",
    background: "#f5f5f5",
  },
  defaultActionVerbs: ["Financed", "Settled", "Approved"],
  suggestedCategories: [
    "business_win",
    "thank_you",
    "review_highlight",
    "team_people",
  ],
} as const;

const realEstate: IndustryConfig = {
  id: "real_estate",
  name: "Real Estate",
  defaultColors: {
    primary: "#1a472a",
    secondary: "#d4af37",
    accent: "#ffffff",
    background: "#fffdf5",
  },
  defaultActionVerbs: ["Sold", "Listed", "Settled"],
  suggestedCategories: [
    "business_win",
    "thank_you",
    "review_highlight",
    "shout_out",
  ],
} as const;

const insurance: IndustryConfig = {
  id: "insurance",
  name: "Insurance",
  defaultColors: {
    primary: "#003366",
    secondary: "#ff6b35",
    accent: "#ffffff",
    background: "#e8f0fe",
  },
  defaultActionVerbs: ["Protected", "Insured", "Covered"],
  suggestedCategories: [
    "business_win",
    "thank_you",
    "review_highlight",
    "announcement",
  ],
} as const;

const financialPlanning: IndustryConfig = {
  id: "financial_planning",
  name: "Financial Planning",
  defaultColors: {
    primary: "#1a1a2e",
    secondary: "#16a085",
    accent: "#ffffff",
    background: "#f0f4f8",
  },
  defaultActionVerbs: ["Planned", "Secured", "Invested"],
  suggestedCategories: [
    "business_win",
    "thank_you",
    "business_milestone",
    "review_highlight",
  ],
} as const;

const cleaning: IndustryConfig = {
  id: "cleaning",
  name: "Cleaning",
  defaultColors: {
    primary: "#2d7d46",
    secondary: "#ffd700",
    accent: "#ffffff",
    background: "#f0fff4",
  },
  defaultActionVerbs: ["Cleaned", "Transformed", "Refreshed"],
  suggestedCategories: [
    "business_win",
    "review_highlight",
    "shout_out",
    "team_people",
  ],
} as const;

const landscaping: IndustryConfig = {
  id: "landscaping",
  name: "Landscaping",
  defaultColors: {
    primary: "#228b22",
    secondary: "#8b6914",
    accent: "#ffffff",
    background: "#f5f7f0",
  },
  defaultActionVerbs: ["Transformed", "Landscaped", "Designed"],
  suggestedCategories: [
    "business_win",
    "review_highlight",
    "shout_out",
    "business_milestone",
  ],
} as const;

const trades: IndustryConfig = {
  id: "trades",
  name: "Trades",
  defaultColors: {
    primary: "#1b2838",
    secondary: "#e67e22",
    accent: "#ffffff",
    background: "#e8eaed",
  },
  defaultActionVerbs: ["Built", "Installed", "Repaired"],
  suggestedCategories: [
    "business_win",
    "review_highlight",
    "team_people",
    "business_milestone",
  ],
} as const;

const automotive: IndustryConfig = {
  id: "automotive",
  name: "Automotive",
  defaultColors: {
    primary: "#2c2c2c",
    secondary: "#c0392b",
    accent: "#ffffff",
    background: "#c0c0c0",
  },
  defaultActionVerbs: ["Delivered", "Serviced", "Restored"],
  suggestedCategories: [
    "business_win",
    "review_highlight",
    "shout_out",
    "team_people",
  ],
} as const;

const healthWellness: IndustryConfig = {
  id: "health_wellness",
  name: "Health & Wellness",
  defaultColors: {
    primary: "#008080",
    secondary: "#ff7f7f",
    accent: "#ffffff",
    background: "#f0fff4",
  },
  defaultActionVerbs: ["Transformed", "Healed", "Achieved"],
  suggestedCategories: [
    "thank_you",
    "review_highlight",
    "business_milestone",
    "team_people",
  ],
} as const;

const other: IndustryConfig = {
  id: "other",
  name: "Other",
  defaultColors: {
    primary: "#333333",
    secondary: "#3498db",
    accent: "#ffffff",
    background: "#f5f5f5",
  },
  defaultActionVerbs: ["Completed", "Delivered", "Achieved"],
  suggestedCategories: [
    "business_win",
    "thank_you",
    "review_highlight",
    "announcement",
  ],
} as const;

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export const INDUSTRIES: Record<IndustryConfig["id"], IndustryConfig> = {
  mortgage_broker: mortgageBroker,
  real_estate: realEstate,
  insurance: insurance,
  financial_planning: financialPlanning,
  cleaning: cleaning,
  landscaping: landscaping,
  trades: trades,
  automotive: automotive,
  health_wellness: healthWellness,
  other: other,
} as const;
