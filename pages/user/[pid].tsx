import Cookies from "cookies";
import type { NextPage, GetServerSideProps } from "next";
import { useState, useEffect } from "react";

import type { AuthContext, Balances, Profile } from "../../types/index";
import { getBalanceForAccounts } from "../../helpers/accounts";
import styles from "../../styles/User.module.css";

const UserProfile: NextPage<{
  userData: Profile;
  userAuth: AuthContext;
  token: any;
}> = ({ userData, userAuth, token }) => {
  const [accounts, setAccounts] = useState(userData.accounts);

  useEffect(() => {
    const fetchBalance = async () => {
      // Fetching balances can take some time, therefore we fetch it after the initial rendering
      return await fetch(
        `https://api.monerium.dev/profiles/${userData.id}/balances`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ).then(async (data) => {
        const balances: Balances[] = await data.json();
        setAccounts(getBalanceForAccounts(accounts, balances) as any);
        return balances;
      });
    };
    fetchBalance();
  }, []);

  return (
    <div>
      <h3>👤 {userAuth.name}</h3>
      <h4>✉️ {userAuth.email}</h4>
      <p>
        KYC:{" "}
        {userData &&
        userData.kyc.state === "confirmed" &&
        userData.kyc.outcome === "approved"
          ? "👍"
          : "👎"}
      </p>
      <table className={styles.table} style={{ textAlign: "left" }}>
        <thead>
          <tr>
            <th className={styles.balances}>balance</th>
            <th>address</th>
            <th>network</th>
            <th>iban</th>
          </tr>
        </thead>
        <tbody>
          {accounts?.map((a: any, i: number) => (
            <tr key={i + a.currency + a.amount}>
              <td>
                {a.amount || 0} {a.currency}
              </td>
              <td>{a.address.slice(0, 6) + "..." + a.address.slice(-4)}</td>
              <td>
                {a.chain}:{a.network}
              </td>
              <td>{a.iban}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  const cookies = new Cookies(req, res);
  const userAccess = JSON.parse(cookies.get(query?.pid as string) as string);

  const userData: Profile = await fetch(
    `https://api.monerium.dev/profiles/${userAccess.profile}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userAccess.access_token}`,
      },
    }
  ).then(async (data) => {
    return await data.json();
  });

  const userAuth: AuthContext = await fetch(
    `https://api.monerium.dev/auth/context`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userAccess.access_token}`,
      },
    }
  ).then(async (data) => {
    return await data.json();
  });

  return {
    props: {
      userData,
      userAuth,
      token: userAccess.access_token,
    }, // will be passed to the page component as props
  };
};

export default UserProfile;
