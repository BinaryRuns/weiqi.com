"use client";

import withAuth from "@/components/WithAuth";
import { fetchWithAuth } from "../../utils/api";

function Demo() {
  const response = fetchWithAuth("/api/hello", { method: "GET" });

  console.log(response);

  return (
    <>
      <h1>Hello Worlssssssssd</h1>
    </>
  );
}

export default withAuth(Demo);
