import type { Metadata } from "next";
import { ApplicationStep1Form } from "@/components/application-step1-form";

export const metadata: Metadata = {
  title: "New Application",
};

export default function NewApplicationPage() {
  return <ApplicationStep1Form />;
}
