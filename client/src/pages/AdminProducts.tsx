import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Trash2, Edit2, Plus, X, Save } from "lucide-react";

export default function AdminProducts() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<"digital" | "service" | "subscription">("digital");
  const [file, setFile] = useState<File | null>(null);
  const [isMonthly, setIsMonthly] = useState(false);

  // Edit mode state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDetails, setEditDetails] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState<"digital" | "service" | "subscription">("digital");
  const [editIsMonthly, setEditIsMonthly] = useState(false);

  // Fetch products
  const { data: products = [], refetch: refetchProducts } = trpc.products.list.useQuery(
    undefined,
    { refetchInterval: 5000 }
  );

  const utils = trpc.useUtils();

  // Create product mutation
  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Продукт успешно создан!");
      setName("");
      setDescription("");
      setDetails("");
      setPrice("");
      setFile(null);
      setCategory("digital");
      setIsMonthly(false);
      // Invalidate products cache
      utils.products.list.invalidate();
      refetchProducts();
    },
    onError: (error: any) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });

  // Update product mutation
  const updateProductMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Продукт успешно обновлён!");
      setEditingId(null);
      // Invalidate products cache
      utils.products.list.invalidate();
      refetchProducts();
    },
    onError: (error: any) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });

  // Delete product mutation
  const deleteProductMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Продукт удалён!");
      // Invalidate products cache
      utils.products.list.invalidate();
      refetchProducts();
    },
    onError: (error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || !category) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    // If it's a digital product, file is required
    if (category === "digital" && !file) {
      toast.error("Загрузите файл для цифрового продукта");
      return;
    }

    createProductMutation.mutate({
      name,
      description,
      price: price,
      category,
      isMonthly: isMonthly ? 1 : 0,
      fileName: file?.name || null,
    });
  };

  const startEdit = (product: any) => {
    console.log("startEdit - Product data:", product);
    console.log("startEdit - Price value:", product.price, "Type:", typeof product.price);
    setEditingId(product.id);
    setEditName(product.name);
    setEditDescription(product.description || "");
    setEditDetails(product.details || "");
    // Ensure price is always a string, even if it's "0"
    const priceStr = product.price !== null && product.price !== undefined ? String(product.price) : "";
    console.log("startEdit - Setting editPrice to:", priceStr);
    setEditPrice(priceStr);
    setEditCategory(product.category);
    setEditIsMonthly(product.isMonthly || false);
  };

  const handleUpdate = () => {
    if (!editName || !editCategory) {
      toast.error("Заполните все обязательные поля (Название и Категория)");
      return;
    }
    // Price can be empty string initially, but should not be undefined
    if (editPrice === undefined || editPrice === null) {
      toast.error("Ошибка: Цена не загружена");
      return;
    }

    console.log("Updating product:", {
      id: editingId,
      name: editName,
      price: editPrice,
      category: editCategory,
    });

    updateProductMutation.mutate({
      id: editingId!,
      name: editName,
      description: editDescription,
      details: editDetails,
      price: editPrice,
      category: editCategory,
      isMonthly: editIsMonthly ? 1 : 0,
    });
  };

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Доступ запрещён</CardTitle>
            <CardDescription>
              У вас нет прав доступа к админ-панели
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Управление продуктами</h1>
          <p className="text-gray-600 mt-2">
            Добавляйте, редактируйте и удаляйте ваши продукты и услуги
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Новый продукт
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Название *
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Название продукта"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Краткое описание
                    </label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Краткое описание (отображается в карточке)"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Полное описание (детали)
                    </label>
                    <Textarea
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="Введите детали, каждый пункт с новой строки (начните с • или -)"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Цена (MDL) *
                    </label>
                    <Input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Например: 400 MDL или Стоимость по запросу"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Категория *
                    </label>
                    <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital">Цифровой продукт</SelectItem>
                        <SelectItem value="service">Услуга</SelectItem>
                        <SelectItem value="subscription">Подписка</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {category === "subscription" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isMonthly"
                        checked={isMonthly}
                        onChange={(e) => setIsMonthly(e.target.checked)}
                      />
                      <label htmlFor="isMonthly" className="text-sm font-medium text-gray-700">
                        Ежемесячная подписка
                      </label>
                    </div>
                  )}

                  {category === "digital" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Файл *
                      </label>
                      <Input
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        accept=".pdf,.xlsx,.xls,.doc,.docx,.zip"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, Excel, Word или ZIP
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={createProductMutation.isPending}
                  >
                    {createProductMutation.isPending ? "Загрузка..." : "Добавить продукт"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Products List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Ваши продукты ({products.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Нет продуктов. Добавьте первый продукт в форме слева.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {products.map((product: any) => (
                      <div key={product.id}>
                        {editingId === product.id ? (
                          // Edit mode
                          <Card className="border-blue-300 bg-blue-50">
                            <CardContent className="pt-6 space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Название
                                </label>
                                <Input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  placeholder="Название продукта"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Краткое описание
                                </label>
                                <Textarea
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  placeholder="Краткое описание"
                                  rows={2}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Полное описание (детали)
                                </label>
                                <Textarea
                                  value={editDetails}
                                  onChange={(e) => setEditDetails(e.target.value)}
                                  placeholder="Полное описание"
                                  rows={2}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Цена (MDL) *
                                </label>
                                <Input
                                  type="text"
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(e.target.value)}
                                  placeholder="Например: 400 MDL или Стоимость по запросу"
                                  className="border-2 border-blue-300 bg-blue-50"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Категория *
                                </label>
                                <Select value={editCategory} onValueChange={(value: any) => setEditCategory(value)}>
                                  <SelectTrigger className="border-2 border-blue-300 bg-blue-50">
                                    <SelectValue placeholder="Выберите категорию" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="digital">Цифровой продукт</SelectItem>
                                    <SelectItem value="service">Услуга</SelectItem>
                                    <SelectItem value="subscription">Подписка</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {editCategory === "subscription" && (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id={`editIsMonthly-${product.id}`}
                                    checked={editIsMonthly}
                                    onChange={(e) => setEditIsMonthly(e.target.checked)}
                                  />
                                  <label htmlFor={`editIsMonthly-${product.id}`} className="text-sm font-medium text-gray-700">
                                    Ежемесячная подписка
                                  </label>
                                </div>
                              )}

                              <div className="flex gap-2">
                                <Button
                                  onClick={handleUpdate}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                                  disabled={updateProductMutation.isPending}
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  {updateProductMutation.isPending ? "Сохранение..." : "Сохранить"}
                                </Button>
                                <Button
                                  onClick={() => setEditingId(null)}
                                  variant="outline"
                                  className="flex-1"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Отмена
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          // View mode
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                <p className="text-sm text-gray-600">{product.description}</p>
                                {product.details && (
                                  <p className="text-sm text-gray-600 mt-1">{product.details}</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEdit(product)}
                                >
                                  <Edit2 className="w-4 h-4 text-blue-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    deleteProductMutation.mutate({ productId: product.id })
                                  }
                                  disabled={deleteProductMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                              <div className="space-y-1">
                                <p className="text-gray-600">
                                  Цена: <span className="font-semibold">{product.price} MDL</span>
                                </p>
                                <p className="text-gray-600">
                                  Категория:{" "}
                                  <span className="font-semibold">
                                    {product.category === "digital"
                                      ? "Цифровой продукт"
                                      : product.category === "service"
                                      ? "Услуга"
                                      : "Подписка"}
                                  </span>
                                </p>
                                {product.isMonthly && (
                                  <p className="text-green-600 font-semibold">Ежемесячная</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
