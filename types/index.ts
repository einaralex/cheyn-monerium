export declare type UniqueId = string;
export declare type IBAN = string;
export declare type Chain = "polygon" | "ethereum";
export declare type Network = "local" | "mumbai" | "goerli" | "mainnet";
export declare type Address = string;
export declare type Signature = string;
export declare type CurrencyCode = "eur" | "gbp" | "usd" | "isk";
export declare type TokenCode = "EURe" | "GBPe" | "USDe" | "ISKe";
export declare type KYCStatus =
  | "absent"
  | "submitted"
  | "pending"
  | "confirmed";
export declare type KYCOutcome = "approved" | "rejected" | "none" | "unknown";
export declare type TreasuryStandard = "iban" | "sort";
export interface Token {
  currency: CurrencyCode;
  ticker: Uppercase<CurrencyCode>;
  symbol: TokenCode;
  chain: Chain;
  network: Network;
  address: Address;
  decimals: number;
}
export interface Balance {
  currency: CurrencyCode;
  amount: string;
}
export interface Balances {
  id: UniqueId;
  chain: Chain;
  network: Network;
  address: Address;
  balances: Balance[];
}
export interface State {
  address: Address;
  balances: Balances;
}
export interface Account {
  id: UniqueId;
  standard?: TreasuryStandard;
  iban?: IBAN;
  sortCode?: string;
  accountNumber?: string;
  address: Address;
  currency: CurrencyCode;
  network?: Network;
  chain?: Chain;
  amount?: string;
}

export interface Profile {
  id: UniqueId;
  name: string;
  kyc: {
    state: KYCStatus;
    outcome: KYCOutcome;
  };
  defaultProfile: UniqueId;
  accounts: Account[];
}
export interface AuthProfile {
  id: UniqueId;
  kind: string;
  name: string;
  perms: Array<"read" | "write">;
}
export interface AuthContext {
  userId: UniqueId;
  email: string;
  name: string;
  roles: [];
  auth: {
    method: "password";
    subject: string;
    verified: boolean;
  };
  defaultProfile: UniqueId;
  profiles: AuthProfile[];
}
export declare enum Events {
  Tokens = "tokens",
  Address = "address",
  Profile = "profile",
  Balances = "balances",
  AuthContext = "authContext",
}
export interface WalletSignature {
  message: string;
  address: Address;
  signature: Signature;
}
export interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  profile: string;
  userId: string;
}
export interface Monerium {
  getTokens: () => Promise<Token[]>;
  getProfile: (profileId: UniqueId) => Promise<Profile>;
  getBalances: () => Promise<Balances>;
  getAuthContext: () => Promise<AuthContext>;
}
