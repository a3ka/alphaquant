'use client'

import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "./components/Header";
import { LeftSidebar } from "./components/LeftSidebar";
import { MainContent } from "./components/MainContent";
import { RightSidebar } from "./components/RightSidebar";

export default function CryptoDashboard() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#010714] text-[#E5E7EB] px-2">
        <Header />
        <div className="grid grid-cols-12 gap-4 pt-20">
          <LeftSidebar />
          <MainContent />
          <RightSidebar />
        </div>
      </div>
      <style jsx global>{`
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        *::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </TooltipProvider>
  );
}