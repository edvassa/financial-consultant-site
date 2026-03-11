import { describe, it, expect, vi, beforeEach } from "vitest";
import consultationsRouter from "./consultations";
import { getDb } from "../db";
import * as notification from "../_core/notification";

// Mock the database
vi.mock("../db");

// Mock the notification service
vi.mock("../_core/notification");

const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
};

describe("Consultations API - Notification Feature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getDb as any).mockResolvedValue(mockDb);
    (notification.notifyOwner as any).mockResolvedValue(true);
  });

  describe("Notification on consultation creation", () => {
    it("should call notifyOwner with correct title and content", async () => {
      const mockReq = {
        body: {
          clientName: "John Doe",
          clientEmail: "john@example.com",
          clientPhone: "+373 69 123 456",
          consultationType: "one-time",
          preferredDate: "2026-03-15",
          message: "I need financial advice",
        },
      };

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      // Mock database insert
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue([1]),
      });

      // Get the POST handler from router
      const postHandler = (consultationsRouter.stack.find(
        (layer: any) => layer.route?.methods?.post
      ) as any).route.stack[0].handle;

      await postHandler(mockReq, mockRes);

      // Verify notification was called
      expect(notification.notifyOwner).toHaveBeenCalled();

      const notifyCall = (notification.notifyOwner as any).mock.calls[0][0];
      expect(notifyCall.title).toBe("Новая заявка на консультацию");
      expect(notifyCall.content).toContain("John Doe");
      expect(notifyCall.content).toContain("john@example.com");
      expect(notifyCall.content).toContain("+373 69 123 456");
      expect(notifyCall.content).toContain("Разовая консультация");
      expect(notifyCall.content).toContain("2026-03-15");
      expect(notifyCall.content).toContain("I need financial advice");
    });

    it("should handle missing optional fields in notification", async () => {
      const mockReq = {
        body: {
          clientName: "Jane Smith",
          clientEmail: "jane@example.com",
          clientPhone: "+373 69 654 321",
          consultationType: "accounting-setup",
          // preferredDate and message are optional
        },
      };

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue([2]),
      });

      const postHandler = (consultationsRouter.stack.find(
        (layer: any) => layer.route?.methods?.post
      ) as any).route.stack[0].handle;

      await postHandler(mockReq, mockRes);

      const notifyCall = (notification.notifyOwner as any).mock.calls[0][0];
      expect(notifyCall.content).toContain("Не указана");
      expect(notifyCall.content).toContain("Постановка управленческого учета");
    });

    it("should format different consultation types correctly", async () => {
      const consultationTypes = [
        {
          value: "financial-startup",
          label: "Финансовый старт",
        },
        {
          value: "financing-help",
          label: "Помощь в привлечении финансирования",
        },
        {
          value: "reporting",
          label: "Регламентированная отчетность",
        },
        {
          value: "outsourced-director",
          label: "Ежемесячный аутсорс финансового директора",
        },
      ];

      for (const consultationType of consultationTypes) {
        vi.clearAllMocks();
        (notification.notifyOwner as any).mockResolvedValue(true);

        const mockReq = {
          body: {
            clientName: "Test Client",
            clientEmail: "test@example.com",
            clientPhone: "+373 69 000 000",
            consultationType: consultationType.value,
            preferredDate: "2026-03-20",
            message: "Test message",
          },
        };

        const mockRes = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
        };

        mockDb.insert.mockReturnValue({
          values: vi.fn().mockResolvedValue([1]),
        });

        const postHandler = (consultationsRouter.stack.find(
          (layer: any) => layer.route?.methods?.post
        ) as any).route.stack[0].handle;

        await postHandler(mockReq, mockRes);

        const notifyCall = (notification.notifyOwner as any).mock.calls[0][0];
        expect(notifyCall.content).toContain(consultationType.label);
      }
    });

    it("should not send notification if database insert fails", async () => {
      const mockReq = {
        body: {
          clientName: "John Doe",
          clientEmail: "john@example.com",
          clientPhone: "+373 69 123 456",
          consultationType: "one-time",
        },
      };

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      // Mock database error
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockRejectedValue(new Error("Database error")),
      });

      const postHandler = (consultationsRouter.stack.find(
        (layer: any) => layer.route?.methods?.post
      ) as any).route.stack[0].handle;

      await postHandler(mockReq, mockRes);

      // Notification should not be called when database fails
      expect(notification.notifyOwner).not.toHaveBeenCalled();
    });

    it("should not send notification if required fields are missing", async () => {
      const mockReq = {
        body: {
          clientName: "John Doe",
          // Missing email, phone, and consultationType
        },
      };

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      const postHandler = (consultationsRouter.stack.find(
        (layer: any) => layer.route?.methods?.post
      ) as any).route.stack[0].handle;

      await postHandler(mockReq, mockRes);

      // Notification should not be called when validation fails
      expect(notification.notifyOwner).not.toHaveBeenCalled();
    });
  });
});
