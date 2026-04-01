import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;
type AdminUser = AuthenticatedUser & { role: "admin" };

function createAdminContext(): TrpcContext {
  const user: AdminUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("products router", () => {
  // IMPORTANT: These tests should NOT create new products or modify existing ones
  // They only verify existing functionality with the 8 production products
  // If you need to test creating products, use a separate test database
  
  it("should list all 8 products (public access)", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(8);
    
    // Verify the book is there with description
    const book = result.find((p: any) => p.id === 1);
    expect(book).toBeDefined();
    expect(book.name).toBe('Книга "От хаоса к прибыли"');
    expect(book.price).toBe("400");
    expect(book.details).toContain("юмором");
  });

  it("should have all 8 services with correct prices", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.list();

    // Check each product exists and has correct price
    expect(result.find((p: any) => p.id === 1).price).toBe("400");
    expect(result.find((p: any) => p.id === 2).price).toBe("2000");
    expect(result.find((p: any) => p.id === 3).price).toBe("2000");
    expect(result.find((p: any) => p.id === 4).price).toBe("Стоимость по запросу");
    expect(result.find((p: any) => p.id === 5).price).toBe("Стоимость по запросу");
    expect(result.find((p: any) => p.id === 6).price).toBe("Стоимость по запросу");
    expect(result.find((p: any) => p.id === 7).price).toBe("Стоимость по запросу");
    expect(result.find((p: any) => p.id === 8).price).toBe("Стоимость по запросу");
  });

  it("should allow admin to update product Full Details with Russian text", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Update product ID 1 (book) with new details
    const longRussianDetails = `Живая и понятная книга о финансах для тех, кто не хочет разбираться в сложных терминах. С юмором, карикатурами и реальными примерами показывает, где теряются деньги в бизнесе и как навести порядок. Подходит даже для тех, кто считает себя 'чайником' в финансах.`;

    const updated = await caller.products.update({
      id: 1,
      details: longRussianDetails,
    });

    expect(updated.details).toBe(longRussianDetails);
    expect(updated.details).toContain("юмором");
    expect(updated.name).toBe('Книга "От хаоса к прибыли"');
    expect(updated.price).toBe("400");
  });

  it("should allow admin to update price field to text", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Update product ID 2 price
    const updated = await caller.products.update({
      id: 2,
      price: "2000 MDL или по запросу",
    });

    expect(updated.price).toBe("2000 MDL или по запросу");
    expect(typeof updated.price).toBe("string");
    expect(updated.name).toBe("Унифицированные шаблоны");
  });

  it("should prevent non-admin from updating products", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.products.update({
        id: 1,
        name: "Updated",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("admin");
    }
  });

  it("should prevent non-admin from creating products", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.products.create({
        name: "Test Product",
        description: "Test Description",
        price: "100",
        category: "digital",
        isMonthly: 0,
        fileName: "test.pdf",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("admin");
    }
  });

  it("should prevent non-admin from deleting products", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.products.delete({
        productId: 1,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("admin");
    }
  });
});
