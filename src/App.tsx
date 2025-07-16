import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import FreeGames from "./pages/FreeGames";
import Welcome from "./pages/Welcome";
import GameDetails from "./pages/GameDetails";
import NotFound from "./pages/NotFound";
import AdvancedSearch from "./pages/AdvancedSearch";
import Wishlist from "./pages/Wishlist";
import Deals from "./pages/Deals";
import Limited from "./pages/Limited";

const queryClient = new QueryClient();

const App = () => {
  const [hasUserName, setHasUserName] = useState<boolean | null>(null);

  useEffect(() => {
    const userName = localStorage.getItem('userName');
    setHasUserName(!!userName);
  }, []);

  // Show loading while checking user name
  if (hasUserName === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Welcome route - only show if no user name */}
              {!hasUserName && (
                <Route path="/welcome" element={<Welcome />} />
              )}
              
              {/* Main app routes */}
              <Route path="/*" element={
                hasUserName ? (
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full bg-background">
                      <AppSidebar />
                      <div className="flex-1 flex flex-col">
                        <header className="h-12 flex items-center border-b bg-card border-border relative z-10">
                          <SidebarTrigger className="ml-4" />
                        </header>
                        <main className="flex-1 bg-background">
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/free-games" element={<FreeGames />} />
                            <Route path="/game/:gameId" element={<GameDetails />} />
                            <Route path="/search" element={<AdvancedSearch />} />
                            <Route path="/wishlist" element={<Wishlist />} />
                            <Route path="/deals" element={<Deals />} />
                            <Route path="/limited" element={<Limited />} />
                            <Route path="/store/*" element={<div className="p-8"><h1>Store Pages - Coming Soon</h1></div>} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </main>
                      </div>
                    </div>
                  </SidebarProvider>
                ) : (
                  <Navigate to="/welcome" replace />
                )
              } />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
