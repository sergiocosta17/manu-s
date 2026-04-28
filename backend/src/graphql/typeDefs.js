const { gql } = require('apollo-server-express');

const typeDefs = gql`
  # ============================================
  # ENUMS
  # ============================================
  enum Role { USER ADMIN }
  
  enum OrderStatus { 
    PLACED 
    CONFIRMED 
    PREPARING 
    READY
    READY_FOR_PICKUP
    OUT_FOR_DELIVERY 
    DELIVERED 
    PICKED_UP
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
  
  enum DiscountType { PERCENTAGE FIXED FREE_SHIPPING }

  enum CouponCustomerType { ALL NEW EXISTING SPECIFIC }

  enum CashbackRuleType { GLOBAL CATEGORY PRODUCT FIRST_ORDER MIN_VALUE }

  enum CashbackTransactionType { CREDIT DEBIT EXPIRED ADJUSTMENT }

  enum DayOfWeek { SUNDAY MONDAY TUESDAY WEDNESDAY THURSDAY FRIDAY SATURDAY }

  # ============================================
  # TYPES
  # ============================================

  # Resultado da validação de endereço de entrega
  type DeliveryValidationResult {
    valid: Boolean!
    message: String!
    allowedCity: String
    allowedState: String
  }
  
  # Endereço do usuário
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

  # Método de pagamento salvo
  type SavedPaymentMethod {
    id: ID!
    type: PaymentMethod!
    label: String
    cardLast4: String
    cardBrand: String
    isDefault: Boolean!
  }

  # Usuário (cliente ou admin)
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
    storePhone: String
    addresses: [Address!]!
    paymentMethods: [SavedPaymentMethod!]!
    createdAt: String!
  }

  # Produto do cardápio
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

  # Banner promocional
  type Banner {
    id: ID!
    title: String
    subtitle: String
    imageUrl: String!
    location: BannerLocation!
    order: Int!
    isActive: Boolean!
  }

  # Informações do veículo do entregador
  type Vehicle {
    brand: String!
    model: String!
    plate: String!
    year: Int!
    color: String!
  }

  # Entregador
  type Courier {
    id: ID!
    firstName: String!
    lastName: String!
    fullName: String!
    phone: String!
    email: String!
    cpf: String!
    vehicle: Vehicle!
    isActive: Boolean!
    totalDeliveries: Int!
    totalEarnings: Float!
    createdAt: String!
    updatedAt: String!
  }

  # Métricas do entregador por período
  type CourierMetrics {
    courierId: ID!
    courierName: String!
    deliveries: Int!
    earnings: Float!
  }

  # Métricas gerais de entregadores
  type CouriersOverviewMetrics {
    totalCouriers: Int!
    activeCouriers: Int!
    totalDeliveries: Int!
    totalEarnings: Float!
    periodDeliveries: Int!
    periodEarnings: Float!
    courierMetrics: [CourierMetrics!]!
  }

  # Item do pedido
  type OrderItem {
    product: Product
    name: String!
    price: Float!
    quantity: Int!
  }

  # Histórico de status do pedido
  type StatusHistory {
    status: OrderStatus!
    timestamp: String!
  }

  # Pedido
  type Order {
    id: ID!
    user: User!
    items: [OrderItem!]!
    subtotal: Float!
    shippingFee: Float!
    discount: Float!
    cashbackUsed: Float
    cashbackEarned: Float
    total: Float!
    couponCode: String
    deliveryType: DeliveryType!
    deliveryAddress: Address
    paymentMethod: PaymentMethod!
    paymentStatus: PaymentStatus!
    status: OrderStatus!
    statusHistory: [StatusHistory!]!
    courier: Courier
    customerConfirmedAt: String
    createdAt: String!
    updatedAt: String!
  }

  # Promoção de produtos
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

  # ============================================
  # HORÁRIO DE FUNCIONAMENTO (para cupons e campanhas)
  # ============================================
  type TimeSchedule {
    startTime: String!
    endTime: String!
    daysOfWeek: [DayOfWeek!]!
  }

  # ============================================
  # CUPOM (Completo)
  # ============================================
  
type CouponUserUse {
  user: ID!
  count: Int!
  lastUsedAt: String
}

type Coupon {
  id: ID!
  code: String!
  name: String!
  description: String
  discountType: DiscountType!
  discountValue: Float!
  maxDiscountValue: Float
  minOrderValue: Float!
  applicableCategories: [Category!]
  applicableProducts: [Product!]
  customerType: CouponCustomerType!
  specificCustomers: [User!]
  maxTotalUses: Int
  maxUsesPerUser: Int!
  totalUsedCount: Int!
  userUses: [CouponUserUse!]
  allowWithCashback: Boolean!
  allowStacking: Boolean!
  startDate: String!
  endDate: String
  hasNoEndDate: Boolean!
  schedule: TimeSchedule
  isActive: Boolean!
  createdAt: String!
  updatedAt: String!
}

  # Resultado da validação de cupom
  type CouponValidation {
    valid: Boolean!
    message: String
    discount: Float
    freeShipping: Boolean
    coupon: Coupon
  }

  # ============================================
  # CASHBACK
  # ============================================
  
  # Transação de cashback
  type CashbackTransaction {
    id: ID!
    type: CashbackTransactionType!
    amount: Float!
    description: String!
    orderId: ID
    expiresAt: String
    createdAt: String!
  }

  # Carteira de cashback do usuário
  type CashbackWallet {
    id: ID!
    user: User!
    balance: Float!
    totalEarned: Float!
    totalUsed: Float!
    totalExpired: Float!
    transactions: [CashbackTransaction!]!
    createdAt: String!
    updatedAt: String!
  }

  # Regra de cashback
  type CashbackRule {
    id: ID!
    name: String!
    description: String
    type: CashbackRuleType!
    percentage: Float!
    categories: [Category!]
    products: [Product!]
    minOrderValue: Float
    maxCashbackValue: Float
    expirationDays: Int!
    allowEarnOnCashbackPayment: Boolean!
    allowEarnWithCoupon: Boolean!
    priority: Int!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  # Campanha de cashback
  type CashbackCampaign {
    id: ID!
    name: String!
    description: String
    multiplier: Float
    fixedPercentage: Float
    categories: [Category!]
    products: [Product!]
    maxCashbackValue: Float
    maxUsesPerUser: Int
    startDate: String!
    endDate: String
    hasNoEndDate: Boolean!
    schedule: TimeSchedule
    imageUrl: String
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  # Configurações gerais de cashback
  type CashbackSettings {
    id: ID!
    isEnabled: Boolean!
    defaultPercentage: Float!
    minRedeemValue: Float!
    maxRedeemPercentage: Float!
    maxRedeemValue: Float
    defaultExpirationDays: Int!
    displayMessage: String
    updatedAt: String!
  }

  # Resumo de cashback para o cliente
  type CashbackSummary {
    balance: Float!
    pendingExpiration: Float!
    nextExpirationDate: String
    totalEarned: Float!
    isEnabled: Boolean!
    currentCampaign: CashbackCampaign
  }

  # Preview do pedido com descontos
  type OrderDiscountPreview {
    subtotal: Float!
    couponDiscount: Float!
    couponCode: String
    freeShipping: Boolean!
    cashbackUsed: Float!
    shippingFee: Float!
    total: Float!
    cashbackToEarn: Float!
    cashbackToEarnExpiration: String
    errors: [String!]
  }

  # Relatório de Cashback
  type CashbackReport {
    totalCredited: Float!
    totalDebited: Float!
    totalExpired: Float!
    activeWallets: Int!
    totalBalance: Float!
    transactionCount: Int!
  }

  # Resultado da expiração de cashback
  type ExpireCashbackResult {
    success: Boolean!
    message: String!
  }

  # ============================================
  # FIM CASHBACK
  # ============================================

  # Payload de autenticação
  type AuthPayload {
    token: String!
    user: User!
  }

  # Métricas do dashboard administrativo
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

  # Cotação de frete
  type ShippingQuote {
    fee: Float!
    estimatedDays: Int!
  }

  # Configurações da loja
  type StoreSettings {
    id: ID!
    storeName: String
    storeAddress: String
    storePhone: String
    businessHours: String
    createdAt: String
    updatedAt: String
  }

  # ============================================
  # INPUTS
  # ============================================

  input AddressInput {
    label: String
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

  input VehicleInput {
    brand: String!
    model: String!
    plate: String!
    year: Int!
    color: String!
  }

  input CourierInput {
    firstName: String!
    lastName: String!
    phone: String!
    email: String!
    cpf: String!
    vehicle: VehicleInput!
    isActive: Boolean
  }

  input UpdateCourierInput {
    firstName: String
    lastName: String
    phone: String
    email: String
    cpf: String
    vehicle: VehicleInput
    isActive: Boolean
  }

  input OrderItemInput {
    product: ID!
    name: String!
    price: Float!
    quantity: Int!
    category: Category
  }

  input OrderInput {
    items: [OrderItemInput!]!
    subtotal: Float!
    shippingFee: Float!
    discount: Float
    cashbackToUse: Float
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

  # Input para horário de funcionamento
  input TimeScheduleInput {
    startTime: String!
    endTime: String!
    daysOfWeek: [DayOfWeek!]!
  }

  # Input para cupom (completo)
  input CouponInput {
    code: String!
    name: String!
    description: String
    discountType: DiscountType!
    discountValue: Float!
    maxDiscountValue: Float
    minOrderValue: Float
    applicableCategories: [Category!]
    applicableProducts: [ID!]
    customerType: CouponCustomerType
    specificCustomers: [ID!]
    maxTotalUses: Int
    maxUsesPerUser: Int
    allowWithCashback: Boolean
    allowStacking: Boolean
    startDate: String!
    endDate: String
    hasNoEndDate: Boolean
    schedule: TimeScheduleInput
    isActive: Boolean
  }

  # Input para regra de cashback
  input CashbackRuleInput {
    name: String!
    description: String
    type: CashbackRuleType!
    percentage: Float!
    categories: [Category!]
    products: [ID!]
    minOrderValue: Float
    maxCashbackValue: Float
    expirationDays: Int
    allowEarnOnCashbackPayment: Boolean
    allowEarnWithCoupon: Boolean
    priority: Int
    isActive: Boolean
  }

  # Input para campanha de cashback
  input CashbackCampaignInput {
    name: String!
    description: String
    multiplier: Float
    fixedPercentage: Float
    categories: [Category!]
    products: [ID!]
    maxCashbackValue: Float
    maxUsesPerUser: Int
    startDate: String!
    endDate: String
    hasNoEndDate: Boolean
    schedule: TimeScheduleInput
    imageUrl: String
    isActive: Boolean
  }

  # Input para configurações de cashback
  input CashbackSettingsInput {
    isEnabled: Boolean
    defaultPercentage: Float
    minRedeemValue: Float
    maxRedeemPercentage: Float
    maxRedeemValue: Float
    defaultExpirationDays: Int
    displayMessage: String
  }

  # Input para preview do pedido
  input OrderPreviewInput {
    items: [OrderItemInput!]!
    subtotal: Float!
    shippingFee: Float!
    couponCode: String
    cashbackToUse: Float
    deliveryType: DeliveryType!
  }

  input UpdateProfileInput {
    name: String
    phone: String
    birthDate: String
    avatarUrl: String
  }

  input UpdateStoreInput {
    storeName: String
    storeAddress: AddressInput
    storePhone: String
    phone: String
    avatarUrl: String
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  input StoreSettingsInput {
    storeName: String
    storeAddress: String
    storePhone: String
    businessHours: String
  }

  # ============================================
  # QUERIES
  # ============================================
  type Query {
    # Validação de endereço
    validateDeliveryAddress(city: String!, state: String!): DeliveryValidationResult!

    # Auth
    me: User!
    
    # Products
    products(category: Category, onlyAvailable: Boolean): [Product!]!
    product(id: ID!): Product
    featuredProducts: [Product!]!
    productsOnSale: [Product!]!
    
    # Banners
    banners(location: BannerLocation): [Banner!]!
    
    # Couriers
    couriers(onlyActive: Boolean): [Courier!]!
    courier(id: ID!): Courier
    couriersMetrics(period: String!): CouriersOverviewMetrics!
    courierDeliveries(courierId: ID!, period: String!): [Order!]!
    availableCouriers: [Courier!]!
    
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
    coupons(onlyActive: Boolean): [Coupon!]!
    coupon(id: ID!): Coupon
    
    # Validate coupon (Client)
    validateCoupon(code: String!, orderTotal: Float!, userId: ID): CouponValidation!
    
    # Cashback - Cliente
    myCashbackWallet: CashbackWallet
    myCashbackSummary: CashbackSummary!
    
    # Cashback - Admin
    cashbackRules(onlyActive: Boolean): [CashbackRule!]!
    cashbackRule(id: ID!): CashbackRule
    cashbackCampaigns(onlyActive: Boolean): [CashbackCampaign!]!
    cashbackCampaign(id: ID!): CashbackCampaign
    cashbackSettings: CashbackSettings!
    cashbackReport(startDate: String!, endDate: String!): CashbackReport!
    
    # Campanhas ativas (para cliente)
    activeCashbackCampaigns: [CashbackCampaign!]!
    
    # Preview do pedido
    previewOrderDiscounts(input: OrderPreviewInput!): OrderDiscountPreview!
    
    # Dashboard
    dashboardMetrics: DashboardMetrics!
    
    # Shipping
    calculateShipping(zipCode: String!): ShippingQuote!
    
    # Store
    storeInfo: User
    storeSettings: StoreSettings
  }

  # ============================================
  # MUTATIONS
  # ============================================
  type Mutation {
    # Auth
    signup(name: String!, email: String!, password: String!, role: Role, adminKey: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    changePassword(input: ChangePasswordInput!): Boolean!
    
    # Profile
    updateProfile(input: UpdateProfileInput!): User!
    updateStore(input: UpdateStoreInput!): User!
    updateStoreSettings(input: StoreSettingsInput!): StoreSettings!
    
    # Addresses
    addAddress(input: AddressInput!): User!
    updateAddress(addressId: ID!, input: AddressInput!): User!
    deleteAddress(addressId: ID!): User!
    setDefaultAddress(addressId: ID!): User!
    
    # Payment Methods
    addPaymentMethod(input: PaymentMethodInput!): User!
    deletePaymentMethod(paymentMethodId: ID!): User!
    setDefaultPaymentMethod(paymentMethodId: ID!): User!
    
    # Products
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
    toggleProductAvailability(id: ID!): Product!
    toggleProductFeatured(id: ID!): Product!
    
    # Banners
    createBanner(input: BannerInput!): Banner!
    updateBanner(id: ID!, input: BannerInput!): Banner!
    deleteBanner(id: ID!): Boolean!
    
    # Couriers
    createCourier(input: CourierInput!): Courier!
    updateCourier(id: ID!, input: UpdateCourierInput!): Courier!
    deleteCourier(id: ID!): Boolean!
    toggleCourierActive(id: ID!): Courier!
    
    # Orders
    createOrder(input: OrderInput!): Order!
    updateOrderStatus(id: ID!, status: OrderStatus!): Order!
    assignCourier(orderId: ID!, courierId: ID!): Order!
    confirmOrderReceived(id: ID!): Order!
    confirmDelivery(id: ID!): Order!
    
    # Promotions
    createPromotion(input: PromotionInput!): Promotion!
    updatePromotion(id: ID!, input: PromotionInput!): Promotion!
    deletePromotion(id: ID!): Boolean!
    
    # Coupons (Admin)
    createCoupon(input: CouponInput!): Coupon!
    updateCoupon(id: ID!, input: CouponInput!): Coupon!
    deleteCoupon(id: ID!): Boolean!
    toggleCouponActive(id: ID!): Coupon!
    
    # Cashback Rules (Admin)
    createCashbackRule(input: CashbackRuleInput!): CashbackRule!
    updateCashbackRule(id: ID!, input: CashbackRuleInput!): CashbackRule!
    deleteCashbackRule(id: ID!): Boolean!
    toggleCashbackRuleActive(id: ID!): CashbackRule!
    
    # Cashback Campaigns (Admin)
    createCashbackCampaign(input: CashbackCampaignInput!): CashbackCampaign!
    updateCashbackCampaign(id: ID!, input: CashbackCampaignInput!): CashbackCampaign!
    deleteCashbackCampaign(id: ID!): Boolean!
    toggleCashbackCampaignActive(id: ID!): CashbackCampaign!
    
    # Cashback Settings (Admin)
    updateCashbackSettings(input: CashbackSettingsInput!): CashbackSettings!
    
    # Cashback Wallet - Admin
    adjustCashbackBalance(userId: ID!, amount: Float!, description: String!): CashbackWallet!
    expireCashback: ExpireCashbackResult!
  }
`;

module.exports = typeDefs;