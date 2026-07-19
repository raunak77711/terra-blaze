/* ════════════════════════════════════════════════════════════════════
   TerraBlaze — hero cinema engine (dependency-free)

   Plays the homepage hero as a film: a double-buffered montage of
   Himalayan scenes that cross-dissolve into each other while each
   frame drifts on a slow Ken Burns move. Scene captions and progress
   ticks advance with the cut.

   Honors prefers-reduced-motion / Save-Data (poster only), pauses
   when the hero leaves the viewport or the tab is hidden, survives
   autoplay refusal (retries on first touch) and broken clips (skips).
   ════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var hero = document.querySelector('.hero');
    var stage = document.getElementById('hero-cinema');
    var configEl = document.getElementById('hero-clips');
    if (!hero || !stage || !configEl) { return; }

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var conn = navigator.connection;
    var slowNet = !!(conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '')));
    var canAnimate = typeof Element.prototype.animate === 'function';

    var films = stage.querySelectorAll('.hero-film');

    /* Poster-only environments: skip the montage entirely */
    if (reduceMotion || slowNet || !canAnimate || films.length < 2) {
        hero.classList.add('hero-static');
        return;
    }

    var config;
    try { config = JSON.parse(configEl.textContent); } catch (err) {
        hero.classList.add('hero-static');
        return;
    }

    var clips = config.clips || [];
    var smallScreen = window.matchMedia('(max-width: 767px)').matches;
    if (smallScreen) {
        /* Phones get the lighter reel: only clips flagged "mobile" */
        var lite = clips.filter(function (c) { return c.mobile; });
        if (lite.length >= 2) { clips = lite; }
    }
    if (!clips.length) {
        hero.classList.add('hero-static');
        return;
    }

    var HOLD = config.hold || 4400;   /* time a scene rests fully visible */
    var FADE = config.fade || 1500;   /* cross-dissolve duration */
    var LIFE = HOLD + FADE * 2;       /* how long one scene keeps moving */

    var sceneNo = document.getElementById('hero-scene-no');
    var sceneCaption = document.getElementById('hero-scene-caption');
    var ticksWrap = document.getElementById('hero-ticks');

    /* Each scene gets its own camera move so the reel never feels looped */
    var MOVES = [
        { origin: '50% 35%', from: 'scale(1.02)', to: 'scale(1.13) translate(0%, 1.6%)' },
        { origin: '30% 55%', from: 'scale(1.04)', to: 'scale(1.12) translate(2%, -1%)' },
        { origin: '70% 45%', from: 'scale(1.12) translate(-2%, 0%)', to: 'scale(1.03)' },
        { origin: '50% 65%', from: 'scale(1.03)', to: 'scale(1.12) translate(-1.5%, -1.5%)' }
    ];

    /* Build one progress tick per scene */
    var tickFills = [];
    if (ticksWrap) {
        clips.forEach(function () {
            var tick = document.createElement('span');
            tick.className = 'hero-tick';
            var fill = document.createElement('i');
            tick.appendChild(fill);
            ticksWrap.appendChild(tick);
            tickFills.push(fill);
        });
    }

    var index = -1;            /* current clip index */
    var buffer = 0;            /* which <video> buffer is on screen */
    var timer = null;
    var started = false;
    var inView = true;
    var pageHidden = false;
    var liveAnims = [];        /* animations to pause with the reel */

    /* ── animation helpers ───────────────────────────────────────── */

    function animate(el, keyframes, opts) {
        var anim = el.animate(keyframes, opts);
        liveAnims.push(anim);
        if (liveAnims.length > 8) { liveAnims.splice(0, liveAnims.length - 8); }
        return anim;
    }

    function fadeTo(el, opacity, dur) {
        animate(el, [{ opacity: getComputedStyle(el).opacity }, { opacity: opacity }],
            { duration: dur, easing: 'ease-in-out', fill: 'forwards' });
    }

    function kenBurns(video, i) {
        var move = MOVES[i % MOVES.length];
        video.style.transformOrigin = move.origin;
        animate(video, [{ transform: move.from }, { transform: move.to }],
            { duration: LIFE, easing: 'linear', fill: 'forwards' });
    }

    function tickProgress(i) {
        tickFills.forEach(function (fill, k) {
            if (k !== i) {
                fill.getAnimations().forEach(function (a) { a.cancel(); });
                fill.style.transform = k < i ? 'scaleX(1)' : 'scaleX(0)';
            }
        });
        var fill = tickFills[i];
        if (!fill) { return; }
        animate(fill, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
            { duration: HOLD + FADE, easing: 'linear', fill: 'forwards' });
    }

    function swapCaption(i) {
        if (!sceneNo || !sceneCaption) { return; }
        var label = sceneNo.parentElement;
        var out = animate(label, [
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(-7px)' }
        ], { duration: 280, easing: 'ease-in', fill: 'forwards' });
        out.onfinish = function () {
            sceneNo.textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
            sceneCaption.textContent = clips[i].caption || '';
            animate(label, [
                { opacity: 0, transform: 'translateY(9px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ], { duration: 480, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' });
        };
    }

    /* ── core loop ───────────────────────────────────────────────── */

    function showNext() {
        var next = (index + 1) % clips.length;
        var incoming = films[buffer ^ 1];
        var outgoing = films[buffer];

        var absolute = new URL(clips[next].src, window.location.href).href;
        if (incoming.src !== absolute) {
            incoming.src = clips[next].src;
            incoming.load();
        } else {
            try { incoming.currentTime = 0; } catch (err) { /* not seekable yet */ }
        }

        var launched = false;
        var launch = function () {
            if (launched) { return; }
            launched = true;

            var proceed = function () {
                hero.classList.add('hero-live');
                buffer = buffer ^ 1;
                var wasFirst = index < 0;
                index = next;
                fadeTo(incoming, 1, FADE);
                kenBurns(incoming, index);
                if (!wasFirst) { fadeTo(outgoing, 0, FADE); }
                swapCaption(index);
                tickProgress(index);
                schedule();
                setTimeout(function () {
                    if (outgoing !== incoming && !outgoing.paused) { outgoing.pause(); }
                }, FADE + 80);
            };

            var attempt = incoming.play();
            if (attempt && typeof attempt.then === 'function') {
                attempt.then(proceed).catch(function () {
                    /* Autoplay refused (battery saver etc.) — retry on first touch */
                    document.addEventListener('pointerdown', function retry() {
                        document.removeEventListener('pointerdown', retry);
                        incoming.play().then(proceed).catch(function () { });
                    });
                });
            } else {
                proceed();
            }
        };

        if (incoming.readyState >= 3) {
            launch();
        } else {
            incoming.addEventListener('canplay', launch, { once: true });
            incoming.addEventListener('error', function () {
                /* Broken clip: skip past it */
                index = next;
                schedule(80);
            }, { once: true });
        }
    }

    function schedule(delay) {
        clearTimeout(timer);
        if (pageHidden || !inView) { return; }
        timer = setTimeout(showNext, typeof delay === 'number' ? delay : HOLD + FADE);
    }

    /* ── lifecycle: stop burning cycles when the reel can't be seen ─ */

    function freeze() {
        clearTimeout(timer);
        Array.prototype.forEach.call(films, function (v) { if (!v.paused) { v.pause(); } });
        liveAnims.forEach(function (a) { if (a.playState === 'running') { a.pause(); } });
    }

    function resume() {
        var active = films[buffer];
        if (active && active.src) {
            var p = active.play();
            if (p && p.catch) { p.catch(function () { }); }
        }
        liveAnims.forEach(function (a) { if (a.playState === 'paused') { a.play(); } });
        schedule();
    }

    document.addEventListener('visibilitychange', function () {
        pageHidden = document.hidden;
        if (pageHidden) { freeze(); }
        else if (started && inView) { resume(); }
    });

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
            inView = entries[0].isIntersecting;
            if (!inView) { freeze(); }
            else if (started && !pageHidden) { resume(); }
        }, { threshold: 0.08 }).observe(stage);
    }

    /* ── roll film ───────────────────────────────────────────────── */

    function start() {
        if (started) { return; }
        started = true;
        showNext();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
