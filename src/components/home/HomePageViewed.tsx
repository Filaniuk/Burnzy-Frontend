"use client";

import { useEffect, useRef } from "react";
import posthog from "posthog-js";

export default function HomePageViewed() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    posthog.capture("home_page_viewed", {
      page: "home",
      path: window.location.pathname,
    });
  }, []);

  return null;
}
