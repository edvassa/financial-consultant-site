import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading } = useAuth();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Lock className="h-6 w-6 text-green-700" />
            </div>
          </div>
          <CardTitle>Вход в админ-панель</CardTitle>
          <CardDescription>
            Только для администраторов сайта
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600 text-center">
            Для входа в админ-панель используйте вашу учетную запись.
          </p>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl() + "?redirect=/dashboard";
            }}
            className="w-full bg-green-700 hover:bg-green-800"
            size="lg"
          >
            Войти в админ-панель
          </Button>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="w-full"
          >
            Вернуться на главную
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
