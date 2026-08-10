import {
  UtensilsCrossed, Bus, ShoppingBag, Receipt, Clapperboard,
  GraduationCap, HeartPulse, Plane, Home, Carrot, MoreHorizontal,
  Banknote, Briefcase, Building2, Gift, TrendingUp, Wallet,
  Landmark, CreditCard, Smartphone,
} from 'lucide-react'

export const EXPENSE_CATEGORIES = [
  { value: 'Food', label: 'Food', icon: UtensilsCrossed, color: '#C98A2C' },
  { value: 'Transport', label: 'Transport', icon: Bus, color: '#1B2A4A' },
  { value: 'Shopping', label: 'Shopping', icon: ShoppingBag, color: '#B94A3E' },
  { value: 'Bills', label: 'Bills', icon: Receipt, color: '#6B5B95' },
  { value: 'Entertainment', label: 'Entertainment', icon: Clapperboard, color: '#2E86AB' },
  { value: 'Education', label: 'Education', icon: GraduationCap, color: '#1C6B4C' },
  { value: 'Health', label: 'Health', icon: HeartPulse, color: '#D6455D' },
  { value: 'Travel', label: 'Travel', icon: Plane, color: '#3D7A9C' },
  { value: 'Rent', label: 'Rent', icon: Home, color: '#8B5A2B' },
  { value: 'Groceries', label: 'Groceries', icon: Carrot, color: '#4C9F70' },
  { value: 'Other', label: 'Other', icon: MoreHorizontal, color: '#8B9990' },
]

export const INCOME_SOURCES = [
  { value: 'Salary', label: 'Salary', icon: Banknote, color: '#1C6B4C' },
  { value: 'Freelance', label: 'Freelance', icon: Briefcase, color: '#2E86AB' },
  { value: 'Business', label: 'Business', icon: Building2, color: '#6B5B95' },
  { value: 'Scholarship', label: 'Scholarship', icon: GraduationCap, color: '#3D7A9C' },
  { value: 'Gift', label: 'Gift', icon: Gift, color: '#B94A3E' },
  { value: 'Investment', label: 'Investment', icon: TrendingUp, color: '#C98A2C' },
  { value: 'Other', label: 'Other', icon: MoreHorizontal, color: '#8B9990' },
]

export const PAYMENT_METHODS = [
  { value: 'Cash', label: 'Cash', icon: Wallet },
  { value: 'UPI', label: 'UPI', icon: Smartphone },
  { value: 'Debit Card', label: 'Debit Card', icon: CreditCard },
  { value: 'Credit Card', label: 'Credit Card', icon: CreditCard },
  { value: 'Bank Transfer', label: 'Bank Transfer', icon: Landmark },
  { value: 'Other', label: 'Other', icon: MoreHorizontal },
]

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
]

export function getCategoryMeta(category, type = 'expense') {
  const list = type === 'income' ? INCOME_SOURCES : EXPENSE_CATEGORIES
  return list.find((c) => c.value === category) || list[list.length - 1]
}
