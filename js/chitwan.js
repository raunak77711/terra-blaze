// Chitwan Jungle Adventure Package — page interactions
// (nav, forms and FAQ accordion are handled globally by main.js)
document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Subtle parallax on the hero and quote-band backgrounds
    const parallaxEls = document.querySelectorAll('[data-cj-parallax]');
    if (!prefersReducedMotion && parallaxEls.length) {
        let ticking = false;
        const applyParallax = () => {
            parallaxEls.forEach(el => {
                const speed = parseFloat(el.getAttribute('data-cj-parallax')) || 0.25;
                const rect = el.parentElement.getBoundingClientRect();
                // Only move elements that are near the viewport
                if (rect.bottom > 0 && rect.top < window.innerHeight) {
                    const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
                    el.style.transform = 'translate3d(0, ' + offset.toFixed(1) + 'px, 0)';
                }
            });
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(applyParallax);
            }
        }, { passive: true });
        applyParallax();
    }

    // 2. Scroll-reveal for .cj- elements, staggered per parent group
    const revealEls = document.querySelectorAll('[data-cj-reveal]');
    if (revealEls.length) {
        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            revealEls.forEach(el => el.classList.add('cj-revealed'));
        } else {
            const groupIndex = new Map();
            revealEls.forEach(el => {
                const idx = groupIndex.get(el.parentElement) || 0;
                groupIndex.set(el.parentElement, idx + 1);
                el.style.setProperty('--cj-delay', Math.min(idx * 0.09, 0.45) + 's');
            });

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('cj-revealed');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

            revealEls.forEach(el => observer.observe(el));
        }
    }

    // 3. Price count-up when the pricing card scrolls into view
    const priceEl = document.querySelector('.cj-price-amount .number');
    if (priceEl && !prefersReducedMotion && 'IntersectionObserver' in window) {
        const target = parseInt(priceEl.textContent, 10);
        if (!isNaN(target)) {
            const priceObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    priceObserver.unobserve(entry.target);
                    const duration = 1400;
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

    // 4. Gallery lightbox
    const galleryItems = document.querySelectorAll('.cj-g-item');
    if (galleryItems.length) {
        const lightbox = document.createElement('div');
        lightbox.className = 'cj-lightbox';
        lightbox.setAttribute('role', 'dialog');
        lightbox.setAttribute('aria-label', 'Photo preview');
        lightbox.innerHTML = '<button class="cj-lightbox-close" aria-label="Close preview">&times;</button><img src="" alt="">';
        document.body.appendChild(lightbox);

        const lightboxImg = lightbox.querySelector('img');
        const closeLightbox = () => {
            lightbox.classList.remove('open');
            document.body.style.overflow = '';
        };

        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                // Skip placeholders whose image file has not been added yet
                if (!img || !img.complete || img.naturalWidth === 0) return;
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightbox.classList.add('open');
                document.body.style.overflow = 'hidden';
            });
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target !== lightboxImg) closeLightbox();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
        });
    }
});
