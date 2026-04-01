import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME } from "@shared/const";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { getProducts, createProduct, deleteProduct, updateProduct, getContentPage, upsertContentPage } from "./db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

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
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admin can create products" });
        }
        return createProduct(input);
      }),
    delete: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admin can delete products" });
        }
        return deleteProduct(input.productId);
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          details: z.string().optional(),
          price: z.number().optional(),
          category: z.enum(["digital", "service", "subscription"]).optional(),
          isMonthly: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admin can update products" });
        }
        const { id, ...data } = input;
        return updateProduct(id, data);
      }),
  }),

  content: router({
    get: publicProcedure
      .input(z.object({ pageKey: z.string() }))
      .query(async ({ input }) => {
        try {
          const page = await getContentPage(input.pageKey);
          if (page) {
            return JSON.parse(page.content);
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
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admin can update content" });
        }
        
        try {
          await upsertContentPage(input.pageKey, input.content);
          return { success: true };
        } catch (error) {
          console.error("Error saving content:", error);
          throw new Error("Failed to save content");
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
