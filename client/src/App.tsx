import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ContentManager from "./pages/ContentManager";
import BookConsultation from "./pages/BookConsultation";
import AdminProducts from "./pages/AdminProducts";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import AdminBlog from "./pages/AdminBlog";
import LearnMore from "./pages/LearnMore";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/content-manager"} component={ContentManager} />
      <Route path={"/book-consultation"} component={BookConsultation} />
      <Route path={"/admin/products"} component={AdminProducts} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/blog/:slug"} component={BlogArticle} />
      <Route path={"/admin/blog"} component={AdminBlog} />
      <Route path={"/learn-more"} component={LearnMore} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook
// NOTE: Content Manager
// - ContentManager page allows admins to edit all website text content
// - Access via /content-manager route from the dashboard

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
