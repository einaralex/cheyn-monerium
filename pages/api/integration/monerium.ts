// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import Cookies from "cookies";
import { profile } from "console";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const cookies = new Cookies(req, res);
  if (req.query?.code && req.query?.state) {
    let params = JSON.parse(cookies?.get(req.query.state as string) as string);
    const authorizationCode = req.query?.code as string;

    const headers = new Headers();
    headers.append("content-type", "application/x-www-form-urlencoded");

    if (authorizationCode && params && params?.client_id) {
      await fetch("https://api-sandbox.monerium.dev/auth/token", {
        method: "POST",
        body: new URLSearchParams({
          client_id: params.client_id,
          code: authorizationCode,
          redirect_uri: params.redirect_uri,
          grant_type: "authorization_code",
          code_verifier: params.code_verifier,
        }),
        headers: headers,
      }).then(async (data) => {
        const response = await data.json();
        const { access_token, profile, userId, refresh_token } = response;

        cookies.set(profile, JSON.stringify(response));

        res.redirect(`/user/${profile}`);

        // await fetch(`https://api-sandbox.monerium.dev/profiles/${profile}`, {
        //   method: "GET",
        //   headers: {
        //     Authorization: `Bearer ${access_token}`,
        //   },
        // }).then(async (data) => {
        //   const response = await data.json();
        //   console.log("profile", profile);
        //   console.log("JSON.stringify(response)", JSON.stringify(response));
        //   try {
        //     cookies.set(profile, "test");
        //     console.log(cookies.get(profile));
        //   } catch (err) {
        //     console.error("error", err);
        //   } finally {
        //     res.redirect(`/user/${profile}`);
        //   }
        // });
      });
    }
  }
}
