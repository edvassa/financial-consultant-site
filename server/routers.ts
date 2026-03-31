import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { getProducts, createProduct, deleteProduct, getDb } from "./db";
import { contentPages } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  products: router({
    list: publicProcedure.query(async () => {
      return getProducts();
    }),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          price: z.number(),
          category: z.enum(["digital", "service", "subscription"]),
          isMonthly: z.number().optional(),
          fileName: z.string().optional().nullable(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admin can create products");
        }
        return createProduct(input);
      }),
    delete: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admin can delete products");
        }
        return deleteProduct(input.productId);
      }),
  }),

  content: router({
    get: publicProcedure
      .input(z.object({ pageKey: z.string() }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) return null;
          
          const result = await db
            .select()
            .from(contentPages)
            .where(eq(contentPages.pageKey, input.pageKey))
            .limit(1);
          
          if (result.length > 0) {
            return JSON.parse(result[0].content);
          }
          return null;
        } catch (error) {
          console.error("Error fetching content:", error);
          return null;
        }
      }),
    
    upsert: protectedProcedure
      .input(
        z.object({
          pageKey: z.string(),
          content: z.unknown(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admin can update content");
        }
        
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          const existing = await db
            .select()
            .from(contentPages)
            .where(eq(contentPages.pageKey, input.pageKey))
            .limit(1);
          
          if (existing.length > 0) {
            await db
              .update(contentPages)
              .set({ content: JSON.stringify(input.content) })
              .where(eq(contentPages.pageKey, input.pageKey));
          } else {
            await db.insert(contentPages).values({
              pageKey: input.pageKey,
              content: JSON.stringify(input.content),
            });
          }
          
          return { success: true };
        } catch (error) {
          console.error("Error saving content:", error);
          throw new Error("Failed to save content");
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
