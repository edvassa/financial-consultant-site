'use client';
import { useRef, useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { Plus, Edit2, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

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

export default function AdminBlog() {
  const [, setLocation] = useLocation();
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    published: false,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/blog/admin/all");
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Ошибка при загрузке статей");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.slug || !formData.content) {
      toast.error("Заполните обязательные поля: название, слаг и содержание");
      return;
    }

    try {
      let imageBase64 = null;
      let imageMimeType = null;

      if (imageFile) {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve) => {
          reader.onload = (event) => {
            resolve(event.target?.result?.toString().split(",")[1]);
          };
          reader.readAsDataURL(imageFile);
        });
        imageMimeType = imageFile.type;
      }

      const url = editingId
        ? `/api/blog/admin/${editingId}`
        : "/api/blog/admin/create";

      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imageBase64,
          imageMimeType,
        }),
      });

      if (response.ok) {
        toast.success(editingId ? "Статья обновлена" : "Статья создана");
        setShowForm(false);
        setEditingId(null);
        setFormData({
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          published: false,
          seoTitle: "",
          seoDescription: "",
          seoKeywords: "",
        });
        setImagePreview(null);
        setImageFile(null);
        fetchArticles();
      } else {
        toast.error("Ошибка при сохранении статьи");
      }
    } catch (error) {
      console.error("Error saving article:", error);
      toast.error("Ошибка при сохранении статьи");
    }
  };

  const handleEdit = (article: BlogArticle) => {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || "",
      content: article.content,
      published: article.published === 1,
      seoTitle: article.seoTitle || "",
      seoDescription: article.seoDescription || "",
      seoKeywords: article.seoKeywords || "",
    });
    if (article.imageUrl) {
      setImagePreview(article.imageUrl);
    }
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить эту статью?")) return;

    try {
      const response = await fetch(`/api/blog/admin/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("Статья удалена");
        fetchArticles();
      } else {
        toast.error("Ошибка при удалении статьи");
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Ошибка при удалении статьи");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      published: false,
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
    });
    setImagePreview(null);
    setImageFile(null);
  };

  const handleContentPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          try {
            const base64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            });

            const response = await fetch('/api/blog/upload-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imageBase64: base64, imageMimeType: file.type }),
            });

            if (response.ok) {
              const data = await response.json();
              const imageMarkdown = `![image](${data.url})`;
              const textarea = e.currentTarget;
              const start = textarea.selectionStart || 0;
              const end = textarea.selectionEnd || 0;
              const beforeText = formData.content.substring(0, start);
              const afterText = formData.content.substring(end);
              const newContent = beforeText + imageMarkdown + afterText;
              setFormData({ ...formData, content: newContent });
              toast.success('Изображение вставлено');
            } else {
              const errorData = await response.json().catch(() => ({}));
              toast.error('Ошибка: ' + (errorData.error || 'Не удалось загрузить изображение'));
            }
          } catch (error) {
            toast.error('Ошибка: ' + String(error).substring(0, 50));
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-slate-900">Управление блогом</h1>
            <Button
              onClick={() => setLocation("/dashboard")}
              variant="outline"
            >
              Назад в панель
            </Button>
          </div>
          <p className="text-slate-600">Добавляйте, редактируйте и удаляйте статьи</p>
        </div>

        {/* Create Button */}
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="mb-8 bg-green-700 hover:bg-green-800 gap-2"
          >
            <Plus className="h-5 w-5" />
            Новая статья
          </Button>
        )}

        {/* Form */}
        {showForm && (
          <Card className="mb-8 border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>{editingId ? "Редактировать статью" : "Новая статья"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Название *
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Введите название статьи"
                    className="border-slate-300"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Слаг (URL) *
                  </label>
                  <Input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="finansovye-sovety"
                    className="border-slate-300"
                  />
                  <p className="text-xs text-slate-500 mt-1">Используется в URL статьи</p>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Краткое описание
                  </label>
                  <Input
                    type="text"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Краткое описание для превью"
                    className="border-slate-300"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Изображение
                  </label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                      />
                    </div>
                    {imagePreview && (
                      <div className="w-32 h-32 rounded-lg overflow-hidden bg-slate-200">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Содержание *
                  </label>
                  <textarea
                    ref={contentTextareaRef}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    onPaste={handleContentPaste}
                    placeholder="Введите содержание статьи (Ctrl+V для вставки изображений)"
                    rows={10}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => document.getElementById('content-image-input')?.click()}
                      className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                    >
                      📎 Загрузить изображение
                    </button>
                    <input
                      id="content-image-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = async () => {
                            const base64 = reader.result as string;
                            try {
                              const response = await fetch('/api/blog/upload-image', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ imageBase64: base64, imageMimeType: file.type }),
                              });
                              if (response.ok) {
                                const data = await response.json();
                                const imageMarkdown = `![image](${data.url})`;
                                const textarea = contentTextareaRef.current;
                                if (textarea) {
                                  const start = textarea.selectionStart || 0;
                                  const end = textarea.selectionEnd || 0;
                                  const currentContent = formData.content;
                                  const beforeText = currentContent.substring(0, start);
                                  const afterText = currentContent.substring(end);
                                  const newContent = beforeText + imageMarkdown + afterText;
                                  setFormData({ ...formData, content: newContent });
                                  toast.success('Изображение загружено');
                                }
                              } else {
                                const errorData = await response.json().catch(() => ({ error: 'Неизвестная ошибка' }));
                                toast.error('Ошибка: ' + (errorData.error || 'Не удалось загрузить изображение'));
                              }
                            } catch (error) {
                              toast.error('Ошибка при загрузке: ' + String(error).substring(0, 50));
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <span className="text-xs text-slate-500">или используйте Ctrl+V</span>
                  </div>
                </div>

                {/* SEO Section */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">SEO оптимизация</h3>

                  {/* SEO Title */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      SEO заголовок (до 60 символов)
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={formData.seoTitle}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            seoTitle: e.target.value.slice(0, 60),
                          })
                        }
                        placeholder="Заголовок для поисковых систем"
                        className="border-slate-300"
                        maxLength={60}
                      />
                      <span className="absolute right-3 top-3 text-xs text-slate-500">
                        {formData.seoTitle.length}/60
                      </span>
                    </div>
                  </div>

                  {/* SEO Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      SEO описание (до 160 символов)
                    </label>
                    <div className="relative">
                      <textarea
                        value={formData.seoDescription}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            seoDescription: e.target.value.slice(0, 160),
                          })
                        }
                        placeholder="Описание для поисковых систем"
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        maxLength={160}
                      />
                      <span className="absolute right-3 bottom-3 text-xs text-slate-500">
                        {formData.seoDescription.length}/160
                      </span>
                    </div>
                  </div>

                  {/* SEO Keywords */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      SEO ключевые слова (через запятую)
                    </label>
                    <Input
                      type="text"
                      value={formData.seoKeywords}
                      onChange={(e) =>
                        setFormData({ ...formData, seoKeywords: e.target.value })
                      }
                      placeholder="финансовый консультант, инвестиции, планирование"
                      className="border-slate-300"
                    />
                  </div>
                </div>

                {/* Published */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) =>
                      setFormData({ ...formData, published: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-300 text-green-700"
                  />
                  <label htmlFor="published" className="text-sm font-medium text-slate-700">
                    Опубликовать
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4 border-t border-slate-200">
                  <Button
                    type="submit"
                    className="bg-green-700 hover:bg-green-800 gap-2"
                  >
                    <Check className="h-4 w-4" />
                    {editingId ? "Сохранить" : "Создать"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Отмена
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Articles List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Загрузка статей...</p>
          </div>
        ) : articles.length === 0 ? (
          <Card className="border-slate-200 bg-white">
            <CardContent className="py-12 text-center">
              <p className="text-slate-600 mb-4">Статьи еще не добавлены</p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-green-700 hover:bg-green-800"
              >
                Создать первую статью
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {articles.map((article) => (
              <Card
                key={article.id}
                className="border-slate-200 bg-white hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex gap-4 items-start">
                    {article.imageUrl && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {article.title}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">/{article.slug}</p>
                          {article.excerpt && (
                            <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                              {article.excerpt}
                            </p>
                          )}
                          {article.seoKeywords && (
                            <p className="text-xs text-slate-500 mt-2">
                              <strong>Ключевые слова:</strong> {article.seoKeywords}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-3">
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded ${
                                article.published
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {article.published ? "Опубликовано" : "Черновик"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(article)}
                            className="gap-2"
                          >
                            <Edit2 className="h-4 w-4" />
                            Редактировать
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(article.id)}
                            className="gap-2 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Удалить
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
