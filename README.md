Start here: [Monerium API Documentation](https://monerium.dev/docs/api)

View live example at https://monerium-api.vercel.app

There are two ways to authenticate, with authentication code flow or client credentials.

Lets see how we build around the authentication code flow.

We start of by structuring the query parameters needed to enter the Monerium portal.

```js
// pages/index.ts

{
  // Random generated string.
  const codeVerifier = CryptoJS.lib.WordArray.random(64).toString();

  // code_challenge = base64urlEncode(SHA256(ASCII(code_verifier)))
  const codeChallenge = CryptoJS.enc.Base64url.stringify(
    CryptoJS.SHA256(codeVerifier)
  );

  // A server endpoint of yours, that can't expose secrets to the client.
  const redirectUri = `${baseUrl}/api/integration/monerium`;

  // TODO: You will need to store the codeVerifier and codeChallenge for later.
  const cookieName = "monerium-state";

  const params = {
    client_id: "1337",
    redirect_uri: redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state: cookieName,
  };

  cookies.set(
    cookieName,
    JSON.stringify({ ...params, code_verifier: codeVerifier })
  );
}
```

When the user clicks `Create IBAN`, redirect to the Monerium portal

```js
router.push(
  `https://sandbox.monerium.dev/partners/piedpiper/auth?${new URLSearchParams(
    params
  ).toString()}`
);
```

When the user has an account, has signed up for an IBAN and has accepted to allow you to read his profile and payment info, they will be directed to the `redirect_uri` you defined, this will have to match one of the `redirectUris` you have applied to your Monerium application. (TBD: Applying for a Monerium application.)

The url we got back now has the following parameters `code` and `state`.

We use the authorization `code` to fetch an `access_token`.

```js
// pages/api/integration/monerium.ts

if (queryParams?.code && queryParams?.state) {
  let params = JSON.parse(cookies?.get(queryParams.state));
  const authorizationCode = queryParams?.code;

  const headers = new Headers();
  headers.append("content-type", "application/x-www-form-urlencoded"); // Required.

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

      // Redirect to your url of choice.
      res.redirect(`/user/${profile}`);
    });
  }
}
```

We now have an `access_token` to fetch all the information we need about this specific user.

Access tokens have a short lifespan, use the `refresh_token` to update it.

```js
 fetch("https://api-sandbox.monerium.dev/auth/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: '1337',
        grant_type: 'refresh_token',
        refresh_token: 'IwOGYzYTlmM2YxOTQ5MGE3YmNmMDFkNTVk', // get this from your database
      })
 })
```

Example response:

```js
{
  "access_token":"MTQ0NjJkZmQ5OTM2NDE1ZTZjNGZmZjI3",
  "token_type":"Bearer",
  "expires_in":3600,
  "refresh_token":"IwOGYzYTlmM2YxOTQ5MGE3YmNmMDFkNTVk",
  "scope":"orders:read"
  "profile":"asd1234f-f05e-11eb-8143-62d421e33aed",
  "userId":"qwer6789-f05e-11eb-8143-62d421e33aed"
}
```

## Client credentials.

Confidential clients which can hide their credentials, e.g. backend servers, can be enlisted in Monerium's partner program, which enables them simultaneous access to multiple profiles which have granted authorization.

```js
// pages/admin.tsx

const headers = new Headers();
headers.append("content-type", "application/x-www-form-urlencoded"); // Required

const authToken = await fetch("https://api-sandbox.monerium.dev/auth/token", {
  method: "POST",
  body: new URLSearchParams({
    client_id: "1234567890abcdef",
    client_secret: "1234567890abcdef1234567890abcdef",
    grant_type: "client_credentials",
  }),
  headers: headers,
});
const clientCredentials = await authToken.json();
const authContext = await fetch(
  "https://api-sandbox.monerium.dev/auth/context",
  {
    method: "GET",
    headers: new Headers({
      Authorization: `Bearer ${clientCredentials.access_token}`,
    }),
  }
);
```
