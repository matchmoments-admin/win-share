"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INDUSTRIES } from "@/lib/templates/industries";
import { updateBrandSettings } from "@/app/(dashboard)/brand/actions";
import { BrandPreview } from "@/components/brand/brand-preview";
import { Loader2 } from "lucide-react";

type BrandSettingsData = {
  id: string;
  organizationId: string;
  companyName: string | null;
  tagline: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  contactPhone: string | null;
  contactEmail: string | null;
  contactWebsite: string | null;
  socialInstagram: string | null;
  socialLinkedin: string | null;
  socialFacebook: string | null;
  socialTwitter: string | null;
  createdAt: Date;
  updatedAt: Date;
};

interface BrandSetupProps {
  initialData: BrandSettingsData | null;
}

export function BrandSetup({ initialData }: BrandSetupProps) {
  const [isPending, startTransition] = useTransition();

  // Form state
  const [companyName, setCompanyName] = useState(
    initialData?.companyName ?? ""
  );
  const [tagline, setTagline] = useState(initialData?.tagline ?? "");
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl ?? "");
  const [primaryColor, setPrimaryColor] = useState(
    initialData?.primaryColor ?? "#1e3a5f"
  );
  const [secondaryColor, setSecondaryColor] = useState(
    initialData?.secondaryColor ?? "#c9a84c"
  );
  const [accentColor, setAccentColor] = useState(
    initialData?.accentColor ?? "#ffffff"
  );
  const [backgroundColor, setBackgroundColor] = useState(
    initialData?.backgroundColor ?? "#f5f5f5"
  );
  const [contactPhone, setContactPhone] = useState(
    initialData?.contactPhone ?? ""
  );
  const [contactEmail, setContactEmail] = useState(
    initialData?.contactEmail ?? ""
  );
  const [contactWebsite, setContactWebsite] = useState(
    initialData?.contactWebsite ?? ""
  );
  const [socialInstagram, setSocialInstagram] = useState(
    initialData?.socialInstagram ?? ""
  );
  const [socialLinkedin, setSocialLinkedin] = useState(
    initialData?.socialLinkedin ?? ""
  );
  const [socialFacebook, setSocialFacebook] = useState(
    initialData?.socialFacebook ?? ""
  );
  const [socialTwitter, setSocialTwitter] = useState(
    initialData?.socialTwitter ?? ""
  );

  function handleIndustryChange(industryId: string) {
    const industry = INDUSTRIES[industryId as keyof typeof INDUSTRIES];
    if (industry) {
      setPrimaryColor(industry.defaultColors.primary);
      setSecondaryColor(industry.defaultColors.secondary);
      setAccentColor(industry.defaultColors.accent);
      setBackgroundColor(industry.defaultColors.background);
    }
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateBrandSettings({
        companyName: companyName || null,
        tagline: tagline || null,
        logoUrl: logoUrl || null,
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        contactWebsite: contactWebsite || null,
        socialInstagram: socialInstagram || null,
        socialLinkedin: socialLinkedin || null,
        socialFacebook: socialFacebook || null,
        socialTwitter: socialTwitter || null,
      });

      if (result.success) {
        toast.success("Brand settings saved successfully.");
      } else {
        toast.error("Failed to save brand settings. Please check your inputs.");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* Form */}
      <div className="space-y-6">
        {/* Industry selector */}
        <Card>
          <CardHeader>
            <CardTitle>Industry</CardTitle>
            <CardDescription>
              Select your industry to apply recommended brand colors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleIndustryChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose an industry..." />
              </SelectTrigger>
              <SelectContent>
                {Object.values(INDUSTRIES).map((industry) => (
                  <SelectItem key={industry.id} value={industry.id}>
                    {industry.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Your company name and tagline appear on generated posts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="e.g. Acme Mortgage Group"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                placeholder="e.g. Making Home Ownership a Reality"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                placeholder="https://..."
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Paste a URL to your logo, or use the upload button in a future
                update.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Brand Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Brand Colors</CardTitle>
            <CardDescription>
              Choose colors that represent your brand. These are used in all
              generated post templates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField
                label="Primary Color"
                value={primaryColor}
                onChange={setPrimaryColor}
              />
              <ColorField
                label="Secondary Color"
                value={secondaryColor}
                onChange={setSecondaryColor}
              />
              <ColorField
                label="Accent Color"
                value={accentColor}
                onChange={setAccentColor}
              />
              <ColorField
                label="Background Color"
                value={backgroundColor}
                onChange={setBackgroundColor}
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Optional contact details displayed on your posts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  placeholder="e.g. (555) 123-4567"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="e.g. hello@company.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactWebsite">Website</Label>
              <Input
                id="contactWebsite"
                placeholder="e.g. https://www.company.com"
                value={contactWebsite}
                onChange={(e) => setContactWebsite(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
            <CardDescription>
              Link your social profiles. Handles are displayed on posts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="socialInstagram">Instagram</Label>
                <Input
                  id="socialInstagram"
                  placeholder="@yourcompany"
                  value={socialInstagram}
                  onChange={(e) => setSocialInstagram(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="socialLinkedin">LinkedIn</Label>
                <Input
                  id="socialLinkedin"
                  placeholder="linkedin.com/company/..."
                  value={socialLinkedin}
                  onChange={(e) => setSocialLinkedin(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="socialFacebook">Facebook</Label>
                <Input
                  id="socialFacebook"
                  placeholder="facebook.com/..."
                  value={socialFacebook}
                  onChange={(e) => setSocialFacebook(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="socialTwitter">Twitter / X</Label>
                <Input
                  id="socialTwitter"
                  placeholder="@yourcompany"
                  value={socialTwitter}
                  onChange={(e) => setSocialTwitter(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isPending}
            size="lg"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Saving..." : "Save Brand Settings"}
          </Button>
        </div>
      </div>

      {/* Live preview — sticky on desktop */}
      <div className="hidden lg:block">
        <div className="sticky top-24">
          <BrandPreview
            companyName={companyName}
            tagline={tagline}
            logoUrl={logoUrl}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            accentColor={accentColor}
            backgroundColor={backgroundColor}
            contactPhone={contactPhone}
            contactWebsite={contactWebsite}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Color picker sub-component
// ---------------------------------------------------------------------------

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-10 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
          />
        </div>
        <Input
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) {
              onChange(v);
            }
          }}
          className="w-28 font-mono text-sm uppercase"
          maxLength={7}
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
