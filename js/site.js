/* ════════════════════════════════════════════════════════════════════
   TerraBlaze — inner pages
   One small script for every page below the homepage. No libraries:
   header state, menu, reveals, accordions, hero video, forms.
   Without JS the document remains fully readable.
   ════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var doc = document.documentElement;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* arms the CSS initial states (reveals, menu transitions) */
    doc.classList.add('has-io');

    /* ─── Header: glass state + hide on scroll down ─────────────── */
    function initHeader() {
        var header = document.getElementById('site-header');
        if (!header) { return; }
        var lastY = 0;
        var ticking = false;

        function update() {
            ticking = false;
            var y = window.scrollY || window.pageYOffset;
            header.classList.toggle('is-solid', y > 44);
            var menu = document.getElementById('mobile-menu');
            var menuOpen = menu && menu.classList.contains('is-open');
            if (!menuOpen) {
                if (y > 560 && y > lastY + 6) { header.classList.add('is-hidden'); }
                else if (y < lastY - 4 || y < 560) { header.classList.remove('is-hidden'); }
            }
            lastY = y;
        }
        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });
        update();
    }

    /* ─── Full-screen menu (CSS transitions) ────────────────────── */
    function initMenu() {
        var toggle = document.getElementById('menu-toggle');
        var menu = document.getElementById('mobile-menu');
        if (!toggle || !menu) { return; }
        var open = false;
        var closeTimer = null;

        function setOpen(state) {
            open = state;
            toggle.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            menu.setAttribute('aria-hidden', String(!open));
            document.body.style.overflow = open ? 'hidden' : '';

            if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
            if (open) {
                menu.classList.add('is-open');
            } else {
                menu.classList.remove('is-open');
            }
        }

        toggle.addEventListener('click', function () { setOpen(!open); });
        menu.querySelectorAll('[data-menu-link]').forEach(function (a) {
            a.addEventListener('click', function () { setOpen(false); });
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && open) { setOpen(false); }
        });
    }

    /* ─── Scroll reveals ────────────────────────────────────────── */
    function initReveals() {
        var items = document.querySelectorAll('[data-reveal]');
        if (!items.length) { return; }
        if (reduceMotion || !('IntersectionObserver' in window)) {
            items.forEach(function (el) { el.classList.add('is-inview'); });
            return;
        }
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) { return; }
                entry.target.classList.add('is-inview');
                io.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -10% 0px' });

        /* small stagger for siblings revealed together */
        var lastParent = null, chain = 0;
        items.forEach(function (el) {
            if (el.parentElement === lastParent) { chain += 1; } else { chain = 0; }
            lastParent = el.parentElement;
            el.style.setProperty('--reveal-delay', Math.min(chain * .09, .45) + 's');
            io.observe(el);
        });
    }

    /* ─── Accordions (itinerary, FAQ) ───────────────────────────── */
    function initAccordions() {
        document.querySelectorAll('.acc').forEach(function (acc) {
            acc.querySelectorAll('.acc-head').forEach(function (head) {
                head.addEventListener('click', function () {
                    var item = head.closest('.acc-item');
                    var isOpen = item.classList.contains('is-open');
                    if (acc.hasAttribute('data-acc-single')) {
                        acc.querySelectorAll('.acc-item.is-open').forEach(function (other) {
                            other.classList.remove('is-open');
                            var b = other.querySelector('.acc-head');
                            if (b) { b.setAttribute('aria-expanded', 'false'); }
                        });
                    }
                    item.classList.toggle('is-open', !isOpen);
                    head.setAttribute('aria-expanded', String(!isOpen));
                });
            });
        });
    }

    /* ─── Hero video: fade in when ready, pause off-screen ──────── */
    function initHeroVideo() {
        var video = document.querySelector('[data-hero-video]');
        if (!video || reduceMotion) { return; }

        function start() {
            var p = video.play();
            if (p && p.catch) { p.catch(function () { /* poster remains */ }); }
        }
        video.addEventListener('playing', function () { video.classList.add('is-playing'); });

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                entries[0].isIntersecting ? start() : video.pause();
            }, { threshold: .15 }).observe(video);
        } else {
            start();
        }
    }

    /* ─── Forms: enquiry → WhatsApp draft · newsletter note ─────── */
    function initForms() {
        var WA_NUMBER = '9779816261447';

        var form = document.getElementById('enquiry-form');
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                if (!form.checkValidity()) { form.reportValidity(); return; }
                var v = function (id) { return (document.getElementById(id) || {}).value || '—'; };
                var lines = [
                    'Namaste TerraBlaze — new trek enquiry:',
                    '',
                    'Name: ' + v('ef-name'),
                    'Email: ' + v('ef-email'),
                    'Country: ' + v('ef-country'),
                    'Journey: ' + v('ef-trek'),
                    'Travellers: ' + v('ef-party'),
                    'Preferred departure: ' + (v('ef-date') || 'Flexible'),
                    'Notes: ' + (v('ef-message') || '—')
                ];
                window.open('https://wa.me/' + WA_NUMBER + '?text=' +
                    encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
                var status = document.getElementById('ef-status');
                if (status) {
                    status.textContent = 'WhatsApp is opening with your enquiry drafted — press send and our Kathmandu desk will reply within 24 hours.';
                }
            });
        }

        var news = document.getElementById('news-form');
        if (news) {
            news.addEventListener('submit', function (e) {
                e.preventDefault();
                var input = document.getElementById('news-email');
                var status = document.getElementById('news-status');
                if (!input.value || input.validity.typeMismatch || input.validity.valueMissing) {
                    if (input.reportValidity) { input.reportValidity(); }
                    return;
                }
                if (status) { status.textContent = 'Thank you — you are on the list.'; }
                input.value = '';
            });
        }

        /* preselect journey from ?trek= param on the contact page */
        var select = document.getElementById('ef-trek');
        if (select) {
            var trek = new URLSearchParams(window.location.search).get('trek');
            var map = {
                ebc: 'Everest Base Camp', circuit: 'Annapurna Circuit', abc: 'Annapurna Base Camp',
                manaslu: 'Manaslu Circuit', langtang: 'Langtang Valley', chitwan: 'Chitwan Jungle Safari'
            };
            if (trek && map[trek]) {
                Array.prototype.some.call(select.options, function (opt) {
                    if (opt.value.indexOf(map[trek]) === 0) { select.value = opt.value; return true; }
                    return false;
                });
            }
        }
    }

    /* ─── Gallery lightbox (pages that opt in) ──────────────────── */
    function initLightbox() {
        var box = document.getElementById('lightbox');
        if (!box) { return; }
        var img = document.getElementById('lb-img');
        var caption = document.getElementById('lb-caption');
        var items = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
        if (!items.length) { return; }
        var current = 0;
        var lastFocus = null;

        function render() {
            var item = items[current];
            img.src = item.getAttribute('href');
            img.alt = (item.querySelector('img') || {}).alt || '';
            caption.textContent = item.getAttribute('data-caption') || '';
        }
        function open(i) {
            current = i;
            lastFocus = document.activeElement;
            render();
            box.classList.add('is-open');
            box.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            document.getElementById('lb-close').focus();
        }
        function close() {
            box.classList.remove('is-open');
            box.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            img.src = '';
            if (lastFocus) { lastFocus.focus(); }
        }
        function step(dir) { current = (current + dir + items.length) % items.length; render(); }

        items.forEach(function (item, i) {
            item.addEventListener('click', function (e) { e.preventDefault(); open(i); });
        });
        document.getElementById('lb-close').addEventListener('click', close);
        document.getElementById('lb-prev').addEventListener('click', function () { step(-1); });
        document.getElementById('lb-next').addEventListener('click', function () { step(1); });
        box.addEventListener('click', function (e) { if (e.target === box) { close(); } });
        document.addEventListener('keydown', function (e) {
            if (!box.classList.contains('is-open')) { return; }
            if (e.key === 'Escape') { close(); }
            if (e.key === 'ArrowLeft') { step(-1); }
            if (e.key === 'ArrowRight') { step(1); }
        });
    }

    /* ─── Boot ──────────────────────────────────────────────────── */
    function boot() {
        initHeader();
        initMenu();
        initReveals();
        initAccordions();
        initHeroVideo();
        initForms();
        initLightbox();
        var year = document.getElementById('year');
        if (year) { year.textContent = String(new Date().getFullYear()); }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
