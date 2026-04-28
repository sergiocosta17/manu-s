import { gql } from '@apollo/client';

// ============================================
// QUERIES - CASHBACK
// ============================================

export const GET_CASHBACK_SETTINGS = gql`
  query GetCashbackSettings {
    cashbackSettings {
      id
      isEnabled
      defaultPercentage
      minRedeemValue
      maxRedeemPercentage
      maxRedeemValue
      defaultExpirationDays
      displayMessage
      updatedAt
    }
  }
`;

export const GET_CASHBACK_RULES = gql`
  query GetCashbackRules($onlyActive: Boolean) {
    cashbackRules(onlyActive: $onlyActive) {
      id
      name
      description
      type
      percentage
      categories
      products {
        id
        name
      }
      minOrderValue
      maxCashbackValue
      expirationDays
      allowEarnOnCashbackPayment
      allowEarnWithCoupon
      priority
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_CASHBACK_RULE = gql`
  query GetCashbackRule($id: ID!) {
    cashbackRule(id: $id) {
      id
      name
      description
      type
      percentage
      categories
      products {
        id
        name
      }
      minOrderValue
      maxCashbackValue
      expirationDays
      allowEarnOnCashbackPayment
      allowEarnWithCoupon
      priority
      isActive
    }
  }
`;

export const GET_CASHBACK_CAMPAIGNS = gql`
  query GetCashbackCampaigns($onlyActive: Boolean) {
    cashbackCampaigns(onlyActive: $onlyActive) {
      id
      name
      description
      multiplier
      fixedPercentage
      categories
      products {
        id
        name
      }
      maxCashbackValue
      maxUsesPerUser
      startDate
      endDate
      imageUrl
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_CASHBACK_CAMPAIGN = gql`
  query GetCashbackCampaign($id: ID!) {
    cashbackCampaign(id: $id) {
      id
      name
      description
      multiplier
      fixedPercentage
      categories
      products {
        id
        name
      }
      maxCashbackValue
      maxUsesPerUser
      startDate
      endDate
      imageUrl
      isActive
    }
  }
`;

export const GET_CASHBACK_REPORT = gql`
  query GetCashbackReport($startDate: String!, $endDate: String!) {
    cashbackReport(startDate: $startDate, endDate: $endDate) {
      totalCredited
      totalDebited
      totalExpired
      activeWallets
      totalBalance
      transactionCount
    }
  }
`;

export const GET_MY_CASHBACK_WALLET = gql`
  query GetMyCashbackWallet {
    myCashbackWallet {
      id
      balance
      totalEarned
      totalUsed
      totalExpired
      transactions {
        id
        type
        amount
        description
        orderId
        expiresAt
        createdAt
      }
    }
  }
`;

export const GET_MY_CASHBACK_SUMMARY = gql`
  query GetMyCashbackSummary {
    myCashbackSummary {
      balance
      pendingExpiration
      nextExpirationDate
      totalEarned
      isEnabled
      currentCampaign {
        id
        name
        description
        multiplier
        fixedPercentage
        endDate
      }
    }
  }
`;

// ============================================
// MUTATIONS - CASHBACK SETTINGS
// ============================================

export const UPDATE_CASHBACK_SETTINGS = gql`
  mutation UpdateCashbackSettings($input: CashbackSettingsInput!) {
    updateCashbackSettings(input: $input) {
      id
      isEnabled
      defaultPercentage
      minRedeemValue
      maxRedeemPercentage
      maxRedeemValue
      defaultExpirationDays
      displayMessage
      updatedAt
    }
  }
`;

// ============================================
// MUTATIONS - CASHBACK RULES
// ============================================

export const CREATE_CASHBACK_RULE = gql`
  mutation CreateCashbackRule($input: CashbackRuleInput!) {
    createCashbackRule(input: $input) {
      id
      name
      description
      type
      percentage
      categories
      minOrderValue
      maxCashbackValue
      expirationDays
      allowEarnOnCashbackPayment
      allowEarnWithCoupon
      priority
      isActive
    }
  }
`;

export const UPDATE_CASHBACK_RULE = gql`
  mutation UpdateCashbackRule($id: ID!, $input: CashbackRuleInput!) {
    updateCashbackRule(id: $id, input: $input) {
      id
      name
      description
      type
      percentage
      categories
      minOrderValue
      maxCashbackValue
      expirationDays
      allowEarnOnCashbackPayment
      allowEarnWithCoupon
      priority
      isActive
    }
  }
`;

export const DELETE_CASHBACK_RULE = gql`
  mutation DeleteCashbackRule($id: ID!) {
    deleteCashbackRule(id: $id)
  }
`;

export const TOGGLE_CASHBACK_RULE_ACTIVE = gql`
  mutation ToggleCashbackRuleActive($id: ID!) {
    toggleCashbackRuleActive(id: $id) {
      id
      isActive
    }
  }
`;

// ============================================
// MUTATIONS - CASHBACK CAMPAIGNS
// ============================================

export const CREATE_CASHBACK_CAMPAIGN = gql`
  mutation CreateCashbackCampaign($input: CashbackCampaignInput!) {
    createCashbackCampaign(input: $input) {
      id
      name
      description
      multiplier
      fixedPercentage
      categories
      maxCashbackValue
      maxUsesPerUser
      startDate
      endDate
      imageUrl
      isActive
    }
  }
`;

export const UPDATE_CASHBACK_CAMPAIGN = gql`
  mutation UpdateCashbackCampaign($id: ID!, $input: CashbackCampaignInput!) {
    updateCashbackCampaign(id: $id, input: $input) {
      id
      name
      description
      multiplier
      fixedPercentage
      categories
      maxCashbackValue
      maxUsesPerUser
      startDate
      endDate
      imageUrl
      isActive
    }
  }
`;

export const DELETE_CASHBACK_CAMPAIGN = gql`
  mutation DeleteCashbackCampaign($id: ID!) {
    deleteCashbackCampaign(id: $id)
  }
`;

export const TOGGLE_CASHBACK_CAMPAIGN_ACTIVE = gql`
  mutation ToggleCashbackCampaignActive($id: ID!) {
    toggleCashbackCampaignActive(id: $id) {
      id
      isActive
    }
  }
`;

// ============================================
// MUTATIONS - AJUSTES MANUAIS
// ============================================

export const ADJUST_USER_CASHBACK = gql`
  mutation AdjustUserCashback($userId: ID!, $amount: Float!, $description: String!) {
    adjustUserCashback(userId: $userId, amount: $amount, description: $description) {
      id
      balance
      totalEarned
      totalUsed
      transactions {
        id
        type
        amount
        description
        createdAt
      }
    }
  }
`;

export const EXPIRE_OLD_CASHBACK = gql`
  mutation ExpireOldCashback {
    expireOldCashback
  }
`;