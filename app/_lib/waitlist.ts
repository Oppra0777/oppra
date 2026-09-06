export const COUNTRY_CODES = "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(" ");

// Generate labels on the server and pass them to the form. Browser and Node
// locale data can differ, so generating both independently causes hydration errors.
export function getCountries() {
  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
  return COUNTRY_CODES.map((code) => ({
    code,
    name: regionNames.of(code) ?? code,
  })).sort((a, b) => a.name.localeCompare(b.name, "en"));
}

export type WaitlistDetails = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
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
    country: read("country"),
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
  if (!COUNTRY_CODES.includes(data.country)) {
    errors.country = "Please select your country.";
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
