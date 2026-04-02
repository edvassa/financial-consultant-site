'use client';

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';

interface BlogFormData {
  title: string;
  slug: string;
  description: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string;
  image: File | null;
  imageUrl?: string;
  published: boolean;
}

export function AdminBlog() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [articles, setArticles] = useState<any[]>([]);
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    slug: '',
    description: '',
    content: '',
    seoTitle: '',
    seoDescription: '',
    keywords: '',
    image: null,
    published: false,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Check admin access
  useEffect(() => {
    if (user && user.role !== 'admin') {
      setLocation('/');
    }
  }, [user, setLocation]);

  // Fetch all articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/blog/admin/all');
        if (response.ok) {
          const data = await response.json();
          setArticles(data);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
        toast.error('Ошибка при загрузке статей');
      }
    };
    fetchArticles();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageBase64(event.target?.result as string);
        setFormData((prev) => ({ ...prev, imageUrl: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContentPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const blob = item.getAsFile();
        if (blob) {
          try {
            const reader = new FileReader();
            reader.onload = async (event) => {
              const base64 = event.target?.result as string;
              const formDataToSend = new FormData();
              formDataToSend.append('image', base64);

              const response = await fetch('/api/blog/upload-image', {
                method: 'POST',
                body: formDataToSend,
              });

              if (response.ok) {
                const { url } = await response.json();
                const textarea = e.currentTarget;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const currentContent = formData.content;
                const newContent =
                  currentContent.substring(0, start) +
                  `![image](${url})` +
                  currentContent.substring(end);
                setFormData((prev) => ({ ...prev, content: newContent }));
                toast.success('Изображение вставлено');
              } else {
                toast.error('Ошибка при загрузке изображения');
              }
            };
            reader.readAsDataURL(blob);
          } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Ошибка при загрузке изображения');
          }
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        content: formData.content,
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        keywords: formData.keywords,
        published: formData.published ? 1 : 0,
        ...(imageBase64 && { imageBase64 }),
      };

      let response;
      if (editingId) {
        response = await fetch(`/api/blog/admin/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/blog/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        toast.success(editingId ? 'Статья обновлена' : 'Статья создана');
        setFormData({
          title: '',
          slug: '',
          description: '',
          content: '',
          seoTitle: '',
          seoDescription: '',
          keywords: '',
          image: null,
          published: false,
        });
        setEditingId(null);
        setImageBase64('');
        // Refresh articles list
        const articlesResponse = await fetch('/api/blog/admin/all');
        if (articlesResponse.ok) {
          const data = await articlesResponse.json();
          setArticles(data);
        }
      } else {
        toast.error('Ошибка при сохранении статьи');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Ошибка при сохранении статьи');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const response = await fetch(`/api/blog/admin/${id}`);
      if (response.ok) {
        const article = await response.json();
        setFormData({
          title: article.title,
          slug: article.slug,
          description: article.excerpt,
          content: article.content,
          seoTitle: article.seoTitle || '',
          seoDescription: article.seoDescription || '',
          keywords: article.seoKeywords || '',
          image: null,
          imageUrl: article.imageUrl,
          published: article.published === 1,
        });
        setEditingId(id);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      toast.error('Ошибка при загрузке статьи');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены?')) return;

    try {
      const response = await fetch(`/api/blog/admin/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Статья удалена');
        setArticles(articles.filter((a) => a.id !== id));
      } else {
        toast.error('Ошибка при удалении статьи');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Ошибка при удалении статьи');
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      content: '',
      seoTitle: '',
      seoDescription: '',
      keywords: '',
      image: null,
      published: false,
    });
    setEditingId(null);
    setImageBase64('');
  };

  if (!user || user.role !== 'admin') {
    return <div>Доступ запрещен</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Управление блогом</h1>
        <button
          onClick={() => setLocation('/admin')}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Назад в панель
        </button>
      </div>

      <p className="text-gray-600">Добавляйте, редактируйте и удаляйте статьи</p>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Редактировать статью' : 'Добавить новую статью'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Название *</label>
              <Input
                placeholder="Введите название статьи"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Слаг (URL) *</label>
              <Input
                placeholder="finansovye-sovety"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                required
              />
              <p className="text-xs text-gray-500">Используется в URL статьи</p>
            </div>

            <div>
              <label className="text-sm font-medium">Краткое описание</label>
              <Input
                placeholder="Краткое описание для превью"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Изображение</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full"
              />
              {formData.imageUrl && (
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="mt-2 w-full h-32 object-cover rounded"
                />
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Содержание *</label>
                <span className="text-xs text-gray-500">Ctrl+V для вставки изображений из буфера обмена</span>
              </div>
              <textarea
                placeholder="Введите содержание статьи (Ctrl+V для вставки изображений)"
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                onPaste={handleContentPaste}
                required
                className="min-h-32 flex min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-full"
              />
            </div>

            {/* SEO Section */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">SEO оптимизация</h3>
              
              <div>
                <label className="text-sm font-medium">SEO заголовок (до 60 символов)</label>
                <Input
                  placeholder="Заголовок для поисковых систем"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, seoTitle: e.target.value }))}
                  maxLength={60}
                />
                <p className="text-xs text-gray-500">{formData.seoTitle.length}/60</p>
              </div>

              <div>
                <label className="text-sm font-medium">SEO описание (до 160 символов)</label>
                <textarea
                  placeholder="Описание для поисковых систем"
                  value={formData.seoDescription}
                  onChange={(e) => setFormData((prev) => ({ ...prev, seoDescription: e.target.value }))}
                  maxLength={160}
                  className="min-h-20 flex min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-full"
                />
                <p className="text-xs text-gray-500">{formData.seoDescription.length}/160</p>
              </div>

              <div>
                <label className="text-sm font-medium">SEO ключевые слова</label>
                <Input
                  placeholder="финансовый консультант, инвестиции, планирование"
                  value={formData.keywords}
                  onChange={(e) => setFormData((prev) => ({ ...prev, keywords: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, published: checked as boolean }))
                }
              />
              <label htmlFor="published" className="text-sm font-medium cursor-pointer">
                Опубликовать
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Отмена
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Articles List */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Статьи</h2>
        {articles.map((article) => (
          <Card key={article.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold">{article.title}</h3>
                  <p className="text-sm text-gray-600">/{article.slug}</p>
                  <p className="text-sm text-gray-500">{article.excerpt}</p>
                  {article.published === 1 && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mt-2 inline-block">
                      Опубликовано
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(article.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDelete(article.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
