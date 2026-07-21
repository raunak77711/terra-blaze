// Jungle Safari (Chitwan) — page interactions
// Nav, mobile menu, accordion, lightbox and parallax are handled globally by main.js
document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scroll-reveal for [data-jng-reveal] elements, staggered per parent group
    const revealEls = document.querySelectorAll('[data-jng-reveal]');
    if (revealEls.length) {
        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            revealEls.forEach(el => el.classList.add('jng-revealed'));
        } else {
            const groupIndex = new Map();
            revealEls.forEach(el => {
                const idx = groupIndex.get(el.parentElement) || 0;
                groupIndex.set(el.parentElement, idx + 1);
                el.style.setProperty('--jng-delay', Math.min(idx * 0.08, 0.4) + 's');
            });

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('jng-revealed');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

            revealEls.forEach(el => observer.observe(el));
        }
    }

    // Price count-up when the ticket card scrolls into view
    const priceEl = document.querySelector('.jng-ticket-amount .number');
    if (priceEl && !prefersReducedMotion && 'IntersectionObserver' in window) {
        const target = parseInt(priceEl.textContent, 10);
        if (!isNaN(target)) {
            const priceObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    priceObserver.unobserve(entry.target);
                    const duration = 1300;
                    const start = performance.now();
                    const step = (now) => {
                        const progress = Math.min((now - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        priceEl.textContent = Math.round(target * eased);
                        if (progress < 1) requestAnimationFrame(step);
                    };
                    requestAnimationFrame(step);
                });
            }, { threshold: 0.6 });
            priceObserver.observe(priceEl);
        }
    }
});
