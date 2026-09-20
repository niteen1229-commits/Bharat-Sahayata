/**
 * BharatSahayata - Core Application Logic & Matching Engine
 * 
 * Implements a weighted 100-point matching algorithm:
 * - Occupation: 25 points
 * - Purpose: 25 points
 * - Income: 20 points
 * - Age: 10 points
 * - State: 10 points
 * - Category: 10 points
 * 
 * Maximum Score = 100.
 * Threshold: Schemes with score >= 40 are recommended.
 * Labels:
 * - 70–100: "Strong Match"
 * - 40–69: "Potential Match"
 * - Below 40: Excluded
 */

(function () {
  "use strict";

  // State management
  let currentUserProfile = null;
  let allMatchedSchemes = [];
  let activeFilterCategory = "All";
  let activeSearchQuery = "";
  let activeSortOption = "highest-match";

  /**
   * Helper: Normalize text by lowercasing, replacing unicode dashes with hyphens,
   * collapsing whitespace, and trimming.
   */
  function cleanText(str) {
    if (str === undefined || str === null) return "";
    return String(str)
      .toLowerCase()
      .replace(/[\u2013\u2014]/g, "-") // Convert en-dash & em-dash to standard hyphen
      .replace(/₹/g, "")              // Remove rupee symbol for clean comparison
      .replace(/\s+/g, " ")           // Collapse multiple spaces
      .trim();
  }

  /**
   * Helper: Check if a list contains a target value with tolerance for
   * capitalization, punctuation, and whitespace.
   */
  function listContains(list, target) {
    if (!Array.isArray(list) || list.length === 0) return false;
    const cleanTarget = cleanText(target);
    return list.some(item => cleanText(item) === cleanTarget);
  }

  /**
   * Weighted Matching Algorithm
   * @param {Object} user - User profile submitted from the form
   * @param {Object} scheme - Scheme data record
   * @returns {Object} { score, matchingReasons, potentialMismatches, matchLabel }
   */
  function calculateMatch(user, scheme) {
    let score = 0;
    const matchingReasons = [];
    const potentialMismatches = [];

    // --- 1. OCCUPATION MATCH (25 Points) ---
    const userOccClean = cleanText(user.occupation);
    const schemeOccsClean = (scheme.occupations || []).map(cleanText);
    let occScore = 0;

    if (
      schemeOccsClean.length === 0 ||
      schemeOccsClean.includes("all") ||
      schemeOccsClean.includes("any") ||
      schemeOccsClean.includes("all occupations")
    ) {
      occScore = 25;
      matchingReasons.push(`Open to applicants across all occupations including ${user.occupation}`);
    } else if (schemeOccsClean.includes(userOccClean)) {
      occScore = 25;
      matchingReasons.push(`Occupation matches designated target group (${user.occupation})`);
    } else {
      // Related occupation affinity
      const isBizOcc = ["entrepreneur", "business owner", "self employed"].includes(userOccClean) &&
        schemeOccsClean.some(o => ["entrepreneur", "business owner", "self employed"].includes(o));
      const isArtisanOcc = ["artisan / craftsperson", "artisan", "craftsperson", "self employed"].includes(userOccClean) &&
        schemeOccsClean.some(o => ["artisan / craftsperson", "artisan", "craftsperson", "self employed"].includes(o));
      const isStudentOcc = ["student"].includes(userOccClean) &&
        schemeOccsClean.some(o => ["student", "youth", "other"].includes(o));

      if (isBizOcc) {
        occScore = 20;
        matchingReasons.push(`Occupation (${user.occupation}) closely aligns with eligible entrepreneurial roles`);
      } else if (isArtisanOcc) {
        occScore = 20;
        matchingReasons.push(`Occupation (${user.occupation}) aligns with skilled traditional trades & self-employment`);
      } else if (isStudentOcc) {
        occScore = 18;
        matchingReasons.push(`Occupation (${user.occupation}) aligns with applicant youth eligibility`);
      } else if (schemeOccsClean.includes("other")) {
        occScore = 15;
        matchingReasons.push(`Open to applicants across diverse professions including ${user.occupation}`);
      } else {
        occScore = 0;
        potentialMismatches.push(`Targeted primarily towards: ${scheme.occupations.slice(0, 3).join(", ")}`);
      }
    }
    score += occScore;

    // --- 2. PURPOSE MATCH (25 Points) ---
    const userPurposeClean = cleanText(user.purpose);
    const schemePurposesClean = (scheme.purposes || []).map(cleanText);
    let purposeScore = 0;

    if (
      schemePurposesClean.length === 0 ||
      schemePurposesClean.includes("all") ||
      schemePurposesClean.includes("any")
    ) {
      purposeScore = 25;
      matchingReasons.push(`Financial assistance can be utilized for ${user.purpose}`);
    } else if (schemePurposesClean.includes(userPurposeClean)) {
      purposeScore = 25;
      matchingReasons.push(`Direct financial assistance available for ${user.purpose}`);
    } else {
      // Related purpose affinity
      const isBizPurpose = ["start a business", "expand a business", "self employment", "equipment purchase"].includes(userPurposeClean) &&
        schemePurposesClean.some(p => ["start a business", "expand a business", "self employment"].includes(p));
      const isEduPurpose = ["education", "skill development"].includes(userPurposeClean) &&
        schemePurposesClean.some(p => ["education", "skill development"].includes(p));
      const isAgriEquip = ["equipment purchase"].includes(userPurposeClean) &&
        schemePurposesClean.some(p => ["agriculture"].includes(p));

      if (isBizPurpose) {
        purposeScore = 20;
        matchingReasons.push(`Financial assistance supports related enterprise needs (${user.purpose})`);
      } else if (isEduPurpose) {
        purposeScore = 20;
        matchingReasons.push(`Academic and technical training components support ${user.purpose}`);
      } else if (isAgriEquip) {
        purposeScore = 18;
        matchingReasons.push(`Supports machinery and asset acquisition for farming/production`);
      } else if (schemePurposesClean.includes("other")) {
        purposeScore = 15;
        matchingReasons.push(`Provides versatile assistance adaptable to ${user.purpose}`);
      } else {
        purposeScore = 0;
        potentialMismatches.push(`Assistance designated for: ${scheme.purposes.slice(0, 3).join(", ")}`);
      }
    }
    score += purposeScore;

    // --- 3. INCOME MATCH (20 Points) ---
    const userIncomeClean = cleanText(user.income);
    const schemeTiersClean = (scheme.incomeTiers || []).map(cleanText);
    const incomeLimitClean = cleanText(scheme.incomeLimit || "");
    let incomeScore = 0;

    // Check if scheme has no income restriction
    const hasNoIncomeCap = (
      schemeTiersClean.length === 0 ||
      schemeTiersClean.includes("all") ||
      schemeTiersClean.length >= 5 ||
      incomeLimitClean.includes("no formal") ||
      incomeLimitClean.includes("no limit") ||
      incomeLimitClean.includes("no upper") ||
      incomeLimitClean.includes("open") ||
      incomeLimitClean.includes("none")
    );

    if (hasNoIncomeCap) {
      incomeScore = 20;
      matchingReasons.push("No strict upper income ceiling; accessible across income groups");
    } else if (schemeTiersClean.includes(userIncomeClean)) {
      incomeScore = 20;
      matchingReasons.push(`Annual family income (${user.income}) satisfies scheme eligibility`);
    } else {
      // If user has lower income, welfare priority applies
      if (userIncomeClean.includes("below 1 lakh") || userIncomeClean.includes("1-3 lakh")) {
        incomeScore = 16;
        matchingReasons.push(`Priority welfare allocation for lower income bracket (${user.income})`);
      } else {
        incomeScore = 10;
        potentialMismatches.push(`Scheme primarily focuses on: ${scheme.incomeLimit || "specified income groups"}`);
      }
    }
    score += incomeScore;

    // --- 4. AGE CRITERIA (10 Points) ---
    let ageScore = 0;
    const age = parseInt(user.age, 10);
    const minAge = typeof scheme.minAge === "number" ? scheme.minAge : 0;
    const maxAge = typeof scheme.maxAge === "number" ? scheme.maxAge : 120;

    if (!scheme.minAge && !scheme.maxAge) {
      ageScore = 10;
      matchingReasons.push("No specific age restrictions");
    } else if (!isNaN(age)) {
      if (age >= minAge && age <= maxAge) {
        ageScore = 10;
        matchingReasons.push(`Age (${age} yrs) complies with required range (${minAge}–${maxAge} yrs)`);
      } else if (Math.abs(age - minAge) <= 3 || Math.abs(age - maxAge) <= 3) {
        ageScore = 6;
        potentialMismatches.push(`Age (${age} yrs) is near boundary limits (${minAge}–${maxAge} yrs)`);
      } else {
        ageScore = 3;
        potentialMismatches.push(`Typical eligible age bracket is ${minAge}–${maxAge} years`);
      }
    } else {
      ageScore = 10;
    }
    score += ageScore;

    // --- 5. STATE APPLICABILITY (10 Points) ---
    let stateScore = 0;
    const userStateClean = cleanText(user.state);
    const schemeStatesClean = (scheme.states || []).map(cleanText);

    const isPanIndia = (
      schemeStatesClean.length === 0 ||
      schemeStatesClean.includes("all india") ||
      schemeStatesClean.includes("all states") ||
      schemeStatesClean.includes("all") ||
      schemeStatesClean.includes("national") ||
      schemeStatesClean.includes("any state") ||
      userStateClean === "all india" ||
      userStateClean === "any state"
    );

    if (isPanIndia || schemeStatesClean.includes(userStateClean)) {
      stateScore = 10;
      matchingReasons.push(`Applicable across Indian States & UTs including ${user.state}`);
    } else {
      stateScore = 0;
      potentialMismatches.push(`Currently available only in: ${scheme.states.join(", ")}`);
    }
    score += stateScore;

    // --- 6. SOCIAL CATEGORY (10 Points) ---
    let catScore = 0;
    const userCatClean = cleanText(user.category);
    const schemeCatsClean = (scheme.categories || []).map(cleanText);

    const isUniversalCategory = (
      schemeCatsClean.length === 0 ||
      schemeCatsClean.includes("all") ||
      schemeCatsClean.includes("general") ||
      userCatClean === "prefer not to say" ||
      userCatClean === "other"
    );

    if (scheme.id === "stand-up-india") {
      if (["sc", "st"].includes(userCatClean)) {
        catScore = 10;
        matchingReasons.push(`Designated priority beneficiary under Stand-Up India (${user.category})`);
      } else {
        catScore = 6;
        potentialMismatches.push("Scheme provides affirmative priority to SC/ST or Women entrepreneurs");
      }
    } else if (isUniversalCategory || schemeCatsClean.includes(userCatClean)) {
      catScore = 10;
      matchingReasons.push(`Open to applicants under ${user.category} category`);
    } else {
      catScore = 6;
      potentialMismatches.push("Special reservation guidelines or quotas apply");
    }
    score += catScore;

    // Clamp score to 100
    score = Math.min(100, Math.max(0, Math.round(score)));

    // Categorization based on threshold >= 40
    let matchLabel = "";
    if (score >= 70) {
      matchLabel = "Strong Match";
    } else if (score >= 40) {
      matchLabel = "Potential Match";
    } else {
      matchLabel = "Low Match";
    }

    return {
      score,
      matchingReasons,
      potentialMismatches,
      matchLabel
    };
  }

  // Support module export for Node / test runners
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { calculateMatch, cleanText, listContains };
  }

  // Browser UI Execution
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  document.addEventListener("DOMContentLoaded", () => {
    initApp();
  });

  function initApp() {
    // DOM Elements
    const mainHeader = document.getElementById("main-header");
    const finderForm = document.getElementById("scheme-finder-form");
    const heroCta = document.getElementById("hero-find-btn");
    const heroAboutBtn = document.getElementById("hero-about-btn");
    const loadingState = document.getElementById("loading-state");
    const resultsSection = document.getElementById("results-section");
    const schemesGrid = document.getElementById("schemes-grid");
    const emptyState = document.getElementById("empty-state");
    const resultsCountEl = document.getElementById("results-count");
    const searchInput = document.getElementById("scheme-search-input");
    const sortSelect = document.getElementById("scheme-sort-select");
    const filterPills = document.querySelectorAll(".filter-pill");
    const modifyDetailsBtn = document.getElementById("modify-details-btn");

    // Modal Elements
    const schemeModal = document.getElementById("scheme-modal");
    const modalCloseBtn = document.getElementById("modal-close-btn");
    const aboutModal = document.getElementById("about-modal");
    const aboutNavBtn = document.getElementById("nav-about-btn");
    const aboutModalCloseBtn = document.getElementById("about-modal-close-btn");
    const compareModal = document.getElementById("compare-modal");

    // Navbar scroll effect
    if (mainHeader) {
      const handleScroll = () => {
        if (window.scrollY > 20) {
          mainHeader.classList.add("scrolled");
        } else {
          mainHeader.classList.remove("scrolled");
        }
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
    }

    // Scroll reveal observer
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
          }
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });

      document.querySelectorAll(".reveal-item, .finder-card, .controls-bar, .results-header-block").forEach(el => {
        observer.observe(el);
      });
    }

    // Smooth scroll for Hero CTAs
    if (heroCta) {
      heroCta.addEventListener("click", (e) => {
        e.preventDefault();
        scrollToElement(document.getElementById("finder-card"));
        focusFirstFormField();
      });
    }

    if (heroAboutBtn && aboutModal) {
      heroAboutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openModal(aboutModal);
      });
    }

    const navFindBtn = document.getElementById("nav-find-btn");
    if (navFindBtn) {
      navFindBtn.addEventListener("click", (e) => {
        e.preventDefault();
        scrollToElement(document.getElementById("finder-card"));
        focusFirstFormField();
      });
    }

    const navHomeBtn = document.getElementById("nav-home-btn");
    if (navHomeBtn) {
      navHomeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    if (modifyDetailsBtn) {
      modifyDetailsBtn.addEventListener("click", () => {
        scrollToElement(document.getElementById("finder-card"));
        focusFirstFormField();
      });
    }

    // About Modal Handlers
    if (aboutNavBtn && aboutModal) {
      aboutNavBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openModal(aboutModal);
      });
    }
    if (aboutModalCloseBtn && aboutModal) {
      aboutModalCloseBtn.addEventListener("click", () => {
        closeModal(aboutModal);
      });
    }

    // Details Modal Close Handler
    if (modalCloseBtn && schemeModal) {
      modalCloseBtn.addEventListener("click", () => {
        closeModal(schemeModal);
      });
    }

    // Close on backdrop click
    [schemeModal, aboutModal, compareModal].forEach(modal => {
      if (!modal) return;
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (schemeModal && schemeModal.classList.contains("active")) {
          closeModal(schemeModal);
        }
        if (aboutModal && aboutModal.classList.contains("active")) {
          closeModal(aboutModal);
        }
        if (compareModal && compareModal.classList.contains("active")) {
          closeModal(compareModal);
        }
      }
    });

    // Form Submission
    if (finderForm) {
      finderForm.addEventListener("submit", (e) => {
        e.preventDefault();
        handleFormSubmit();
      });
    }

    // Search and Filter controls
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        activeSearchQuery = cleanText(e.target.value);
        renderFilteredSchemes();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        activeSortOption = e.target.value;
        renderFilteredSchemes();
      });
    }

    filterPills.forEach(pill => {
      pill.addEventListener("click", () => {
        filterPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        activeFilterCategory = pill.getAttribute("data-category") || "All";
        renderFilteredSchemes();
      });
    });

    function focusFirstFormField() {
      const ageInput = document.getElementById("user-age");
      if (ageInput) {
        setTimeout(() => ageInput.focus(), 350);
      }
    }

    function scrollToElement(elem) {
      if (!elem) return;
      const navOffset = 90;
      const elementPosition = elem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }

    /**
     * Validate and process form input
     */
    function handleFormSubmit() {
      clearFormErrors();

      const ageInput = document.getElementById("user-age");
      const stateSelect = document.getElementById("user-state");
      const occSelect = document.getElementById("user-occupation");
      const incSelect = document.getElementById("user-income");
      const purposeSelect = document.getElementById("user-purpose");
      const catSelect = document.getElementById("user-category");

      let isValid = true;

      // Age validation
      const ageVal = parseInt(ageInput.value, 10);
      if (isNaN(ageVal) || ageVal < 15 || ageVal > 100) {
        showFieldError(ageInput, "Please enter a valid age between 15 and 100.");
        isValid = false;
      }

      // Dropdown validation
      if (!stateSelect.value) {
        showFieldError(stateSelect, "Please select your state or union territory.");
        isValid = false;
      }
      if (!occSelect.value) {
        showFieldError(occSelect, "Please choose your current occupation.");
        isValid = false;
      }
      if (!incSelect.value) {
        showFieldError(incSelect, "Please choose your annual family income bracket.");
        isValid = false;
      }
      if (!purposeSelect.value) {
        showFieldError(purposeSelect, "Please select the main purpose of assistance.");
        isValid = false;
      }
      if (!catSelect.value) {
        showFieldError(catSelect, "Please select your social category.");
        isValid = false;
      }

      if (!isValid) {
        const firstError = document.querySelector(".form-group.has-error");
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      // Collect user profile
      currentUserProfile = {
        age: ageVal,
        state: stateSelect.value,
        occupation: occSelect.value,
        income: incSelect.value,
        purpose: purposeSelect.value,
        category: catSelect.value
      };

      // Show brief responsive loading state
      if (loadingState) {
        loadingState.classList.remove("hidden");
        loadingState.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      if (resultsSection) {
        resultsSection.classList.add("hidden");
      }

      // Simulate analysis with clean UX transition
      setTimeout(() => {
        executeMatching();
        if (loadingState) {
          loadingState.classList.add("hidden");
        }
        if (resultsSection) {
          resultsSection.classList.remove("hidden");
          scrollToElement(resultsSection);
        }
      }, 550);
    }

    function showFieldError(field, msg) {
      const parent = field.closest(".form-group");
      if (parent) {
        parent.classList.add("has-error");
        let errorSpan = parent.querySelector(".error-message");
        if (!errorSpan) {
          errorSpan = document.createElement("span");
          errorSpan.className = "error-message";
          parent.appendChild(errorSpan);
        }
        errorSpan.textContent = msg;
      }
    }

    function clearFormErrors() {
      document.querySelectorAll(".form-group.has-error").forEach(group => {
        group.classList.remove("has-error");
        const msg = group.querySelector(".error-message");
        if (msg) msg.remove();
      });
    }

    /**
     * Compute matches for all schemes in dataset and output debugging info
     */
    function executeMatching() {
      // Robust dataset access (window.SCHEMES_DATA or global SCHEMES_DATA)
      const schemes = (typeof window !== "undefined" && window.SCHEMES_DATA && window.SCHEMES_DATA.length > 0)
        ? window.SCHEMES_DATA
        : ((typeof SCHEMES_DATA !== "undefined") ? SCHEMES_DATA : []);

      // Debugging information via console.log
      console.log("=== BharatSahayata Matching Engine Debug ===");
      console.log("1. User's Submitted Profile:", currentUserProfile);
      console.log("2. Number of Schemes Loaded:", schemes.length);

      const scoredList = schemes.map(scheme => {
        const matchResult = calculateMatch(currentUserProfile, scheme);
        return {
          ...scheme,
          match: matchResult
        };
      });

      console.log("3. Score Calculated for Every Scheme:");
      scoredList.forEach(item => {
        console.log(`   [Score: ${item.match.score}% | ${item.match.matchLabel}] "${item.name}"`);
      });

      // Threshold: A scheme is displayed when score is at least 40
      allMatchedSchemes = scoredList.filter(item => item.match.score >= 40);

      // Default sort highest to lowest
      allMatchedSchemes.sort((a, b) => b.match.score - a.match.score);

      console.log(`4. Final Recommended Schemes (Score >= 40): ${allMatchedSchemes.length} schemes found`, allMatchedSchemes.map(s => ({
        name: s.name,
        score: s.match.score,
        label: s.match.matchLabel,
        category: s.category
      })));
      console.log("============================================");

      // Reset filters and render
      activeFilterCategory = "All";
      activeSearchQuery = "";
      if (searchInput) searchInput.value = "";
      filterPills.forEach(p => {
        if (p.getAttribute("data-category") === "All") p.classList.add("active");
        else p.classList.remove("active");
      });

      renderFilteredSchemes();
    }

    /**
     * Filter, sort, and render scheme cards
     */
    function renderFilteredSchemes() {
      if (!schemesGrid || !emptyState) return;

      let filtered = [...allMatchedSchemes];

      // Category filter
      if (activeFilterCategory !== "All") {
        filtered = filtered.filter(item => cleanText(item.category) === cleanText(activeFilterCategory));
      }

      // Search filter (name, purpose, assistance, description)
      if (activeSearchQuery) {
        filtered = filtered.filter(item => {
          const combinedText = cleanText(`${item.name} ${item.description} ${(item.purposes || []).join(" ")} ${item.assistance}`);
          return combinedText.includes(activeSearchQuery);
        });
      }

      // Sort
      if (activeSortOption === "highest-match") {
        filtered.sort((a, b) => b.match.score - a.match.score);
      } else if (activeSortOption === "name-asc") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else if (activeSortOption === "lowest-match") {
        filtered.sort((a, b) => a.match.score - b.match.score);
      }

      // Update count badge
      if (resultsCountEl) {
        resultsCountEl.textContent = `${filtered.length} Scheme${filtered.length === 1 ? "" : "s"} Found`;
      }

      // Toggle empty vs cards
      if (filtered.length === 0) {
        schemesGrid.innerHTML = "";
        schemesGrid.classList.add("hidden");
        emptyState.classList.remove("hidden");
      } else {
        emptyState.classList.add("hidden");
        schemesGrid.classList.remove("hidden");
        schemesGrid.innerHTML = filtered.map((item, idx) => createSchemeCardHtml(item, idx)).join("");

        // Attach event listeners to "View Details" buttons
        schemesGrid.querySelectorAll(".btn-view-details").forEach(btn => {
          btn.addEventListener("click", () => {
            const schemeId = btn.getAttribute("data-scheme-id");
            const schemeItem = allMatchedSchemes.find(s => s.id === schemeId);
            if (schemeItem) {
              openSchemeDetailsModal(schemeItem);
            }
          });
        });

        // Attach event listeners to "Compare with AI" card buttons
        schemesGrid.querySelectorAll(".btn-card-compare").forEach(btn => {
          btn.addEventListener("click", () => {
            const schemeId = btn.getAttribute("data-scheme-id");
            if (typeof window.openCompareAssistantWithScheme === "function") {
              window.openCompareAssistantWithScheme(schemeId);
            }
          });
        });
      }
    }

    /**
     * Generate HTML for a scheme card with modern SaaS styling, match meter, and staggered animation
     */
    function createSchemeCardHtml(item, index) {
      const match = item.match;
      const isStrong = match.score >= 70;
      const badgeClass = isStrong ? "badge-strong" : "badge-possible";
      const icon = isStrong ? "★" : "✦";
      const labelText = match.matchLabel || (isStrong ? "Strong Match" : "Potential Match");

      // Take first 3 key matching reasons with modern check badges
      const reasonsHtml = match.matchingReasons.slice(0, 3).map(r => `
        <li class="reason-item">
          <span class="reason-check" aria-hidden="true">✓</span>
          <span class="reason-text">${escapeHtml(r)}</span>
        </li>
      `).join("");

      return `
        <article class="scheme-card ${isStrong ? 'card-strong' : ''}" data-scheme-id="${item.id}" style="--card-index: ${index || 0};">
          <div class="card-header">
            <span class="category-chip category-${item.category.toLowerCase().replace(/\s+/g, '-')}">${escapeHtml(item.category)}</span>
            <div class="match-indicator-block">
              <span class="match-badge ${badgeClass}">
                <span class="badge-icon">${icon}</span>
                <span class="badge-percent">${match.score}%</span>
                <span class="badge-label">${escapeHtml(labelText)}</span>
              </span>
            </div>
          </div>

          <!-- Visual Match Progress Meter -->
          <div class="match-progress-wrapper" title="${match.score}% Profile Match">
            <div class="match-progress-bar ${isStrong ? 'progress-strong' : 'progress-possible'}" style="width: ${match.score}%;"></div>
          </div>

          <h3 class="card-title">${escapeHtml(item.name)}</h3>

          <div class="card-meta">
            <div class="meta-row">
              <span class="meta-label">
                <span class="meta-icon" aria-hidden="true">🎯</span> Purpose:
              </span>
              <span class="meta-value">${escapeHtml(item.purposes.slice(0, 2).join(" / "))}</span>
            </div>
            <div class="meta-row assistance-row">
              <span class="meta-label">
                <span class="meta-icon" aria-hidden="true">💰</span> Benefit:
              </span>
              <span class="meta-value highlight-assistance">${escapeHtml(item.assistance)}</span>
            </div>
          </div>

          <p class="card-desc">${escapeHtml(item.description)}</p>

          <div class="card-reasons">
            <span class="reasons-heading">
              <span class="reasons-heading-icon" aria-hidden="true">⚡</span> Profile Match Highlights:
            </span>
            <ul class="reasons-list">
              ${reasonsHtml}
            </ul>
          </div>

          <div class="card-footer card-footer-split">
            <button type="button" class="btn-primary btn-view-details" data-scheme-id="${item.id}">
              <span>View Details</span>
              <span class="btn-arrow" aria-hidden="true">&rarr;</span>
            </button>
            <button type="button" class="btn-card-compare" data-scheme-id="${item.id}" title="Compare this scheme with another using AI">
              <span class="btn-ai-icon" aria-hidden="true">🤖</span>
              <span>Compare</span>
            </button>
          </div>
        </article>
      `;
    }

    /**
     * Open Scheme Details Modal with comprehensive information
     */
    function openSchemeDetailsModal(item) {
      if (!schemeModal) return;

      const modalTitle = document.getElementById("modal-scheme-title");
      const modalCategory = document.getElementById("modal-scheme-category");
      const modalScore = document.getElementById("modal-scheme-score");
      const modalAbout = document.getElementById("modal-scheme-about");
      const modalAssistance = document.getElementById("modal-scheme-assistance");
      const modalBenefit = document.getElementById("modal-scheme-benefit");
      const modalEligibility = document.getElementById("modal-scheme-eligibility");
      const modalDocuments = document.getElementById("modal-scheme-documents");
      const modalReasons = document.getElementById("modal-scheme-reasons");
      const modalMismatches = document.getElementById("modal-scheme-mismatches");
      const modalOfficialLink = document.getElementById("modal-official-link");

      const match = item.match;
      const isStrong = match.score >= 70;
      const labelText = match.matchLabel || (isStrong ? "Strong Match" : "Potential Match");

      if (modalTitle) modalTitle.textContent = item.name;
      if (modalCategory) {
        modalCategory.textContent = item.category;
        modalCategory.className = `category-chip category-${item.category.toLowerCase().replace(/\s+/g, '-')}`;
      }
      if (modalScore) {
        modalScore.className = `match-badge ${isStrong ? 'badge-strong' : 'badge-possible'}`;
        modalScore.innerHTML = `<span class="badge-icon">${isStrong ? '★' : '✦'}</span> <span class="badge-percent">${match.score}%</span> Profile Match (${labelText})`;
      }
      if (modalAbout) modalAbout.textContent = item.description;
      if (modalAssistance) modalAssistance.textContent = item.assistance;
      if (modalBenefit) modalBenefit.textContent = item.whoMayBenefit;
      if (modalEligibility) {
        modalEligibility.innerHTML = `
          <p class="eligibility-desc">${escapeHtml(item.basicEligibility)}</p>
          <ul class="eligibility-specs">
            <li><strong>Eligible Age:</strong> ${item.minAge} to ${item.maxAge} years</li>
            <li><strong>Geographic Scope:</strong> ${item.states.join(", ")}</li>
            <li><strong>Income Bracket:</strong> ${escapeHtml(item.incomeLimit)}</li>
          </ul>
        `;
      }

      // Documents
      if (modalDocuments) {
        modalDocuments.innerHTML = item.documents.map(doc => `
          <li class="doc-item">
            <span class="doc-icon">📄</span>
            <span>${escapeHtml(doc)}</span>
          </li>
        `).join("");
      }

      // Why this matched you
      if (modalReasons) {
        modalReasons.innerHTML = match.matchingReasons.map(r => `
          <li class="reason-item">
            <span class="reason-check" aria-hidden="true">✓</span>
            <span>${escapeHtml(r)}</span>
          </li>
        `).join("");
      }

      // Advisories / Potential Mismatches
      if (modalMismatches) {
        if (match.potentialMismatches && match.potentialMismatches.length > 0) {
          modalMismatches.parentElement.classList.remove("hidden");
          modalMismatches.innerHTML = match.potentialMismatches.map(m => `
            <li class="mismatch-item">
              <span class="info-icon">ℹ</span>
              <span>${escapeHtml(m)}</span>
            </li>
          `).join("");
        } else {
          modalMismatches.parentElement.classList.add("hidden");
        }
      }

      // Official link
      if (modalOfficialLink) {
        modalOfficialLink.href = item.officialSource;
        modalOfficialLink.innerHTML = `<span>Apply on Official Ministry Portal</span> <span class="btn-arrow" aria-hidden="true">&nearr;</span>`;
      }

      openModal(schemeModal);
    }

    function openModal(modal) {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
      const focusable = modal.querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
      if (focusable) focusable.focus();
    }

    function closeModal(modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }

    function escapeHtml(str) {
      if (!str) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    /**
     * =========================================================================
     * AI Scheme Comparison Assistant Controller
     * =========================================================================
     */
    function initCompareAssistant() {
      const compareModal = document.getElementById("compare-modal");
      const btnOpenCompare = document.getElementById("btn-open-compare");
      const compareCloseBtn = document.getElementById("compare-modal-close-btn");
      const scheme1Select = document.getElementById("compare-scheme-1-select");
      const scheme2Select = document.getElementById("compare-scheme-2-select");
      const suggestionPills = document.querySelectorAll(".suggestion-pill");
      const chatContainer = document.getElementById("compare-chat-container");
      const loadingEl = document.getElementById("compare-loading");
      const errorBanner = document.getElementById("compare-error-banner");
      const errorText = document.getElementById("compare-error-text");
      const compareForm = document.getElementById("compare-form");
      const userInput = document.getElementById("compare-user-input");
      const submitBtn = document.getElementById("compare-submit-btn");

      let conversationHistory = [];
      let isRequestInProgress = false;

      // Close modal button
      if (compareCloseBtn && compareModal) {
        compareCloseBtn.addEventListener("click", () => {
          closeModal(compareModal);
        });
      }

      // Populate selector dropdowns
      function populateSchemeSelectors(preselectedId1, preselectedId2) {
        if (!scheme1Select || !scheme2Select) return;

        // Determine scheme pool: prefer allMatchedSchemes if available, otherwise SCHEMES_DATA
        const availableSchemes = (allMatchedSchemes && allMatchedSchemes.length > 0)
          ? allMatchedSchemes
          : ((typeof SCHEMES_DATA !== "undefined") ? SCHEMES_DATA : []);

        if (!availableSchemes || availableSchemes.length === 0) return;

        const currentVal1 = preselectedId1 || scheme1Select.value || (availableSchemes[0] ? availableSchemes[0].id : "");
        let currentVal2 = preselectedId2 || scheme2Select.value;
        if (!currentVal2 || currentVal2 === currentVal1) {
          const alternate = availableSchemes.find(s => s.id !== currentVal1);
          currentVal2 = alternate ? alternate.id : "";
        }

        const buildOptionsHtml = (selectedVal) => {
          return `
            <option value="" disabled ${!selectedVal ? "selected" : ""}>Select a scheme...</option>
            ${availableSchemes.map(s => {
              const matchSuffix = (s.match && typeof s.match.score === "number") ? ` (${s.match.score}% Match)` : "";
              const isSelected = s.id === selectedVal ? "selected" : "";
              return `<option value="${escapeHtml(s.id)}" ${isSelected}>${escapeHtml(s.name)}${matchSuffix}</option>`;
            }).join("")}
          `;
        };

        scheme1Select.innerHTML = buildOptionsHtml(currentVal1);
        scheme2Select.innerHTML = buildOptionsHtml(currentVal2);
      }

      // Scheme selection changes
      if (scheme1Select) {
        scheme1Select.addEventListener("change", () => {
          if (scheme1Select.value && scheme1Select.value === scheme2Select.value) {
            const pool = (allMatchedSchemes && allMatchedSchemes.length > 0) ? allMatchedSchemes : SCHEMES_DATA;
            const diffScheme = pool.find(s => s.id !== scheme1Select.value);
            if (diffScheme) {
              scheme2Select.value = diffScheme.id;
            }
          }
          onSchemesChanged();
        });
      }

      if (scheme2Select) {
        scheme2Select.addEventListener("change", () => {
          if (scheme2Select.value && scheme2Select.value === scheme1Select.value) {
            const pool = (allMatchedSchemes && allMatchedSchemes.length > 0) ? allMatchedSchemes : SCHEMES_DATA;
            const diffScheme = pool.find(s => s.id !== scheme2Select.value);
            if (diffScheme) {
              scheme1Select.value = diffScheme.id;
            }
          }
          onSchemesChanged();
        });
      }

      function onSchemesChanged() {
        if (scheme1Select.value && scheme2Select.value && scheme1Select.value !== scheme2Select.value) {
          resetChatGreeting();
          sendComparisonRequest("What is the difference between these schemes?");
        }
      }

      function resetChatGreeting() {
        conversationHistory = [];
        if (chatContainer) {
          chatContainer.innerHTML = `
            <div class="compare-initial-greeting">
              <div class="greeting-icon">🤖</div>
              <div class="greeting-content">
                <h4 class="greeting-title">Comparing Schemes with AI</h4>
                <p class="greeting-text">
                  Examining both schemes across objective parameters, eligibility, financial assistance, and required documents...
                </p>
              </div>
            </div>
          `;
        }
        clearError();
      }

      // Global function to open assistant with optional pre-selected scheme
      window.openCompareAssistantWithScheme = function (selectedSchemeId) {
        if (!compareModal) return;

        let s1 = selectedSchemeId;
        let s2 = null;

        const pool = (allMatchedSchemes && allMatchedSchemes.length > 0) ? allMatchedSchemes : SCHEMES_DATA;
        if (s1) {
          const alternate = pool.find(s => s.id !== s1);
          if (alternate) s2 = alternate.id;
        } else {
          if (pool.length >= 2) {
            s1 = pool[0].id;
            s2 = pool[1].id;
          } else if (pool.length === 1) {
            s1 = pool[0].id;
          }
        }

        populateSchemeSelectors(s1, s2);
        openModal(compareModal);

        // If newly opened and both schemes are valid, trigger initial comparison
        if (s1 && s2 && s1 !== s2) {
          resetChatGreeting();
          sendComparisonRequest("What is the difference between these schemes?");
        }
      };

      // Button in results controls bar
      if (btnOpenCompare) {
        btnOpenCompare.addEventListener("click", () => {
          window.openCompareAssistantWithScheme();
        });
      }

      // Suggested Question Pills
      suggestionPills.forEach(pill => {
        pill.addEventListener("click", () => {
          if (isRequestInProgress) return;
          const question = pill.getAttribute("data-question") || pill.textContent.trim().replace(/^•\s*/, "");
          sendComparisonRequest(question);
        });
      });

      // Custom user input form
      if (compareForm) {
        compareForm.addEventListener("submit", (e) => {
          e.preventDefault();
          if (isRequestInProgress) return;
          const question = (userInput.value || "").trim();
          if (!question) return;
          userInput.value = "";
          sendComparisonRequest(question);
        });
      }

      function getSchemeById(id) {
        const pool = (allMatchedSchemes && allMatchedSchemes.length > 0) ? allMatchedSchemes : SCHEMES_DATA;
        let s = pool.find(item => item.id === id);
        if (!s && typeof SCHEMES_DATA !== "undefined") {
          s = SCHEMES_DATA.find(item => item.id === id);
        }
        return s;
      }

      async function sendComparisonRequest(question) {
        if (!scheme1Select || !scheme2Select) return;

        const id1 = scheme1Select.value;
        const id2 = scheme2Select.value;

        if (!id1 || !id2) {
          showError("Please select two schemes to compare.");
          return;
        }
        if (id1 === id2) {
          showError("Please select two different schemes to compare.");
          return;
        }

        const scheme1 = getSchemeById(id1);
        const scheme2 = getSchemeById(id2);

        if (!scheme1 || !scheme2) {
          showError("Unable to locate scheme data. Please re-select a scheme.");
          return;
        }

        appendUserBubble(question);
        setLoading(true);
        clearError();

        const payload = {
          scheme1: scheme1,
          scheme2: scheme2,
          question: question,
          history: conversationHistory.slice(-4)
        };

        try {
          const response = await fetch("/api/compare-schemes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Server responded with ${response.status}`);
          }

          const result = await response.json();
          if (!result.success) {
            throw new Error(result.error || "Comparison request failed.");
          }

          appendAssistantBubble(result, scheme1, scheme2);

          conversationHistory.push({ role: "user", content: question });
          if (result.type === "structured" && result.data) {
            conversationHistory.push({
              role: "assistant",
              content: result.data.summary || "Structured comparison provided."
            });
          } else {
            conversationHistory.push({
              role: "assistant",
              content: result.answer || "Answer provided."
            });
          }

        } catch (err) {
          console.warn("[AI Comparison Request failed, using client fallback]:", err);
          // Gracefully fallback to client-side structured comparison
          renderClientSideFallbackComparison(scheme1, scheme2, question);
        } finally {
          setLoading(false);
        }
      }

      function setLoading(isLoading) {
        isRequestInProgress = isLoading;
        if (loadingEl) {
          if (isLoading) loadingEl.classList.remove("hidden");
          else loadingEl.classList.add("hidden");
        }
        if (submitBtn) submitBtn.disabled = isLoading;
        suggestionPills.forEach(pill => {
          pill.disabled = isLoading;
        });
      }

      function showError(msg) {
        if (errorBanner && errorText) {
          errorText.textContent = msg;
          errorBanner.classList.remove("hidden");
        }
      }

      function clearError() {
        if (errorBanner) {
          errorBanner.classList.add("hidden");
        }
      }

      function appendUserBubble(text) {
        if (!chatContainer) return;
        const div = document.createElement("div");
        div.className = "chat-bubble-user";
        div.textContent = text;
        chatContainer.appendChild(div);
        scrollChatToBottom();
      }

      function appendAssistantBubble(result, scheme1, scheme2) {
        if (!chatContainer) return;
        const aiBubble = document.createElement("div");
        aiBubble.className = "chat-bubble-ai";

        if (result.type === "structured" && result.data) {
          aiBubble.innerHTML = buildStructuredComparisonHtml(result.data, scheme1, scheme2);
        } else if (result.answer) {
          aiBubble.innerHTML = buildTextAnswerHtml(result.answer, result.sources || []);
        } else {
          aiBubble.innerHTML = `<p class="comp-raw-markdown">Comparison completed.</p>`;
        }

        chatContainer.appendChild(aiBubble);
        
        // Scroll to the start of the comparison response so the user reads from the top
        setTimeout(() => {
          aiBubble.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 60);
      }

      function buildStructuredComparisonHtml(data, scheme1, scheme2) {
        const s1Name = scheme1.name || "Scheme 1";
        const s2Name = scheme2.name || "Scheme 2";
        const summary = data.summary || "";
        const comparisonRows = data.comparison || [];
        const importantNote = data.important_note || "Government scheme guidelines, loan terms, and eligibility rules are subject to official revision. Citizens must verify latest details on the official ministry portal before applying.";
        const sources = data.sources || [
          { name: s1Name, url: scheme1.officialSource },
          { name: s2Name, url: scheme2.officialSource }
        ];

        function getCategoryIcon(cat) {
          const c = (cat || "").toLowerCase();
          if (c.includes("purpose") || c.includes("objective")) return "🎯";
          if (c.includes("financial") || c.includes("benefit") || c.includes("loan") || c.includes("subsidy")) return "💰";
          if (c.includes("eligibility") || c.includes("age") || c.includes("criteria")) return "👤";
          if (c.includes("document")) return "📄";
          if (c.includes("application") || c.includes("target") || c.includes("process")) return "🏛️";
          return "📌";
        }

        const tableRowsHtml = comparisonRows.map(row => `
          <tr>
            <td class="comp-td-param">
              <span class="param-icon">${getCategoryIcon(row.category)}</span>
              <span>${escapeHtml(row.category)}</span>
            </td>
            <td class="comp-td-val1">${escapeHtml(row.scheme1)}</td>
            <td class="comp-td-val2">${escapeHtml(row.scheme2)}</td>
          </tr>
        `).join("");

        const sourcesHtml = sources.filter(s => s && s.url).map(s => `
          <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" class="comp-source-link">
            <span>🔗 Official ${escapeHtml(s.name)} Portal</span>
            <span aria-hidden="true">&nearr;</span>
          </a>
        `).join("");

        return `
          <div class="comp-header-bar">
            <div class="comp-header-title">
              <span>⚖️ ${escapeHtml(s1Name)} vs ${escapeHtml(s2Name)}</span>
            </div>
            <span class="comp-badge">${data.is_ai ? "AI Factual Comparison" : "Official Data Comparison"}</span>
          </div>

          ${summary ? `
            <div class="comp-summary-box">
              <p><strong>💡 Key Overview:</strong> ${escapeHtml(summary)}</p>
            </div>
          ` : ""}

          <div class="comp-matrix-wrapper">
            <table class="comp-table">
              <thead>
                <tr>
                  <th class="comp-th-param">Parameter</th>
                  <th class="comp-th-scheme1">
                    <span class="comp-scheme-tag">Scheme 1</span>
                    <span class="comp-scheme-name">${escapeHtml(s1Name)}</span>
                  </th>
                  <th class="comp-th-scheme2">
                    <span class="comp-scheme-tag tag-accent">Scheme 2</span>
                    <span class="comp-scheme-name">${escapeHtml(s2Name)}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                ${tableRowsHtml}
              </tbody>
            </table>
          </div>

          <div class="comp-important-note">
            <strong>⚠️ Important Note:</strong> ${escapeHtml(importantNote)}
          </div>

          ${sourcesHtml ? `
            <div class="comp-sources-box">
              <span class="comp-sources-label">Official Sources:</span>
              ${sourcesHtml}
            </div>
          ` : ""}
        `;
      }

      function buildTextAnswerHtml(text, sources) {
        const formattedText = renderMarkdownToHtml(text);
        const sourcesHtml = (sources || []).filter(s => s && s.url).map(s => `
          <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" class="comp-source-link">
            <span>${escapeHtml(s.name)} Portal</span>
            <span aria-hidden="true">&nearr;</span>
          </a>
        `).join("");

        return `
          <div class="comp-raw-markdown">
            ${formattedText}
          </div>

          <div class="comp-important-note">
            <strong>Note:</strong> BharatSahayata provides objective scheme comparisons and does not advise or declare eligibility. Always confirm information with official government portals.
          </div>

          ${sourcesHtml ? `
            <div class="comp-sources-box">
              <span class="comp-sources-label">Official Sources:</span>
              ${sourcesHtml}
            </div>
          ` : ""}
        `;
      }

      function renderMarkdownToHtml(md) {
        if (!md) return "";
        let html = escapeHtml(md);

        // Bold **text**
        html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

        // Headers ### Header
        html = html.replace(/^### (.*$)/gim, "<h4>$1</h4>");
        html = html.replace(/^## (.*$)/gim, "<h3>$1</h3>");

        // Unordered lists - item or * item
        html = html.replace(/^\s*[-•*]\s+(.*$)/gim, "<li>$1</li>");
        html = html.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>");
        html = html.replace(/<\/ul>\s*<ul>/g, "");

        // Line breaks to paragraphs
        const paragraphs = html.split(/\n\s*\n/).map(p => {
          p = p.trim();
          if (p.startsWith("<h4>") || p.startsWith("<h3>") || p.startsWith("<ul>")) {
            return p;
          }
          return `<p>${p.replace(/\n/g, "<br>")}</p>`;
        });

        return paragraphs.join("");
      }

      function renderClientSideFallbackComparison(scheme1, scheme2, question) {
        const fallbackData = {
          summary: `${scheme1.name} and ${scheme2.name} are two verified government initiatives designed for distinct target groups and support structures.`,
          comparison: [
            {
              category: "Purpose",
              scheme1: scheme1.purposes ? scheme1.purposes.join(", ") : scheme1.description,
              scheme2: scheme2.purposes ? scheme2.purposes.join(", ") : scheme2.description
            },
            {
              category: "Eligibility",
              scheme1: `${scheme1.basicEligibility} (Age: ${scheme1.minAge}-${scheme1.maxAge} yrs)`,
              scheme2: `${scheme2.basicEligibility} (Age: ${scheme2.minAge}-${scheme2.maxAge} yrs)`
            },
            {
              category: "Financial Assistance",
              scheme1: scheme1.assistance,
              scheme2: scheme2.assistance
            },
            {
              category: "Documents Required",
              scheme1: (scheme1.documents || []).join(", "),
              scheme2: (scheme2.documents || []).join(", ")
            },
            {
              category: "Target Beneficiaries",
              scheme1: scheme1.whoMayBenefit,
              scheme2: scheme2.whoMayBenefit
            }
          ],
          important_note: "Government scheme rules, loan subventions, and eligibility parameters are subject to official revision. Citizens must verify latest requirements on official portals before applying.",
          sources: [
            { name: scheme1.name, url: scheme1.officialSource },
            { name: scheme2.name, url: scheme2.officialSource }
          ],
          is_ai: false
        };

        appendAssistantBubble({ type: "structured", data: fallbackData }, scheme1, scheme2);
      }

      function scrollChatToBottom() {
        if (!chatContainer) return;
        setTimeout(() => {
          chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: "smooth"
          });
        }, 60);
      }
    }

    // Initialize the AI Scheme Comparison Assistant
    initCompareAssistant();
  }
})();

