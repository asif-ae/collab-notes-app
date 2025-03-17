"use client";

import { me } from "@/api/auth";
import { useEffect } from "react";

function User() {
  useEffect(() => {
    (async () => {
      await me().then((data) => console.log({ data }));
    })();
  }, []);
  return <div>User</div>;
}

export default User;
