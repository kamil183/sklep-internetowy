/** Database brand config (used by contact, footer, etc.) */
export const BRAND = {
  name: "ZODARA PARFUMS",
  shortName: "ZODARA",
  owner: "Laura Ludef",
  street: "Ul. Wielichowska 4",
  postalCode: "62-067",
  city: "Rakoniewice",
  get fullAddress() {
    return `${this.street}, ${this.postalCode} ${this.city}`;
  },
  nip: "9950267308",
  email: "zodaraparfums@gmail.com",
  slogan: "Zapach, który zostaje w pamięci.",
} as const;

/** Brand slogan used in hero and meta descriptions. */
export const BRAND_SLOGAN = "Zapach, który zostaje w pamięci.";
