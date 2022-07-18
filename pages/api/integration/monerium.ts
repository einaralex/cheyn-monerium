// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import Cookies from "cookies";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const cookies = new Cookies(req, res);
  const queryParams = req.query;
  if (queryParams?.code && queryParams?.state) {
    let params = JSON.parse(
      cookies?.get(queryParams.state as string) as string
    );
    const authorizationCode = queryParams?.code as string;

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

        // You should securely store the access_token and the refresh_token
        // This is not secure, it exposes the access_token to the client:
        cookies.set(profile, JSON.stringify(response));

        res.redirect(`/user/${profile}`);
      });
    }
  } else {
    res.status(400).end();
  }
}
