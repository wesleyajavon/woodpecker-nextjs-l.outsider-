import { Beat } from './beat'

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'
  | 'REFUNDED'
  | 'DISPUTED'

export type LicenseType =
  | 'WAV_LEASE'
  | 'TRACKOUT_LEASE'
  | 'UNLIMITED_LEASE'
  | 'EXCLUSIVE'
  | 'CUSTOM'

export interface MultiItemOrder {
  id: string
  customerEmail: string
  customerName?: string | null
  customerPhone?: string | null
  totalAmount: number
  currency: string
  status: OrderStatus
  paymentMethod?: string | null
  paymentId?: string | null
  paidAt?: Date | null
  usageRights: string[]
  createdAt: Date
  updatedAt: Date
  items: OrderItem[]
  sessionId?: string
}

export interface OrderItem {
  id: string
  orderId: string
  beatId: string
  beat: Beat
  quantity: number
  unitPrice: number
  totalPrice: number
  licenseType: LicenseType
  createdAt: Date
  updatedAt: Date
}

export interface CreateMultiItemOrderInput {
  customerEmail: string
  customerName?: string
  customerPhone?: string
  totalAmount: number
  currency?: string
  paymentMethod?: string
  paymentId?: string
  licenseType?: LicenseType
  usageRights?: string[]
  items: Array<{
    beatId: string
    quantity: number
    unitPrice: number
  }>
  sessionId?: string
}
