/**
 * BharatSahayata - Government Schemes Dataset
 * 
 * Verified central and state government schemes across Business, Agriculture,
 * Education, Housing, and Skill Development.
 * 
 * Note: Data compiled from official government portals (PMMY, PM-KISAN, PMEGP,
 * PM Vishwakarma, Stand-Up India, PMAY, PMKVY, KCC, PM Vidyalaxmi, CGTMSE, etc.)
 * For official application rules, citizens should visit the respective official portals.
 */

const SCHEMES_DATA = [
  {
    id: "pm-mudra",
    name: "Pradhan Mantri Mudra Yojana (PMMY)",
    category: "Business",
    description: "Provides collateral-free institutional micro-credit up to ₹10 Lakhs to non-corporate, non-farm small and micro enterprises to start or expand business activities.",
    occupations: ["Business Owner", "Entrepreneur", "Self Employed", "Artisan / Craftsperson", "Other"],
    purposes: ["Start a Business", "Expand a Business", "Equipment Purchase", "Self Employment"],
    states: ["All India", "All States"],
    minAge: 18,
    maxAge: 65,
    incomeLimit: "No formal income ceiling; targeted at small/micro enterprises",
    incomeTiers: ["Below ₹1 lakh", "₹1–3 lakh", "₹3–5 lakh", "₹5–10 lakh", "Above ₹10 lakh"],
    categories: ["General", "SC", "ST", "OBC", "Other", "Prefer not to say"],
    assistance: "Collateral-free loans up to ₹10 Lakhs categorized as Shishu (up to ₹50k), Kishore (₹50k to ₹5L), and Tarun (₹5L to ₹10L) with affordable interest rates.",
    whoMayBenefit: "Shopkeepers, fruit/vegetable vendors, small manufacturing units, artisans, service providers, food stalls, and transport operators.",
    basicEligibility: "Any Indian citizen aged 18-65 with a viable non-farm business proposal and no prior default with any bank or financial institution.",
    documents: [
      "Aadhaar Card & Voter ID",
      "PAN Card",
      "Proof of Business Address / Trade License",
      "Bank Statement of last 6 months",
      "Project / Quotation Report for machinery or equipment"
    ],
    officialSource: "https://www.mudra.org.in"
  },
  {
    id: "pm-kisan",
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    category: "Agriculture",
    description: "A flagship central sector scheme providing direct guaranteed income support of ₹6,000 per year to all landholding farmer families across India.",
    occupations: ["Farmer"],
    purposes: ["Agriculture", "Equipment Purchase", "Other"],
    states: ["All India", "All States"],
    minAge: 18,
    maxAge: 85,
    incomeLimit: "Excludes institutional landholders and income tax payers",
    incomeTiers: ["Below ₹1 lakh", "₹1–3 lakh", "₹3–5 lakh"],
    categories: ["General", "SC", "ST", "OBC", "Other", "Prefer not to say"],
    assistance: "₹6,000 per year paid directly in 3 equal four-monthly instalments of ₹2,000 directly into the farmer's Aadhaar-seeded bank account.",
    whoMayBenefit: "Small and marginal landholder farmer families cultivating cultivable land in rural and urban areas.",
    basicEligibility: "Landholder farmer family possessing cultivable landholding. Excludes institutional landowners, serving/retired government employees, and income-tax payers.",
    documents: [
      "Aadhaar Card",
      "Land Ownership Documents (Khatauni / Land Patta)",
      "Active Aadhaar-linked Bank Account",
      "Valid Mobile Number for e-KYC"
    ],
    officialSource: "https://pmkisan.gov.in"
  },
  {
    id: "pmegp",
    name: "Prime Minister's Employment Generation Programme (PMEGP)",
    category: "Business",
    description: "A major credit-linked subsidy initiative by the Ministry of MSME to generate employment through setting up new micro-enterprises in manufacturing and services.",
    occupations: ["Entrepreneur", "Business Owner", "Self Employed", "Artisan / Craftsperson", "Other"],
    purposes: ["Start a Business", "Self Employment", "Equipment Purchase"],
    states: ["All India", "All States"],
    minAge: 18,
    maxAge: 60,
    incomeLimit: "No family income ceiling; project limits apply up to ₹50 Lakhs",
    incomeTiers: ["Below ₹1 lakh", "₹1–3 lakh", "₹3–5 lakh", "₹5–10 lakh"],
    categories: ["General", "SC", "ST", "OBC", "Other", "Prefer not to say"],
    assistance: "Margin money subsidy of 15% to 35% of project cost (up to ₹50 Lakhs for manufacturing units and ₹20 Lakhs for service sector enterprises).",
    whoMayBenefit: "Individuals, self-help groups, and cooperative societies planning to launch new production or service units in rural or urban areas.",
    basicEligibility: "Individuals aged 18+ with at least 8th standard pass for projects costing above ₹10 Lakh in manufacturing and above ₹5 Lakh in services.",
    documents: [
      "Aadhaar Card & PAN Card",
      "Educational Qualification Certificate (8th / 10th / Degree)",
      "Detailed Project Report (DPR)",
      "Special Category / Caste Certificate (for higher 25-35% subsidy)",
      "Rural Area Certificate (if applying under rural category)"
    ],
    officialSource: "https://www.kviconline.gov.in/pmegpeportal"
  },
  {
    id: "pm-vishwakarma",
    name: "PM Vishwakarma Scheme",
    category: "Skill Development",
    description: "Dedicated holistic welfare scheme supporting traditional artisans and craftspersons with formal recognition, modern skill training, toolkits, and low-interest credit.",
    occupations: ["Artisan / Craftsperson", "Self Employed", "Other"],
    purposes: ["Skill Development", "Equipment Purchase", "Start a Business", "Self Employment", "Expand a Business"],
    states: ["All India", "All States"],
    minAge: 18,
    maxAge: 70,
    incomeLimit: "Targeted at traditional artisan households",
    incomeTiers: ["Below ₹1 lakh", "₹1–3 lakh", "₹3–5 lakh"],
    categories: ["General", "SC", "ST", "OBC", "Other", "Prefer not to say"],
    assistance: "PM Vishwakarma ID card, ₹15,000 digital toolkit incentive grant, ₹500/day training stipend, and collateral-free enterprise loan up to ₹3 Lakhs at 5% interest.",
    whoMayBenefit: "Traditional craftspersons in 18 trades: Carpenters, Blacksmiths, Goldsmiths, Potters, Sculptors, Cobblers, Masons, Weavers, Tailors, and Toolmakers.",
    basicEligibility: "Artisan practicing one of the 18 recognized family trades, aged 18 or above, with only one member per family availing the scheme.",
    documents: [
      "Aadhaar Card",
      "Mobile Number linked with Aadhaar",
      "Bank Account Passbook",
      "Ration Card",
      "Declaration of Traditional Trade Engagement"
    ],
    officialSource: "https://pmvishwakarma.gov.in"
  },
  {
    id: "stand-up-india",
    name: "Stand-Up India Scheme",
    category: "Business",
    description: "Facilitates bank loans between ₹10 Lakh and ₹1 Crore to Scheduled Caste (SC), Scheduled Tribe (ST), and women entrepreneurs to establish greenfield enterprises.",
    occupations: ["Entrepreneur", "Business Owner", "Self Employed"],
    purposes: ["Start a Business", "Expand a Business", "Equipment Purchase"],
    states: ["All India", "All States"],
    minAge: 18,
    maxAge: 65,
    incomeLimit: "Commercial feasibility evaluated by lending bank",
    incomeTiers: ["Below ₹1 lakh", "₹1–3 lakh", "₹3–5 lakh", "₹5–10 lakh", "Above ₹10 lakh"],
    categories: ["SC", "ST", "General", "OBC", "Other", "Prefer not to say"],
    assistance: "Composite bank loans from ₹10 Lakhs to ₹1 Crore covering up to 85% of total project cost at lowest applicable commercial interest rates.",
    whoMayBenefit: "SC, ST, and Women borrowers setting up greenfield (first-time) ventures in manufacturing, services, agri-allied, or trading sectors.",
    basicEligibility: "SC/ST and/or woman entrepreneur aged 18+. In non-individual enterprises, 51% shareholding and controlling stake must be held by SC/ST or woman.",
    documents: [
      "Aadhaar Card and PAN Card",
      "Caste Certificate (for SC/ST applicants)",
      "Comprehensive Business Project Report",
      "Proof of Enterprise Address and Incorporation Documents",
      "Pollution Control Clearance and Municipal Permits (where required)"
    ],
    officialSource: "https://www.standupmitra.in"
  },
  {
    id: "pm-svanidhi",
    name: "PM SVANidhi (PM Street Vendor's AtmaNirbhar Nidhi)",
    category: "Business",
    description: "Empowers urban and peri-urban street vendors with affordable collateral-free working capital loans to restart and expand their livelihood activities.",
    occupations: ["Self Employed", "Artisan / Craftsperson", "Other"],
    purposes: ["Self Employment", "Start a Business", "Expand a Business"],
    states: ["All India", "All States"],
    minAge: 18,
    maxAge: 65,
    incomeLimit: "Low-income urban informal sector",
    incomeTiers: ["Below ₹1 lakh", "₹1–3 lakh"],
    categories: ["General", "SC", "ST", "OBC", "Other", "Prefer not to say"],
    assistance: "Initial collateral-free loan of ₹10,000, upgraded to ₹20,000 and ₹50,000 upon timely repayment, with 7% interest subsidy and cashback on digital transactions.",
    whoMayBenefit: "Vendors selling vegetables, fruits, street food, snacks, clothing, artisan products, and small retail services on street corners or carts.",
    basicEligibility: "Street vendors holding a Certificate of Vending / ID card issued by Urban Local Bodies (ULBs) or vending before March 2020.",
    documents: [
      "Aadhaar Card",
      "Vending Certificate or ID / ULB Recommendation Letter",
      "Bank Account details",
      "Mobile Number"
    ],
    officialSource: "https://pmsvanidhi.mohua.gov.in"
  },
  {
    id: "pmay-urban",
    name: "Pradhan Mantri Awas Yojana - Urban (PMAY-U 2.0)",
    category: "Housing",
    description: "Addresses urban housing shortage among Economically Weaker Sections (EWS), Low Income Groups (LIG), and Middle Income Groups (MIG) by providing pucca houses.",
    occupations: ["Salaried", "Self Employed", "Business Owner", "Artisan / Craftsperson", "Other"],
    purposes: ["Housing"],
    states: ["All India", "All States"],
    minAge: 21,
    maxAge: 70,
    incomeLimit: "Annual family income up to ₹9 Lakhs for credit-linked subsidy",
    incomeTiers: ["Below ₹1 lakh", "₹1–3 lakh", "₹3–5 lakh", "₹5–10 lakh"],
    categories: ["General", "SC", "ST", "OBC", "Other", "Prefer not to say"],
    assistance: "Interest subsidy up to ₹1.80 Lakh to ₹2.67 Lakh on home loans, plus direct central financial assistance of ₹1.5 Lakh per dwelling unit.",
    whoMayBenefit: "Urban families who do not own a pucca house anywhere in the country, prioritizing female family members and senior citizens.",
    basicEligibility: "Beneficiary family must not own a pucca house anywhere in India. Annual household income within eligible tiers (EWS up to ₹3L, LIG up to ₹6L, MIG up to ₹9L).",
    documents: [
      "Aadhaar Card of all family members",
      "Proof of Household Income (Salary slip, Form 16, or Income Certificate)",
      "Bank Account details",
      "Affidavit of not owning any pucca house in India",
      "Land Ownership title / Property Purchase Agreement"
    ],
    officialSource: "https://pmaymis.gov.in"
  },
  {
    id: "pmay-gramin",
    name: "Pradhan Mantri Awas Yojana - Gramin (PMAY-G)",
    category: "Housing",
    description: "Provides financial grant assistance to rural families living in kutcha, dilapidated houses or without shelter to construct durable, clean pucca houses.",
    occupations: ["Farmer", "Artisan / Craftsperson", "Self Employed", "Other"],
    purposes: ["Housing"],
    states: ["All India", "All States"],
    minAge: 18,
    maxAge: 80,
    incomeLimit: "Below ₹1.5 Lakh per annum (verified under SECC / Awaas+ list)",
    incomeTiers: ["Below ₹1 lakh", "₹1–3 lakh"],
    categories: ["General", "SC", "ST", "OBC", "Other", "Prefer not to say"],
    assistance: "Direct financial grant of ₹1.20 Lakh in plain areas and ₹1.30 Lakh in hilly/difficult areas, plus 90 days MGNREGA wage support and ₹12,000 for toilet construction.",
    whoMayBenefit: "Rural households living in kutcha homes or houseless families verified in Gram Panchayat lists.",
    basicEligibility: "Rural families listed in the verified SECC 2011 / Awaas+ beneficiary register who do not own a pucca house.",
    documents: [
      "Aadhaar Card",
      "MGNREGA Job Card",
      "Bank Account Passbook (Aadhaar linked)",
      "Land Ownership / Allotment Certificate",
      "Photograph of existing kutcha shelter"
    ],
    officialSource: "https://pmayg.nic.in"
  },
  {
    id: "pmkvy",
    name: "Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)",
    category: "Skill Development",
    description: "National skill development scheme offering free, industry-aligned skill certification and practical training in modern technologies and traditional trades.",
    occupations: ["Student", "Self Employed", "Artisan / Craftsperson", "Other"],
    purposes: ["Skill Development", "Education", "Self Employment"],
    states: ["All India", "All States"],
    minAge: 15,
    maxAge: 45,
    incomeLimit: "No family income limit; open to all aspirational youth",
    incomeTiers: ["Below ₹1 lakh", "₹1–3 lakh", "₹3–5 lakh", "₹5–10 lakh", "Above ₹10 lakh"],
    categories: ["General", "SC", "ST", "OBC", "Other", "Prefer not to say"],
    assistance: "100% free government-sponsored training, NSDC Skill India Certificate, post-placement assistance, and training stipend support.",
    whoMayBenefit: "School or college dropouts, job seekers, and youth desiring recognized certifications in technical, digital, or manufacturing roles.",
    basicEligibility: "Indian national aged 15-45 with an Aadhaar card and basic educational qualifications required for the specific job role.",
    documents: [
      "Aadhaar Card",
      "Educational Certificates / Marksheet",
      "Recent Passport Size Photos",
      "Bank Account Details"
    ],
    officialSource: "https://www.pmkvyofficial.org"
  },
  {
    id: "kcc",
    name: "Kisan Credit Card (KCC) Scheme",
    category: "Agriculture",
    description: "Provides timely institutional credit to farmers for agricultural cultivation, post-harvest maintenance, farm asset management, dairy, and fisheries.",
    occupations: ["Farmer", "Self Employed"],
    purposes: ["Agriculture", "Equipment Purchase", "Expand a Business"],
    states: ["All India", "All States"],
    minAge: 18,
    maxAge: 75,
    incomeLimit: "No formal income ceiling; credit determined by crop scale and land size",
    incomeTiers: ["Below ₹1 lakh", "₹1–3 lakh", "₹3–5 lakh", "₹5–10 lakh"],
    categories: ["General", "SC", "ST", "OBC", "Other", "Prefer not to say"],
    assistance: "Revolving credit limit up to ₹3 Lakhs at 7% interest rate with 3% prompt repayment incentive, reducing effective rate to 4% per year. Collateral-free up to ₹1.6 Lakhs.",
    whoMayBenefit: "Owner farmers, tenant farmers, oral lessees, sharecroppers, and allied farmers engaged in dairy, poultry, or fisheries.",
    basicEligibility: "Cultivators or allied farmers aged 18-75 (co-applicant needed for senior citizens above 60) possessing cultivable land or operational lease.",
    documents: [
      "Land Ownership Records / Revenue Khatoni / Lease Deed",
      "Aadhaar Card and PAN Card",
      "Passport Size Photos",
      "Declaration of Cropping Pattern"
    ],
    officialSource: "https://agriwelfare.gov.in"
  },
  {
    id: "vidya-lakshmi",
    name: "PM Vidyalaxmi / Vidya Lakshmi Scheme",
    category: "Education",
    description: "National digital platform and credit guarantee scheme facilitating affordable, collateral-free education loans for higher studies in top-ranked institutions.",
    occupations: ["Student", "Other"],
    purposes: ["Education", "Skill Development"],
    states: ["All India", "All States"],
    minAge: 16,
    maxAge: 35,
    incomeLimit: "Subsidies available for family income up to ₹8 Lakhs",
    incomeTiers: ["Below ₹1 lakh", "₹1–3 lakh", "₹3–5 lakh", "₹5–10 lakh"],
    categories: ["General", "SC", "ST", "OBC", "Other", "Prefer not to say"],
    assistance: "Collateral-free and third-party-guarantee-free education loans up to ₹7.5 Lakhs with 75% credit guarantee, plus 3% interest subvention for eligible income brackets.",
    whoMayBenefit: "Students admitted to higher educational institutions (top NIRF rated universities/colleges) in India.",
    basicEligibility: "Indian citizen student who has secured admission through entrance exam or merit to an approved higher educational institution.",
    documents: [
      "Admission Letter & Fee Schedule from Institution",
      "Mark sheets of Class 10, 12, and Graduation (if applicable)",
      "Aadhaar Card & PAN Card of Student and Co-borrower (Parent)",
      "Family Income Certificate / Form 16",
      "Bank Account Statements of last 6 months"
    ],
    officialSource: "https://www.vidyalakshmi.co.in"
  },
  {
    id: "cgtmse",
    name: "Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)",
    category: "Business",
    description: "Facilitates collateral-free loans for micro and small enterprises by providing credit guarantee coverage to lending commercial banks and financial institutions.",
    occupations: ["Business Owner", "Entrepreneur"],
    purposes: ["Start a Business", "Expand a Business", "Equipment Purchase"],
    states: ["All India", "All States"],
    minAge: 21,
    maxAge: 65,
    incomeLimit: "Commercial viability assessment by lending institution",
    incomeTiers: ["Below ₹1 lakh", "₹1–3 lakh", "₹3–5 lakh", "₹5–10 lakh", "Above ₹10 lakh"],
    categories: ["General", "SC", "ST", "OBC", "Other", "Prefer not to say"],
    assistance: "Credit guarantee cover up to 85% for fund-based and non-fund-based credit facilities up to ₹5 Crores without requiring third-party guarantee or collateral.",
    whoMayBenefit: "New and existing Micro and Small Enterprises (MSEs) in manufacturing, services, and wholesale trade activities.",
    basicEligibility: "MSE enterprise registered on the Udyam registration portal with a viable business model and viable credit assessment.",
    documents: [
      "Udyam Registration Certificate",
      "Detailed Project Report / Business Expansion Plan",
      "Audited Balance Sheet and P&L for last 2 years (for existing units)",
      "GST Registration Certificate and Returns",
      "KYC documents of Directors/Partners/Proprietor"
    ],
    officialSource: "https://www.cgtmse.in"
  },
  {
    id: "naps",
    name: "National Apprenticeship Promotion Scheme (NAPS-2)",
    category: "Skill Development",
    description: "Promotes formal on-the-job industrial apprenticeship training with direct government co-funding of monthly apprentice stipends.",
    occupations: ["Student", "Other"],
    purposes: ["Skill Development", "Education", "Self Employment"],
    states: ["All India", "All States"],
    minAge: 16,
    maxAge: 35,
    incomeLimit: "No income restrictions",
    incomeTiers: ["Below ₹1 lakh", "₹1–3 lakh", "₹3–5 lakh", "₹5–10 lakh", "Above ₹10 lakh"],
    categories: ["General", "SC", "ST", "OBC", "Other", "Prefer not to say"],
    assistance: "Direct benefit transfer (DBT) of 25% of stipend (up to ₹1,500/month) directly to apprentice bank account, plus recognized practical industrial experience certificate.",
    whoMayBenefit: "ITI graduates, diploma holders, graduates, and young candidates looking for structured industrial apprenticeship and shop-floor skills.",
    basicEligibility: "Candidate aged 14+ (16+ for hazardous sectors) fulfilling minimum educational qualifications specified for the chosen apprenticeship trade.",
    documents: [
      "Aadhaar Card",
      "Educational / ITI Certificates",
      "Aadhaar-linked Bank Account Details",
      "Registration on Apprenticeship Portal (apprenticeshipindia.gov.in)"
    ],
    officialSource: "https://www.apprenticeshipindia.gov.in"
  },
  {
    id: "aif",
    name: "Agriculture Infrastructure Fund (AIF)",
    category: "Agriculture",
    description: "Financing facility for medium-to-long term debt investment in post-harvest management infrastructure and community farming assets with interest subvention.",
    occupations: ["Farmer", "Entrepreneur", "Business Owner"],
    purposes: ["Agriculture", "Equipment Purchase", "Expand a Business", "Start a Business"],
    states: ["All India", "All States"],
    minAge: 18,
    maxAge: 70,
    incomeLimit: "Project-based credit evaluation",
    incomeTiers: ["Below ₹1 lakh", "₹1–3 lakh", "₹3–5 lakh", "₹5–10 lakh", "Above ₹10 lakh"],
    categories: ["General", "SC", "ST", "OBC", "Other", "Prefer not to say"],
    assistance: "3% interest subvention per annum for loans up to ₹2 Crores for up to 7 years, plus reimbursement of CGTMSE credit guarantee fee by government.",
    whoMayBenefit: "Farmers, Primary Agricultural Credit Societies (PACS), Farmer Producer Organizations (FPOs), Agri-entrepreneurs, and Startups.",
    basicEligibility: "Individual or organization setting up post-harvest agricultural infrastructure (cold rooms, sorting units, grain silos, bio-stimulant plants).",
    documents: [
      "Detailed Project Report (DPR)",
      "Land Ownership / Long-term Lease Agreement",
      "Entity Registration and PAN Details",
      "Bank Account Statements & Financial Projections"
    ],
    officialSource: "https://agriinfra.dac.gov.in"
  },
  {
    id: "haryana-enterprise",
    name: "Haryana Enterprise Promotion Scheme (HEPC)",
    category: "Business",
    description: "State government financial incentives and capital investment subsidies for establishing and expanding micro, small, and startup business units in Haryana.",
    occupations: ["Entrepreneur", "Business Owner", "Self Employed"],
    purposes: ["Start a Business", "Expand a Business", "Equipment Purchase"],
    states: ["Haryana", "All India", "All States"],
    minAge: 18,
    maxAge: 65,
    incomeLimit: "Project viability based; no family income cap",
    incomeTiers: ["Below ₹1 lakh", "₹1–3 lakh", "₹3–5 lakh", "₹5–10 lakh", "Above ₹10 lakh"],
    categories: ["General", "SC", "ST", "OBC", "Other", "Prefer not to say"],
    assistance: "Capital investment subsidy up to ₹20 Lakhs, 5% interest subvention for 3 years, and 100% stamp duty exemption for qualifying enterprise units in Haryana.",
    whoMayBenefit: "First-generation entrepreneurs, MSME founders, and industrial innovators setting up operations in Haryana.",
    basicEligibility: "New or expanding enterprise registered in Haryana with valid Udyam registration and Parivar Pehchan Patra (PPP) verification.",
    documents: [
      "Aadhaar Card",
      "Haryana Domicile / Parivar Pehchan Patra (PPP)",
      "PAN Card",
      "Detailed Project Report",
      "Udyam MSME Registration Certificate"
    ],
    officialSource: "https://msme.haryana.gov.in"
  },
  {
    id: "maha-swadhar",
    name: "Maharashtra Swadhar & Higher Education Support Scheme",
    category: "Education",
    description: "Dedicated Maharashtra state financial assistance providing accommodation, food, and book allowances to students pursuing professional higher education.",
    occupations: ["Student"],
    purposes: ["Education", "Skill Development"],
    states: ["Maharashtra", "All India", "All States"],
    minAge: 16,
    maxAge: 32,
    incomeLimit: "Annual family income up to ₹2.5 Lakhs",
    incomeTiers: ["Below ₹1 lakh", "₹1–3 lakh"],
    categories: ["General", "SC", "ST", "OBC", "Other", "Prefer not to say"],
    assistance: "Direct annual allowance up to ₹51,000 per student deposited directly in bank account for lodging, boarding, academic books, and stationery.",
    whoMayBenefit: "College and university students admitted to approved undergraduate and postgraduate courses in Maharashtra who did not get government hostel accommodation.",
    basicEligibility: "Student domicile of Maharashtra admitted to recognized degree/diploma course with annual family income within eligible limits.",
    documents: [
      "Aadhaar Card",
      "Maharashtra Domicile Certificate",
      "College Admission Receipt & Bonafide Certificate",
      "Family Income Certificate",
      "Aadhaar-seeded Bank Account Passbook"
    ],
    officialSource: "https://mahadbt.maharashtra.gov.in"
  }
];

// Explicitly attach to window for browser script compatibility
if (typeof window !== "undefined") {
  window.SCHEMES_DATA = SCHEMES_DATA;
}

// Support CommonJS/Node environments (for test runners)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { SCHEMES_DATA };
}
