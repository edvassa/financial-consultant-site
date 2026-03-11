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
import { Trash2, Edit2, Plus } from "lucide-react";

export default function AdminProducts() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<"digital" | "service" | "subscription">("digital");
  const [file, setFile] = useState<File | null>(null);
  const [isMonthly, setIsMonthly] = useState(false);

  // Fetch products
  const { data: products = [], refetch: refetchProducts } = trpc.products.list.useQuery();

  // Create product mutation
  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Продукт успешно создан!");
      setName("");
      setDescription("");
      setPrice("");
      setFile(null);
      setCategory("digital");
      setIsMonthly(false);
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

    // For now, we'll create the product without the file
    // In a real implementation, you'd upload the file first
    createProductMutation.mutate({
      name,
      description,
      price: parseInt(price),
      category,
      isMonthly: isMonthly ? 1 : 0,
      fileName: file?.name || null,
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
                      Описание
                    </label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Описание продукта"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Цена (MDL) *
                    </label>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Цена в молдавских леях"
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
                      <div
                        key={product.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{product.name}</h3>
                            <p className="text-sm text-gray-600">{product.description}</p>
                          </div>
                          <div className="flex gap-2">
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
