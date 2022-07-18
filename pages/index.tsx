import type { NextPage } from "next";
import CryptoJS from "crypto-js";
import Cookies from "cookies";
import { useRouter } from "next/router";
// import styles from '../styles/Home.module.css'
// emi.authenticate(client_id);

const Home: NextPage = ({ params }) => {
  const router = useRouter();

  const emiConnect = () => {
    router.push(
      `https://sandbox.monerium.dev/partners/piedpiper/auth?${new URLSearchParams(
        params
      ).toString()}`
    );
    // example:
    //   https://sandbox.monerium.dev/partners/piedpiper/auth?code_challenge=YmgGyzsAN28CpfTrJESF-p_42_YMRH8Y6jAfF2pbuhc&code_challenge_method=S256&redirect_uri=http://localhost:8001/integration/monerium
  };

  return (
    <div>
      <h1>Be your own bank</h1>
      <button onClick={() => emiConnect()}>Create Iban</button>
    </div>
  );
};

export async function getServerSideProps({ req, res }) {
  const cookies = new Cookies(req, res);

  // Random generated string.
  const codeVerifier = CryptoJS.lib.WordArray.random(64).toString();

  // code_challenge = base64urlEncode(SHA256(ASCII(code_verifier)))
  const codeChallenge = CryptoJS.enc.Base64url.stringify(
    CryptoJS.SHA256(codeVerifier)
  );

  // A server endpoint of yours, that can't expose secrets to the client.
  const redirectUri = "http://localhost:8001/api/integration/monerium";

  // TODO: You will need to store the codeVerifier and codeChallenge for later.
  const cookieName = "monerium_state";

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

  return {
    props: { params }, // will be passed to the page component as props
  };
}
export default Home;
