import Cookies from "cookies";
import type { NextPage, GetServerSideProps } from "next";

const Profile: NextPage<{ userData: any }> = ({ userData }) => {
  return <p>Profile: {userData.name}</p>;
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
  console.log("userData", userData);

  return {
    props: { userData }, // will be passed to the page component as props
  };
};

export default Profile;
