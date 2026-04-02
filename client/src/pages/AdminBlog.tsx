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
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  image: File | null;
  imageUrl?: string;
  published: boolean;
}

function AdminBlog() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [articles, setArticles] = useState<any[]>([]);
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
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
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/blog/admin/all');
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      }
    } catch (error) {
      toast.error('Ошибка при загрузке статей');
    }
  };

  const handleContentPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file && item.type.startsWith('image/')) {
          try {
            const base64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            });

            const formDataObj = new FormData();
            formDataObj.append('image', base64);

            const response = await fetch('/api/blog/upload-image', {
              method: 'POST',
              body: formDataObj,
            });

            if (response.ok) {
              const result = await response.json();
              const imageMarkdown = `![image](${result.url})`;
              setFormData(prev => ({
                ...prev,
                content: prev.content + '\n' + imageMarkdown,
              }));
              toast.success('Изображение загружено');
            } else {
              toast.error('Ошибка при загрузке изображения');
            }
          } catch (error) {
            toast.error('Ошибка при обработке изображения');
          }
        }
      }
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageBase64(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        image: imageBase64,
      };

      const url = editingId ? `/api/blog/admin/${editingId}` : '/api/blog/admin/create';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success(editingId ? 'Статья обновлена' : 'Статья создана');
        setFormData({
          title: '',
          slug: '',
          excerpt: '',
          content: '',
          seoTitle: '',
          seoDescription: '',
          seoKeywords: '',
          image: null,
          published: false,
        });
        setImageBase64('');
        setEditingId(null);
        fetchArticles();
      } else {
        toast.error('Ошибка при сохранении');
      }
    } catch (error) {
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
          title: article.title || '',
          slug: article.slug || '',
          excerpt: article.excerpt || '',
          content: article.content || '',
          seoTitle: article.seoTitle || '',
          seoDescription: article.seoDescription || '',
          seoKeywords: article.seoKeywords || '',
          image: null,
          imageUrl: article.imageUrl,
          published: article.published === 1,
        });
        setImageBase64(article.imageUrl || '');
        setEditingId(id);
        window.scrollTo(0, 0);
      }
    } catch (error) {
      toast.error('Ошибка при загрузке статьи');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены?')) return;

    try {
      const response = await fetch(`/api/blog/admin/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Статья удалена');
        fetchArticles();
      } else {
        toast.error('Ошибка при удалении');
      }
    } catch (error) {
      toast.error('Ошибка при удалении статьи');
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      image: null,
      published: false,
    });
    setImageBase64('');
    setEditingId(null);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Управление блогом</h1>
        <Button onClick={() => setLocation('/admin')} variant="outline">
          Назад в панель
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Редактировать статью' : 'Новая статья'}</CardTitle>
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
                value={formData.excerpt}
                onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Изображение</label>
              <Input type="file" accept="image/*" onChange={handleImageChange} />
              {imageBase64 && (
                <img
                  src={imageBase64}
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
                  value={formData.seoKeywords}
                  onChange={(e) => setFormData((prev) => ({ ...prev, seoKeywords: e.target.value }))}
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
              <Button type="submit" disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
              <Button type="button" onClick={handleCancel} variant="outline">
                Отмена
              </Button>
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
                  <Button
                    onClick={() => handleEdit(article.id)}
                    variant="default"
                    size="sm"
                  >
                    Редактировать
                  </Button>
                  <Button
                    onClick={() => handleDelete(article.id)}
                    variant="destructive"
                    size="sm"
                  >
                    Удалить
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default AdminBlog;
