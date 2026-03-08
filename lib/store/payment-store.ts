import { create } from 'zustand'
import api from '@/lib/api/mock-api'
import { useAuthStore } from './auth-store'
import type { Payment } from '@/lib/types/payment'

export type { Payment } from '@/lib/types/payment'

interface PaymentState {
  payment: Payment | null
  isLoading: boolean
  error: string | null
  lastChecked: string | null
  whatsappVerified: boolean
  checkPaymentStatus: () => Promise<string>
  resetPaymentState: () => void
  setWhatsappVerified: (verified: boolean) => void
}

export const usePaymentStore = create<PaymentState>()((set, get) => ({
  payment: null,
  isLoading: false,
  error: null,
  lastChecked: null,
  whatsappVerified: false,
  
  checkPaymentStatus: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const user = useAuthStore.getState().user
      
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      const response = await api.get('/payments/status', {
        params: { userId: user.id },
      })
      
      const { payment } = response.data
      const lastChecked = new Date().toLocaleString('id-ID')
      
      set({
        payment,
        isLoading: false,
        lastChecked,
      })
      
      // If payment is completed, update user payment status
      if (payment.status === 'completed') {
        useAuthStore.getState().updateUser({
          hasCompletedPayment: true,
        })
      }
      
      return payment.status
    } catch (error) {
      set({
        error: 'Failed to check payment status. Please try again.',
        isLoading: false,
      })
      throw error
    }
  },
  
  resetPaymentState: () => {
    set({
      payment: null,
      isLoading: false,
      error: null,
      lastChecked: null,
      whatsappVerified: false
    })
  },
  
  setWhatsappVerified: (verified: boolean) => {
    set({ whatsappVerified: verified })
  }
}))

