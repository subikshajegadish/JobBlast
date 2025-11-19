// content.js
// Job Application Tracker – robust job-page-only detection

(function () {
  'use strict';

  console.log('[Job Tracker] Content script loaded');

  // ----- Global state -----
  let latestJobInfo = {
    job_title: '',
    company: '',
    location: '',
  };

  let lastUrl = location.href;
  let detectTimeoutId = null;

  // Small helper for safe text extraction
  function getCleanText(el) {
    if (!el) return '';
    const text = el.textContent || el.innerText || '';
    return text.replace(/\s+/g, ' ').trim();
  }

  // Helper: try selectors in order, return first non-empty text
  function trySelectors(selectors, root = document) {
    for (const sel of selectors) {
      try {
        const el = root.querySelector(sel);
        if (el) {
          const text = getCleanText(el);
          if (text) return text;
        }
      } catch (e) {
        // ignore bad selector, keep going
      }
    }
    return '';
  }

  // Extract location from messy text (e.g., "San Francisco, CA · Hybrid · Full-time")
  function extractLocationFromText(text) {
    if (!text) return '';

    // Remove common trailing job tags
    let cleaned = text
      .replace(/·/g, ' ')
      .replace(/\b(Remote|Hybrid|On[- ]site|Full[- ]time|Part[- ]time|Contract|Internship)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    // If it's shortish already, use it
    if (cleaned.length <= 60) return cleaned;

    // Try to capture something that looks like "City, ST" or "City, Country"
    const match = cleaned.match(/[A-Z][a-zA-Z.\s'-]+,\s*[A-Z]{2,}|[A-Z][a-zA-Z.\s'-]+/);
    return match ? match[0].trim() : cleaned;
  }

  // Determine if this URL is a job-detail page (NOT listing)
  function isJobDetailPage(hostname, pathname) {
    hostname = hostname || window.location.hostname;
    pathname = pathname || window.location.pathname;

    // LinkedIn job view
    if (hostname.includes('linkedin.com') && pathname.includes('/jobs/view/')) {
      return true;
    }

    // Indeed job view
    if (hostname.includes('indeed.') && (pathname.includes('/viewjob') || pathname.includes('/rc/clk'))) {
      return true;
    }

    // Greenhouse
    if (hostname.includes('greenhouse.io') && /\/jobs\/\d+/.test(pathname)) {
      return true;
    }

    // Lever
    if (hostname.includes('lever.co') && pathname.includes('/jobs/')) {
      return true;
    }

    // Workday
    if (hostname.includes('myworkdayjobs.com') || hostname.includes('wd') && pathname.includes('job')) {
      return true;
    }

    // Ashby
    if (hostname.includes('ashbyhq.com') && /\/job\/\w+/.test(pathname)) {
      return true;
    }

    // SmartRecruiters
    if (hostname.includes('smartrecruiters.com') && pathname.includes('/job/')) {
      return true;
    }

    // iCIMS
    if (hostname.includes('icims.com') && /jobs\/\d+/.test(pathname)) {
      return true;
    }

    // Taleo
    if (hostname.includes('taleo.net') && /jobdetail\./.test(pathname)) {
      return true;
    }

    // Fallback: look for "apply" button + big heading
    const h1 = document.querySelector('main h1, h1.job-title, h1[class*="title"]');
    const applyBtn = document.querySelector(
      'button[type="submit"][id*="apply"], button[id*="apply"], a[id*="apply"], a[href*="apply"]'
    );
    if (h1 && applyBtn) {
      return true;
    }

    return false;
  }

  // ----- LinkedIn job detection -----
  function detectLinkedInJob() {
    console.log('[Job Tracker] Detecting LinkedIn job...');

    // LinkedIn job pages have the unified top card; we focus on h1 and surrounding
    const titleSelectors = [
      'h1.job-details-jobs-unified-top-card__job-title',
      'h1.jobs-unified-top-card__job-title',
      'h1[data-test-id="job-details-jobs-unified-top-card__job-title"]',
      'main h1',
      'div.jobs-unified-top-card h1',
      'div.jobs-details-top-card__job-title--container h1',
      'h1[class*="job-title"]',
    ];

    const companySelectors = [
      'a.job-details-jobs-unified-top-card__company-name',
      '.job-details-jobs-unified-top-card__company-name a',
      '.jobs-unified-top-card__company-name a',
      '[data-test-id="job-details-jobs-unified-top-card__company-name"]',
      'a[href*="/company/"] span',
      'a[href*="/company/"]',
      'span.jobs-unified-top-card__company-name',
      'div[class*="company-name"]',
    ];

    const locationSelectors = [
      '[data-test-id="job-details-jobs-unified-top-card__primary-description"]',
      '.jobs-unified-top-card__primary-description',
      '.jobs-unified-top-card__bullet',
      'span.jobs-unified-top-card__workplace-type',
      'span.jobs-unified-top-card__location',
      'li.jobs-unified-top-card__job-insight span',
      'span[class*="job-location"]',
      'div[class*="job-location"]',
    ];

    const job_title = trySelectors(titleSelectors);
    const company = trySelectors(companySelectors);
    const rawLocation = trySelectors(locationSelectors);
    const location = extractLocationFromText(rawLocation);

    return { job_title, company, location };
  }

  // ----- Indeed job detection -----
  function detectIndeedJob() {
    console.log('[Job Tracker] Detecting Indeed job...');

    const titleSelectors = [
      'h1[data-testid="jobTitle"]',
      'h1[data-testid="job-title"]',
      'h1.jobsearch-JobInfoHeader-title',
      'h1.jobTitle',
      'h1[class*="jobTitle"]',
      'h1',
    ];

    const companySelectors = [
      '[data-testid="inlineHeader-companyName"]',
      '.jobsearch-CompanyInfoWithoutHeaderImage div[data-company-name]',
      '.jobsearch-CompanyInfoWithoutHeaderImage .jobsearch-InlineCompanyRating div:first-child',
      '.jobsearch-InlineCompanyRating div:first-child',
      '.jobsearch-CompanyInfoContainer a',
      '.companyName',
    ];

    const locationSelectors = [
      '[data-testid="inlineHeader-companyLocation"]',
      '[data-testid="jobLocation"]',
      '.jobsearch-CompanyInfoWithoutHeaderImage div:nth-child(2)',
      '.jobsearch-JobInfoHeader-subtitle > div:last-child',
      '.jobsearch-CompanyInfoWithReview div:nth-child(2)',
    ];

    const job_title = trySelectors(titleSelectors);
    const company = trySelectors(companySelectors);
    const rawLocation = trySelectors(locationSelectors);
    const location = extractLocationFromText(rawLocation);

    return { job_title, company, location };
  }

  // ----- Generic ATS / company site job detection -----
  function detectGenericJob() {
    console.log('[Job Tracker] Detecting generic job page...');

    let job_title = '';
    let company = '';
    let location = '';

    // 1) Try obvious heading inside main/content
    const container =
      document.querySelector('main') ||
      document.querySelector('[role="main"]') ||
      document.querySelector('#content') ||
      document.body;

    job_title =
      trySelectors(
        [
          'main h1',
          'h1[data-automation-id="jobPostingHeader"]',
          'h1[data-testid="jobTitle"]',
          'h1[itemprop="title"]',
          'h1[class*="job-title"]',
          'h1[class*="jobTitle"]',
          'h1',
        ],
        container
      ) || '';

    // 2) Try microdata / meta tags for title
    if (!job_title) {
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle && ogTitle.content) {
        // Often "Senior X - Company - Location" or "Company – Role"
        const parts = ogTitle.content.split(/[-–|•·]/).map((p) => p.trim()).filter(Boolean);
        if (parts.length === 1) {
          job_title = parts[0];
        } else if (parts.length >= 2) {
          // Heuristic: choose the segment with "Engineer / Manager / Intern / Developer / etc."
          const jobKeywords = /(engineer|developer|manager|designer|analyst|intern|scientist|lead|architect|consultant|specialist)/i;
          const titleCandidate = parts.find((p) => jobKeywords.test(p));
          job_title = titleCandidate || parts[0];
        }
      }
    }

    // 3) Company detection
    company =
      trySelectors(
        [
          '[data-automation-id="company"]',
          '[itemprop="hiringOrganization"] [itemprop="name"]',
          '[itemprop="hiringOrganization"]',
          '.company span',
          '.company',
          'a.company',
          'header [class*="company"]',
          'header [class*="employer"]',
        ],
        container
      ) || '';

    if (!company) {
      const orgMeta =
        document.querySelector('meta[property="og:site_name"]') ||
        document.querySelector('meta[name="twitter:site"]');
      if (orgMeta && orgMeta.content) {
        company = orgMeta.content.replace(/^@/, '').trim();
      }
    }

    // 4) Location detection
    const rawLocation =
      trySelectors(
        [
          '[data-automation-id="jobLocation"]',
          '[data-testid="job-location"]',
          '[itemprop="jobLocation"] [itemprop="addressLocality"]',
          '[itemprop="jobLocation"]',
          '.job-location',
          '.location',
          '.jobLocation',
          'li[class*="location"]',
        ],
        container
      ) || '';

    location = extractLocationFromText(rawLocation);

    return { job_title, company, location };
  }

  // ----- Main detection dispatcher -----
  function detectJobInfoOnce() {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    console.log('[Job Tracker] detectJobInfoOnce on', hostname, pathname);

    if (!isJobDetailPage(hostname, pathname)) {
      console.log('[Job Tracker] Not detected as job detail page; returning empty info');
      latestJobInfo = {
        job_title: '',
        company: '',
        location: '',
      };
      return latestJobInfo;
    }

    let info;
    if (hostname.includes('linkedin.com')) {
      info = detectLinkedInJob();
    } else if (hostname.includes('indeed.')) {
      info = detectIndeedJob();
    } else {
      info = detectGenericJob();
    }

    // Update global cache
    latestJobInfo = {
      job_title: info.job_title || '',
      company: info.company || '',
      location: info.location || '',
    };

    console.log('[Job Tracker] Updated latestJobInfo:', latestJobInfo);
    return latestJobInfo;
  }

  // Debounced detect (for MutationObserver + URL changes)
  function scheduleDetect(delay = 500) {
    if (detectTimeoutId) {
      clearTimeout(detectTimeoutId);
    }
    detectTimeoutId = setTimeout(() => {
      detectTimeoutId = null;
      detectJobInfoOnce();
    }, delay);
  }

  // Keep latestJobInfo in sync with SPA navigation and DOM changes
  function setupObservers() {
    // URL change (SPA / pushState)
    const urlObserver = new MutationObserver(() => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        console.log('[Job Tracker] URL changed:', lastUrl, '→', currentUrl);
        lastUrl = currentUrl;
        scheduleDetect(700); // allow new page content to load
      }
    });

    urlObserver.observe(document, {
      subtree: true,
      childList: true,
    });

    // DOM content changes (job card fully renders later)
    const domObserver = new MutationObserver((mutations) => {
      // Lightweight: just schedule detection, debounce handles spam
      scheduleDetect(800);
    });

    domObserver.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });

    // Initial detection after load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        scheduleDetect(800);
      });
    } else {
      scheduleDetect(800);
    }

    console.log('[Job Tracker] Observers set up');
  }

  setupObservers();

  // Wait for a bit for job info to become available (used by popup)
  function waitForJobInfo(maxWaitMs = 1500, intervalMs = 250) {
    return new Promise((resolve) => {
      const start = Date.now();

      function check() {
        const hasTitleOrCompany =
          (latestJobInfo.job_title && latestJobInfo.job_title.length > 0) ||
          (latestJobInfo.company && latestJobInfo.company.length > 0);

        if (hasTitleOrCompany || Date.now() - start >= maxWaitMs) {
          resolve(latestJobInfo);
        } else {
          setTimeout(check, intervalMs);
        }
      }

      check();
    });
  }

  // ----- Message handler for popup -----
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request && request.action === 'getJobInfo') {
      console.log('[Job Tracker] Received getJobInfo request from popup');

      // Make sure we try at least once right now
      detectJobInfoOnce();

      // Then wait briefly for more stable info (if DOM still loading)
      waitForJobInfo().then((info) => {
        console.log('[Job Tracker] Sending jobInfo to popup:', info);
        sendResponse({ jobInfo: info });
      });

      // Indicate async response
      return true;
    }

    return false;
  });
})();
