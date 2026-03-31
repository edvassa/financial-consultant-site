import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BlogArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  imageUrl: string | null;
  published: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function FeaturedBlog() {
  const [, setLocation] = useLocation();
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestArticles();
  }, []);

  const fetchLatestArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/blog");
      if (response.ok) {
        const data = await response.json();
        // Sort articles by date - newest first
        const sortedData = data.sort((a: BlogArticle, b: BlogArticle) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Newest first
        });
        // Take only the first 3 articles
        setArticles(sortedData.slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching blog articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateText = (text: string, length: number) => {
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  if (loading || articles.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Последние статьи в блоге</h2>
          <p className="text-lg text-slate-600 max-w-2xl">
            Полезные советы и инсайты по финансовому управлению бизнесом
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {articles.map((article) => (
            <Card
              key={article.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-slate-200 bg-white"
              onClick={() => setLocation(`/blog/${article.slug}`)}
            >
              {article.imageUrl && (
                <div className="h-40 overflow-hidden bg-slate-200">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              )}

              <CardHeader className="pb-3">
                <CardTitle className="text-base line-clamp-2">
                  {article.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="h-3 w-3" />
                  {formatDate(article.createdAt)}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-slate-600 text-sm line-clamp-2">
                  {article.excerpt || truncateText(article.content, 100)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 border-green-200 text-green-700 hover:bg-green-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocation(`/blog/${article.slug}`);
                  }}
                >
                  Читать
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            size="lg"
            className="bg-green-700 hover:bg-green-800 gap-2"
            onClick={() => setLocation("/blog")}
          >
            Все статьи
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
