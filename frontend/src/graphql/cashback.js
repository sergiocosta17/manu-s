import { gql } from '@apollo/client';

// queries - cashback

export const getCashbackSettings = gql`
  query getCashbackSettings {
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

export const getCashbackRules = gql`
  query getCashbackRules($onlyActive: Boolean) {
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

export const getCashbackRule = gql`
  query getCashbackRule($id: ID!) {
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

export const getCashbackCampaigns = gql`
  query getCashbackCampaigns($onlyActive: Boolean) {
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

export const getCashbackCampaign = gql`
  query getCashbackCampaign($id: ID!) {
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

export const getCashbackReport = gql`
  query getCashbackReport($startDate: String!, $endDate: String!) {
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

export const getMyCashbackWallet = gql`
  query getMyCashbackWallet {
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

export const getMyCashbackSummary = gql`
  query getMyCashbackSummary {
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

// mutations - cashback settings

export const updateCashbackSettings = gql`
  mutation updateCashbackSettings($input: CashbackSettingsInput!) {
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

// mutations - cashback rules

export const createCashbackRule = gql`
  mutation createCashbackRule($input: CashbackRuleInput!) {
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

export const updateCashbackRule = gql`
  mutation updateCashbackRule($id: ID!, $input: CashbackRuleInput!) {
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

export const deleteCashbackRule = gql`
  mutation deleteCashbackRule($id: ID!) {
    deleteCashbackRule(id: $id)
  }
`;

export const toggleCashbackRuleActive = gql`
  mutation toggleCashbackRuleActive($id: ID!) {
    toggleCashbackRuleActive(id: $id) {
      id
      isActive
    }
  }
`;

// mutations - cashback campaigns

export const createCashbackCampaign = gql`
  mutation createCashbackCampaign($input: CashbackCampaignInput!) {
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

export const updateCashbackCampaign = gql`
  mutation updateCashbackCampaign($id: ID!, $input: CashbackCampaignInput!) {
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

export const deleteCashbackCampaign = gql`
  mutation deleteCashbackCampaign($id: ID!) {
    deleteCashbackCampaign(id: $id)
  }
`;

export const toggleCashbackCampaignActive = gql`
  mutation toggleCashbackCampaignActive($id: ID!) {
    toggleCashbackCampaignActive(id: $id) {
      id
      isActive
    }
  }
`;

// mutations - ajustes manuais

export const adjustUserCashback = gql`
  mutation adjustUserCashback($userId: ID!, $amount: Float!, $description: String!) {
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

export const expireOldCashback = gql`
  mutation expireOldCashback {
    expireOldCashback
  }
`;