import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppliedCode, CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  appliedCode: AppliedCode | null;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantLabel?: string) => void;
  updateQuantity: (productId: string, variantLabel: string | undefined, quantity: number) => void;
  clearCart: () => void;
  setAppliedCode: (code: AppliedCode | null) => void;
  totalCents: () => number;
  totalItems: () => number;
  discountCents: () => number;
  finalTotalCents: () => number;
}

function sameLine(a: CartItem, productId: string, variantLabel?: string) {
  return a.productId === productId && a.variantLabel === variantLabel;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCode: null,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, item.productId, item.variantLabel));
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, item.productId, item.variantLabel)
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (productId, variantLabel) =>
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, productId, variantLabel)),
        })),
      updateQuantity: (productId, variantLabel, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              sameLine(i, productId, variantLabel) ? { ...i, quantity } : i
            )
            .filter((i) => i.quantity > 0),
        })),
      clearCart: () => set({ items: [], appliedCode: null }),
      setAppliedCode: (code) => set({ appliedCode: code }),
      totalCents: () => get().items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      discountCents: () => get().appliedCode?.discountCents ?? 0,
      finalTotalCents: () => Math.max(0, get().totalCents() - get().discountCents()),
    }),
    { name: "vcloset-cart" }
  )
);
