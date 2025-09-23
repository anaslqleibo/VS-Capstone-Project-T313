"use client";
import { useRef } from "react";
import Layout from "@/app/components/Layout";
import Button from "@/app/components/Button";
import { useRouter } from "next/navigation";
import { FaCalendarAlt, FaThLarge } from "react-icons/fa";

export default function PortalPage() {
  const modalContainer = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Front-end config for the CRM link
  // needs to be set in .env or on cPanel I think?
  const crmUrl = process.env.NEXT_PUBLIC_CRM_URL;

  return (
  <Layout modalContainer={modalContainer}>
    {/* center the content vertically; sit a bit lower than the top */}
    <main className="min-h-[75vh] w-full flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-semibold text-center text-[color:var(--primary-color)] mb-8">
          Choose a System
        </h1>

        {/* vertical stack */}
        <div className="flex flex-col items-stretch gap-6">
          {/* Roster System */}
          <Button
            type="cta"
            className="w-full justify-center py-8 px-10 text-xl rounded-2xl"
            aria-label="Open the Roster System"
            onClick={() => router.replace("/home")}
          >
            <FaCalendarAlt className="text-2xl opacity-90" />
            Roster System
          </Button>

          {/* CRM */}
          <span
            title={crmUrl ? "Open CRM" : "Set NEXT_PUBLIC_CRM_URL to enable"}
            className="w-full"
            >
            <Button
                type="outline"
                className="w-full justify-center py-8 px-10 text-xl rounded-2xl"
                aria-label="Open the CRM"
                onClick={() => {
                    if (crmUrl) window.open(crmUrl, "_blank", "noopener,noreferrer");
                }}
                disabled={!crmUrl}  // stays disabled until the URL is set
            >
                <FaThLarge className="text-2xl opacity-90" />
                CRM
            </Button>
          </span>
        </div>
      </div>
    </main>
  </Layout>
);
} 