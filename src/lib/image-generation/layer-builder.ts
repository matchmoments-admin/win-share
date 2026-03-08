import type { LayerData } from "./interface";

export interface BrandData {
  logoUrl?: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  companyName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  contactWebsite?: string | null;
  tagline?: string | null;
}

export interface PostFormData {
  actionVerb: string;
  headline: string;
  heroPhotoUrl?: string | null;
  category: string;
  fieldValues: Record<string, string>;
}

export function buildLayers(
  brand: BrandData,
  formData: PostFormData,
  options: { watermark: boolean }
): LayerData[] {
  const layers: LayerData[] = [];

  // Background / brand colors
  layers.push({
    name: "background",
    type: "shape",
    value: brand.primaryColor,
    color: brand.primaryColor,
  });

  layers.push({
    name: "accent_bar",
    type: "shape",
    value: brand.secondaryColor,
    color: brand.secondaryColor,
  });

  // Logo
  if (brand.logoUrl) {
    layers.push({
      name: "logo",
      type: "image",
      value: brand.logoUrl,
    });
  }

  // Action verb headline: "Just [Financed]!"
  layers.push({
    name: "action_verb",
    type: "text",
    value: `Just ${formData.actionVerb}!`,
    color: brand.secondaryColor,
  });

  // Main headline
  layers.push({
    name: "headline",
    type: "text",
    value: formData.headline,
    color: "#ffffff",
  });

  // Hero photo
  if (formData.heroPhotoUrl) {
    layers.push({
      name: "hero_photo",
      type: "image",
      value: formData.heroPhotoUrl,
    });
  }

  // Dynamic field values — map common fields to template layers
  const fieldMappings: Record<string, string> = {
    clientName: "client_name",
    loanAmount: "loan_amount",
    propertyAddress: "property_address",
    lenderName: "lender_name",
    testimonialQuote: "testimonial_quote",
    personName: "person_name",
    achievement: "achievement_text",
    title: "person_title",
    reviewerName: "reviewer_name",
    reviewText: "review_text",
    starRating: "star_rating",
    milestoneName: "milestone_name",
    milestoneValue: "milestone_value",
    announcementTitle: "announcement_title",
    announcementBody: "announcement_body",
  };

  for (const [fieldName, layerName] of Object.entries(fieldMappings)) {
    const value = formData.fieldValues[fieldName];
    if (value) {
      layers.push({
        name: layerName,
        type: "text",
        value,
        color: brand.accentColor,
      });
    }
  }

  // Company name
  if (brand.companyName) {
    layers.push({
      name: "company_name",
      type: "text",
      value: brand.companyName,
      color: "#ffffff",
    });
  }

  // Contact info
  if (brand.contactPhone) {
    layers.push({
      name: "contact_phone",
      type: "text",
      value: brand.contactPhone,
    });
  }

  if (brand.contactWebsite) {
    layers.push({
      name: "contact_website",
      type: "text",
      value: brand.contactWebsite,
    });
  }

  // Tagline
  if (brand.tagline) {
    layers.push({
      name: "tagline",
      type: "text",
      value: brand.tagline,
      color: brand.secondaryColor,
    });
  }

  // Watermark for free tier
  layers.push({
    name: "watermark",
    type: "text",
    value: "Made with WinPost",
    visible: options.watermark,
  });

  return layers;
}

export function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return String(amount);
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}
