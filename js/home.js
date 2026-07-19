/* ════════════════════════════════════════════════════════════════════
   TerraBlaze — home experience
   Progressive enhancement in layers:
     1. Functional layer (always): nav, menu, slider, lightbox, forms.
     2. Motion layer (GSAP + ScrollTrigger + Lenis, skipped for
        reduced-motion): preloader, split reveals, parallax, pinning.
   Without JS or GSAP the document remains fully readable.
   ════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var doc = document.documentElement;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var motionReady = !reduceMotion && typeof window.gsap !== 'undefined' &&
        typeof window.ScrollTrigger !== 'undefined';

    var gsap = window.gsap;
    var lenis = null;

    if (motionReady) {
        gsap.registerPlugin(window.ScrollTrigger);
        doc.classList.add('has-js');   /* arms the CSS initial states */
    }

    /* ─────────────────────────────────────────────────────────────
       Smooth scrolling (Lenis) + anchor handling
       ───────────────────────────────────────────────────────────── */
    function initLenis() {
        if (!motionReady || typeof window.Lenis === 'undefined') { return; }
        lenis = new window.Lenis({ lerp: .095, wheelMultiplier: 1, smoothWheel: true });
        lenis.on('scroll', window.ScrollTrigger.update);
        gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
    }

    function scrollToTarget(target) {
        var el = typeof target === 'string' ? document.querySelector(target) : target;
        if (!el) { return; }
        if (lenis) {
            lenis.scrollTo(el, { offset: -72, duration: 1.4 });
        } else {
            el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }
    }

    function initAnchors() {
        document.addEventListener('click', function (e) {
            var link = e.target.closest('a[href^="#"]');
            if (!link) { return; }
            var id = link.getAttribute('href');
            if (id.length < 2) { return; }
            var el = document.querySelector(id);
            if (!el) { return; }
            e.preventDefault();
            scrollToTarget(el);
            history.replaceState(null, '', id);
        });
    }

    /* ─────────────────────────────────────────────────────────────
       Header: glass state, hide-on-scroll, scrollspy
       ───────────────────────────────────────────────────────────── */
    function initHeader() {
        var header = document.getElementById('site-header');
        if (!header) { return; }
        var lastY = 0;

        function onScroll() {
            var y = window.scrollY || window.pageYOffset;
            header.classList.toggle('is-solid', y > 44);
            var menuOpen = document.getElementById('mobile-menu').classList.contains('is-open');
            if (!menuOpen) {
                if (y > 560 && y > lastY + 6) { header.classList.add('is-hidden'); }
                else if (y < lastY - 4 || y < 560) { header.classList.remove('is-hidden'); }
            }
            lastY = y;
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        /* active-section indicator */
        var spyLinks = {};
        document.querySelectorAll('.nav-link[data-spy]').forEach(function (a) {
            spyLinks[a.getAttribute('data-spy')] = a;
        });
        var ids = Object.keys(spyLinks);
        if (ids.length && 'IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) { return; }
                    ids.forEach(function (id) { spyLinks[id].classList.remove('is-active'); });
                    var link = spyLinks[entry.target.id];
                    if (link) { link.classList.add('is-active'); }
                });
            }, { rootMargin: '-40% 0px -52% 0px' });
            ids.forEach(function (id) {
                var section = document.getElementById(id);
                if (section) { io.observe(section); }
            });
        }
    }

    /* ─────────────────────────────────────────────────────────────
       Full-screen menu
       ───────────────────────────────────────────────────────────── */
    function initMenu() {
        var toggle = document.getElementById('menu-toggle');
        var menu = document.getElementById('mobile-menu');
        if (!toggle || !menu) { return; }

        var bg = menu.querySelector('.mobile-menu-bg');
        var links = menu.querySelectorAll('.mobile-menu-list a');
        var foot = menu.querySelector('.mobile-menu-foot');
        var open = false;

        function lockScroll(lock) {
            if (lenis) { lock ? lenis.stop() : lenis.start(); }
            document.body.style.overflow = lock ? 'hidden' : '';
        }

        function setOpen(state) {
            open = state;
            toggle.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            menu.setAttribute('aria-hidden', String(!open));
            lockScroll(open);

            if (motionReady) {
                if (open) {
                    menu.classList.add('is-open');
                    gsap.timeline()
                        .to(bg, { y: 0, duration: .75, ease: 'power4.inOut' }, 0)
                        .to(links, { y: 0, duration: .85, stagger: .055, ease: 'power4.out' }, .32)
                        .fromTo(foot, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .6 }, .6);
                } else {
                    gsap.timeline({
                        onComplete: function () { menu.classList.remove('is-open'); }
                    })
                        .to(links, { y: '110%', duration: .4, stagger: .03, ease: 'power2.in' }, 0)
                        .to(foot, { opacity: 0, duration: .3 }, 0)
                        .to(bg, { y: '-100%', duration: .65, ease: 'power4.inOut' }, .18);
                }
            } else {
                /* no-motion fallback */
                menu.classList.toggle('is-open', open);
                bg.style.transform = open ? 'translateY(0)' : 'translateY(-100%)';
                links.forEach(function (a) { a.style.transform = open ? 'none' : ''; });
                if (foot) { foot.style.opacity = open ? 1 : ''; }
            }
        }

        toggle.addEventListener('click', function () { setOpen(!open); });

        menu.querySelectorAll('[data-menu-link]').forEach(function (a) {
            a.addEventListener('click', function (e) {
                var href = a.getAttribute('href');
                if (href.charAt(0) === '#') {
                    e.preventDefault();
                    setOpen(false);
                    setTimeout(function () { scrollToTarget(href); }, motionReady ? 650 : 60);
                } else {
                    setOpen(false);
                }
            });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && open) { setOpen(false); }
        });
    }

    /* ─────────────────────────────────────────────────────────────
       Text splitting helpers
       ───────────────────────────────────────────────────────────── */
    function splitChars(el) {
        var frag = document.createDocumentFragment();
        function walk(node, parent) {
            Array.prototype.slice.call(node.childNodes).forEach(function (child) {
                if (child.nodeType === 3) {
                    var text = child.textContent;
                    for (var i = 0; i < text.length; i++) {
                        if (text[i] === ' ') {
                            parent.appendChild(document.createTextNode(' '));
                        } else {
                            var span = document.createElement('span');
                            span.className = 'ch';
                            span.textContent = text[i];
                            parent.appendChild(span);
                        }
                    }
                } else {
                    var clone = child.cloneNode(false);
                    parent.appendChild(clone);
                    walk(child, clone);
                }
            });
        }
        walk(el, frag);
        el.textContent = '';
        el.appendChild(frag);
    }

    function splitLines(el) {
        /* Lines are authored with <br>; each segment becomes a masked line */
        var segments = el.innerHTML.split(/<br\s*\/?>(?:\s*)/i);
        el.innerHTML = segments.map(function (seg) {
            return '<span class="split-line"><span class="split-inner">' + seg + '</span></span>';
        }).join('');
    }

    /* ─────────────────────────────────────────────────────────────
       Preloader + hero intro
       ───────────────────────────────────────────────────────────── */
    function initLoaderAndIntro() {
        var loader = document.getElementById('loader');
        var introDone = false;

        function heroIntro() {
            if (introDone) { return; }
            introDone = true;

            if (window.__tbCinema) { window.__tbCinema.start(); }
            if (!motionReady) { return; }

            var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
            tl.fromTo('#hero-stage', { scale: 1.12 }, { scale: 1, duration: 2.4, ease: 'expo.out' }, 0)
                .to('[data-hero-kicker]', { opacity: 1, duration: .9 }, .25)
                .to('.hero-line .ch', {
                    y: 0, rotate: 0, duration: 1.15, stagger: .02
                }, .35)
                .to('[data-hero-sub]', { opacity: 1, duration: 1 }, .95)
                .to('[data-hero-actions]', { opacity: 1, duration: 1 }, 1.15)
                .to('[data-hero-chrome]', { opacity: 1, duration: 1.1 }, 1.35);
        }

        if (!motionReady || !loader) {
            heroIntro();
            return;
        }

        /* split the loader word */
        var word = loader.querySelector('[data-loader-word]');
        if (word) {
            var letters = word.textContent.split('');
            word.innerHTML = letters.map(function (l) {
                return '<span class="lch">' + l + '</span>';
            }).join('');
        }

        var finished = false;
        function finish() {
            if (finished) { return; }
            finished = true;
            gsap.timeline({
                onComplete: function () {
                    loader.style.display = 'none';
                    loader.setAttribute('aria-hidden', 'true');
                }
            })
                .to(loader.querySelector('.loader-inner'), { opacity: 0, y: -24, duration: .5, ease: 'power2.in' })
                .to(loader, { yPercent: -100, duration: .85, ease: 'power4.inOut' }, '-=.15')
                .add(heroIntro, '-=.55');
        }

        gsap.timeline()
            .to('.loader-word .lch', { y: 0, duration: .9, stagger: .045, ease: 'power4.out' }, .1)
            .to('[data-loader-rule]', { scaleX: 1, duration: 1.05, ease: 'power2.inOut' }, .35)
            .add(finish, '+=.25');

        /* hard failsafe — never trap the visitor behind the curtain */
        setTimeout(finish, 3200);
        gsap.set('.loader-word .lch', { y: '120%' });
        gsap.set('[data-loader-rule]', { scaleX: 0 });
    }

    /* ─────────────────────────────────────────────────────────────
       Scroll-triggered reveals, counters, parallax
       ───────────────────────────────────────────────────────────── */
    function initScrollMotion() {
        if (!motionReady) { return; }

        /* masked line titles */
        document.querySelectorAll('[data-split-lines]').forEach(function (el) {
            splitLines(el);
            gsap.to(el.querySelectorAll('.split-inner'), {
                y: 0,
                duration: 1.15,
                stagger: .14,
                ease: 'power4.out',
                scrollTrigger: { trigger: el, start: 'top 84%', once: true }
            });
        });

        /* generic reveals */
        window.ScrollTrigger.batch('[data-reveal]', {
            start: 'top 88%',
            once: true,
            onEnter: function (batch) {
                gsap.to(batch, { opacity: 1, y: 0, duration: 1.05, stagger: .09, ease: 'power3.out' });
            }
        });

        /* counters */
        document.querySelectorAll('[data-count]').forEach(function (el) {
            var target = parseInt(el.getAttribute('data-count'), 10) || 0;
            var proxy = { v: 0 };
            gsap.to(proxy, {
                v: target,
                duration: 2.1,
                ease: 'power2.out',
                scrollTrigger: { trigger: el, start: 'top 88%', once: true },
                onUpdate: function () {
                    el.textContent = Math.round(proxy.v).toLocaleString('en-US');
                }
            });
        });

        /* gentle parallax on framed imagery */
        document.querySelectorAll('[data-parallax]').forEach(function (el) {
            var depth = parseFloat(el.getAttribute('data-parallax')) || .1;
            gsap.fromTo(el, { y: depth * -90 }, {
                y: depth * 90,
                ease: 'none',
                scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: .8 }
            });
        });

        /* full-bleed background drift (culture / summon) */
        document.querySelectorAll('[data-parallax-bg]').forEach(function (img) {
            gsap.fromTo(img, { yPercent: -9 }, {
                yPercent: 9,
                ease: 'none',
                scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: .6 }
            });
        });

        /* hero content drifts up & fades as you leave it */
        gsap.to('.hero-content', {
            y: -110,
            opacity: 0,
            ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'center top', end: 'bottom top', scrub: true }
        });

        window.addEventListener('load', function () { window.ScrollTrigger.refresh(); });
    }

    /* ─────────────────────────────────────────────────────────────
       Regions: pinned horizontal panorama (desktop),
       native swipe + progress (touch / small screens)
       ───────────────────────────────────────────────────────────── */
    function initRegions() {
        var wrap = document.getElementById('regions-wrap');
        var track = document.getElementById('regions-track');
        var fill = document.getElementById('regions-progress-fill');
        if (!wrap || !track) { return; }

        var isDesktop = window.matchMedia('(min-width: 900px)').matches;

        if (motionReady && isDesktop) {
            var getDistance = function () {
                return Math.max(0, track.scrollWidth - wrap.clientWidth);
            };
            gsap.to(track, {
                x: function () { return -getDistance(); },
                ease: 'none',
                scrollTrigger: {
                    trigger: '.regions',
                    start: 'top top',
                    end: function () { return '+=' + (getDistance() + window.innerHeight * .35); },
                    pin: true,
                    scrub: 1,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    onUpdate: function (self) {
                        if (fill) { fill.style.width = (self.progress * 100).toFixed(2) + '%'; }
                    }
                }
            });
        } else {
            /* progress bar mirrors native horizontal scroll */
            wrap.addEventListener('scroll', function () {
                if (!fill) { return; }
                var max = wrap.scrollWidth - wrap.clientWidth;
                fill.style.width = (max > 0 ? (wrap.scrollLeft / max) * 100 : 0) + '%';
            }, { passive: true });
        }
    }

    /* ─────────────────────────────────────────────────────────────
       Stories rotator
       ───────────────────────────────────────────────────────────── */
    function initStories() {
        var stage = document.getElementById('stories-stage');
        if (!stage) { return; }
        var stories = stage.querySelectorAll('[data-story]');
        var dots = document.querySelectorAll('[data-story-dot]');
        if (!stories.length) { return; }

        var current = 0;
        var timer = null;
        var INTERVAL = 6800;

        function show(i) {
            current = (i + stories.length) % stories.length;
            stories.forEach(function (s, k) { s.classList.toggle('is-active', k === current); });
            dots.forEach(function (d, k) { d.classList.toggle('is-active', k === current); });
        }

        function play() {
            stop();
            timer = setInterval(function () { show(current + 1); }, INTERVAL);
        }
        function stop() { if (timer) { clearInterval(timer); timer = null; } }

        dots.forEach(function (dot, k) {
            dot.addEventListener('click', function () { show(k); play(); });
        });

        stage.addEventListener('pointerenter', stop);
        stage.addEventListener('pointerleave', play);

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                entries[0].isIntersecting ? play() : stop();
            }, { threshold: .25 }).observe(stage);
        } else {
            play();
        }
    }

    /* ─────────────────────────────────────────────────────────────
       Gallery lightbox
       ───────────────────────────────────────────────────────────── */
    function initLightbox() {
        var box = document.getElementById('lightbox');
        if (!box) { return; }
        var img = document.getElementById('lb-img');
        var caption = document.getElementById('lb-caption');
        var items = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
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
            if (lenis) { lenis.stop(); }
            document.getElementById('lb-close').focus();
        }

        function close() {
            box.classList.remove('is-open');
            box.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            if (lenis) { lenis.start(); }
            img.src = '';
            if (lastFocus) { lastFocus.focus(); }
        }

        function step(dir) {
            current = (current + dir + items.length) % items.length;
            render();
        }

        items.forEach(function (item, i) {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                open(i);
            });
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

    /* ─────────────────────────────────────────────────────────────
       Forms: enquiry → WhatsApp draft · newsletter feedback
       ───────────────────────────────────────────────────────────── */
    function initForms() {
        var WA_NUMBER = '9779816261447';

        var form = document.getElementById('enquiry-form');
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }
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
                var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
                window.open(url, '_blank', 'noopener');
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
                    input.reportValidity ? input.reportValidity() : null;
                    return;
                }
                if (status) { status.textContent = 'Thank you — you are on the list.'; }
                input.value = '';
            });
        }
    }

    /* ─────────────────────────────────────────────────────────────
       Card tilt (fine pointers only) — a whisper, not a gimmick
       ───────────────────────────────────────────────────────────── */
    function initTilt() {
        if (!motionReady || !window.matchMedia('(pointer: fine)').matches) { return; }
        document.querySelectorAll('[data-tilt]').forEach(function (card) {
            /* tilt the media plate, not the card — the card owns the hover lift */
            var media = card.querySelector('.jcard-media');
            if (!media) { return; }
            gsap.set(media, { transformPerspective: 750 });
            var qx = gsap.quickTo(media, 'rotationY', { duration: .5, ease: 'power2.out' });
            var qy = gsap.quickTo(media, 'rotationX', { duration: .5, ease: 'power2.out' });
            card.addEventListener('pointermove', function (e) {
                var rect = card.getBoundingClientRect();
                var px = (e.clientX - rect.left) / rect.width - .5;
                var py = (e.clientY - rect.top) / rect.height - .5;
                qx(px * 4.5);
                qy(py * -4.5);
            });
            card.addEventListener('pointerleave', function () { qx(0); qy(0); });
        });
    }

    /* ─────────────────────────────────────────────────────────────
       Boot
       ───────────────────────────────────────────────────────────── */
    function boot() {
        /* hero title characters are wrapped before the CSS states arm */
        if (motionReady) {
            document.querySelectorAll('[data-split]').forEach(splitChars);
        }

        initLenis();
        initAnchors();
        initHeader();
        initMenu();
        initLoaderAndIntro();
        initScrollMotion();
        initRegions();
        initStories();
        initLightbox();
        initForms();
        initTilt();

        var year = document.getElementById('year');
        if (year) { year.textContent = String(new Date().getFullYear()); }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
