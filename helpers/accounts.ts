import type { Account, Balance, Balances } from "../types/index";

export const getBalanceForAccounts = (
  accounts: Account[],
  balances: Balances[]
) => {
  return accounts.map((paymentAccount) => {
    const b = balances.length
      ? balances
          ?.filter(
            (d: Balances) =>
              d.address === paymentAccount.address &&
              d.chain === paymentAccount.chain
          )?.[0]
          ?.balances?.filter(
            (b: Balance) => b.currency === paymentAccount.currency
          )[0]
      : ({} as Balance);

    return {
      currency: paymentAccount.currency,
      network: paymentAccount.network,
      chain: paymentAccount.chain,
      address: paymentAccount.address,
      amount: b?.amount || "-",
      iban: paymentAccount?.iban,
      // scan: paymentAccount?.scan,
      standard: paymentAccount?.standard,
    };
  });
};
