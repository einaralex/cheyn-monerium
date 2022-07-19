import type { NextPage, GetServerSideProps } from "next";
import CryptoJS from "crypto-js";
import Cookies from "cookies";
import { useRouter } from "next/router";
import Image from "next/image";
import styles from "../styles/Home.module.css";

const baseUrl =
  process.env?.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? "https://monerium-api.vercel.app"
    : "http://localhost:8001";

const Home: NextPage<{ params: any }> = ({ params }) => {
  const router = useRouter();

  const emiConnect = () => {
    router.push(
      `https://sandbox.monerium.dev/partners/piedpiper/auth?${new URLSearchParams(
        params
      ).toString()}`
    );
  };

  return (
    <div className={styles.main}>
      <h1>Be your own bank</h1>

      <button className={styles.ibanButton} onClick={() => emiConnect()}>
        <Image src="/monerium.svg" alt="me" width="24" height="24" />
        Create IBAN
      </button>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const cookies = new Cookies(req, res);

  // Random generated string.
  const codeVerifier = CryptoJS.lib.WordArray.random(64).toString();

  // code_challenge = base64urlEncode(SHA256(ASCII(code_verifier)))
  const codeChallenge = CryptoJS.enc.Base64url.stringify(
    CryptoJS.SHA256(codeVerifier)
  );

  // A server endpoint of yours, that can't expose secrets to the client.
  const redirectUri = `${baseUrl}/api/integration/monerium`;

  // You will need to store the codeVerifier and codeChallenge for later.
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

  return {
    props: { params }, // will be passed to the page component as props
  };
};
export default Home;
