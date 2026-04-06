/**
 * PERMANENT FIX FOR og:url BUG
 * 
 * CRITICAL RULE: og:url must ALWAYS be built using SITE_URL + article.slug from database
 * NEVER use req.url, req.originalUrl, or request.url for og:url
 * 
 * Manus proxy adds ?manus_scraper=1 to all requests - this cannot be changed
 * The only solution is to build URLs from scratch using this hardcoded constant
 */

export const SITE_URL = 'https://finconsult-turcanelena.manus.space';

export default { SITE_URL };
