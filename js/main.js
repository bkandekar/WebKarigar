/**
 * Webkar Studio - Main JavaScript Module
 * Pure Vanilla JS (Zero Build Step / GitHub Pages Compatible)
 */

(function () {
  'use strict';

  const CONFIG = {
    whatsappNumber: '{{WHATSAPP_NUMBER}}',
    fallbackWhatsAppNumber: '919876543210',
    defaultEnquiryMessage: 'Hello Webkar Studio, I am interested in getting a website for my business.',
    siteUrl: 'https://webkarstudio.in',
    brandName: 'Webkar Studio',
    parentBrand: 'ebookcharm Web Services'
  };

  // Detects whether the site is running under a GitHub Pages project subpath
  // (e.g. bkandekar.github.io/WebKarigar/) or at a root/custom domain
  // (e.g. webkarstudio.in/). Root-relative asset paths are resolved against
  // this base so featured images work correctly in both cases.
  CONFIG.siteBase = (function () {
    const path = window.location.pathname;
    const match = path.match(/^\/([^\/]+)\//);
    const isGithubIoProject = window.location.hostname.endsWith('github.io') && match;
    return isGithubIoProject ? `/${match[1]}/` : '/';
  })();

  window.WEBAKR_CONFIG = CONFIG;

  function getWhatsAppUrl(customText) {
    const rawNumber = (CONFIG.whatsappNumber && CONFIG.whatsappNumber !== '{{WHATSAPP_NUMBER}}')
      ? CONFIG.whatsappNumber
      : CONFIG.fallbackWhatsAppNumber;
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(customText || CONFIG.defaultEnquiryMessage);
    return `https://wa.me/${cleanNumber}?text=${message}`;
  }
  window.getWhatsAppUrl = getWhatsAppUrl;

  // Resolves a root-relative asset path (e.g. "images/foo.webp") against the
  // detected site base, so it loads correctly regardless of page depth or
  // whether the site is served from a GitHub Pages subpath or a custom domain.
  // Absolute URLs (http/https) and data URIs are passed through unchanged.
  function resolveAsset(path) {
    if (!path) return path;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return CONFIG.siteBase + path.replace(/^\/+/, '');
  }
  window.resolveAsset = resolveAsset;

  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initWhatsAppLinks();
    initPortfolioFilters();
    initContactForm();
    initCopyLinkButtons();
    initDynamicBlogRenderer();
    initInteractiveBeforeAfterSlider();
    initCostCalculator();
    initDemoModalPreview();
    initLiveActivityToasts();
  });

  function initNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileNav.classList.toggle('open');
        const isOpen = mobileNav.classList.contains('open');
        menuToggle.setAttribute('aria-expanded', isOpen);
      });

      document.addEventListener('click', (e) => {
        if (!mobileNav.contains(e.target) && !menuToggle.contains(e.target)) {
          mobileNav.classList.remove('open');
        }
      });
    }

    const currentPath = window.location.pathname.replace(/\/index\.html$/, '/');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        const cleanHref = href.replace(/\.html$/, '').replace(/^\.\.\//, '').replace(/^\.\//, '');
        if (cleanHref !== '' && cleanHref !== 'index' && window.location.href.includes(cleanHref)) {
          link.classList.add('active');
        } else if ((cleanHref === '' || cleanHref === 'index') && (currentPath === '/' || currentPath.endsWith('/web/'))) {
          link.classList.add('active');
        }
      }
    });
  }

  function initWhatsAppLinks() {
    const waButtons = document.querySelectorAll('[data-whatsapp-btn], a[href*="{{WHATSAPP_NUMBER}}"], .whatsapp-float');
    waButtons.forEach(btn => {
      const customMessage = btn.getAttribute('data-message') || CONFIG.defaultEnquiryMessage;
      btn.setAttribute('href', getWhatsAppUrl(customMessage));
      btn.setAttribute('target', '_blank');
      btn.setAttribute('rel', 'noopener noreferrer');
    });
  }

  function initPortfolioFilters() {
    const filterBtns = document.querySelectorAll('.portfolio-filters .filter-btn');
    const portfolioCards = document.querySelectorAll('.portfolio-grid .portfolio-card');
    const searchInput = document.getElementById('portfolioSearchInput');

    if (!portfolioCards.length) return;

    let currentCategory = 'all';
    let currentSearch = '';

    function filterCards() {
      portfolioCards.forEach(card => {
        const cardCat = card.getAttribute('data-category') || '';
        const cardKeywords = (card.getAttribute('data-keywords') || '') + ' ' + (card.innerText || '');
        const matchesCategory = (currentCategory === 'all' || cardCat === currentCategory);
        const matchesSearch = !currentSearch || cardKeywords.toLowerCase().includes(currentSearch.toLowerCase());
        card.style.display = (matchesCategory && matchesSearch) ? 'flex' : 'none';
      });
    }

    if (filterBtns.length) {
      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentCategory = btn.getAttribute('data-filter') || 'all';
          filterCards();
        });
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.trim();
        filterCards();
      });
    }
  }

  function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('clientName')?.value || '';
      const phone = document.getElementById('clientPhone')?.value || '';
      const businessType = document.getElementById('clientBusiness')?.value || 'Local Business';
      const packageTier = document.getElementById('clientPackage')?.value || 'Basic / Standard';
      const notes = document.getElementById('clientNotes')?.value || '';

      const msg = `*New Website Enquiry - Webkar Studio*\n\n` +
                  `*Name:* ${name}\n` +
                  `*Phone/WhatsApp:* ${phone}\n` +
                  `*Business Type:* ${businessType}\n` +
                  `*Interested Package:* ${packageTier}\n` +
                  `*Project Details:* ${notes}`;

      const waUrl = getWhatsAppUrl(msg);
      showToast('Opening WhatsApp with your enquiry details...');
      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 600);
    });
  }

  function showToast(message) {
    let toast = document.getElementById('siteToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'siteToast';
      toast.className = 'toast-msg';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
  window.showToast = showToast;

  function initCopyLinkButtons() {
    document.addEventListener('click', (e) => {
      const copyBtn = e.target.closest('[data-copy-link]');
      if (copyBtn) {
        const urlToCopy = window.location.href;
        navigator.clipboard.writeText(urlToCopy).then(() => {
          showToast('Article link copied to clipboard!');
        }).catch(() => {
          showToast('Copied link: ' + urlToCopy);
        });
      }
    });
  }

  // ==========================================
  // 6. DYNAMIC BLOG ENGINE
  // ==========================================
  function initDynamicBlogRenderer() {
    if (typeof window.BLOG_POSTS === 'undefined') return;

    const postContainer = document.getElementById('singlePostContainer');
    if (postContainer) {
      renderSinglePost();
      return;
    }

    const categoryPageContainer = document.getElementById('categoryPostsGrid');
    if (categoryPageContainer) {
      const targetCategory = categoryPageContainer.getAttribute('data-category');
      renderCategoryPostGrid(targetCategory);
      return;
    }

    const blogListingGrid = document.getElementById('blogPostsGrid');
    if (blogListingGrid) {
      renderBlogListing();
    }
  }

  // 6A. Single Post Page Renderer
  function renderSinglePost() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    const posts = window.BLOG_POSTS || [];

    let post = posts.find(p => p.slug === slug);
    if (!post && posts.length > 0) {
      post = posts[0];
    }

    if (!post) {
      const container = document.getElementById('singlePostContainer');
      if (container) container.innerHTML = '<p>Article not found.</p>';
      return;
    }

    document.title = `${post.title} | Webkar Studio Blog`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', post.excerpt);

    const breadcrumbCategory = document.getElementById('breadcrumbCategory');
    if (breadcrumbCategory) {
      const catObj = window.BLOG_CATEGORIES?.[post.category];
      breadcrumbCategory.textContent = catObj ? catObj.name : post.category;
      breadcrumbCategory.href = `${post.category}/index.html`;
    }

    const breadcrumbTitle = document.getElementById('breadcrumbTitle');
    if (breadcrumbTitle) breadcrumbTitle.textContent = post.title;

    const postTitle = document.getElementById('postTitle');
    if (postTitle) postTitle.textContent = post.title;

    const postDate = document.getElementById('postDate');
    if (postDate) postDate.textContent = formatDate(post.date);

    const postReadingTime = document.getElementById('postReadingTime');
    if (postReadingTime) postReadingTime.textContent = post.readingTime;

    const postAuthor = document.getElementById('postAuthor');
    if (postAuthor) postAuthor.textContent = post.author;

    const postImage = document.getElementById('postFeaturedImage');
    if (postImage) {
      postImage.src = resolveAsset(post.featuredImage);
      postImage.alt = post.title;
    }

    const contentEl = document.getElementById('postMainContent');
    if (contentEl) {
      contentEl.innerHTML = post.content;

      const headings = contentEl.querySelectorAll('h2');
      const tocList = document.getElementById('tocList');
      if (tocList && headings.length > 0) {
        tocList.innerHTML = '';
        headings.forEach((h2, idx) => {
          const anchorId = 'heading-' + idx;
          h2.id = anchorId;
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = '#' + anchorId;
          a.textContent = h2.textContent;
          li.appendChild(a);
          tocList.appendChild(li);
        });
      } else if (tocList) {
        const tocBox = document.getElementById('tocBox');
        if (tocBox) tocBox.style.display = 'none';
      }
    }

    const tagsContainer = document.getElementById('postTags');
    if (tagsContainer && post.tags) {
      tagsContainer.innerHTML = post.tags.map(t => `<span class="tag-badge">#${t}</span>`).join(' ');
    }

    const currentUrl = encodeURIComponent(window.location.href);
    const postTitleEnc = encodeURIComponent(post.title);

    const waShare = document.getElementById('shareWhatsApp');
    if (waShare) waShare.href = `https://api.whatsapp.com/send?text=${postTitleEnc}%20${currentUrl}`;

    const fbShare = document.getElementById('shareFacebook');
    if (fbShare) fbShare.href = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;

    const liShare = document.getElementById('shareLinkedIn');
    if (liShare) liShare.href = `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`;

    const xShare = document.getElementById('shareTwitter');
    if (xShare) xShare.href = `https://twitter.com/intent/tweet?text=${postTitleEnc}&url=${currentUrl}`;

    const relatedGrid = document.getElementById('relatedPostsGrid');
    if (relatedGrid) {
      const otherPosts = posts.filter(p => p.id !== post.id && (p.category === post.category || p.featured)).slice(0, 3);
      relatedGrid.innerHTML = otherPosts.map(p => createBlogCardHtml(p, '')).join('');
    }

    const schemaScript = document.getElementById('articleSchema');
    if (schemaScript) {
      const schemaData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "description": post.excerpt,
        "image": resolveAsset(post.featuredImage),
        "author": { "@type": "Organization", "name": "Webkar Studio" },
        "publisher": {
          "@type": "Organization",
          "name": "Webkar Studio (ebookcharm Web Services)",
          "logo": { "@type": "ImageObject", "url": "https://webkarstudio.in/images/logo.png" }
        },
        "datePublished": post.date,
        "dateModified": post.modifiedDate || post.date,
        "mainEntityOfPage": { "@type": "WebPage", "@id": post.canonicalUrl }
      };
      schemaScript.textContent = JSON.stringify(schemaData, null, 2);
    }
  }

  // 6B. Category Hub Page Renderer (with dynamic Subcategory pills)
  function renderCategoryPostGrid(categorySlug) {
    const grid = document.getElementById('categoryPostsGrid');
    if (!grid) return;

    const pathPrefix = grid.getAttribute('data-path-prefix') || '';
    const posts = window.BLOG_POSTS || [];
    const catObj = window.BLOG_CATEGORIES?.[categorySlug];
    const subcatFilterContainer = document.getElementById('subcategoryFilters');

    let activeSubcategory = '';

    // Build subcategory pills dynamically from BLOG_CATEGORIES
    if (subcatFilterContainer && catObj && catObj.subcategories) {
      let pillsHtml = `<button class="filter-btn active" data-subcategory="">All in ${catObj.name}</button>`;
      Object.keys(catObj.subcategories).forEach(subSlug => {
        pillsHtml += `<button class="filter-btn" data-subcategory="${subSlug}">${catObj.subcategories[subSlug]}</button>`;
      });
      subcatFilterContainer.innerHTML = pillsHtml;

      const pillButtons = subcatFilterContainer.querySelectorAll('.filter-btn');
      pillButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          pillButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          activeSubcategory = btn.getAttribute('data-subcategory') || '';
          updateGrid();
        });
      });
    }

    function updateGrid() {
      let filtered = posts.filter(p => p.category === categorySlug);
      if (activeSubcategory) {
        filtered = filtered.filter(p => p.subcategory === activeSubcategory);
      }

      if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 3rem; background:#fff; border-radius: 12px; border:1px solid #e2e8f0;">
          <h3>More articles coming soon!</h3>
          <p style="color:#64748b; margin-top:0.5rem;">Our team is currently writing in-depth guides for this niche. Check back shortly or browse all categories.</p>
          <a href="${pathPrefix}index.html" class="btn btn-primary btn-sm" style="margin-top:1rem;">View All Blog Posts</a>
        </div>`;
        return;
      }

      grid.innerHTML = filtered.map(p => createBlogCardHtml(p, pathPrefix)).join('');
    }

    updateGrid();
  }

  // 6C. Blog Listing Page Renderer
  function renderBlogListing() {
    const grid = document.getElementById('blogPostsGrid');
    const searchInput = document.getElementById('blogSearchInput');
    const featuredContainer = document.getElementById('featuredPostContainer');

    const posts = window.BLOG_POSTS || [];

    if (featuredContainer) {
      const featuredPost = posts.find(p => p.featured) || posts[0];
      if (featuredPost) {
        featuredContainer.innerHTML = `
          <div class="blog-card" style="display: grid; grid-template-columns: 1.2fr 1fr; border-color: var(--color-primary);">
            <img src="${resolveAsset(featuredPost.featuredImage)}" alt="${featuredPost.title}" class="blog-card-img" style="height: 100%; min-height: 280px;" loading="lazy">
            <div class="blog-card-body" style="padding: 2.25rem;">
              <div class="blog-card-meta">
                <span class="section-badge" style="margin: 0; font-size: 0.75rem;">⭐ Featured Guide</span>
                <span>•</span>
                <span>${featuredPost.readingTime}</span>
              </div>
              <h2 style="font-size: 1.45rem; margin: 0.75rem 0 1rem 0;">
                <a href="post.html?slug=${featuredPost.slug}">${featuredPost.title}</a>
              </h2>
              <p class="blog-card-excerpt">${featuredPost.excerpt}</p>
              <div style="margin-top: auto;">
                <a href="post.html?slug=${featuredPost.slug}" class="btn btn-primary btn-sm">Read Full Guide →</a>
              </div>
            </div>
          </div>
        `;
      }
    }

    let searchQuery = '';

    function updateList() {
      let results = posts;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        results = results.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
        );
      }

      if (results.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: #fff; border-radius: 12px;">
          <h3>No articles match your search</h3>
          <p style="color: #64748b;">Try searching for different keywords like 'WhatsApp', 'Pest Control', or 'Cost'.</p>
        </div>`;
      } else {
        grid.innerHTML = results.map(p => createBlogCardHtml(p, '')).join('');
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        updateList();
      });
    }

    updateList();
  }

  // Card HTML generator — pathPrefix = relative path to the /blog/ root folder
  function createBlogCardHtml(post, pathPrefix) {
    const prefix = pathPrefix || '';
    const postLink = `${prefix}post.html?slug=${post.slug}`;
    const catName = window.BLOG_CATEGORIES?.[post.category]?.name || post.category;

    return `
      <article class="blog-card">
        <img src="${resolveAsset(post.featuredImage)}" alt="${post.title}" class="blog-card-img" loading="lazy">
        <div class="blog-card-body">
          <div class="blog-card-meta">
            <span style="font-weight: 700; color: var(--color-primary);">${catName}</span>
            <span>•</span>
            <span>${post.readingTime}</span>
          </div>
          <h3 class="blog-card-title">
            <a href="${postLink}">${post.title}</a>
          </h3>
          <p class="blog-card-excerpt">${post.excerpt}</p>
          <div style="margin-top: auto; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 0.8rem; color: var(--color-gray-400);">${formatDate(post.date)}</span>
            <a href="${postLink}" style="font-size: 0.9rem; font-weight: 600; color: var(--color-primary);">Read More →</a>
          </div>
        </div>
      </article>
    `;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // ==========================================
  // 7. INTERACTIVE BEFORE / AFTER SLIDER
  // ==========================================
  function initInteractiveBeforeAfterSlider() {
    const container = document.getElementById('beforeAfterSlider');
    const rangeInput = document.getElementById('baRangeInput');
    const afterLayer = document.getElementById('baAfterLayer');
    const handleLine = document.getElementById('baHandleLine');

    if (!container || !rangeInput || !afterLayer || !handleLine) return;

    function updateSlider(val) {
      afterLayer.style.width = `${val}%`;
      handleLine.style.left = `${val}%`;
    }

    rangeInput.addEventListener('input', (e) => {
      updateSlider(e.target.value);
    });

    container.addEventListener('mousemove', (e) => {
      if (e.buttons === 1) {
        const rect = container.getBoundingClientRect();
        let posX = ((e.clientX - rect.left) / rect.width) * 100;
        posX = Math.max(0, Math.min(100, posX));
        rangeInput.value = posX;
        updateSlider(posX);
      }
    });

    updateSlider(50);
  }

  // ==========================================
  // 8. INTERACTIVE COST & FEATURE CALCULATOR
  // ==========================================
  function initCostCalculator() {
    const calcContainer = document.getElementById('cost-calculator');
    if (!calcContainer) return;

    const baseRadios = document.querySelectorAll('input[name="calcBase"]');
    const addonCheckboxes = document.querySelectorAll('input[name="calcAddon"]');
    const baseLabelEl = document.getElementById('calcBaseLabel');
    const basePriceEl = document.getElementById('calcBasePrice');
    const addonsListEl = document.getElementById('calcAddonsList');
    const finalPriceEl = document.getElementById('calcFinalPrice');
    const whatsappCtaEl = document.getElementById('calcWhatsAppCta');

    function calculateTotal() {
      let selectedBaseRadio = document.querySelector('input[name="calcBase"]:checked');
      let baseVal = parseInt(selectedBaseRadio?.value || '8000', 10);
      let baseName = selectedBaseRadio?.getAttribute('data-name') || 'Basic Single-Page';

      baseRadios.forEach(r => {
        const card = r.closest('.calc-radio-card');
        if (card) {
          if (r.checked) card.classList.add('active');
          else card.classList.remove('active');
        }
      });

      if (baseLabelEl) baseLabelEl.textContent = baseName;
      if (basePriceEl) basePriceEl.textContent = `₹${baseVal.toLocaleString('en-IN')}`;

      let addonsTotal = 0;
      let selectedAddonNames = [];

      addonCheckboxes.forEach(cb => {
        const item = cb.closest('.calc-checkbox-item');
        if (cb.checked) {
          if (item) item.classList.add('active');
          const val = parseInt(cb.value, 10);
          const name = cb.getAttribute('data-name');
          addonsTotal += val;
          selectedAddonNames.push({ name, val });
        } else {
          if (item) item.classList.remove('active');
        }
      });

      if (addonsListEl) {
        if (selectedAddonNames.length === 0) {
          addonsListEl.innerHTML = '<em style="color: rgba(255,255,255,0.4);">No add-ons selected</em>';
        } else {
          addonsListEl.innerHTML = selectedAddonNames.map(a => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #cbd5e1;">
              <span>• ${a.name}</span>
              <span style="font-weight: 600;">+₹${a.val.toLocaleString('en-IN')}</span>
            </div>
          `).join('');
        }
      }

      const totalVal = baseVal + addonsTotal;
      if (finalPriceEl) {
        finalPriceEl.textContent = `₹${totalVal.toLocaleString('en-IN')}`;
      }

      if (whatsappCtaEl) {
        let addonSummaryText = selectedAddonNames.length > 0
          ? `\n*Selected Add-ons:* ${selectedAddonNames.map(a => a.name).join(', ')}`
          : '';
        const msg = `*Website Estimate Request - Webkar Studio*\n\n` +
                    `*Base Tier:* ${baseName} (₹${baseVal.toLocaleString('en-IN')})` +
                    addonSummaryText + `\n` +
                    `*Estimated Total:* ₹${totalVal.toLocaleString('en-IN')} (One-time, zero server costs)\n\n` +
                    `Please share the next steps and sample designs for my business!`;
        whatsappCtaEl.href = getWhatsAppUrl(msg);
      }
    }

    baseRadios.forEach(r => r.addEventListener('change', calculateTotal));
    addonCheckboxes.forEach(cb => cb.addEventListener('change', calculateTotal));

    calculateTotal();
  }

  // ==========================================
  // 9. LIVE DEMO MODAL PREVIEW & DEVICE SWITCHER
  // ==========================================
  function initDemoModalPreview() {
    const modalBackdrop = document.getElementById('demoModalBackdrop');
    const closeBtn = document.getElementById('closeDemoModalBtn');
    const previewBtns = document.querySelectorAll('.preview-demo-btn');
    const deviceBtns = document.querySelectorAll('.demo-device-switcher .device-btn');
    const frameContainer = document.getElementById('demoFrameContainer');

    if (!modalBackdrop) return;

    const modalTitle = document.getElementById('modalDemoTitle');
    const clientBrand = document.getElementById('modalClientBrandName');
    const modalImg = document.getElementById('modalDemoImg');
    const modalSub = document.getElementById('modalDemoSubtitle');
    const modalHeading = document.getElementById('modalDemoHeroHeading');
    const modalDesc = document.getElementById('modalDemoDescription');
    const browserUrl = document.getElementById('modalBrowserUrl');
    const orderBtn = document.getElementById('modalOrderWhatsAppBtn');

    function openModal(btn) {
      const demoId = btn.getAttribute('data-demo-id') || 'preview';
      const title = btn.getAttribute('data-demo-title') || 'Demo Website';
      const badge = btn.getAttribute('data-demo-badge') || 'Concept Demo';
      const img = btn.getAttribute('data-demo-img') || '';
      const desc = btn.getAttribute('data-demo-desc') || '';

      if (modalTitle) modalTitle.textContent = `${title} Demo`;
      if (clientBrand) clientBrand.textContent = title;
      if (modalSub) modalSub.textContent = badge;
      if (modalHeading) modalHeading.textContent = `High-Converting ${badge} Web Engine`;
      if (modalDesc) modalDesc.textContent = desc;
      if (modalImg && img) modalImg.src = img;
      if (browserUrl) browserUrl.textContent = `https://demo.webkarstudio.in/${demoId}`;

      if (orderBtn) {
        const orderMsg = `Hi Webkar Studio, I saw the *${title}* demo website and want to build a similar website for my business!`;
        orderBtn.href = getWhatsAppUrl(orderMsg);
      }

      modalBackdrop.classList.add('show');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modalBackdrop.classList.remove('show');
      document.body.style.overflow = '';
    }

    previewBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(btn);
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalBackdrop.classList.contains('show')) {
        closeModal();
      }
    });

    if (deviceBtns.length && frameContainer) {
      deviceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          deviceBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const device = btn.getAttribute('data-device');
          frameContainer.className = `demo-frame-container device-${device}`;
        });
      });
    }
  }

  // ==========================================
  // 10. SOCIAL PROOF LIVE ACTIVITY TOASTS
  // ==========================================
  function initLiveActivityToasts() {
    const activities = [
      { name: 'Dr. Joshi', city: 'Nashik', action: 'requested a Dental Clinic website demo' },
      { name: 'Rajesh G.', city: 'Pune (Kothrud)', action: 'asked for the Pest Control package quote' },
      { name: 'Aura Unisex Salon', city: 'Kolhapur', action: 'booked a Standard Website build' },
      { name: 'Prof. Anil K.', city: 'Chhatrapati Sambhajinagar', action: 'previewed the Coaching Classes demo' },
      { name: 'Vistara Decor', city: 'PCMC / Ravet', action: 'requested an Interior Architecture portfolio' },
      { name: 'Surya Power', city: 'Nagpur', action: 'ordered a Rooftop Solar EPC landing page' }
    ];

    let currentIndex = 0;

    function showRandomActivity() {
      const item = activities[currentIndex % activities.length];
      currentIndex++;

      let toastContainer = document.getElementById('liveActivityToast');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'liveActivityToast';
        toastContainer.className = 'live-activity-toast';
        document.body.appendChild(toastContainer);
      }

      toastContainer.innerHTML = `
        <div class="activity-avatar">💬</div>
        <div class="activity-text">
          <div class="activity-name">${item.name} from ${item.city}</div>
          <div class="activity-action">${item.action} • Just now</div>
        </div>
      `;

      toastContainer.classList.add('show');

      setTimeout(() => {
        toastContainer.classList.remove('show');
      }, 5000);
    }

    setTimeout(() => {
      showRandomActivity();
      setInterval(showRandomActivity, 24000);
    }, 4000);
  }

})();
