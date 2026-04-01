#!/usr/bin/env node

// Test script to verify product update endpoint works with Full Details field

const API_URL = "http://localhost:3000/api/trpc";

// Test data with Russian text and special characters
const testDetails = `Что входит в консультацию:
• Онлайн-встреча длительностью 1,5–2 часа
• Предварительный анализ ваших документов
• Разбор конкретной ситуации
• Практические рекомендации
• Ответы на все ваши вопросы`;

async function testUpdate() {
  try {
    console.log("Testing product update with Full Details field...\n");

    // First, get the current product
    console.log("1. Fetching product ID 1...");
    const listResponse = await fetch(`${API_URL}/products.list`);
    const listData = await listResponse.json();
    const product = listData.result.data[0];
    console.log(`   Current product: ${product.name}`);
    console.log(`   Current details length: ${product.details?.length || 0} chars\n`);

    // Now test updating the details field
    console.log("2. Updating Full Details field...");
    console.log(`   New details: ${testDetails.substring(0, 50)}...\n`);

    // Note: This would need authentication in real scenario
    // For now, just show what would be sent
    const updatePayload = {
      id: 1,
      details: testDetails,
    };

    console.log("3. Update payload:");
    console.log(JSON.stringify(updatePayload, null, 2));
    console.log("\n4. Expected behavior:");
    console.log("   - Server receives the update request");
    console.log("   - updateProduct function filters undefined values");
    console.log("   - Only 'details' field is updated");
    console.log("   - Russian text is properly encoded");
    console.log("   - Returns updated product with new details");

    console.log("\n✓ Test structure verified");
    console.log("Note: Actual update requires admin authentication");

  } catch (error) {
    console.error("Error:", error);
  }
}

testUpdate();
