export const INDUSTRIES = [
  "Agriculture",
  "Construction",
  "Education",
  "Energy and Utilities",
  "Financial Services",
  "Government and Public Sector",
  "Healthcare",
  "Hospitality",
  "Logistics and Transportation",
  "Manufacturing",
  "Nonprofit and NGO",
  "Professional Services",
  "Real Estate",
  "Retail and E-commerce",
  "Technology",
  "Telecommunications",
  "Other",
] as const;

export type WaitlistDetails = {
  fullName: string;
  email: string;
  phone: string;
  industry: string;
  useCase: string;
};

export type WaitlistErrors = Partial<Record<keyof WaitlistDetails, string>>;

type ValidationResult =
  | { success: true; data: WaitlistDetails }
  | { success: false; errors: WaitlistErrors };

export function validateWaitlist(input: unknown): ValidationResult {
  const values = typeof input === "object" && input !== null ? input : {};
  function read(key: keyof WaitlistDetails): string {
    const value = key in values ? (values as Record<string, unknown>)[key] : undefined;
    return typeof value === "string" ? value.trim() : "";
  }

  const data: WaitlistDetails = {
    fullName: read("fullName"),
    email: read("email").toLowerCase(),
    phone: read("phone"),
    industry: read("industry"),
    useCase: read("useCase"),
  };
  const errors: WaitlistErrors = {};
  if (data.fullName.length < 2 || data.fullName.length > 100) {
    errors.fullName = "Please enter your full name (2–100 characters).";
  }
  if (data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (data.phone && (data.phone.length > 30 || !/^\+?[0-9\s().-]+$/.test(data.phone) || data.phone.replace(/\D/g, "").length < 7 || data.phone.replace(/\D/g, "").length > 15)) {
    errors.phone = "Please enter a valid phone number, including your country code.";
  }
  if (!INDUSTRIES.some((industry) => industry === data.industry)) {
    errors.industry = "Please select your industry.";
  }
  if (data.useCase.length > 1000) {
    errors.useCase = "Please keep your answer to 1,000 characters or fewer.";
  }
  for (const key of ["phone", "useCase"] as const) {
    if (key in values && typeof (values as Record<string, unknown>)[key] !== "string") {
      errors[key] = "Please enter a text value.";
    }
  }

  return Object.keys(errors).length ? { success: false, errors } : { success: true, data };
}
