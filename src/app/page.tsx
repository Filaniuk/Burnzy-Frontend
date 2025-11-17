"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {

    const router = useRouter();

    useEffect(() => {
        async function redirect() {
            router.replace("/analyze");
        }
        redirect();
    }, [router]);

    return (
        <div></div>
    );
}
