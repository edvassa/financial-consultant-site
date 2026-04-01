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
  it("should list products (public access)", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should allow admin to create products", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.create({
      name: "Test Product",
      description: "Test Description",
      price: 100,
      category: "digital",
      isMonthly: 0,
      fileName: "test.pdf",
    });

    expect(result).toBeDefined();
  });

  it("should prevent non-admin from creating products", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.products.create({
        name: "Test Product",
        description: "Test Description",
        price: 100,
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

  it("should allow admin to update product price and category", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // First create a product
    const created = await caller.products.create({
      name: "Update Test Product",
      description: "Test Description",
      price: 100,
      category: "digital",
      isMonthly: 0,
      fileName: "test.pdf",
    });

    // Then update it
    const updated = await caller.products.update({
      id: created.id,
      name: "Updated Product",
      description: "Updated Description",
      details: "Updated Details",
      price: 250,
      category: "service",
      isMonthly: 0,
    });

    expect(updated.price).toBe(250);
    expect(updated.category).toBe("service");
    expect(updated.name).toBe("Updated Product");
  });

  it("should prevent non-admin from updating products", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.products.update({
        id: 1,
        name: "Updated",
        description: "Updated",
        details: "Updated",
        price: 250,
        category: "service",
        isMonthly: 0,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("admin");
    }
  });
