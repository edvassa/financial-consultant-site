import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function Blog() {
  const [, setLocation] = useLocation();
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredArticles, setFilteredArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/blog");
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
        setFilteredArticles(data);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredArticles(articles);
      return;
    }

    try {
      const response = await fetch(`/api/blog/search/${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setFilteredArticles(data);
      }
    } catch (error) {
      console.error("Error searching articles:", error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Блог</h1>
          <p className="text-green-100 text-lg">
            Полезные советы и инсайты по финансовому управлению бизнесом
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="relative mb-8">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Поиск статей..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 py-2 border-slate-300"
          />
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Загрузка статей...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">
              {searchQuery ? "Статьи не найдены" : "Статьи скоро появятся"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Card
                key={article.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-slate-200 bg-white"
                onClick={() => setLocation(`/blog/${article.slug}`)}
              >
                {/* Article Image */}
                {article.imageUrl && (
                  <div className="h-48 overflow-hidden bg-slate-200">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                )}

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-2">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="h-4 w-4" />
                    {formatDate(article.createdAt)}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-slate-600 text-sm line-clamp-3">
                    {article.excerpt || truncateText(article.content, 150)}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-green-200 text-green-700 hover:bg-green-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/blog/${article.slug}`);
                    }}
                  >
                    Читать далее
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
