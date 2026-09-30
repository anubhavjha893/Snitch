import { useEffect } from 'react';

const setMeta = (selector, attribute, key, value) => {
    let element = document.head.querySelector(selector);

    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
    }

    element.setAttribute('content', value);
};

/** Sets the document title, description and Open Graph tags for the current page. */
export const usePageMeta = ({ title, description, image }) => {
    useEffect(() => {
        if (!title) return;

        const fullTitle = title.includes('SNITCH') ? title : `${title} | SNITCH.`;
        document.title = fullTitle;

        setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
        setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);

        if (description) {
            setMeta('meta[name="description"]', 'name', 'description', description);
            setMeta('meta[property="og:description"]', 'property', 'og:description', description);
        }
        if (image) {
            setMeta('meta[property="og:image"]', 'property', 'og:image', image);
        }
    }, [ title, description, image ]);
};
