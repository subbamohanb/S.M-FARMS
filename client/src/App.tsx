import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import AgriFarm from "./pages/AgriFarm";
import DairyFarm from "./pages/DairyFarm";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import TrackOrder from "./pages/TrackOrder";
import TransactionHistory from "./pages/TransactionHistory";
import OrderConfirmation from "./pages/OrderConfirmation";
import Profile from "./pages/Profile";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/agri-farm" component={AgriFarm} />
      <Route path="/dairy-farm" component={DairyFarm} />
      <Route path="/shop" component={Shop} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/track-order" component={TrackOrder} />
      <Route path="/transactions" component={TransactionHistory} />
      <Route path="/order-confirmation" component={OrderConfirmation} />
      <Route path="/profile" component={Profile} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </ThemeProvider>
  );
}
