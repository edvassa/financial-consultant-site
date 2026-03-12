import { describe, it, expect, vi, beforeEach } from "vitest";
import blogRouter from "./blog";
import { getDb } from "../db";
import * as storage from "../storage";

// Mock the database
vi.mock("../db");

// Mock the storage
vi.mock("../storage");

const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe("Blog API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getDb as any).mockResolvedValue(mockDb);
  });

  describe("GET /api/blog - Get all published articles", () => {
    it("should return all published articles", async () => {
      const mockArticles = [
        {
          id: 1,
          title: "Финансовые советы",
          slug: "finansovye-sovety",
          content: "Содержание статьи",
          excerpt: "Краткое описание",
          imageUrl: "https://example.com/image.jpg",
          published: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mockArticles),
        }),
      });

      const mockReq = { params: {} } as any;
      const mockRes = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      const handler = blogRouter.stack.find(
        (layer: any) => layer.route?.methods?.get && layer.route.path === "/"
      )?.route.stack[0].handle;

      if (handler) {
        await handler(mockReq, mockRes);
        expect(mockRes.json).toHaveBeenCalledWith(mockArticles);
      }
    });
  });

  describe("GET /api/blog/article/:slug - Get single article", () => {
    it("should return article by slug", async () => {
      const mockArticle = {
        id: 1,
        title: "Финансовые советы",
        slug: "finansovye-sovety",
        content: "Содержание статьи",
        excerpt: "Краткое описание",
        imageUrl: "https://example.com/image.jpg",
        published: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockArticle]),
          }),
        }),
      });

      const mockReq = { params: { slug: "finansovye-sovety" } } as any;
      const mockRes = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      const handler = blogRouter.stack.find(
        (layer: any) =>
          layer.route?.methods?.get && layer.route.path === "/article/:slug"
      )?.route.stack[0].handle;

      if (handler) {
        await handler(mockReq, mockRes);
        expect(mockRes.json).toHaveBeenCalledWith(mockArticle);
      }
    });

    it("should return 404 if article not found", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const mockReq = { params: { slug: "nonexistent" } } as any;
      const mockRes = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      const handler = blogRouter.stack.find(
        (layer: any) =>
          layer.route?.methods?.get && layer.route.path === "/article/:slug"
      )?.route.stack[0].handle;

      if (handler) {
        await handler(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(404);
      }
    });
  });

  describe("GET /api/blog/search/:query - Search articles", () => {
    it("should search articles by query", async () => {
      const mockArticles = [
        {
          id: 1,
          title: "Финансовые советы",
          slug: "finansovye-sovety",
          content: "Содержание статьи о финансах",
          excerpt: "Краткое описание",
          imageUrl: "https://example.com/image.jpg",
          published: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mockArticles),
        }),
      });

      const mockReq = { params: { query: "финансы" } } as any;
      const mockRes = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      const handler = blogRouter.stack.find(
        (layer: any) =>
          layer.route?.methods?.get && layer.route.path === "/search/:query"
      )?.route.stack[0].handle;

      if (handler) {
        await handler(mockReq, mockRes);
        expect(mockRes.json).toHaveBeenCalled();
      }
    });
  });

  describe("POST /api/blog/admin/create - Create article", () => {
    it("should create article with required fields", async () => {
      const mockReq = {
        body: {
          title: "Новая статья",
          slug: "novaya-statya",
          content: "Содержание статьи",
          excerpt: "Краткое описание",
          published: true,
        },
      } as any;

      const mockRes = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue([1]),
      });

      const handler = blogRouter.stack.find(
        (layer: any) =>
          layer.route?.methods?.post && layer.route.path === "/admin/create"
      )?.route.stack[0].handle;

      if (handler) {
        await handler(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(201);
      }
    });

    it("should return 400 if required fields missing", async () => {
      const mockReq = {
        body: {
          title: "Новая статья",
          // Missing slug and content
        },
      } as any;

      const mockRes = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      const handler = blogRouter.stack.find(
        (layer: any) =>
          layer.route?.methods?.post && layer.route.path === "/admin/create"
      )?.route.stack[0].handle;

      if (handler) {
        await handler(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
      }
    });
  });

  describe("PATCH /api/blog/admin/:id - Update article", () => {
    it("should update article", async () => {
      const mockReq = {
        params: { id: "1" },
        body: {
          title: "Обновленная статья",
          published: true,
        },
      } as any;

      const mockRes = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      const handler = blogRouter.stack.find(
        (layer: any) =>
          layer.route?.methods?.patch && layer.route.path === "/admin/:id"
      )?.route.stack[0].handle;

      if (handler) {
        await handler(mockReq, mockRes);
        expect(mockRes.json).toHaveBeenCalledWith({ success: true });
      }
    });
  });

  describe("DELETE /api/blog/admin/:id - Delete article", () => {
    it("should delete article", async () => {
      const mockReq = { params: { id: "1" } } as any;
      const mockRes = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      mockDb.delete.mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });

      const handler = blogRouter.stack.find(
        (layer: any) =>
          layer.route?.methods?.delete && layer.route.path === "/admin/:id"
      )?.route.stack[0].handle;

      if (handler) {
        await handler(mockReq, mockRes);
        expect(mockRes.json).toHaveBeenCalledWith({ success: true });
      }
    });
  });

  describe("GET /api/blog/admin/all - Get all articles", () => {
    it("should return all articles including drafts", async () => {
      const mockArticles = [
        {
          id: 1,
          title: "Опубликованная статья",
          published: 1,
        },
        {
          id: 2,
          title: "Черновик",
          published: 0,
        },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockResolvedValue(mockArticles),
      });

      const mockReq = {} as any;
      const mockRes = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      const handler = blogRouter.stack.find(
        (layer: any) =>
          layer.route?.methods?.get && layer.route.path === "/admin/all"
      )?.route.stack[0].handle;

      if (handler) {
        await handler(mockReq, mockRes);
        expect(mockRes.json).toHaveBeenCalledWith(mockArticles);
      }
    });
  });
});
