"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

// Make an early access page
// Join waitlist

export default function page() {
  return (
    <div className="">
      <div>Drafts and Send</div>
      <Link href="/">
        <Button variant="default">Join the waitlist</Button>
      </Link>
    </div>
  );
}
