import { z } from "zod";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Formularz kontaktowy (sekcyjna 7 strony głównej). */
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Podaj imię i nazwisko"),
  email: z
    .string()
    .trim()
    .min(1, "Podaj adres e-mail")
    .refine((v) => emailRe.test(v), "Podaj poprawny adres e-mail"),
  phone: z.string().trim().optional(),
  subject: z.string().trim().min(1, "Podaj temat"),
  message: z.string().trim().min(1, "Wiadomość nie może być pusta"),
  consent: z
    .boolean()
    .refine((v) => v === true, { message: "Wymagana jest zgoda na kontakt" }),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Dane przesyłane z formularza checkoutu. */
export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "Koszyk jest pusty"),
  customer: z.object({
    firstName: z.string().trim().min(1, "Podaj imię"),
    lastName: z.string().trim().min(1, "Podaj nazwisko"),
    email: z
      .string()
      .trim()
      .min(1, "Podaj adres e-mail")
      .refine((v) => emailRe.test(v), "Podaj poprawny adres e-mail"),
    phone: z.string().trim().min(7, "Podaj numer telefonu"),
  }),
  delivery: z.object({
    method: z.enum(["INPOST_LOCKER", "INPOST_COURIER"]),
    lockerCode: z.string().trim().optional(),
    street: z.string().trim().min(1, "Podaj ulicę"),
    postCode: z.string().trim().min(2, "Podaj kod pocztowy"),
    city: z.string().trim().min(1, "Podaj miejscowość"),
  }),
  payment: z
    .object({
      method: z.enum(["stripe", "cod"]),
    })
    .default({ method: "stripe" }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** Pierwszy komunikat błędu z wyniku Zod — do wyświetlenia w UI. */
export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Nieprawidłowe dane formularza.";
}
