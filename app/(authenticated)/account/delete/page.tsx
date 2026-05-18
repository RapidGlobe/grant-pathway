import type { Metadata } from "next";
import { DeleteAccountForm } from "@/components/delete-account-form";

export const metadata: Metadata = {
  title: "Delete Account",
};

export default function DeleteAccountPage() {
  return <DeleteAccountForm />;
}
