"use client"

import withAuth from "@/components/WithAuth"
import {fetchWithAuth} from "../../utils/api"


async function Demo() {

    const response = await fetchWithAuth("/api/hello", { method: "GET" })


    return <>
        <h1>Hello</h1>
    </>
}


export default withAuth(Demo)

