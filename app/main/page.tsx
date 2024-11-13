'use client'

import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "./components/Header";
import { LeftSidebar } from "./components/LeftSidebar";
import { MainContent } from "./components/MainContent";
import { RightSidebar } from "./components/RightSidebar";
import { UserProfile } from '@/components/user-profile';

export default function CryptoDashboard() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#010714] text-[#E5E7EB] px-2">
        <Header />
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center">
            {/* Другие элементы навигации */}
          </div>
          <div className="flex items-center">
            <UserProfile />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-20 max-w-[1920px] mx-auto">
          <div className="lg:col-span-3">
            <LeftSidebar />
          </div>
          <div className="lg:col-span-6">
            <MainContent />
          </div>
          <div className="lg:col-span-3">
            <RightSidebar />
          </div>
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