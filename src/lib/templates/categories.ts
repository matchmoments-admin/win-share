// =============================================================================
// Content Category Definitions
// Maps to contentCategoryEnum from schema.ts
// =============================================================================

/**
 * Field configuration for dynamic form generation per category.
 */
export type FieldConfig = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "currency" | "select";
  placeholder: string;
  required: boolean;
  options?: string[];
};

/**
 * Content category definition with metadata, icons, and field configs.
 * The `id` must match one of the contentCategoryEnum values in the DB schema.
 */
export type ContentCategory = {
  id:
    | "business_win"
    | "thank_you"
    | "shout_out"
    | "team_people"
    | "review_highlight"
    | "business_milestone"
    | "announcement";
  name: string;
  description: string;
  icon: string;
  actionVerbs: string[];
  fields: FieldConfig[];
};

// -----------------------------------------------------------------------------
// Category Definitions
// -----------------------------------------------------------------------------

const businessWin: ContentCategory = {
  id: "business_win",
  name: "Business Win",
  description:
    "Celebrate a closed deal, funded loan, or successful transaction with your audience.",
  icon: "Trophy",
  actionVerbs: ["Financed", "Settled", "Approved", "Funded"],
  fields: [
    {
      name: "clientName",
      label: "Client Name",
      type: "text",
      placeholder: "e.g. John & Sarah Smith",
      required: true,
    },
    {
      name: "loanAmount",
      label: "Loan Amount",
      type: "currency",
      placeholder: "e.g. 750000",
      required: false,
    },
    {
      name: "propertyAddress",
      label: "Property Address",
      type: "text",
      placeholder: "e.g. 42 Harbour St, Sydney NSW 2000",
      required: false,
    },
    {
      name: "lenderName",
      label: "Lender Name",
      type: "text",
      placeholder: "e.g. Commonwealth Bank",
      required: false,
    },
  ],
} as const;

const thankYou: ContentCategory = {
  id: "thank_you",
  name: "Thank You",
  description:
    "Show gratitude to a client, partner, or supporter with a personalised thank-you post.",
  icon: "Heart",
  actionVerbs: ["Thanked", "Appreciated", "Grateful", "Celebrated"],
  fields: [
    {
      name: "clientName",
      label: "Client Name",
      type: "text",
      placeholder: "e.g. Maria Garcia",
      required: true,
    },
    {
      name: "testimonialQuote",
      label: "Testimonial Quote",
      type: "textarea",
      placeholder:
        "e.g. They made the whole process so easy and stress-free...",
      required: false,
    },
    {
      name: "serviceDescription",
      label: "Service Description",
      type: "text",
      placeholder: "e.g. Home loan refinance",
      required: false,
    },
  ],
} as const;

const shoutOut: ContentCategory = {
  id: "shout_out",
  name: "Shout Out",
  description:
    "Give a public shout-out to recognise someone's achievement or contribution.",
  icon: "Megaphone",
  actionVerbs: ["Recognised", "Celebrated", "Acknowledged", "Honoured"],
  fields: [
    {
      name: "personName",
      label: "Person Name",
      type: "text",
      placeholder: "e.g. Alex Johnson",
      required: true,
    },
    {
      name: "achievement",
      label: "Achievement",
      type: "textarea",
      placeholder: "e.g. Closed 50 deals this quarter — an incredible effort!",
      required: true,
    },
    {
      name: "relationship",
      label: "Relationship",
      type: "select",
      placeholder: "Select relationship",
      required: true,
      options: ["client", "partner", "referrer", "team member"],
    },
  ],
} as const;

const teamPeople: ContentCategory = {
  id: "team_people",
  name: "Team & People",
  description:
    "Spotlight a team member to humanise your brand and build trust with your audience.",
  icon: "Users",
  actionVerbs: ["Introducing", "Spotlighting", "Featuring", "Meet"],
  fields: [
    {
      name: "personName",
      label: "Person Name",
      type: "text",
      placeholder: "e.g. Sam Nguyen",
      required: true,
    },
    {
      name: "title",
      label: "Job Title",
      type: "text",
      placeholder: "e.g. Senior Mortgage Broker",
      required: true,
    },
    {
      name: "funFact",
      label: "Fun Fact",
      type: "textarea",
      placeholder:
        "e.g. When Sam's not crunching numbers, you'll find him on the golf course.",
      required: false,
    },
    {
      name: "yearsWithCompany",
      label: "Years with Company",
      type: "number",
      placeholder: "e.g. 5",
      required: false,
    },
  ],
} as const;

const reviewHighlight: ContentCategory = {
  id: "review_highlight",
  name: "Review Highlight",
  description:
    "Turn a glowing client review into a shareable, branded social post.",
  icon: "Star",
  actionVerbs: ["Reviewed", "Rated", "Recommended", "Endorsed"],
  fields: [
    {
      name: "reviewerName",
      label: "Reviewer Name",
      type: "text",
      placeholder: "e.g. Chris Taylor",
      required: true,
    },
    {
      name: "reviewText",
      label: "Review Text",
      type: "textarea",
      placeholder:
        "e.g. Absolutely fantastic service from start to finish...",
      required: true,
    },
    {
      name: "starRating",
      label: "Star Rating",
      type: "select",
      placeholder: "Select rating",
      required: true,
      options: ["1", "2", "3", "4", "5"],
    },
    {
      name: "reviewPlatform",
      label: "Review Platform",
      type: "select",
      placeholder: "Select platform",
      required: false,
      options: ["Google", "Trustpilot", "Facebook", "ProductReview"],
    },
  ],
} as const;

const businessMilestone: ContentCategory = {
  id: "business_milestone",
  name: "Business Milestone",
  description:
    "Announce a major business milestone like revenue targets, anniversaries, or records.",
  icon: "Flag",
  actionVerbs: ["Reached", "Achieved", "Celebrated", "Surpassed"],
  fields: [
    {
      name: "milestoneName",
      label: "Milestone Name",
      type: "text",
      placeholder: "e.g. 500 Loans Settled",
      required: true,
    },
    {
      name: "milestoneValue",
      label: "Milestone Value",
      type: "text",
      placeholder: "e.g. $100M in settlements",
      required: false,
    },
    {
      name: "milestoneDescription",
      label: "Description",
      type: "textarea",
      placeholder:
        "e.g. After 10 years in the industry, we've officially settled over $100 million in home loans.",
      required: false,
    },
  ],
} as const;

const announcement: ContentCategory = {
  id: "announcement",
  name: "Announcement",
  description:
    "Share important news, events, or updates with your followers.",
  icon: "Bell",
  actionVerbs: ["Announcing", "Launching", "Introducing", "Unveiling"],
  fields: [
    {
      name: "announcementTitle",
      label: "Announcement Title",
      type: "text",
      placeholder: "e.g. We're expanding to Melbourne!",
      required: true,
    },
    {
      name: "announcementBody",
      label: "Announcement Body",
      type: "textarea",
      placeholder:
        "e.g. We're thrilled to announce that our team is opening a new office in Melbourne CBD...",
      required: true,
    },
    {
      name: "effectiveDate",
      label: "Effective Date",
      type: "text",
      placeholder: "e.g. March 2026",
      required: false,
    },
  ],
} as const;

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export const CATEGORIES: Record<ContentCategory["id"], ContentCategory> = {
  business_win: businessWin,
  thank_you: thankYou,
  shout_out: shoutOut,
  team_people: teamPeople,
  review_highlight: reviewHighlight,
  business_milestone: businessMilestone,
  announcement: announcement,
} as const;
