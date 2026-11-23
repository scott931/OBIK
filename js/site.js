// =========================================================================
    // 1. CURATED PHOTO LIBRARY & MULTI-TIER FALLBACK HYDRATION
    // =========================================================================
    const sitePhotos = [
      'images/1.jpeg',
      'images/2.jpeg',
      'images/3.jpeg',
      'images/4.jpeg',
      'images/5.jpeg',
    ];

    function sitePhoto(index) {
      const i = ((index % sitePhotos.length) + sitePhotos.length) % sitePhotos.length;
      return {
        primary: sitePhotos[i],
        secondary: sitePhotos[(i + 1) % sitePhotos.length],
      };
    }

    const photoLibrary = {
      'hero-elder': { ...sitePhoto(0), label: 'Dignity & Independence' },
      'hero-diaspora': { ...sitePhoto(3), label: 'OBIK Diaspora Care' },
      'hero-health': { ...sitePhoto(4), label: 'Health Access & Mobility' },
      'hero-upkeep': { ...sitePhoto(2), label: 'Upkeep & Social Protection' },
      'why-1': { ...sitePhoto(0), label: 'Community Support' },
      'why-2': { ...sitePhoto(1), label: 'Intergenerational Warmth' },
      'prog-diaspora': { ...sitePhoto(3), label: '01. OBIK Diaspora Care' },
      'prog-upkeep': { ...sitePhoto(2), label: '02. OBIK Upkeep & Social Protection' },
      'prog-health': { ...sitePhoto(4), label: '03. OBIK Health Access & Mobility' },
      'gallery-1': { ...sitePhoto(0), label: 'Dignity & Everyday Joy' },
      'gallery-2': { ...sitePhoto(1), label: 'Family & Connection' },
      'gallery-3': { ...sitePhoto(3), label: 'Independence & Care' },
      'about-hero': { ...sitePhoto(3), label: 'Who We Are at OBIK' },
      'founder': {
        primary: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=850&q=85',
        secondary: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=850&q=85',
        label: 'Dalcy C., Founder of OBIK',
      },
      'partner-hero': { ...sitePhoto(1), label: 'Working Together With OBIK' },
      'contact-img': { ...sitePhoto(2), label: 'Connect With OBIK' },
    };

    function createEditorialSvgFallback(label = 'OBIK — Advancing Women’s Ageing & Wellbeing') {
      const safeLabel = String(label).replace(/[<>&"']/g, '');
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs>
          <linearGradient id="obGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#320C19"/>
            <stop offset="55%" stop-color="#4D1628"/>
            <stop offset="100%" stop-color="#D9501E"/>
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#obGrad)"/>
        <circle cx="400" cy="245" r="56" fill="none" stroke="#F28C28" stroke-width="2.5"/>
        <text x="400" y="257" text-anchor="middle" fill="#FDFBFB" font-family="Georgia, serif" font-size="34" font-weight="bold">OBIK</text>
        <text x="400" y="345" text-anchor="middle" fill="#F28C28" font-family="sans-serif" font-size="14" font-weight="bold" letter-spacing="3">AGE WELL. LIVE WELL.</text>
        <text x="400" y="382" text-anchor="middle" fill="#FDFBFB" font-family="Georgia, serif" font-size="22">${safeLabel}</text>
      </svg>`;
      return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    }

    function bindImageWithFallback(imgEl, entry) {
      if (!imgEl) return;
      const fallbackData = entry || { label: imgEl.alt || 'OBIK' };
      let attempt = 0;

      imgEl.onerror = () => {
        attempt += 1;
        if (attempt === 1 && fallbackData.secondary) {
          imgEl.src = fallbackData.secondary;
        } else {
          imgEl.onerror = null;
          imgEl.src = createEditorialSvgFallback(fallbackData.label || imgEl.alt);
        }
      };

      if (fallbackData.primary) {
        imgEl.src = fallbackData.primary;
      } else if (fallbackData.secondary) {
        imgEl.src = fallbackData.secondary;
      } else {
        imgEl.src = createEditorialSvgFallback(fallbackData.label || imgEl.alt);
      }
    }

    function hydrateAllStaticImages() {
      document.querySelectorAll('img[data-photo]').forEach((imgEl) => {
        const key = imgEl.getAttribute('data-photo');
        bindImageWithFallback(imgEl, photoLibrary[key] || { label: imgEl.alt || 'OBIK' });
      });
    }

    // =========================================================================
    // 2. HERO INTERACTIVE HOVER SPOTLIGHT & ARCH PHOTO CAROUSEL LOGIC
    // =========================================================================
    const HERO_VIDEO_SOURCES = [
      'videos/hero.mp4',
      'https://assets.mixkit.co/videos/preview/mixkit-group-of-elderly-friends-having-fun-in-a-park-41196-large.mp4',
    ];

    function wireHeroVideoFallback(videoEl, onReady) {
      if (!videoEl) return;
      let sourceIndex = 0;

      const loadAt = (index) => {
        if (index >= HERO_VIDEO_SOURCES.length) {
          if (heroSection) heroSection.classList.add('hero-bg-video-paused');
          return;
        }
        sourceIndex = index;
        videoEl.removeAttribute('src');
        videoEl.innerHTML = '';
        videoEl.src = HERO_VIDEO_SOURCES[index];
        videoEl.load();
      };

      const heroSection = document.getElementById('home-hero');

      videoEl.addEventListener('error', () => loadAt(sourceIndex + 1));
      videoEl.addEventListener('loadeddata', () => {
        if (onReady) onReady();
      }, { once: false });

      loadAt(0);
    }

    function tryPlayHeroVideo(videoEl) {
      if (!videoEl) return Promise.resolve();
      const playAttempt = videoEl.play();
      if (playAttempt && typeof playAttempt.then === 'function') {
        return playAttempt.catch(() => undefined);
      }
      return Promise.resolve();
    }

    function initHeroVideo() {
      const heroSection = document.getElementById('home-hero');
      const heroVideo = document.getElementById('hero-bg-video');
      const cardVideo = document.getElementById('hero-card-video');
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!heroVideo) return;

      if (reducedMotion) {
        heroVideo.pause();
        if (cardVideo) cardVideo.pause();
        if (heroSection) heroSection.classList.add('hero-bg-video-paused');
        return;
      }

      const syncCardMirror = () => {
        if (!cardVideo || cardVideo === heroVideo) return;
        const sync = () => {
          if (Math.abs(cardVideo.currentTime - heroVideo.currentTime) > 0.35) {
            try {
              cardVideo.currentTime = heroVideo.currentTime;
            } catch (e) { /* ignore seek edge cases */ }
          }
        };
        heroVideo.addEventListener('timeupdate', sync);
      };

      const startPlayback = () => {
        tryPlayHeroVideo(heroVideo).then(() => {
          if (heroSection) heroSection.classList.remove('hero-bg-video-paused');
        });
        if (cardVideo) tryPlayHeroVideo(cardVideo);
        syncCardMirror();
      };

      wireHeroVideoFallback(heroVideo, startPlayback);
      if (cardVideo) wireHeroVideoFallback(cardVideo, startPlayback);

      const unlockOnGesture = () => {
        startPlayback();
        document.removeEventListener('pointerdown', unlockOnGesture);
        document.removeEventListener('keydown', unlockOnGesture);
      };
      document.addEventListener('pointerdown', unlockOnGesture, { once: true });
      document.addEventListener('keydown', unlockOnGesture, { once: true });

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          heroVideo.pause();
          if (cardVideo) cardVideo.pause();
        } else if (!reducedMotion) {
          startPlayback();
        }
      });
    }

    const heroCarouselSlidesData = [
      {
        photoKey: 'hero-elder',
        badgeTitle: 'Dignity & Independence',
        badgeSub: 'Supporting women aged 65+ across Africa',
        pillText: 'Age Well. Live Well.',
        caption: 'Practical care, financial security, and trusted local support.',
      },
      {
        photoKey: 'hero-diaspora',
        badgeTitle: 'OBIK Diaspora Care',
        badgeSub: 'Connecting families across distance',
        pillText: 'Diaspora Support',
        caption: 'Bringing trusted support closer, even when families are far away.',
      },
      {
        photoKey: 'hero-health',
        badgeTitle: 'Health Access & Mobility',
        badgeSub: 'Making healthcare easier to navigate',
        pillText: 'Medical Mobility',
        caption: 'Coordinating medical support and facilitating transport for appointments.',
      },
      {
        photoKey: 'hero-upkeep',
        badgeTitle: 'Upkeep & Social Protection',
        badgeSub: 'Strengthening financial security',
        pillText: 'Social Protection',
        caption: 'Sponsored upkeep allocations and benefit-access assistance.',
      },
    ];

    let currentHeroSlideIndex = 0;
    let heroCarouselTimer = null;

    function initHeroCarousel() {
      const slidesContainer = document.getElementById('hero-carousel-slides');
      const dotsContainer = document.getElementById('hero-carousel-dots');
      if (!slidesContainer || !dotsContainer) return;

      slidesContainer.innerHTML = heroCarouselSlidesData
        .map((slide, idx) => `
          <div class="hero-carousel-slide ${idx === 0 ? 'is-active' : ''}" data-slide-idx="${idx}">
            <img data-photo="${slide.photoKey}" alt="${slide.badgeTitle}" class="w-full h-full object-cover object-top" />
          </div>
        `)
        .join('');

      dotsContainer.innerHTML = heroCarouselSlidesData
        .map((_, idx) => `
          <button
            type="button"
            onclick="jumpToHeroSlide(${idx})"
            role="tab"
            aria-selected="${idx === 0 ? 'true' : 'false'}"
            aria-label="Slide ${idx + 1}"
            class="hero-dot h-2 rounded-full transition-all duration-300 ${idx === 0 ? 'w-8 bg-marigold' : 'w-2 bg-alabaster/40'}"
          ></button>
        `)
        .join('');

      slidesContainer.querySelectorAll('img[data-photo]').forEach((imgEl) => {
        const key = imgEl.getAttribute('data-photo');
        bindImageWithFallback(imgEl, photoLibrary[key]);
      });

      updateHeroCarouselUI();
      scheduleNextHeroSlide();
    }

    function updateHeroCarouselUI() {
      const data = heroCarouselSlidesData[currentHeroSlideIndex];
      if (!data) return;

      const badgeTitleEl = document.getElementById('hero-badge-title');
      if (badgeTitleEl) badgeTitleEl.textContent = data.badgeTitle;

      const badgeSubEl = document.getElementById('hero-badge-sub');
      if (badgeSubEl) badgeSubEl.textContent = data.badgeSub;

      const slidePillEl = document.getElementById('hero-slide-pill');
      if (slidePillEl) slidePillEl.textContent = data.pillText;

      const slideCaptionEl = document.getElementById('hero-slide-caption');
      if (slideCaptionEl) slideCaptionEl.textContent = data.caption;

      const slideCounterEl = document.getElementById('hero-slide-counter');
      if (slideCounterEl) slideCounterEl.textContent = `0${currentHeroSlideIndex + 1} / 0${heroCarouselSlidesData.length}`;

      document.querySelectorAll('.hero-carousel-slide').forEach((slideEl, idx) => {
        if (idx === currentHeroSlideIndex) {
          slideEl.classList.add('is-active');
        } else {
          slideEl.classList.remove('is-active');
        }
      });

      document.querySelectorAll('.hero-dot').forEach((dotEl, idx) => {
        if (idx === currentHeroSlideIndex) {
          dotEl.className = 'hero-dot h-2 rounded-full transition-all duration-300 w-8 bg-marigold';
          dotEl.setAttribute('aria-selected', 'true');
        } else {
          dotEl.className = 'hero-dot h-2 rounded-full transition-all duration-300 w-2 bg-alabaster/40';
          dotEl.setAttribute('aria-selected', 'false');
        }
      });

      restartHeroProgressBar();
    }

    function restartHeroProgressBar() {
      const progress = document.getElementById('hero-carousel-progress');
      if (!progress) return;
      progress.style.animation = 'none';
      void progress.offsetWidth;
      progress.style.animation = 'heroCarouselProgress 5.5s linear forwards';
    }

    function scheduleNextHeroSlide() {
      if (heroCarouselTimer) clearTimeout(heroCarouselTimer);
      const homePage = document.getElementById('page-home');
      if (homePage && !homePage.classList.contains('active')) return;

      heroCarouselTimer = setTimeout(() => {
        currentHeroSlideIndex = (currentHeroSlideIndex + 1) % heroCarouselSlidesData.length;
        updateHeroCarouselUI();
        scheduleNextHeroSlide();
      }, 5500);
    }

    function stepHeroCarousel(direction) {
      if (heroCarouselTimer) clearTimeout(heroCarouselTimer);
      currentHeroSlideIndex = (currentHeroSlideIndex + direction + heroCarouselSlidesData.length) % heroCarouselSlidesData.length;
      updateHeroCarouselUI();
      scheduleNextHeroSlide();
    }

    function jumpToHeroSlide(index) {
      if (heroCarouselTimer) clearTimeout(heroCarouselTimer);
      currentHeroSlideIndex = index;
      updateHeroCarouselUI();
      scheduleNextHeroSlide();
    }

    // =========================================================================
    // 2B. BRAND LOADER & MULTI-PAGE NAVIGATION ROUTER
    // =========================================================================
    let isInitialSiteLoad = true;
    let loaderHideTimer = null;
    let loaderProgressTimer = null;

    function showObLoader(statusText, durationMs = 850, onComplete = null) {
      const loader = document.getElementById('ob-loader');
      const statusEl = document.getElementById('ob-loader-status');
      const barEl = document.getElementById('ob-loader-bar');
      if (!loader) {
        if (typeof onComplete === 'function') onComplete();
        return;
      }

      if (loaderHideTimer) clearTimeout(loaderHideTimer);
      if (loaderProgressTimer) clearTimeout(loaderProgressTimer);

      const prefersReducedMotion =
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const effectiveDuration = prefersReducedMotion ? Math.min(durationMs, 180) : durationMs;

      if (statusEl && statusText) {
        statusEl.textContent = statusText;
      }

      if (barEl) {
        barEl.style.transition = 'none';
        barEl.style.width = '22%';
        void barEl.offsetWidth;
        barEl.style.transition = `width ${Math.max(effectiveDuration - 60, 140)}ms cubic-bezier(0.22, 1, 0.36, 1)`;
        loaderProgressTimer = setTimeout(() => {
          barEl.style.width = '100%';
        }, 25);
      }

      loader.classList.remove('is-hidden');

      loaderHideTimer = setTimeout(() => {
        loader.classList.add('is-hidden');
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }, effectiveDuration);
    }

    const PAGE_HREF = {
      home: 'index.html',
      about: 'about.html',
      programmes: 'programmes.html',
      gallery: 'gallery.html',
      partner: 'partner.html',
      contact: 'contact.html',
    };

    function currentFile() {
      const name = (location.pathname.split('/').pop() || 'index.html').split('?')[0];
      return name || 'index.html';
    }

    function goToPage(pageId, search) {
      const file = PAGE_HREF[pageId];
      if (!file) return;
      window.location.href = search ? file + search : file;
    }

    function applyPageSwitch(pageId) {
      const targetPage = document.getElementById(`page-${pageId}`);
      if (!targetPage) {
        goToPage(pageId);
        return;
      }

      document.querySelectorAll('.page-view').forEach((page) => {
        page.classList.remove('active');
      });
      targetPage.classList.add('active');

      // Update Desktop & Mobile Active States
      document.querySelectorAll('.nav-link').forEach((link) => {
        if (link.dataset.nav === pageId) {
          link.classList.add('active-nav');
        } else {
          link.classList.remove('active-nav');
        }
      });

      document.querySelectorAll('.mobile-nav-link').forEach((link) => {
        link.classList.toggle('is-current', link.dataset.nav === pageId);
      });

      if (pageId === 'home') {
        startHeroTyping();
      } else {
        stopHeroTyping();
      }

      if (pageId !== 'home' && heroCarouselTimer) {
        clearTimeout(heroCarouselTimer);
        heroCarouselTimer = null;
      }

      window.scrollTo({ top: 0, behavior: 'instant' });
      setTimeout(triggerVisibleReveals, 80);
    }

    function navigateTo(pageId) {
      const mobileMenu = document.getElementById('mobile-menu');
      const mobileBtn = document.getElementById('mobile-menu-btn');
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        if (mobileBtn) mobileBtn.setAttribute('aria-expanded', 'false');
      }

      const targetPage = document.getElementById(`page-${pageId}`);
      if (targetPage && targetPage.classList.contains('active') && currentFile() === PAGE_HREF[pageId]) {
        window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }
      goToPage(pageId);
    }

    // =========================================================================
    // 2C. CONTINUOUS LOOPING HERO HEADLINE TYPING EFFECT
    // =========================================================================
    // 2. BRAND LOADER, MULTI-PAGE NAVIGATION & SCROLL PROGRESS
    // =========================================================================
    // 2B. CONTINUOUS LOOPING HERO HEADLINE TYPING EFFECT
    // =========================================================================
    const heroHeadlines = [
      {
        before: 'Aging should not  ',
        accent: 'mean being left',
        after: ' behind.',
      },
      {
        before: 'Strengthening the support ',
        accent: 'systems around',
        after: ' older women.',
      },
      {
        before: 'Growing older with dignity starts with ',
        accent: 'practical help',
        after: ' close to home.',
      },
      {
        before: 'Caring from a distance still needs ',
        accent: 'someone trustworthy',
        after: ' on the ground.',
      },
      {
        before: 'Age well. Live well. With ',
        accent: 'dignity',
        after: ' and care.',
      },
      {
        before: 'Connecting families across ',
        accent: 'distance',
        after: ' and generations.',
      },
      // {
      //   before: 'Connecting families across ',
      //   accent: 'distance',
      //   after: ' and generations.',
      // },
    ];

    let heroTypingTimer = null;
    let heroPhraseIndex = 0;

    function stopHeroTyping() {
      if (heroTypingTimer) {
        clearTimeout(heroTypingTimer);
        heroTypingTimer = null;
      }
    }

    function headlineText(phrase) {
      return phrase.before + phrase.accent + phrase.after;
    }

    function paintHeroHeadline(phrase, count) {
      const beforeEl = document.getElementById('hero-typed-before');
      const accentEl = document.getElementById('hero-typed-accent');
      const afterEl = document.getElementById('hero-typed-after');
      if (!beforeEl || !accentEl || !afterEl) return;
      const shown = headlineText(phrase).slice(0, count);
      const beforeEnd = phrase.before.length;
      const accentEnd = beforeEnd + phrase.accent.length;
      beforeEl.textContent = shown.slice(0, beforeEnd);
      accentEl.textContent = shown.length > beforeEnd ? shown.slice(beforeEnd, accentEnd) : '';
      afterEl.textContent = shown.length > accentEnd ? shown.slice(accentEnd) : '';
    }

    function startHeroTyping() {
      const cursorEl = document.getElementById('hero-typed-cursor');
      const headlineEl = document.getElementById('hero-headline');
      if (!cursorEl) return;

      stopHeroTyping();

      const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        const phrase = heroHeadlines[0];
        paintHeroHeadline(phrase, headlineText(phrase).length);
        if (headlineEl) headlineEl.setAttribute('aria-label', headlineText(phrase));
        cursorEl.style.display = 'none';
        return;
      }

      cursorEl.style.display = '';
      cursorEl.classList.remove('is-done');
      let charIndex = 0;
      let isDeleting = false;
      paintHeroHeadline(heroHeadlines[heroPhraseIndex], 0);

      function tickTyping() {
        const homePage = document.getElementById('page-home');
        if (homePage && !homePage.classList.contains('active')) {
          heroTypingTimer = null;
          return;
        }

        const phrase = heroHeadlines[heroPhraseIndex];
        const full = headlineText(phrase);

        if (!isDeleting) {
          if (charIndex < full.length) {
            charIndex += 1;
            paintHeroHeadline(phrase, charIndex);
            const typedChar = full.charAt(charIndex - 1);
            heroTypingTimer = setTimeout(tickTyping, typedChar === ' ' ? 36 : 34);
          } else {
            if (headlineEl) headlineEl.setAttribute('aria-label', full);
            isDeleting = true;
            heroTypingTimer = setTimeout(tickTyping, 2600);
          }
        } else if (charIndex > 0) {
          charIndex -= 1;
          paintHeroHeadline(phrase, charIndex);
          heroTypingTimer = setTimeout(tickTyping, 18);
        } else {
          isDeleting = false;
          heroPhraseIndex = (heroPhraseIndex + 1) % heroHeadlines.length;
          heroTypingTimer = setTimeout(tickTyping, 420);
        }
      }

      heroTypingTimer = setTimeout(tickTyping, 280);
    }

    function toggleMobileMenu(forceClose) {
      const mobileMenu = document.getElementById('mobile-menu');
      const mobileBtn = document.getElementById('mobile-menu-btn');
      if (!mobileMenu) return;
      const shouldClose = forceClose === true || !mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden', shouldClose);
      if (mobileBtn) {
        mobileBtn.setAttribute('aria-expanded', String(!shouldClose));
        mobileBtn.setAttribute('aria-label', shouldClose ? 'Open menu' : 'Close menu');
      }
    }

    document.addEventListener('click', (event) => {
      const mobileMenu = document.getElementById('mobile-menu');
      const mobileBtn = document.getElementById('mobile-menu-btn');
      if (!mobileMenu || mobileMenu.classList.contains('hidden')) return;
      if (mobileMenu.contains(event.target) || (mobileBtn && mobileBtn.contains(event.target))) return;
      toggleMobileMenu(true);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        toggleMobileMenu(true);
        closePartnerForm();
      }
    });

    function pathwaySection(key) {
      return document.getElementById(key) || document.getElementById('prog-detail-' + key);
    }

    function navigateToProgramme(key) {
      if (currentFile() === 'programmes.html') {
        highlightPathway(key);
        const card = pathwaySection(key);
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      goToPage('programmes', '?pathway=' + encodeURIComponent(key));
    }

    let partnerFormReturnFocus = null;

    function openPartnerForm() {
      const modal = document.getElementById('partner-form-modal');
      if (!modal) return;
      partnerFormReturnFocus = document.activeElement;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
      modal.scrollTop = 0;
      const name = document.getElementById('partner-name');
      if (name) setTimeout(() => name.focus(), 40);
    }

    function closePartnerForm() {
      const modal = document.getElementById('partner-form-modal');
      if (!modal || modal.classList.contains('hidden')) return;
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
      if (partnerFormReturnFocus && typeof partnerFormReturnFocus.focus === 'function') {
        partnerFormReturnFocus.focus();
      }
      partnerFormReturnFocus = null;
    }

    function navigateToPartnerType(categoryName) {
      if (currentFile() === 'partner.html') {
        selectPartnerCategory(categoryName);
        return;
      }
      goToPage('partner', '?category=' + encodeURIComponent(categoryName));
    }

    function navigateToContactTopic(topic) {
      if (currentFile() === 'partner.html') {
        openPartnerForm();
        return;
      }
      goToPage('partner', '?inquiry=1');
    }

    // =========================================================================
    // 3. INTERACTIVE 5-PILLAR APPROACH EXPLORER (HOMEPAGE)
    // =========================================================================
    const approachPillars = [
      {
        title: 'Care coordination',
        desc: 'Connecting women and families to practical services and trusted local support.',
        photoKey: 'prog-diaspora',
      },
      {
        title: 'Financial access',
        desc: 'Mobilising resources and facilitating access to social protection and essential financial assistance.',
        photoKey: 'prog-upkeep',
      },
      {
        title: 'Healthcare partnerships',
        desc: 'Working with qualified healthcare providers, institutions and licensed insurance partners to improve access to care.',
        photoKey: 'prog-health',
      },
      {
        title: 'Community connections',
        desc: 'Building relationships with local organisations and service networks that understand the needs of the women they serve.',
        photoKey: 'why-1',
      },
      {
        title: 'Accountability',
        desc: 'Promoting responsible programme delivery, transparency and measurable outcomes.',
        photoKey: 'partner-hero',
      },
    ];

    function selectApproachPillar(index) {
      const pillar = approachPillars[index];
      if (!pillar) return;

      document.querySelectorAll('.approach-btn').forEach((btn, idx) => {
        const badge = btn.querySelector('span:last-child');
        const desc = btn.querySelector('p');
        if (idx === index) {
          btn.className = 'approach-btn w-full text-left p-5 rounded-2xl bg-emerald text-alabaster border border-emerald shadow-card transition-all';
          if (badge) badge.className = 'text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-alabaster/15 text-marigold';
          if (desc) desc.className = 'text-sm text-alabaster/85 mt-1.5 leading-relaxed';
        } else {
          btn.className = 'approach-btn w-full text-left p-5 rounded-2xl bg-alabaster hover:bg-linen text-charcoal border border-stoneBorder transition-all';
          if (badge) badge.className = 'text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-linen text-charcoal-subtle';
          if (desc) desc.className = 'text-sm text-charcoal-muted mt-1.5 leading-relaxed';
        }
      });

      document.getElementById('approach-preview-badge').textContent = `${index + 1} of 5`;
      document.getElementById('approach-preview-title').textContent = pillar.title;
      document.getElementById('approach-preview-desc').textContent = pillar.desc;
      bindImageWithFallback(document.getElementById('approach-preview-img'), photoLibrary[pillar.photoKey]);
    }

    // =========================================================================
    // 4. PROGRAMMES PATHWAY MATCHER & FORMS
    // =========================================================================
    function highlightPathway(key) {
      document.querySelectorAll('.pathway-btn').forEach((btn) => {
        const isActive = btn.dataset.pathway === key;
        btn.classList.toggle('is-active', isActive);
        if (btn.getAttribute('role') === 'tab') btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      document.querySelectorAll('.prog-detail-card').forEach((card) => {
        card.classList.toggle('is-active', card.id === key || card.id === 'prog-detail-' + key);
      });
    }

    function selectPartnerCategory(categoryName) {
      const select = document.getElementById('partner-category');
      if (select) {
        select.value = categoryName;
      }
      document.querySelectorAll('.partner-card-btn').forEach((btn) => {
        btn.classList.toggle('is-selected', btn.textContent.includes(categoryName));
      });
      openPartnerForm();
    }

    // Change this to the inbox that should receive form messages.
    const OBIK_INBOX = 'hello@obik.org';
    let lastEnquiryText = '';

    function fieldValue(id) {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    }

    function showFormError(errorId, message) {
      const errorEl = document.getElementById(errorId);
      if (!errorEl) return;
      errorEl.textContent = message || '';
      errorEl.classList.toggle('hidden', !message);
    }

    function markInvalid(input, invalid) {
      if (!input) return;
      input.classList.toggle('border-terracotta', invalid);
      input.setAttribute('aria-invalid', invalid ? 'true' : 'false');
    }

    function validateEnquiry(fields, errorId) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email);
      Object.values(fields.inputs || {}).forEach((input) => markInvalid(input, false));
      if (!fields.name) {
        markInvalid(fields.inputs.name, true);
        showFormError(errorId, 'Please add your name.');
        fields.inputs.name?.focus();
        return false;
      }
      if (!emailOk) {
        markInvalid(fields.inputs.email, true);
        showFormError(errorId, 'Please add a valid email address so we can reply.');
        fields.inputs.email?.focus();
        return false;
      }
      if (fields.topic !== undefined && !fields.topic) {
        markInvalid(fields.inputs.topic, true);
        showFormError(errorId, 'Please add a subject.');
        fields.inputs.topic?.focus();
        return false;
      }
      if (!fields.message || fields.message.length < 12) {
        markInvalid(fields.inputs.message, true);
        showFormError(errorId, 'Please write a short message (at least a sentence).');
        fields.inputs.message?.focus();
        return false;
      }
      showFormError(errorId, '');
      return true;
    }

    function openEnquiryEmail(subject, body) {
      lastEnquiryText = `To: ${OBIK_INBOX}\nSubject: ${subject}\n\n${body}`;
      const href = `mailto:${OBIK_INBOX}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const link = document.createElement('a');
      link.href = href;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      link.remove();
    }

    function copyLastEnquiry() {
      if (!lastEnquiryText) return;
      const done = () => {
        const buttons = document.querySelectorAll('[onclick="copyLastEnquiry()"]');
        buttons.forEach((btn) => {
          btn.textContent = 'Copied';
        });
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(lastEnquiryText).then(done).catch(() => {});
      }
    }

    function finishEnquiry(form, feedbackId) {
      const feedback = document.getElementById(feedbackId);
      if (feedback) feedback.classList.remove('hidden');
      form.reset();
    }

    function handlePartnerSubmit(event) {
      event.preventDefault();
      const form = event.target;
      const fields = {
        name: fieldValue('partner-name'),
        email: fieldValue('partner-email'),
        message: fieldValue('partner-message'),
        inputs: {
          name: document.getElementById('partner-name'),
          email: document.getElementById('partner-email'),
          message: document.getElementById('partner-message'),
        },
      };
      if (!validateEnquiry(fields, 'partner-error')) return;

      const organisation = fieldValue('partner-org') || 'Not given';
      const category = fieldValue('partner-category');
      const subject = `Partnership inquiry — ${fields.name}`;
      const body = [
        'Partnership inquiry for OBIK',
        '',
        `Name: ${fields.name}`,
        `Email: ${fields.email}`,
        `Organisation: ${organisation}`,
        `Category: ${category}`,
        '',
        fields.message,
      ].join('\n');

      openEnquiryEmail(subject, body);
      finishEnquiry(form, 'partner-feedback');
    }

    function setContactTopic(topic) {
      const input = document.getElementById('contact-topic');
      if (input) {
        input.value = topic;
        input.focus();
      }
    }

    function handleContactSubmit(event) {
      event.preventDefault();
      const form = event.target;
      const fields = {
        name: fieldValue('contact-name'),
        email: fieldValue('contact-email'),
        topic: fieldValue('contact-topic'),
        message: fieldValue('contact-message'),
        inputs: {
          name: document.getElementById('contact-name'),
          email: document.getElementById('contact-email'),
          topic: document.getElementById('contact-topic'),
          message: document.getElementById('contact-message'),
        },
      };
      if (!validateEnquiry(fields, 'contact-error')) return;

      const subject = fields.topic;
      const body = [
        'Message for OBIK',
        '',
        `Name: ${fields.name}`,
        `Email: ${fields.email}`,
        `Subject: ${fields.topic}`,
        '',
        fields.message,
      ].join('\n');

      openEnquiryEmail(subject, body);
      finishEnquiry(form, 'contact-feedback');
    }

    function bindInboxAddress() {
      document.querySelectorAll('a[href^="mailto:hello@obik.org"], #obik-inbox-link').forEach((link) => {
        const raw = link.getAttribute('href') || '';
        const query = raw.includes('?') ? raw.slice(raw.indexOf('?')) : '';
        link.href = `mailto:${OBIK_INBOX}${query}`;
        if (link.id === 'obik-inbox-link') link.textContent = OBIK_INBOX;
      });
      document.querySelectorAll('[data-obik-inbox]').forEach((field) => {
        field.value = OBIK_INBOX;
      });
    }

    // =========================================================================
    // 5. GALLERY DATA, ASYMMETRIC RENDERING & FULLSCREEN LIGHTBOX
    // =========================================================================
    const galleryItems = [
      {
        id: 1,
        category: 'diaspora',
        categoryLabel: 'Diaspora Care & Family',
        title: 'Bridging Distance With Trusted Care',
        caption: 'Distance should not prevent families from ensuring their loved ones receive consistent practical support back home.',
        programme: '1. OBIK Diaspora Care',
        programmeKey: 'diaspora',
        span: 'lg:col-span-7',
        aspect: 'aspect-[16/10]',
        primary: 'images/1.jpeg',
        secondary: 'images/2.jpeg',
      },
      {
        id: 2,
        category: 'community',
        categoryLabel: 'Community & Independence',
        title: 'Ageing With Dignity & Grace',
        caption: 'Ageing should be accompanied by dignity, independence and access to the support that makes life better.',
        programme: 'Our Commitment — Age Well. Live Well.',
        programmeKey: null,
        span: 'lg:col-span-5',
        aspect: 'aspect-[4/5]',
        primary: 'images/2.jpeg',
        secondary: 'images/3.jpeg',
      },
      {
        id: 3,
        category: 'health',
        categoryLabel: 'Health & Mobility',
        title: 'Making Healthcare Easier to Navigate',
        caption: 'Bringing healthcare access and practical mobility together so older women receive timely, respectful care.',
        programme: '03. OBIK Health Access & Mobility',
        programmeKey: 'health',
        span: 'lg:col-span-4',
        aspect: 'aspect-[4/3]',
        primary: 'images/3.jpeg',
        secondary: 'images/4.jpeg',
      },
      {
        id: 4,
        category: 'upkeep',
        categoryLabel: 'Upkeep & Daily Living',
        title: 'Strengthening Everyday Financial Security',
        caption: 'Benefit-access assistance and sponsored upkeep allocations help women access the resources they need for everyday living.',
        programme: '02. OBIK Upkeep & Social Protection',
        programmeKey: 'upkeep',
        span: 'lg:col-span-4',
        aspect: 'aspect-[4/3]',
        primary: 'images/4.jpeg',
        secondary: 'images/5.jpeg',
      },
      {
        id: 5,
        category: 'diaspora',
        categoryLabel: 'Diaspora Care & Family',
        title: 'Consistent Practical Check-Ins',
        caption: 'Coordinating everyday assistance, household support, and wellbeing check-ins with trusted local service providers.',
        programme: '1. OBIK Diaspora Care',
        programmeKey: 'diaspora',
        span: 'lg:col-span-4',
        aspect: 'aspect-[4/3]',
        primary: 'images/5.jpeg',
        secondary: 'images/1.jpeg',
      },
    ];


    let activeGalleryFilter = 'all';
    let filteredGalleryItems = [...galleryItems];
    let currentLightboxIndex = 0;

    function renderGallery() {
      const grid = document.getElementById('gallery-grid');
      if (!grid) return;

      filteredGalleryItems = activeGalleryFilter === 'all'
        ? galleryItems
        : galleryItems.filter((item) => item.category === activeGalleryFilter);

      const label = document.getElementById('gallery-showing-label');
      if (label) {
        const n = filteredGalleryItems.length;
        label.textContent = `${n} ${n === 1 ? 'frame' : 'frames'}`;
      }

      const mosaicSpans = [
        'lg:col-span-7 lg:row-span-2 min-h-[320px] lg:min-h-[520px]',
        'lg:col-span-5 min-h-[250px]',
        'lg:col-span-5 min-h-[250px]',
        'lg:col-span-4 min-h-[280px]',
        'lg:col-span-4 min-h-[280px]',
        'lg:col-span-4 min-h-[280px]',
        'lg:col-span-8 min-h-[340px]',
        'lg:col-span-4 min-h-[340px]',
        'lg:col-span-3 min-h-[240px]',
        'lg:col-span-3 min-h-[240px]',
        'lg:col-span-6 min-h-[300px]',
        'lg:col-span-6 min-h-[300px]',
      ];

      grid.innerHTML = filteredGalleryItems
        .map((item, idx) => {
          const frameNo = String(item.id).padStart(2, '0');
          const delayMs = Math.min(idx * 40, 360);
          const isLead = activeGalleryFilter === 'all' && idx === 0;
          const span = activeGalleryFilter === 'all'
            ? mosaicSpans[idx % mosaicSpans.length]
            : 'lg:col-span-4 min-h-[280px]';

          if (isLead) {
            return `
              <article onclick="openLightbox(${idx})" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openLightbox(${idx});}" role="button" aria-label="View story: ${item.title}" style="animation-delay: ${delayMs}ms;" class="sm:col-span-2 lg:col-span-12 gallery-card-enter group cursor-pointer grid lg:grid-cols-12 gap-4 lg:gap-6 items-stretch rounded-[1.4rem] bg-linen/70 border border-stoneBorder p-3 sm:p-4">
                <div class="lg:col-span-7 relative overflow-hidden rounded-2xl min-h-[260px] lg:min-h-[420px] bg-emerald">
                  <img data-gallery-idx="${idx}" alt="${item.title}" class="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]" />
                  <span class="absolute top-4 left-4 font-editorial text-alabaster text-lg drop-shadow">${frameNo}</span>
                </div>
                <div class="lg:col-span-5 flex flex-col justify-between gap-6 px-2 py-3 lg:py-6 lg:pr-4">
                  <div class="space-y-3">
                    <p class="section-label text-terracotta">${item.categoryLabel}</p>
                    <h2 class="font-editorial text-3xl sm:text-4xl font-bold text-charcoal leading-tight">${item.title}</h2>
                    <p class="text-charcoal-muted leading-relaxed">${item.caption}</p>
                  </div>
                  <p class="text-sm font-semibold text-emerald">Open story <span aria-hidden="true">→</span></p>
                </div>
              </article>
            `;
          }

          return `
            <article onclick="openLightbox(${idx})" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openLightbox(${idx});}" role="button" aria-label="View story: ${item.title}" style="animation-delay: ${delayMs}ms;" class="sm:col-span-1 ${span} gallery-tile gallery-card-enter group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta">
              <img data-gallery-idx="${idx}" alt="" class="absolute inset-0" />
              <div class="gallery-shade"></div>
              <span class="absolute top-3 left-3 font-editorial text-alabaster/90 text-sm">${frameNo}</span>
              <div class="gallery-meta">
                <p class="text-[11px] font-semibold text-marigold mb-1">${item.categoryLabel}</p>
                <h3 class="font-editorial text-xl sm:text-2xl font-bold leading-snug">${item.title}</h3>
                <p class="mt-1.5 text-sm text-alabaster/80 line-clamp-2 opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-16 group-focus-visible:opacity-100 group-focus-visible:max-h-16 transition-all duration-300">${item.caption}</p>
              </div>
            </article>
          `;
        })
        .join('');

      // Hydrate gallery images with multi-tier fallback
      grid.querySelectorAll('img[data-gallery-idx]').forEach((imgEl) => {
        const idx = Number(imgEl.getAttribute('data-gallery-idx'));
        const item = filteredGalleryItems[idx];
        if (item) {
          bindImageWithFallback(imgEl, {
            primary: item.primary,
            secondary: item.secondary,
            label: item.title,
          });
        }
      });
    }

    function filterGallery(category) {
      activeGalleryFilter = category;
      document.querySelectorAll('.gallery-filter-btn').forEach((btn) => {
        const base = 'gallery-filter-btn px-3.5 py-2 rounded-full border text-sm font-semibold transition-colors';
        if (btn.dataset.filter === category) {
          btn.className = `${base} is-active border-transparent`;
        } else {
          btn.className = `${base} border-transparent text-charcoal-muted hover:text-charcoal hover:bg-linen`;
        }
      });
      renderGallery();
    }

    function openLightbox(index) {
      currentLightboxIndex = index;
      updateLightboxContent();
      const modal = document.getElementById('gallery-lightbox');
      if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeLightbox() {
      const modal = document.getElementById('gallery-lightbox');
      if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    }

    function stepLightbox(direction) {
      if (!filteredGalleryItems.length) return;
      currentLightboxIndex = (currentLightboxIndex + direction + filteredGalleryItems.length) % filteredGalleryItems.length;
      updateLightboxContent();
    }

    function updateLightboxContent() {
      const item = filteredGalleryItems[currentLightboxIndex];
      if (!item) return;

      const img = document.getElementById('lightbox-img');
      bindImageWithFallback(img, {
        primary: item.primary,
        secondary: item.secondary,
        label: item.title,
      });
      img.alt = item.title;

      document.getElementById('lightbox-badge').textContent = item.categoryLabel;
      document.getElementById('lightbox-counter').textContent = `${currentLightboxIndex + 1} / ${filteredGalleryItems.length}`;
      document.getElementById('lightbox-title').textContent = item.title;
      document.getElementById('lightbox-caption').textContent = item.caption;
      document.getElementById('lightbox-programme').textContent = item.programme;

      const cta = document.getElementById('lightbox-cta');
      cta.onclick = () => {
        closeLightbox();
        if (item.programmeKey) {
          navigateToProgramme(item.programmeKey);
        } else {
          navigateTo('programmes');
        }
      };
    }

    // Keyboard & Backdrop Events for Lightbox
    document.addEventListener('keydown', (e) => {
      const modal = document.getElementById('gallery-lightbox');
      if (!modal || modal.classList.contains('hidden')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') stepLightbox(-1);
      if (e.key === 'ArrowRight') stepLightbox(1);
    });

    document.getElementById('gallery-lightbox')?.addEventListener('click', (e) => {
      if (e.target.id === 'gallery-lightbox') closeLightbox();
    });

    // =========================================================================
    // 6. SCROLL REVEAL OBSERVER & READING PROGRESS BAR
    // =========================================================================
    function triggerVisibleReveals() {
      document.querySelectorAll('.page-view.active .reveal-on-scroll').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92) {
          el.classList.add('is-visible');
        }
      });
    }

    window.addEventListener('scroll', () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100)) : 0;
      const bar = document.getElementById('scroll-progress');
      if (bar) bar.style.width = `${pct}%`;
      triggerVisibleReveals();
    }, { passive: true });

    function markCurrentNav() {
      const pageId = document.body.dataset.page;
      if (!pageId) return;
      document.querySelectorAll('.nav-link').forEach((link) => {
        link.classList.toggle('active-nav', link.dataset.nav === pageId);
      });
      document.querySelectorAll('.mobile-nav-link').forEach((link) => {
        link.classList.toggle('is-current', link.dataset.nav === pageId);
      });
    }

    function applyPageQuery() {
      const params = new URLSearchParams(location.search);
      let pathway = params.get('pathway');
      if (!pathway && location.hash) {
        pathway = location.hash.replace('#', '').replace(/^prog-detail-/, '');
      }
      if (pathway && document.getElementById('page-programmes') && pathwaySection(pathway)) {
        highlightPathway(pathway);
        const card = pathwaySection(pathway);
        if (card) setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
      }
      const category = params.get('category');
      if (category && document.getElementById('partner-category')) {
        selectPartnerCategory(category);
      }
      if (params.get('inquiry') === '1' && document.getElementById('partner-form-modal')) {
        openPartnerForm();
      }
      const topic = params.get('topic');
      if (topic && document.getElementById('contact-topic')) {
        setContactTopic(topic);
      }
    }

    window.addEventListener('DOMContentLoaded', () => {
      const yearEl = document.getElementById('footer-year');
      if (yearEl) yearEl.textContent = new Date().getFullYear();

      let firstOpen = true;
      try {
        firstOpen = !sessionStorage.getItem('obik-opened');
        if (firstOpen) sessionStorage.setItem('obik-opened', '1');
      } catch (e) {}
      if (firstOpen) {
        showObLoader('Preparing dignified care pathways...', 2800);
      } else {
        const loader = document.getElementById('ob-loader');
        if (loader) loader.classList.add('is-hidden');
      }

      bindInboxAddress();
      hydrateAllStaticImages();
      initHeroVideo();
      initHeroCarousel();
      renderGallery();
      markCurrentNav();
      applyPageQuery();

      if (document.body.dataset.page === 'home') {
        startHeroTyping();
      }
      setTimeout(triggerVisibleReveals, 80);
    });

    (function () {
      const STORAGE_KEY = 'obik-cookie-consent-v2';
      const banner = document.getElementById('ob-cookie-banner');
      const modal = document.getElementById('ob-cookie-modal');
      const policyModal = document.getElementById('ob-policy-modal');

      const POLICY_TITLES = {
        privacy: 'Privacy Policy',
        terms: 'Terms of Use',
        cookies: 'Cookies Policy'
      };

      window.switchPolicyTab = function (type) {
        ['privacy', 'terms', 'cookies'].forEach(function (key) {
          const tab = document.getElementById('policy-tab-' + key);
          const panel = document.getElementById('policy-panel-' + key);
          const active = key === type;
          if (tab) {
            tab.setAttribute('aria-selected', active ? 'true' : 'false');
            tab.classList.toggle('bg-emerald', active);
            tab.classList.toggle('text-alabaster', active);
            tab.classList.toggle('bg-linen', !active);
            tab.classList.toggle('text-charcoal', !active);
            tab.classList.toggle('hover:bg-linenDeep', !active);
          }
          if (panel) {
            panel.classList.toggle('hidden', !active);
          }
        });
        const titleEl = document.getElementById('ob-policy-modal-title');
        if (titleEl && POLICY_TITLES[type]) {
          titleEl.textContent = POLICY_TITLES[type];
        }
      };

      window.openPolicyModal = function (type) {
        if (!policyModal) return;
        window.switchPolicyTab(type || 'privacy');
        policyModal.classList.remove('hidden');
      };

      window.closePolicyModal = function () {
        if (policyModal) policyModal.classList.add('hidden');
      };

      function applyConsent(prefs) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            essential: true,
            analytics: Boolean(prefs.analytics),
            preferences: Boolean(prefs.preferences),
            updatedAt: new Date().toISOString()
          }));
        } catch (e) {}
        if (banner) banner.classList.add('hidden');
        if (modal) modal.classList.add('hidden');
      }

      window.acceptAllCookies = function () {
        applyConsent({ analytics: true, preferences: true });
      };

      window.rejectOptionalCookies = function () {
        applyConsent({ analytics: false, preferences: false });
      };

      window.openCookieModal = function () {
        try {
          const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
          if (saved) {
            document.getElementById('cookie-opt-analytics').checked = Boolean(saved.analytics);
            document.getElementById('cookie-opt-preferences').checked = Boolean(saved.preferences);
          }
        } catch (e) {}
        if (modal) modal.classList.remove('hidden');
      };

      window.closeCookieModal = function () {
        if (modal) modal.classList.add('hidden');
      };

      window.saveCustomCookies = function () {
        applyConsent({
          analytics: document.getElementById('cookie-opt-analytics').checked,
          preferences: document.getElementById('cookie-opt-preferences').checked
        });
      };

      [policyModal, modal].forEach(function (overlay) {
        if (!overlay) return;
        overlay.addEventListener('click', function (e) {
          if (e.target === overlay) overlay.classList.add('hidden');
        });
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          if (policyModal) policyModal.classList.add('hidden');
          if (modal) modal.classList.add('hidden');
        }
      });

      // Reliably show the cookie banner when there is no saved consent
      function showBannerIfNeeded() {
        if (!banner) return;
        let hasConsent = false;
        try {
          hasConsent = Boolean(localStorage.getItem(STORAGE_KEY));
        } catch (e) {
          hasConsent = false;
        }
        if (!hasConsent) {
          banner.classList.remove('hidden');
        }
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showBannerIfNeeded);
      } else {
        showBannerIfNeeded();
      }
    })();
