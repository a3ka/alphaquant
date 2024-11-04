import { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { isAuthorized } from "@/utils/data/user/isAuthorized";
import { redirect } from "next/navigation";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();
  const { authorized, message } = await isAuthorized(user?.id!);

  if (!authorized) {
    redirect("/sign-in");
  }

  return children;
} 