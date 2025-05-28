"use client";
import { useRouter } from "next/navigation";
import Header from "./Header";

export default function HeaderClient({ formattedDate }: { formattedDate: string }) {
  const router = useRouter();
  return (
    <Header
      formattedDate={formattedDate}
      onAboutClick={() => router.push("/about")}
      onLogoClick={() => router.push("/")}
    />
  );
} 