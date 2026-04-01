import { describe, expect, it, beforeAll, afterAll } from "vitest";

const API_URL = "http://localhost:3000/api";

describe("Consultations API", () => {
  let consultationId: number;

  it("should create a new consultation booking", async () => {
    const response = await fetch(`${API_URL}/consultations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: "Test Client",
        clientEmail: "test@example.com",
        clientPhone: "+373 69 00 00 00",
        consultationType: "one-time",
        preferredDate: "2026-03-20",
        message: "Test consultation request",
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.id).toBeDefined();
    consultationId = data.id;
  });

  it("should fetch all consultations", async () => {
    const response = await fetch(`${API_URL}/consultations`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("should fetch a single consultation", async () => {
    if (!consultationId) {
      console.log("Skipping: consultationId not set");
      return;
    }

    const response = await fetch(`${API_URL}/consultations/${consultationId}`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.clientName).toBe("Test Client");
  });

  it("should update consultation status", async () => {
    if (!consultationId) {
      console.log("Skipping: consultationId not set");
      return;
    }

    const response = await fetch(`${API_URL}/consultations/${consultationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "confirmed" }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it("should return 400 for missing required fields", async () => {
    const response = await fetch(`${API_URL}/consultations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: "Test Client",
        // Missing required fields
      }),
    });

    expect(response.status).toBe(400);
  });
});

describe("Orders API", () => {
  let orderId: number;

  it("should create a new order", async () => {
    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: 1,
        customerName: "Test Customer",
        customerEmail: "customer@example.com",
        customerPhone: "+373 69 00 00 00",
        price: "400",
        notes: "Test order",
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.id).toBeDefined();
    orderId = data.id;
  });

  it("should fetch all orders", async () => {
    const response = await fetch(`${API_URL}/orders`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("should fetch a single order", async () => {
    if (!orderId) {
      console.log("Skipping: orderId not set");
      return;
    }

    const response = await fetch(`${API_URL}/orders/${orderId}`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.customerName).toBe("Test Customer");
  });

  it("should update order status", async () => {
    if (!orderId) {
      console.log("Skipping: orderId not set");
      return;
    }

    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid" }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it("should return 400 for missing required fields", async () => {
    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: 1,
        // Missing required fields
      }),
    });

    expect(response.status).toBe(400);
  });
});
