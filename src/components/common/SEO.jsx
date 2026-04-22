import { useEffect } from 'react';

/**
 * SEO Component to dynamically update document title and meta tags.
 * This helps with SEO in a Single Page Application (SPA).
 */
const SEO = ({ 
    title = "Anonymous Emotional Support & Safe Space | SoulThread", 
    description = "Need a safe space to talk anonymously? Join SoulThread, the leading online venting platform for emotional support, anxiety relief, and mental wellness conversations.",
    keywords = "anonymous emotional support, venting platform, safe space to talk anonymously, find emotional support online, mental health community, anonymous therapy alternative",
    image = "https://soulthread.in/logo.jpg", 
    url = "https://soulthread.in/",
    type = 'website', 
    schema = null 
}) => {
    const fullTitle = `${title} | SoulThread Sanctuary`;

    useEffect(() => {
        // Update Title
        if (title) {
            document.title = fullTitle;
        }

        // Update Description
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

        if (description) {
            updateMetaTag('description', description);
            updateMetaTag('og:description', description, true);
            updateMetaTag('twitter:description', description);
        }

        if (keywords) {
            updateMetaTag('keywords', keywords);
        }

        if (image) {
            updateMetaTag('og:image', image, true);
            updateMetaTag('twitter:image', image);
        }

        if (url) {
            updateMetaTag('og:url', url, true);
            updateMetaTag('twitter:url', url);
            
            // Update Canonical Link
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

        if (title) {
            updateMetaTag('og:title', title, true);
            updateMetaTag('twitter:title', title);
        }

        updateMetaTag('og:type', type, true);

        // --- JSON-LD Structured Data ---
        // Remove existing dynamic schemas (those not in index.html)
        const existingSchemas = document.querySelectorAll('script[type="application/ld+json"].dynamic-schema');
        existingSchemas.forEach(s => s.remove());

        if (schema) {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.className = 'dynamic-schema';
            script.text = JSON.stringify(schema);
            document.head.appendChild(script);
        }

    }, [title, description, keywords, image, url, type, schema]);

    return null;
};

export default SEO;
