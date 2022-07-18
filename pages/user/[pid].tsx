import Cookies from "cookies";
import type { NextPage, GetServerSideProps } from "next";
import { useState, useEffect } from "react";

import type { Account, Balance } from "../../types/index";
import { getBalanceForAccounts } from "../../helpers/accounts";

const Profile: NextPage<{ userData: any }> = ({
  userData,
  userAuth,
  token,
}) => {
  const [accounts, setAccounts] = useState(userData.accounts);

  useEffect(() => {
    const fetchBalance = async () => {
      // Fetching balances can take some time, therefore we fetch it after the initial rendering
      return await fetch(
        `https://api-sandbox.monerium.dev/profiles/${userData.id}/balances`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ).then(async (data) => {
        const balances = await data.json();
        setAccounts(getBalanceForAccounts(accounts, balances));
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
      <table style={{ textAlign: "left" }}>
        <thead>
          <tr>
            <th>currency</th>
            <th>balance</th>
            <th>network</th>
            <th>address</th>
            <th>iban</th>
          </tr>
        </thead>
        <tbody>
          {accounts?.map((a: Account & Balance, i: number) => (
            <tr key={i + a.currency + a.amount}>
              <td>{a.currency}</td>
              <td>{a.amount}</td>
              <td>
                {a.chain}:{a.network}
              </td>
              <td>{a.address}</td>
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

  const userData = await fetch(
    `https://api-sandbox.monerium.dev/profiles/${userAccess.profile}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userAccess.access_token}`,
      },
    }
  ).then(async (data) => {
    return await data.json();
  });

  const userAuth = await fetch(
    `https://api-sandbox.monerium.dev/auth/context`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userAccess.access_token}`,
      },
    }
  ).then(async (data) => {
    return await data.json();
  });
  console.log("userData", userData);
  console.log("userAuth", userAuth);

  return {
    props: {
      userData,
      userAuth,
      token: userAccess.access_token,
    }, // will be passed to the page component as props
  };
};

export default Profile;
