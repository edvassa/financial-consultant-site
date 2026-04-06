#!/usr/bin/env node

/**
 * AUTOMATED OG:URL TEST SUITE
 * 
 * This test MUST pass before every deployment.
 * It verifies that:
 * 1. og:url does NOT contain ?manus_scraper=1
 * 2. og:title matches the article title from database
 * 3. og:image is the article image (not default/homepage)
 * 4. og:description is the article description
 * 
 * Run with: node test-og.mjs
 * Exit code 0 = all tests pass (safe to deploy)
 * Exit code 1 = tests failed (DO NOT deploy)
 */

import fetch from 'node-fetch';
import { createConnection } from 'mysql2/promise';

const BASE_URL = 'https://finconsult-turcanelena.manus.space';
const FACEBOOK_USER_AGENT = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';
const LINKEDIN_USER_AGENT = 'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache Hadoop; java.net.URLConnection)';
const TWITTER_USER_AGENT = 'Twitterbot/1.0';

// Test articles - these must exist in the database
const TEST_ARTICLES = [
  'dae',
  'infleatia',
  'vijivanieveconomice'
];

let passCount = 0;
let failCount = 0;

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    'info': '[INFO]',
    'pass': '[✓ PASS]',
    'fail': '[✗ FAIL]',
    'error': '[ERROR]'
  }[type] || '[LOG]';
  console.log(`${timestamp} ${prefix} ${message}`);
}

function assert(condition, message) {
  if (condition) {
    log(message, 'pass');
    passCount++;
  } else {
    log(message, 'fail');
    failCount++;
  }
}

async function getArticleFromDB(slug) {
  try {
    const connection = await createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'financial_consultant'
    });

    const [rows] = await connection.execute(
      'SELECT title, seoTitle, seoDescription, excerpt, imageUrl FROM blog_articles WHERE slug = ?',
      [slug]
    );

    await connection.end();

    if (rows.length === 0) {
      log(`Article not found in database: ${slug}`, 'error');
      return null;
    }

    return rows[0];
  } catch (error) {
    log(`Database error: ${error.message}`, 'error');
    return null;
  }
}

async function testArticle(slug, userAgent, userAgentName) {
  log(`Testing ${slug} with ${userAgentName}...`, 'info');

  try {
    const response = await fetch(`${BASE_URL}/blog/${slug}`, {
      headers: {
        'User-Agent': userAgent
      }
    });

    const html = await response.text();

    // Extract og:url
    const ogUrlMatch = html.match(/<meta\s+property="og:url"\s+content="([^"]+)"/);
    const ogUrl = ogUrlMatch ? ogUrlMatch[1] : null;

    // Extract og:title
    const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/);
    const ogTitle = ogTitleMatch ? ogTitleMatch[1] : null;

    // Extract og:description
    const ogDescMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/);
    const ogDescription = ogDescMatch ? ogDescMatch[1] : null;

    // Extract og:image
    const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/);
    const ogImage = ogImageMatch ? ogImageMatch[1] : null;

    log(`og:url: ${ogUrl}`, 'info');
    log(`og:title: ${ogTitle}`, 'info');
    log(`og:description: ${ogDescription}`, 'info');
    log(`og:image: ${ogImage}`, 'info');

    // Get article from database
    const dbArticle = await getArticleFromDB(slug);
    if (!dbArticle) {
      return;
    }

    const expectedTitle = dbArticle.seoTitle || dbArticle.title;
    const expectedDescription = dbArticle.seoDescription || dbArticle.excerpt;
    const expectedImage = dbArticle.imageUrl;

    // Test 1: og:url should NOT contain ?manus_scraper=1
    assert(
      !ogUrl || !ogUrl.includes('?manus_scraper'),
      `og:url should not contain ?manus_scraper: ${ogUrl}`
    );

    // Test 2: og:url should match expected format
    const expectedUrl = `${BASE_URL}/blog/${slug}`;
    assert(
      ogUrl === expectedUrl,
      `og:url should be ${expectedUrl}, got ${ogUrl}`
    );

    // Test 3: og:title should match article title
    assert(
      ogTitle === expectedTitle,
      `og:title should be "${expectedTitle}", got "${ogTitle}"`
    );

    // Test 4: og:description should match article description
    assert(
      ogDescription === expectedDescription,
      `og:description should be "${expectedDescription}", got "${ogDescription}"`
    );

    // Test 5: og:image should match article image (if present)
    if (expectedImage) {
      assert(
        ogImage === expectedImage,
        `og:image should be "${expectedImage}", got "${ogImage}"`
      );
    }

  } catch (error) {
    log(`Error testing ${slug}: ${error.message}`, 'error');
    failCount++;
  }
}

async function runTests() {
  log('Starting OG:URL automated tests...', 'info');
  log(`Base URL: ${BASE_URL}`, 'info');
  log(`Test articles: ${TEST_ARTICLES.join(', ')}`, 'info');
  log('', 'info');

  for (const slug of TEST_ARTICLES) {
    log(`\n=== Testing article: ${slug} ===`, 'info');

    // Test with Facebook bot
    await testArticle(slug, FACEBOOK_USER_AGENT, 'Facebook Bot');
    log('', 'info');

    // Test with LinkedIn bot
    await testArticle(slug, LINKEDIN_USER_AGENT, 'LinkedIn Bot');
    log('', 'info');

    // Test with Twitter bot
    await testArticle(slug, TWITTER_USER_AGENT, 'Twitter Bot');
    log('', 'info');
  }

  // Summary
  log('\n=== TEST SUMMARY ===', 'info');
  log(`Passed: ${passCount}`, 'pass');
  log(`Failed: ${failCount}`, 'fail');

  if (failCount === 0) {
    log('All tests passed! Safe to deploy.', 'pass');
    process.exit(0);
  } else {
    log('Some tests failed! DO NOT deploy.', 'fail');
    process.exit(1);
  }
}

runTests().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});
