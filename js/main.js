document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Navigation Header
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Nav Drawer Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            // Adjust hamburger lines color when menu is active on transparent header
            const hamburgerLines = document.querySelectorAll('.hamburger-line');
            if (navLinks.classList.contains('active')) {
                hamburgerLines.forEach(line => line.style.backgroundColor = '#ffffff');
            } else if (!header.classList.contains('scrolled')) {
                hamburgerLines.forEach(line => line.style.backgroundColor = '#ffffff');
            } else {
                hamburgerLines.forEach(line => line.style.backgroundColor = '#0e2e4a');
            }
        });

        // Close mobile menu when clicking a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // 3. Simple Form Validations (Lead Capture)
    const enquiryForms = document.querySelectorAll('form');
    
    enquiryForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Extract values
            const nameInput = form.querySelector('[name="name"]');
            const emailInput = form.querySelector('[name="email"]');
            const countryInput = form.querySelector('[name="country"]');
            const trekInput = form.querySelector('[name="trek"]');
            const dateInput = form.querySelector('[name="date"]');
            const messageInput = form.querySelector('[name="message"]');
            
            let isValid = true;
            let errorMessage = '';

            // Name validation
            if (nameInput && nameInput.value.trim() === '') {
                isValid = false;
                errorMessage += '- Please enter your name.\n';
                nameInput.style.borderColor = '#ef4444';
            } else if (nameInput) {
                nameInput.style.borderColor = '';
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailInput && !emailRegex.test(emailInput.value.trim())) {
                isValid = false;
                errorMessage += '- Please enter a valid email address.\n';
                emailInput.style.borderColor = '#ef4444';
            } else if (emailInput) {
                emailInput.style.borderColor = '';
            }

            // Trek select validation (if present)
            if (trekInput && (trekInput.value === '' || trekInput.value === 'choose')) {
                isValid = false;
                errorMessage += '- Please select a trek from the list.\n';
                trekInput.style.borderColor = '#ef4444';
            } else if (trekInput) {
                trekInput.style.borderColor = '';
            }

            if (!isValid) {
                alert('Please correct the errors in the form:\n\n' + errorMessage);
                return;
            }

            // Trek enquiry forms (identified by the "trek" field) open a pre-filled
            // Gmail compose window. Other forms (e.g. the footer newsletter) keep
            // the mock success behavior.
            if (trekInput) {
                const trekNames = {
                    abc: 'Annapurna Base Camp (11 Days)',
                    circuit: 'Annapurna Circuit (14 Days)',
                    manaslu: 'Manaslu Circuit (14 Days)',
                    langtang: 'Langtang Valley (11 Days)',
                    ebc: 'Everest Base Camp (14 Days)',
                    chitwan: 'Chitwan Jungle Adventure Package (2 Nights / 3 Days)'
                };
                const trekLabel = trekInput.tagName === 'SELECT'
                    ? trekInput.options[trekInput.selectedIndex].text
                    : (trekNames[trekInput.value] || trekInput.value);
                const groupSizeInput = form.querySelector('[name="group-size"]');

                const bodyLines = [
                    `Name: ${nameInput.value.trim()}`,
                    `Email: ${emailInput.value.trim()}`,
                    `Country: ${countryInput ? countryInput.value.trim() : ''}`,
                    `Interested Trek: ${trekLabel}`,
                    `Number of Travelers: ${groupSizeInput ? groupSizeInput.value : ''}`,
                    `Departure Date: ${dateInput && dateInput.value ? dateInput.value : 'Not specified'}`,
                    `Message: ${messageInput && messageInput.value.trim() ? messageInput.value.trim() : 'None'}`
                ];

                const subject = encodeURIComponent(`New Trek Enquiry - ${trekLabel}`);
                const body = encodeURIComponent(bodyLines.join('\n'));
                const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=booking@terrablazeadventure.com&su=${subject}&body=${body}`;

                window.open(gmailUrl, '_blank');
                form.reset();
                return;
            }

            const successMessage = 'Enquiry submitted successfully!\n\nThank you for contacting TerraBlaze Adventures. We will get back to you within 24 hours via email.';
            alert(successMessage);
            form.reset();
        });
    });

    // 4. Day-by-Day Accordion Handler for Trek Detail Pages
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = item.querySelector('.accordion-content');
            
            // Toggle active class
            item.classList.toggle('active');
            
            if (item.classList.contains('active')) {
                // Open panel (scroll height)
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                // Close panel
                content.style.maxHeight = '0';
            }
            
            // Close other accordions in the same list (optional, but premium feel)
            const allItems = item.parentElement.querySelectorAll('.accordion-item');
            allItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.accordion-content').style.maxHeight = '0';
                }
            });
        });
    });

    // 5. Premium Micro-Animations
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 5a. Reading progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    let progressTicking = false;
    const updateProgress = () => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.width = scrollable > 0 ? (window.scrollY / scrollable) * 100 + '%' : '0%';
        progressTicking = false;
    };
    window.addEventListener('scroll', () => {
        if (!progressTicking) {
            progressTicking = true;
            requestAnimationFrame(updateProgress);
        }
    }, { passive: true });
    updateProgress();

    // 5b. Scroll-reveal with per-group stagger
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        const revealSelectors = [
            '.section-header', '.trek-card', '.feature-box', '.testimonial-card',
            '.blog-card', '.trust-item', '.inc-box', '.exc-box', '.sidebar-card',
            '.blog-sidebar-card', '.blog-featured', '.gallery-item', '.cta-banner-text',
            '.enquiry-form-card', '.form-light-container', '.accordion-item',
            '.route-map-img', '.filter-section', '.value-card', '.guide-card',
            '.stat-item', '.quote-band-content', '.cta-simple-inner', '.blog-pill',
            '.blog-newsletter-card', '.contact-info-card', '.contact-form-card',
            '.rating-summary-card', '.review-card'
        ].join(', ');

        const revealEls = document.querySelectorAll(revealSelectors);
        const staggerCount = new Map();

        revealEls.forEach(el => {
            const idx = staggerCount.get(el.parentElement) || 0;
            staggerCount.set(el.parentElement, idx + 1);
            el.style.setProperty('--reveal-delay', Math.min(idx * 0.08, 0.4) + 's');
            el.classList.add('reveal-init');
        });

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(el => revealObserver.observe(el));
    }

    // 5c. Count-up animation for statistics (e.g. "15+", "5000+", "100%", "5/5")
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        const animateCount = (el) => {
            const match = el.textContent.trim().match(/^(\d+(?:\.\d+)?)(.*)$/);
            if (!match) return;
            const target = parseFloat(match[1]);
            const suffix = match[2];
            const decimals = match[1].includes('.') ? match[1].split('.')[1].length : 0;
            const duration = 1600;
            const start = performance.now();

            const step = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = (target * eased).toFixed(decimals) + suffix;
                if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        };

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.trust-item h3, .page-hero-stat strong, .rating-badge strong, .rating-score')
            .forEach(el => counterObserver.observe(el));
    }

    // 5d. Hero scroll-down indicator
    const hero = document.querySelector('.hero');
    if (hero && !prefersReducedMotion) {
        const indicator = document.createElement('div');
        indicator.className = 'hero-scroll-indicator';
        indicator.setAttribute('aria-hidden', 'true');
        indicator.innerHTML = '<span class="mouse"></span><span>Scroll</span>';
        hero.appendChild(indicator);
    }

    // 5e. Site-wide parallax for [data-parallax] background images
    // (same technique as the Chitwan/destination pages, generalized)
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    if (!prefersReducedMotion && parallaxEls.length) {
        let parallaxTicking = false;
        const applyParallax = () => {
            parallaxEls.forEach(el => {
                const speed = parseFloat(el.getAttribute('data-parallax')) || 0.25;
                const parent = el.parentElement;
                const rect = parent.getBoundingClientRect();
                if (rect.bottom > 0 && rect.top < window.innerHeight) {
                    const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
                    el.style.transform = 'translate3d(0, ' + offset.toFixed(1) + 'px, 0)';
                }
            });
            parallaxTicking = false;
        };
        window.addEventListener('scroll', () => {
            if (!parallaxTicking) {
                parallaxTicking = true;
                requestAnimationFrame(applyParallax);
            }
        }, { passive: true });
        applyParallax();
    }

    // 5f. Lightweight lightbox for .gallery-item photo grids
    const lightboxSourceItems = document.querySelectorAll('.gallery-item');
    if (lightboxSourceItems.length) {
        const lightbox = document.createElement('div');
        lightbox.className = 'site-lightbox';
        lightbox.setAttribute('role', 'dialog');
        lightbox.setAttribute('aria-label', 'Photo preview');
        lightbox.innerHTML = '<button class="site-lightbox-close" aria-label="Close preview">&times;</button><img src="" alt="">';
        document.body.appendChild(lightbox);

        const lightboxImg = lightbox.querySelector('img');
        const closeLightbox = () => {
            lightbox.classList.remove('open');
            document.body.style.overflow = '';
        };

        lightboxSourceItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
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
