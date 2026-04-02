import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "../db";

describe("Blog Image Upload Endpoint", () => {
  let baseUrl: string;

  beforeAll(() => {
    baseUrl = process.env.API_URL || "http://localhost:3000";
  });

  it("should upload an image and return a URL", async () => {
    // Create a simple test image (1x1 pixel PNG)
    const pngBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    const response = await fetch(`${baseUrl}/api/blog/upload-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageBase64: pngBase64,
        imageMimeType: "image/png",
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.url).toBeTruthy();
    expect(typeof data.url).toBe("string");
    expect(data.url).toContain("blog-images");
  });

  it("should return error if imageBase64 is missing", async () => {
    const response = await fetch(`${baseUrl}/api/blog/upload-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageMimeType: "image/png",
      }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Missing image data");
  });

  it("should handle different image formats", async () => {
    // JPEG base64 (1x1 pixel)
    const jpegBase64 =
      "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=";

    const response = await fetch(`${baseUrl}/api/blog/upload-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageBase64: jpegBase64,
        imageMimeType: "image/jpeg",
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.url).toBeTruthy();
  });

  it("should generate unique URLs for multiple uploads", async () => {
    const pngBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    const response1 = await fetch(`${baseUrl}/api/blog/upload-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageBase64: pngBase64,
        imageMimeType: "image/png",
      }),
    });

    const data1 = await response1.json();

    // Wait a bit to ensure different timestamp
    await new Promise((resolve) => setTimeout(resolve, 10));

    const response2 = await fetch(`${baseUrl}/api/blog/upload-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageBase64: pngBase64,
        imageMimeType: "image/png",
      }),
    });

    const data2 = await response2.json();

    expect(data1.url).not.toBe(data2.url);
  });
});
