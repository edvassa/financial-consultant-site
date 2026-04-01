import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SocialShare from "@/components/SocialShare";

interface BlogArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  imageUrl: string | null;
  published: number;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function BlogArticle() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/blog/:slug");
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params?.slug) {
      fetchArticle(params.slug);
    }
  }, [params?.slug]);

  const fetchArticle = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/blog/article/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setArticle(data);
      } else if (response.status === 404) {
        setError("Статья не найдена");
      } else {
        setError("Ошибка при загрузке статьи");
      }
    } catch (err) {
      console.error("Error fetching article:", err);
      setError("Ошибка при загрузке статьи");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Загрузка...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setLocation("/blog")}
            className="mb-6 gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад к блогу
          </Button>
          <Card className="p-8 text-center">
            <p className="text-slate-600 text-lg">{error || "Статья не найдена"}</p>
            <Button
              onClick={() => setLocation("/blog")}
              className="mt-6 bg-green-700 hover:bg-green-800"
            >
              Вернуться в блог
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Set SEO meta tags
  useEffect(() => {
    if (article) {
      // Update document title
      document.title = article.seoTitle || article.title;
      
      // Update meta tags
      const updateMetaTag = (name: string, content: string) => {
        let tag = document.querySelector(`meta[name="${name}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('name', name);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      };
      
      const updateOGTag = (property: string, content: string) => {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('property', property);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      };
      
      updateMetaTag('description', article.seoDescription || article.excerpt || article.content.substring(0, 160));
      updateMetaTag('keywords', article.seoKeywords || '');
      updateOGTag('og:title', article.seoTitle || article.title);
      updateOGTag('og:description', article.seoDescription || article.excerpt || article.content.substring(0, 160));
      if (article.imageUrl) {
        updateOGTag('og:image', article.imageUrl);
      }
    }
  }, [article]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Article Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setLocation("/blog")}
            className="mb-6 gap-2 text-green-100 hover:text-white hover:bg-green-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад к блогу
          </Button>
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          <div className="flex items-center gap-2 text-green-100">
            <Calendar className="h-5 w-5" />
            <span>{formatDate(article.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Article Image */}
        {article.imageUrl && (
          <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Article Body */}
        <Card className="p-8 bg-white border-slate-200">
          {article.excerpt && (
            <p className="text-lg text-slate-600 italic mb-6 pb-6 border-b border-slate-200">
              {article.excerpt}
            </p>
          )}

          <div className="prose prose-sm max-w-none">
            {article.content.split("\n").map((paragraph, index) => (
              <p key={index} className="text-slate-700 mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </Card>

        {/* Social Share Section */}
        <div className="mt-8 p-6 bg-white rounded-lg border border-slate-200">
          <SocialShare
            title={article.title}
            url={typeof window !== "undefined" ? window.location.href : ""}
            description={article.excerpt || article.content.substring(0, 160)}
          />
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => setLocation("/blog")}
            className="bg-green-700 hover:bg-green-800"
          >
            Вернуться в блог
          </Button>
        </div>
      </div>
    </div>
  );
}
