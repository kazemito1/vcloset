export type OrderStatus = "PENDING" | "PAID" | "FAILED" | "CANCELED";
export type PaymentMethodType = "CREDIT_CARD" | "PIX";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductVariant {
  id: string;
  label: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  material: string;
  priceCents: number;
  salePriceCents?: number | null;
  targetGender: string;
  images: string[];
  featured: boolean;
  categoryId: string;
  category?: Category;
  variants: ProductVariant[];
}

export interface ShippingAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  unitPriceCents: number;
  quantity: number;
  variantLabel?: string;
}

export interface OrderItemInput {
  productId: string;
  productName: string;
  variantLabel?: string;
  quantity: number;
  unitPriceCents: number;
}

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerCpf: string;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethodType;
  items: OrderItemInput[];
  appliedCode?: string;
  useCredit?: boolean;
}

export interface OrderResponse {
  id: string;
  customerName: string;
  customerEmail: string;
  totalCents: number;
  discountCents?: number;
  couponCode?: string | null;
  referralCode?: string | null;
  status: OrderStatus;
  paymentMethod: PaymentMethodType;
  paymentRef?: string | null;
  pixQrCode?: string | null;
  pixQrCodeBase64?: string | null;
  createdAt: string;
}

export type CouponType = "PERCENT" | "FIXED";

export interface AppliedCode {
  code: string;
  kind: "COUPON" | "REFERRAL";
  discountCents: number;
}
