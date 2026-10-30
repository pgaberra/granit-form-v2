import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "sv-SE",
}: ConvertToLocaleParams) => {
  return currency_code && !isEmpty(currency_code)
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency_code,
        // Whole-krona prices read as "5 945 kr"; amounts with öre (e.g. moms) keep them.
        minimumFractionDigits:
          minimumFractionDigits ?? (Number.isInteger(amount) ? 0 : undefined),
        maximumFractionDigits,
      }).format(amount)
    : amount.toString()
}
