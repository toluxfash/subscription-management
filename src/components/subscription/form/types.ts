// Form validation types
export type FormErrors = {
  [key: string]: string
}

// Form data type - excludes auto-calculated fields and optional display fields
export type SubscriptionFormData = {
  name: string
  plan: string
  billingCycle: "monthly" | "quarterly" | "yearly"
  amount: number
  currency: string
  paymentMethodId: number
  startDate: string
  status: "active" | "trial" | "cancelled"
  categoryId: number
  renewalType: "auto" | "manual"
  notes: string
  website: string
}