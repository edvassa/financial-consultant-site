import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  type?: 'website' | 'article';
  articlePublishedTime?: string;
  articleModifiedTime?: string;
}

export function SEOHead({
  title = 'Финансовый директор онлайн | Консультант по финансам и CFO',
  description = 'Профессиональный финансовый консультант и директор онлайн. Услуги финанализа, стратегического управления, CFO консультации для бизнеса.',
  keywords = 'финансовый директор, финансовый консультант, финанализ, CFO консультант',
  ogImage = 'https://finconsult-turcanelena.manus.space/og-image.jpg',
  ogUrl = 'https://finconsult-turcanelena.manus.space',
  type = 'website',
  articlePublishedTime,
  articleModifiedTime,
}: SEOHeadProps) {
  useEffect(() => {
    // Update page title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!tag) {
        tag = document.createElement('meta');
        tag.name = name;
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    const updatePropertyTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updatePropertyTag('og:title', title);
    updatePropertyTag('og:description', description);
    updatePropertyTag('og:url', ogUrl);
    updatePropertyTag('og:type', type);
    updatePropertyTag('og:image', ogImage);

    if (type === 'article') {
      if (articlePublishedTime) {
        updatePropertyTag('article:published_time', articlePublishedTime);
      }
      if (articleModifiedTime) {
        updatePropertyTag('article:modified_time', articleModifiedTime);
      }
    }
  }, [title, description, keywords, ogImage, ogUrl, type, articlePublishedTime, articleModifiedTime]);

  return null;
}

// Schema.org Structured Data Components
export function BusinessSchema() {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      'name': 'FinDirector - Финансовый консультант',
      'description': 'Профессиональные услуги финансового консультанта и директора онлайн',
      'url': 'https://finconsult-turcanelena.manus.space',
      'telephone': '+373-XXXXXXX',
      'email': 'edvassa@gmail.com',
      'address': {
        '@type': 'PostalAddress',
        'addressCountry': 'MD',
        'addressRegion': 'Chisinau'
      },
      'priceRange': '$$',
      'areaServed': ['MD', 'RO', 'RU'],
      'serviceType': ['Финансовое консультирование', 'Финанализ', 'CFO услуги', 'Управление финансами'],
      'sameAs': [
        'https://finconsult-turcanelena.manus.space'
      ]
    };

    let script = document.querySelector('script[type="application/ld+json"][data-schema="business"]') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-schema', 'business');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
  }, []);

  return null;
}

export function PersonSchema() {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      'name': 'Елена Цуркан',
      'jobTitle': 'Финансовый директор и консультант',
      'email': 'edvassa@gmail.com',
      'url': 'https://finconsult-turcanelena.manus.space',
      'description': 'Профессиональный финансовый консультант с опытом более 15 лет в стратегическом финансовом управлении',
      'knowsAbout': ['Финансовое управление', 'Финанализ', 'CFO услуги', 'Бухгалтерский учет', 'Финансовое планирование'],
      'areaServed': ['MD', 'RO', 'RU']
    };

    let script = document.querySelector('script[type="application/ld+json"][data-schema="person"]') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-schema', 'person');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
  }, []);

  return null;
}

export function ArticleSchema({ title, description, imageUrl, publishedTime, modifiedTime }: {
  title: string;
  description: string;
  imageUrl?: string;
  publishedTime: string;
  modifiedTime: string;
}) {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': title,
      'description': description,
      'image': imageUrl || 'https://finconsult-turcanelena.manus.space/og-image.jpg',
      'datePublished': publishedTime,
      'dateModified': modifiedTime,
      'author': {
        '@type': 'Person',
        'name': 'Елена Цуркан'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'FinDirector',
        'url': 'https://finconsult-turcanelena.manus.space'
      }
    };

    let script = document.querySelector('script[type="application/ld+json"][data-schema="article"]') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-schema', 'article');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
  }, [title, description, imageUrl, publishedTime, modifiedTime]);

  return null;
}
