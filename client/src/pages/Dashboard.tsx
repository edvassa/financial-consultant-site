import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Plus, Trash2, Eye, EyeOff, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

interface Product {
  id: number;
  name: string;
  description?: string;
  details?: string;
  price: number;
  category: string;
  isActive: number;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
}

interface Order {
  id: number;
  productId: number;
  customerName: string;
  customerEmail: string;
  price: number;
  status: string;
  createdAt: string;
  productName?: string;
}

interface ConsultationBooking {
  id: number;
  clientName: string;
  clientEmail: string;
  consultationType: string;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<ConsultationBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
      return;
    }
    const ownerEmail = "edvassa@gmail.com";
    if (user?.email !== ownerEmail) {
      setLocation("/");
      return;
    }
    fetchData();
  }, [isAuthenticated, user?.email, setLocation]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes, bookingsRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/orders"),
        fetch("/api/consultations"),
      ]);

      if (productsRes.ok) setProducts(await productsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await fetch(`/api/products/${id}`, { method: "DELETE" });
        setProducts(products.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleToggleProduct = async (id: number, isActive: number) => {
    try {
      await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: isActive ? 0 : 1 }),
      });
      setProducts(
        products.map((p) => (p.id === id ? { ...p, isActive: isActive ? 0 : 1 } : p))
      );
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingId(product.id);
    setEditForm(product);
  };

  const handleSaveProduct = async () => {
    if (!editingId) return;
    try {
      const response = await fetch(`/api/products/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (response.ok) {
        setProducts(
          products.map((p) =>
            p.id === editingId ? { ...p, ...editForm } : p
          )
        );
        setEditingId(null);
        setEditForm({});
        alert("Product updated successfully!");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error updating product");
    }
  }

  const handleFileUpload = async (productId: number, file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const response = await fetch(`/api/products/${productId}/file`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileBase64: base64,
            fileName: file.name,
            fileSize: file.size,
          }),
        });
        if (response.ok) {
          const updated = await response.json();
          setProducts(products.map((p) => (p.id === productId ? updated : p)));
          alert("File uploaded successfully!");
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Site
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          </div>
          <div className="text-sm text-slate-600">
            Welcome, <strong>{user?.name}</strong>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="consultations">Consultations ({bookings.length})</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Manage Products</h2>
              <Button className="bg-green-700 hover:bg-green-800 gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>

            <div className="grid gap-4">
              {products.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-slate-600">
                    No products yet. Click "Add Product" to create your first one.
                  </CardContent>
                </Card>
              ) : (
                products.map((product) => (
                  <Card key={product.id} className="border-slate-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-slate-900">{product.name}</CardTitle>
                          <CardDescription>
                            {product.price.toLocaleString()} MDL • {product.category}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleProduct(product.id, product.isActive)}
                          >
                            {product.isActive ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {editingId === product.id ? (
                        <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                            <input
                              type="text"
                              value={editForm.name || ""}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Price (MDL)</label>
                            <input
                              type="number"
                              value={editForm.price || ""}
                              onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                              value={editForm.description || ""}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                              rows={3}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Details</label>
                            <textarea
                              value={editForm.details || ""}
                              onChange={(e) => setEditForm({ ...editForm, details: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                              rows={5}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleSaveProduct}
                              className="bg-green-700 hover:bg-green-800"
                              size="sm"
                            >
                              Save
                            </Button>
                            <Button
                              onClick={() => {
                                setEditingId(null);
                                setEditForm({});
                              }}
                              variant="outline"
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                        {product.fileUrl ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Download className="h-4 w-4" />
                              <span>{product.fileName}</span>
                            </div>
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.zip"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleFileUpload(product.id, e.target.files[0]);
                                  }
                                }}
                                className="hidden"
                              />
                              <Button variant="outline" size="sm" className="gap-2">
                                <Upload className="h-4 w-4" />
                                Replace
                              </Button>
                            </label>
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.zip"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleFileUpload(product.id, e.target.files[0]);
                                }
                              }}
                              className="hidden"
                            />
                            <Button variant="outline" size="sm" className="gap-2 w-full">
                              <Upload className="h-4 w-4" />
                              Upload File
                            </Button>
                          </label>
                        )}
                        <p className="text-xs text-slate-500">
                          Created: {new Date(product.createdAt).toLocaleDateString()}
                        </p>
                        {product.description && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <p className="text-xs font-semibold text-slate-700 mb-1">Description:</p>
                            <p className="text-sm text-slate-600">{product.description}</p>
                          </div>
                        )}
                        {product.details && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <p className="text-xs font-semibold text-slate-700 mb-1">Details:</p>
                            <p className="text-sm text-slate-600">{product.details}</p>
                          </div>
                        )}
                      </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Customer Orders</h2>

            <div className="grid gap-4">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-slate-600">
                    No orders yet. When customers make purchases, they'll appear here.
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="border-slate-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-slate-900">{order.customerName}</CardTitle>
                          <CardDescription>{order.customerEmail}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-700">
                            {order.price.toLocaleString()} MDL
                          </div>
                          <div className={`text-xs font-semibold ${
                            order.status === "paid"
                              ? "text-green-600"
                              : order.status === "pending"
                              ? "text-yellow-600"
                              : "text-slate-600"
                          }`}>
                            {order.status.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600 mb-2">
                        <strong>Product:</strong> {order.productName}
                      </p>
                      <p className="text-xs text-slate-500">
                        Ordered: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Consultations Tab */}
          <TabsContent value="consultations" className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Consultation Requests</h2>

            <div className="grid gap-4">
              {bookings.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-slate-600">
                    No consultation requests yet.
                  </CardContent>
                </Card>
              ) : (
                bookings.map((booking) => (
                  <Card key={booking.id} className="border-slate-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-slate-900">{booking.clientName}</CardTitle>
                          <CardDescription>{booking.clientEmail}</CardDescription>
                        </div>
                        <div className={`text-xs font-semibold px-2 py-1 rounded ${
                          booking.status === "new"
                            ? "bg-blue-100 text-blue-700"
                            : booking.status === "scheduled"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {booking.status.toUpperCase()}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600 mb-2">
                        <strong>Type:</strong> {booking.consultationType}
                      </p>
                      <p className="text-xs text-slate-500">
                        Requested: {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Manage Blog</h2>
              <Button
                onClick={() => setLocation("/admin/blog")}
                className="bg-green-700 hover:bg-green-800 gap-2"
              >
                <Plus className="h-4 w-4" />
                Manage Articles
              </Button>
            </div>
            <Card>
              <CardContent className="pt-6 text-center text-slate-600">
                <p className="mb-4">Click "Manage Articles" to add, edit, or delete blog posts</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
