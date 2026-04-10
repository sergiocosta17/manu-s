const { gql } = require('apollo-server-express');

const typeDefs = gql`
  # ==================== ENUMS ====================
  enum Role { USER ADMIN }
  
  enum OrderStatus { 
    PLACED 
    CONFIRMED 
    PREPARING 
    OUT_FOR_DELIVERY 
    DELIVERED 
    COMPLETED 
    CANCELLED 
  }
  
  enum PaymentStatus { PENDING PAID FAILED REFUNDED }
  
  enum PaymentMethod { 
    CREDIT_CARD 
    DEBIT_CARD 
    PIX 
    APPLE_PAY 
    GOOGLE_PAY 
    CASH 
    CARD_ON_DELIVERY 
  }
  
  enum DeliveryType { DELIVERY PICKUP }
  
  enum Category { BURGER CHICKEN COMBO SIDE DRINK DESSERT }
  
  enum BannerLocation { HOME OFFERS }
  
  enum DiscountType { PERCENTAGE FIXED }

  # ==================== TYPES ====================
  type Address {
    id: ID!
    label: String!
    zipCode: String!
    street: String!
    number: String!
    complement: String
    neighborhood: String!
    city: String!
    state: String!
    isDefault: Boolean!
  }

  type SavedPaymentMethod {
    id: ID!
    type: PaymentMethod!
    label: String
    cardLast4: String
    cardBrand: String
    isDefault: Boolean!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    phone: String
    birthDate: String
    avatarUrl: String
    storeName: String
    storeAddress: Address
    addresses: [Address!]!
    paymentMethods: [SavedPaymentMethod!]!
    createdAt: String!
  }

  type Product {
    id: ID!
    name: String!
    price: Float!
    promotionalPrice: Float
    description: String
    category: Category!
    imageUrl: String
    isFeatured: Boolean!
    isAvailable: Boolean!
  }

  type Banner {
    id: ID!
    title: String
    subtitle: String
    imageUrl: String!
    location: BannerLocation!
    order: Int!
    isActive: Boolean!
  }

  type OrderItem {
    product: Product
    name: String!
    price: Float!
    quantity: Int!
  }

  type StatusHistory {
    status: OrderStatus!
    timestamp: String!
  }

  type Order {
    id: ID!
    user: User!
    items: [OrderItem!]!
    subtotal: Float!
    shippingFee: Float!
    discount: Float!
    total: Float!
    couponCode: String
    deliveryType: DeliveryType!
    deliveryAddress: Address
    paymentMethod: PaymentMethod!
    paymentStatus: PaymentStatus!
    status: OrderStatus!
    statusHistory: [StatusHistory!]!
    customerConfirmedAt: String
    createdAt: String!
    updatedAt: String!
  }

  type Promotion {
    id: ID!
    name: String!
    products: [Product!]!
    discountType: DiscountType!
    discountValue: Float!
    startDate: String!
    endDate: String!
    isActive: Boolean!
  }

  type Coupon {
    id: ID!
    code: String!
    discountType: DiscountType!
    discountValue: Float!
    minOrderValue: Float!
    maxUses: Int
    usedCount: Int!
    startDate: String!
    endDate: String!
    isActive: Boolean!
  }

  type CouponValidation {
    valid: Boolean!
    message: String
    discount: Float
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type DashboardMetrics {
    totalOrders: Int!
    pendingOrders: Int!
    totalRevenue: Float!
    todayOrders: Int!
    todayRevenue: Float!
    weekOrders: Int!
    weekRevenue: Float!
    monthOrders: Int!
    monthRevenue: Float!
  }

  type ShippingQuote {
    fee: Float!
    estimatedDays: Int!
  }

  # ==================== INPUTS ====================
  input AddressInput {
    label: String!
    zipCode: String!
    street: String!
    number: String!
    complement: String
    neighborhood: String!
    city: String!
    state: String!
    isDefault: Boolean
  }

  input PaymentMethodInput {
    type: PaymentMethod!
    label: String
    cardLast4: String
    cardBrand: String
    isDefault: Boolean
  }

  input ProductInput {
    name: String!
    price: Float!
    promotionalPrice: Float
    description: String
    category: Category!
    imageUrl: String
    isFeatured: Boolean
    isAvailable: Boolean
  }

  input BannerInput {
    title: String
    subtitle: String
    imageUrl: String!
    location: BannerLocation
    order: Int
    isActive: Boolean
  }

  input OrderItemInput {
    product: ID!
    name: String!
    price: Float!
    quantity: Int!
  }

  input OrderInput {
    items: [OrderItemInput!]!
    subtotal: Float!
    shippingFee: Float!
    discount: Float
    total: Float!
    couponCode: String
    deliveryType: DeliveryType!
    deliveryAddress: AddressInput
    paymentMethod: PaymentMethod!
  }

  input PromotionInput {
    name: String!
    products: [ID!]!
    discountType: DiscountType!
    discountValue: Float!
    startDate: String!
    endDate: String!
    isActive: Boolean
  }

  input CouponInput {
    code: String!
    discountType: DiscountType!
    discountValue: Float!
    minOrderValue: Float
    maxUses: Int
    startDate: String!
    endDate: String!
    isActive: Boolean
  }

  input UpdateProfileInput {
    name: String
    phone: String
    birthDate: String
    avatarUrl: String
  }

  input UpdateStoreInput {
    storeName: String
    phone: String
    avatarUrl: String
    storeAddress: AddressInput
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  # ==================== QUERIES ====================
  type Query {
    # Auth
    me: User!
    
    # Products
    products(category: Category, onlyAvailable: Boolean): [Product!]!
    product(id: ID!): Product
    featuredProducts: [Product!]!
    productsOnSale: [Product!]!
    
    # Banners
    banners(location: BannerLocation): [Banner!]!
    
    # Orders
    orders(status: OrderStatus, limit: Int, offset: Int): [Order!]!
    order(id: ID!): Order
    activeOrders: [Order!]!
    orderHistory(limit: Int, offset: Int): [Order!]!
    
    # Promotions
    promotions(onlyActive: Boolean): [Promotion!]!
    promotion(id: ID!): Promotion
    activePromotions: [Promotion!]!
    
    # Coupons (Admin)
    coupons: [Coupon!]!
    coupon(id: ID!): Coupon
    
    # Validate coupon (Client)
    validateCoupon(code: String!, orderTotal: Float!): CouponValidation!
    
    # Dashboard (Admin)
    dashboardMetrics: DashboardMetrics!
    
    # Shipping
    calculateShipping(zipCode: String!): ShippingQuote!
    
    # Store info (para pickup)
    storeInfo: User
  }

  # ==================== MUTATIONS ====================
  type Mutation {
    # Auth
    signup(name: String!, email: String!, password: String!, role: Role, adminKey: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    changePassword(input: ChangePasswordInput!): Boolean!
    
    # Profile (Client)
    updateProfile(input: UpdateProfileInput!): User!
    
    # Store Profile (Admin)
    updateStore(input: UpdateStoreInput!): User!
    
    # Addresses (Client)
    addAddress(input: AddressInput!): User!
    updateAddress(addressId: ID!, input: AddressInput!): User!
    deleteAddress(addressId: ID!): User!
    setDefaultAddress(addressId: ID!): User!
    
    # Payment Methods (Client)
    addPaymentMethod(input: PaymentMethodInput!): User!
    deletePaymentMethod(paymentMethodId: ID!): User!
    setDefaultPaymentMethod(paymentMethodId: ID!): User!
    
    # Products (Admin)
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
    toggleProductAvailability(id: ID!): Product!
    toggleProductFeatured(id: ID!): Product!
    
    # Banners (Admin)
    createBanner(input: BannerInput!): Banner!
    updateBanner(id: ID!, input: BannerInput!): Banner!
    deleteBanner(id: ID!): Boolean!
    
    # Orders
    createOrder(input: OrderInput!): Order!
    
    # Order Status (Admin)
    updateOrderStatus(id: ID!, status: OrderStatus!): Order!
    
    # Order Confirmation (Client)
    confirmOrderReceived(id: ID!): Order!
    
    # Promotions (Admin)
    createPromotion(input: PromotionInput!): Promotion!
    updatePromotion(id: ID!, input: PromotionInput!): Promotion!
    deletePromotion(id: ID!): Boolean!
    
    # Coupons (Admin)
    createCoupon(input: CouponInput!): Coupon!
    updateCoupon(id: ID!, input: CouponInput!): Coupon!
    deleteCoupon(id: ID!): Boolean!
    
    # Apply coupon (usado internamente no createOrder)
    applyCoupon(code: String!): Coupon!
  }
`;

module.exports = typeDefs;