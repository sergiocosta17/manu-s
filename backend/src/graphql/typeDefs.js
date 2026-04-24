const { gql } = require('apollo-server-express');

const typeDefs = gql`
  # ENUMS
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

  # TYPES
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

  # Cupom de desconto
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

  # Resultado da validação de cupom
  type CouponValidation {
    valid: Boolean!
    message: String
    discount: Float
  }

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

  # Configurações da loja (inclui horários de funcionamento)
  type StoreSettings {
    id: ID!
    storeName: String
    storeAddress: String
    storePhone: String
    businessHours: String
    createdAt: String
    updatedAt: String
  }

  # INPUTS
  # Input para criação/atualização de endereço
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

  # Input para adicionar método de pagamento
  input PaymentMethodInput {
    type: PaymentMethod!
    label: String
    cardLast4: String
    cardBrand: String
    isDefault: Boolean
  }

  # Input para criação/atualização de produto
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

  # Input para criação/atualização de banner
  input BannerInput {
    title: String
    subtitle: String
    imageUrl: String!
    location: BannerLocation
    order: Int
    isActive: Boolean
  }

  # Input para informações do veículo
  input VehicleInput {
    brand: String!
    model: String!
    plate: String!
    year: Int!
    color: String!
  }

  # Input para criação de entregador
  input CourierInput {
    firstName: String!
    lastName: String!
    phone: String!
    email: String!
    cpf: String!
    vehicle: VehicleInput!
    isActive: Boolean
  }

  # Input para atualização de entregador
  input UpdateCourierInput {
    firstName: String
    lastName: String
    phone: String
    email: String
    cpf: String
    vehicle: VehicleInput
    isActive: Boolean
  }

  # Input para item de pedido
  input OrderItemInput {
    product: ID!
    name: String!
    price: Float!
    quantity: Int!
  }

  # Input para criação de pedido
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

  # Input para criação/atualização de promoção
  input PromotionInput {
    name: String!
    products: [ID!]!
    discountType: DiscountType!
    discountValue: Float!
    startDate: String!
    endDate: String!
    isActive: Boolean
  }

  # Input para criação/atualização de cupom
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

  # Input para atualização de perfil do cliente
  input UpdateProfileInput {
    name: String
    phone: String
    birthDate: String
    avatarUrl: String
  }

  # Input para atualização de perfil da loja (admin)
  input UpdateStoreInput {
    storeName: String
    storeAddress: AddressInput
    storePhone: String
    phone: String
    avatarUrl: String
  }

  # Input para alteração de senha
  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  # Input para configurações da loja (horários de funcionamento)
  input StoreSettingsInput {
    storeName: String
    storeAddress: String
    storePhone: String
    businessHours: String
  }

  # QUERIES
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
    
    # Couriers (Entregadores)
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
    coupons: [Coupon!]!
    coupon(id: ID!): Coupon
    
    # Validate coupon (Client)
    validateCoupon(code: String!, orderTotal: Float!): CouponValidation!
    
    # Dashboard (Admin)
    dashboardMetrics: DashboardMetrics!
    
    # Shipping
    calculateShipping(zipCode: String!): ShippingQuote!
    
    # Store info (para pickup - retorna usuário admin)
    storeInfo: User
    
    # Store settings (para checkout e horários de funcionamento)
    storeSettings: StoreSettings
  }

  # MUTATIONS
  type Mutation {
    # Auth
    signup(name: String!, email: String!, password: String!, role: Role, adminKey: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    changePassword(input: ChangePasswordInput!): Boolean!
    
    # Profile (Client)
    updateProfile(input: UpdateProfileInput!): User!
    
    # Store Profile (Admin)
    updateStore(input: UpdateStoreInput!): User!
    
    # Store Settings - Horários de Funcionamento (Admin)
    updateStoreSettings(input: StoreSettingsInput!): StoreSettings!
    
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
    
    # Couriers (Admin)
    createCourier(input: CourierInput!): Courier!
    updateCourier(id: ID!, input: UpdateCourierInput!): Courier!
    deleteCourier(id: ID!): Boolean!
    toggleCourierActive(id: ID!): Courier!
    
    # Orders
    createOrder(input: OrderInput!): Order!
    
    # Order Status (Admin)
    updateOrderStatus(id: ID!, status: OrderStatus!): Order!
    
    # Assign Courier to Order (Admin)
    assignCourier(orderId: ID!, courierId: ID!): Order!
    
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

    # Confirm delivery (mantido por compatibilidade)
    confirmDelivery(id: ID!): Order!
  }
`;

module.exports = typeDefs;
