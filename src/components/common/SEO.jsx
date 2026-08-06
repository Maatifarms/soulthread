import { useEffect } from 'react';

/**
 * Enhanced SEO Component for SoulThread (SPA)
 * Handles Title, Meta Description, Keywords, Canonical URLs, OpenGraph, Twitter Cards,
 * and Schema.org JSON-LD Structured Data (Organization, WebSite, FAQPage, BreadcrumbList, MedicalWebPage).
 */
const SEO = ({
    title = "SoulThread | India's Trusted Anonymous Mental Health Sanctuary & Care Platform",
    description = "Talk to someone who understands. SoulThread is India's leading anonymous mental health sanctuary offering peer support, verified online psychologists, and confidential crisis guidance without judgment or real names.",
    keywords = "mental health platform India, online therapy India, anonymous mental health support, vent anonymously online, anxiety relief app India, depression support group, student mental health India, corporate EAP wellness",
    image = "https://soulthread.in/logo.jpg", 
    url = "https://soulthread.in/",
    type = 'website', 
    schema = null 
}) => {
    const fullTitle = title.includes('SoulThread') ? title : `${title} | SoulThread`;

    useEffect(() => {
        // 1. Title Tag
        document.title = fullTitle;

        // Helper to upsert meta tags
        const updateMetaTag = (name, content, property = false) => {
            if (!content) return;
            const attr = property ? 'property' : 'name';
            let element = document.querySelector(`meta[${attr}="${name}"]`);
            if (element) {
                element.setAttribute('content', content);
            } else {
                element = document.createElement('meta');
                element.setAttribute(attr, name);
                element.setAttribute('content', content);
                document.head.appendChild(element);
            }
        };

        // 2. Standard & Social Meta Tags
        updateMetaTag('description', description);
        updateMetaTag('og:description', description, true);
        updateMetaTag('twitter:description', description);

        updateMetaTag('keywords', keywords);

        updateMetaTag('og:image', image, true);
        updateMetaTag('twitter:image', image);

        updateMetaTag('og:title', fullTitle, true);
        updateMetaTag('twitter:title', fullTitle);
        updateMetaTag('og:type', type, true);

        if (url) {
            updateMetaTag('og:url', url, true);
            updateMetaTag('twitter:url', url);
            
            // Canonical URL
            let canonical = document.querySelector('link[rel="canonical"]');
            if (canonical) {
                canonical.setAttribute('href', url);
            } else {
                canonical = document.createElement('link');
                canonical.setAttribute('rel', 'canonical');
                canonical.setAttribute('href', url);
                document.head.appendChild(canonical);
            }
        }

        // 3. WebSite & SearchAction Base Schema
        const websiteSchema = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "SoulThread",
            "url": "https://soulthread.in/",
            "potentialAction": {
                "@type": "SearchAction",
                "target": "https://soulthread.in/explore?q={search_term_string}",
                "query-input": "required name=search_term_string"
            }
        };

        // 4. JSON-LD Dynamic Schema Ingestion
        const existingSchemas = document.querySelectorAll('script[type="application/ld+json"].dynamic-schema');
        existingSchemas.forEach(s => s.remove());

        const schemasToInject = [websiteSchema];
        if (schema) {
            if (Array.isArray(schema)) {
                schemasToInject.push(...schema);
            } else {
                schemasToInject.push(schema);
            }
        }

        schemasToInject.forEach((schObj) => {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.className = 'dynamic-schema';
            script.text = JSON.stringify(schObj);
            document.head.appendChild(script);
        });

    }, [fullTitle, description, keywords, image, url, type, schema]);

    return null;
};

export default SEO;
