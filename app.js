const navItems = [
  ["Home", "/"],
  ["Search", "/search/"],
  ["Map", "/map/"],
  ["Consultant", "/consultant/"],
  ["Investor", "/investor/"],
  ["Legal", "/legal/"],
  ["Compare", "/compare/"],
  ["Visits", "/site-visits/"],
  ["Deals", "/deals/"],
  ["List", "/list-property/"],
];

const roleNav = [
  ["Buyers", "/buyers/"],
  ["Sellers", "/sellers/"],
  ["Brokers", "/brokers/"],
  ["Builders", "/builders/"],
  ["Admin", "/admin/"],
];

const SUPABASE_URL = "https://pwyewdqbsqyrubaixjgp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_eQOs7gIMhCOcIn9T_GHOAw_CY37OWhH";
let liveProperties = null;
let supabaseClient = null;
let currentUser = null;
let currentProfile = null;

const hierarchy = {
  country: "India",
  states: [
    {
      name: "Karnataka",
      cities: [
        {
          name: "Bengaluru",
          zones: [
            {
              name: "East",
              areas: [
                {
                  name: "Whitefield",
                  localities: [
                    {
                      name: "Kadugodi",
                      societies: [
                        {
                          name: "Aster Park",
                          projects: [
                            { name: "Aster Park Residences", towers: [{ name: "Tower B", units: ["B-1804", "B-1902"] }] },
                          ],
                        },
                      ],
                    },
                  ],
                },
                { name: "Indiranagar", localities: [{ name: "HAL 2nd Stage", societies: [] }] },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "Maharashtra",
      cities: [{ name: "Mumbai", zones: [{ name: "Thane Belt", areas: [{ name: "Thane West", localities: [] }] }] }],
    },
    {
      name: "Delhi NCR",
      cities: [{ name: "Gurugram", zones: [{ name: "Dwarka Expressway", areas: [{ name: "Sector 113", localities: [] }] }] }],
    },
  ],
};

const properties = [
  {
    id: "aster-park",
    title: "Aster Park Residences",
    city: "Bengaluru",
    area: "Whitefield",
    locality: "Kadugodi",
    lat: 12.9698,
    lng: 77.7499,
    hierarchy: "India / Karnataka / Bengaluru / East / Whitefield / Kadugodi / Aster Park / Tower B / B-1804",
    type: "3 BHK Apartment",
    price: "INR 1.18 Cr",
    budget: 118,
    size: "1,620 sq ft",
    bedrooms: 3,
    possession: "Ready to move",
    verification: "Property Verified",
    ownerType: "Owner",
    score: 92,
    trust: 96,
    builder: 94,
    areaScore: 88,
    investment: 82,
    risk: 18,
    yield: "3.8%",
    growth: "High",
    commute: "18 min to metro",
    amenities: "Clubhouse, pool, coworking lounge, EV parking",
    image: "linear-gradient(135deg, #ccbfae, #7f9788 46%, #2b3740)",
  },
  {
    id: "indigo-grove",
    title: "Indigo Grove Villas",
    city: "Bengaluru",
    area: "Sarjapur Road",
    locality: "Dommasandra",
    lat: 12.8788,
    lng: 77.7854,
    hierarchy: "India / Karnataka / Bengaluru / South East / Sarjapur Road / Dommasandra / Indigo Grove / Villa Row / V-12",
    type: "4 BHK Villa",
    price: "INR 2.42 Cr",
    budget: 242,
    size: "3,480 sq ft",
    bedrooms: 4,
    possession: "Under construction",
    verification: "Builder Verified",
    ownerType: "Builder",
    score: 87,
    trust: 93,
    builder: 91,
    areaScore: 82,
    investment: 89,
    risk: 26,
    yield: "4.2%",
    growth: "Very high",
    commute: "32 min to ORR",
    amenities: "Private garden, solar backup, club, sports courts",
    image: "linear-gradient(135deg, #d8cab3, #4f8a72 42%, #46384f)",
  },
  {
    id: "metro-nest",
    title: "Metro Nest",
    city: "Mumbai",
    area: "Thane West",
    locality: "Majiwada",
    lat: 19.2183,
    lng: 72.9781,
    hierarchy: "India / Maharashtra / Mumbai / Thane Belt / Thane West / Majiwada / Metro Nest / Tower A / A-1207",
    type: "2 BHK Rental",
    price: "INR 54k/mo",
    budget: 54,
    size: "910 sq ft",
    bedrooms: 2,
    possession: "Available now",
    verification: "Owner Verified",
    ownerType: "Owner",
    score: 89,
    trust: 98,
    builder: 88,
    areaScore: 90,
    investment: 76,
    risk: 12,
    yield: "NA",
    growth: "Medium",
    commute: "9 min to metro",
    amenities: "Gym, security, play area, visitor parking",
    image: "linear-gradient(135deg, #c7d7dc, #e1b79d 45%, #202020)",
  },
  {
    id: "capital-heights",
    title: "Capital Heights",
    city: "Gurugram",
    area: "Dwarka Expressway",
    locality: "Sector 113",
    lat: 28.5226,
    lng: 77.0229,
    hierarchy: "India / Delhi NCR / Gurugram / Dwarka Expressway / Sector 113 / Capital Heights / Tower C / C-2401",
    type: "3.5 BHK Apartment",
    price: "INR 1.74 Cr",
    budget: 174,
    size: "2,050 sq ft",
    bedrooms: 3,
    possession: "Under construction",
    verification: "Legal Verified",
    ownerType: "Developer",
    score: 86,
    trust: 90,
    builder: 85,
    areaScore: 84,
    investment: 91,
    risk: 31,
    yield: "3.5%",
    growth: "Very high",
    commute: "24 min to Cyber City",
    amenities: "Club, pool, concierge, business lounge",
    image: "linear-gradient(135deg, #d7d1c1, #8c9278 40%, #334155)",
  },
];

function getProperties() {
  return liveProperties && liveProperties.length ? liveProperties : properties;
}

function mapSupabaseProperty(row) {
  return {
    id: row.id,
    title: row.title,
    city: row.city,
    area: row.area,
    locality: row.locality,
    hierarchy: row.hierarchy,
    type: row.type,
    price: row.price,
    budget: row.budget,
    size: row.size,
    bedrooms: row.bedrooms,
    possession: row.possession,
    verification: row.verification,
    ownerType: row.owner_type,
    score: row.score,
    trust: row.trust,
    builder: row.builder,
    areaScore: row.area_score,
    investment: row.investment,
    risk: row.risk,
    yield: row.yield,
    growth: row.growth,
    commute: row.commute,
    amenities: row.amenities,
    image: row.image,
    lat: row.lat,
    lng: row.lng,
  };
}

async function loadSupabaseProperties() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/properties?select=*&order=score.desc`, {
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      },
    });
    if (!response.ok) return;
    const rows = await response.json();
    if (Array.isArray(rows) && rows.length) {
      liveProperties = rows.map(mapSupabaseProperty);
      renderRoute();
    }
  } catch (error) {
    // Keep local mock data active until Supabase tables are ready.
  }
}

async function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  const module = await import("https://esm.sh/@supabase/supabase-js@2");
  supabaseClient = module.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  return supabaseClient;
}

async function loadProfile() {
  if (!currentUser) {
    currentProfile = null;
    return;
  }

  const client = await getSupabaseClient();
  const { data } = await client.from("profiles").select("*").eq("id", currentUser.id).maybeSingle();
  currentProfile = data || null;
}

async function initializeAuth() {
  try {
    const client = await getSupabaseClient();
    const { data } = await client.auth.getSession();
    currentUser = data.session?.user || null;
    await loadProfile();
    renderRoute();
    client.auth.onAuthStateChange(async (_event, session) => {
      currentUser = session?.user || null;
      await loadProfile();
      renderRoute();
    });
  } catch (error) {
    showToast("Supabase auth could not load. Check internet and SQL setup.");
  }
}

function requireAuthMessage() {
  return `
    <section class="section">
      <div class="empty-state-block">
        <h2>Login required</h2>
        <p>Create an account or sign in to use this workspace.</p>
        <a class="button" href="/auth/" data-link>Login or sign up</a>
      </div>
    </section>
  `;
}

function showToast(message) {
  drawerRoot.innerHTML = `<aside class="toast">${message}</aside>`;
  setTimeout(() => {
    if (drawerRoot.innerHTML.includes(message)) drawerRoot.innerHTML = "";
  }, 3200);
}

const localityScores = [
  ["Safety Score", 92, "Low incident density around residential streets"],
  ["Crime Signals", 84, "Low theft and harassment reports"],
  ["Traffic Score", 68, "Evening congestion risk"],
  ["Pollution Score", 74, "Moderate arterial-road exposure"],
  ["Air Quality", 76, "Better inside residential pockets"],
  ["Water Availability", 79, "Stable supply with seasonal dependency"],
  ["Internet Quality", 93, "Fiber and 5G coverage"],
  ["School Access", 88, "Strong K-12 coverage"],
  ["College Access", 72, "Moderate higher education proximity"],
  ["Hospital Access", 86, "Fast emergency access"],
  ["Metro Access", 91, "Reliable last-mile options"],
  ["Public Transport Access", 89, "Bus, cab, and metro coverage"],
  ["Shopping Access", 87, "Daily needs within 10 minutes"],
  ["Livability Score", 91, "Strong daily-life fundamentals"],
  ["Family Score", 89, "Good schools, parks, and low-noise lanes"],
  ["Rental Demand Score", 86, "IT corridor tenant demand"],
  ["Investment Score", 84, "Stable appreciation and liquidity"],
  ["Future Growth Score", 88, "Metro and civic upgrades tracked"],
];

const mapLayers = [
  "Properties",
  "Schools",
  "Colleges",
  "Hospitals",
  "Metro",
  "Railway",
  "Airport",
  "Shopping",
  "Parks",
  "Industrial Areas",
  "Highways",
  "Traffic",
  "Pollution",
  "Crime",
  "Development Projects",
  "Price Heatmaps",
  "Rental Heatmaps",
  "Demand Heatmaps",
];

const mapPois = {
  Schools: [
    ["Greenwood High International", 12.9566, 77.7355],
    ["Delhi Public School Whitefield", 12.9826, 77.7695],
  ],
  Colleges: [
    ["MVJ College of Engineering", 12.9855, 77.7608],
    ["CMR Institute of Technology", 12.9679, 77.7132],
  ],
  Hospitals: [
    ["Manipal Hospital Whitefield", 12.9692, 77.7508],
    ["Vydehi Hospital", 12.9766, 77.7297],
  ],
  Metro: [
    ["Kadugodi Tree Park Metro", 12.9964, 77.7582],
    ["Hopefarm Channasandra Metro", 12.9877, 77.7426],
  ],
  Railway: [["Whitefield Railway Station", 12.9963, 77.7619]],
  Airport: [["Kempegowda International Airport", 13.1986, 77.7066]],
  Shopping: [
    ["Phoenix Marketcity", 12.9961, 77.6964],
    ["Forum Shantiniketan", 12.9898, 77.7288],
  ],
  Parks: [
    ["Inner Circle Park", 12.9696, 77.7468],
    ["Seegehalli Lake Park", 13.0067, 77.7538],
  ],
  "Industrial Areas": [["EPIP Zone", 12.9796, 77.7212]],
  Highways: [["Old Madras Road", 13.0089, 77.7015]],
};

let leafletLoadPromise;
let activeMap;
let activeLayerGroups = {};

const legalItems = [
  "Property Purchase Checklist",
  "Registry Guide",
  "RERA Information",
  "Property Verification Checklist",
  "Document Verification",
  "Fraud Awareness",
  "Legal Risk Assessment",
  "Buyer Protection Guides",
];

const roleData = {
  buyers: {
    title: "Buyer Dashboard",
    metrics: [["Saved Properties", "24"], ["Collections", "5"], ["Site Visits", "3"], ["Loan Tracking", "72%"]],
    flows: ["Comparison Lists", "Property Notes", "Consultant Reports", "Investment Reports", "Offers", "Documents", "Activity Timeline"],
  },
  sellers: {
    title: "Seller Dashboard",
    metrics: [["Active Listings", "8"], ["Track Interest", "1.4k"], ["Offers", "7"], ["Verification", "92%"]],
    flows: ["List Property", "Manage Property", "Chats", "Visits", "Documents", "Analytics"],
  },
  brokers: {
    title: "Broker Dashboard",
    metrics: [["Listings", "128"], ["Lead Quality Scores", "91"], ["Deals", "14"], ["Commissions", "INR 18L"]],
    flows: ["Leads", "Clients", "Client Management", "Property Matching", "Site Visits", "Offers", "Performance Analytics", "Document Management", "Communication Center"],
  },
  builders: {
    title: "Builder Dashboard",
    metrics: [["Projects", "12"], ["Inventory", "420"], ["Bookings", "86"], ["Reputation", "94"]],
    flows: ["Sales", "Leads", "Analytics", "Marketing", "Customer Management", "Project Progress", "Reputation Metrics"],
  },
  admin: {
    title: "Admin Dashboard",
    metrics: [["Fraud Queue", "38"], ["Verifications", "8.4k"], ["Revenue", "INR 4.8 Cr"], ["Audit Logs", "Live"]],
    flows: ["User Management", "Property Verification", "Reports", "Content Moderation", "Dispute Management", "Support Management"],
  },
};

const visits = [
  ["Book Visit", "Aster Park Residences", "Tomorrow, 10:30 AM", "Confirmed"],
  ["Reschedule", "Capital Heights", "Saturday, 4:00 PM", "Awaiting seller"],
  ["Leave Feedback", "Metro Nest", "Completed", "Feedback pending"],
];

const deals = [
  ["Offer Creation", "Aster Park Residences", "INR 1.12 Cr", "Negotiation Tracking"],
  ["Document Exchange", "Capital Heights", "Token pending", "Progress Tracking"],
  ["Closing Checklist", "Metro Nest", "Rental agreement", "Ready for signature"],
];

const app = document.querySelector("#app");
const shell = document.querySelector("#shell");
const drawerRoot = document.querySelector("#drawer-root");

function path() {
  const normalized = window.location.pathname.replace(/\/index\.html$/, "").replace(/\/+$/, "") || "/";
  return normalized;
}

function activeHref(href) {
  return path() === href.replace(/\/+$/, "") ? "active" : "";
}

function renderShell() {
  shell.innerHTML = `
    <header class="site-header">
      <a class="brand" href="/" data-link><span class="brand-mark"></span><span>Nivas OS</span></a>
      <nav class="nav-links" aria-label="Primary">
        ${navItems.map(([label, href]) => `<a class="${activeHref(href)}" href="${href}" data-link>${label}</a>`).join("")}
      </nav>
      <nav class="role-nav" aria-label="Role dashboards">
        ${roleNav.map(([label, href]) => `<a class="${activeHref(href)}" href="${href}" data-link>${label}</a>`).join("")}
      </nav>
      <div class="account-nav">
        ${
          currentUser
            ? `<span>${currentProfile?.role || "user"}</span><button class="button small ghost" type="button" data-sign-out>Sign out</button>`
            : `<a class="button small" href="/auth/" data-link>Login</a>`
        }
      </div>
    </header>
  `;
}

function page(title, eyebrow, body, actions = "") {
  return `
    <section class="page-hero">
      <div>
        <p class="eyebrow">${eyebrow}</p>
        <h1>${title}</h1>
        <p>${body}</p>
      </div>
      <div class="hero-actions">${actions}</div>
    </section>
  `;
}

function metricGrid(items) {
  return `<div class="metric-grid">${items.map(([label, value]) => `<article><strong>${value}</strong><span>${label}</span></article>`).join("")}</div>`;
}

function propertyCards(list = getProperties()) {
  return `<div class="property-grid">${list
    .map(
      (property) => `
        <article class="property-card">
          <div class="property-media" style="--media:${property.image}">
            <span>${property.verification}</span>
            <span>Trust ${property.trust}</span>
          </div>
          <div class="property-body">
            <h3>${property.title}</h3>
            <p>${property.city} / ${property.area} / ${property.locality}</p>
            <strong>${property.price}</strong>
            <div class="mini-score">
              <span>Property ${property.score}</span>
              <span>Area ${property.areaScore}</span>
              <span>Invest ${property.investment}</span>
            </div>
            <div class="card-actions">
              <a class="button small" href="/property/aster-park/" data-link>Details</a>
              <button class="button small ghost" type="button" data-compare="${property.id}">Compare</button>
            </div>
          </div>
        </article>
      `
    )
    .join("")}</div>`;
}

function hierarchyView() {
  return `
    <section class="section">
      <div class="section-heading">
        <p class="eyebrow">India Property Hierarchy</p>
        <h2>Every search respects country to unit-level structure.</h2>
      </div>
      <div class="hierarchy-chain">
        ${["Country", "State", "City", "Zone", "Area", "Locality", "Society", "Project", "Tower", "Unit", "Property"]
          .map((item) => `<span>${item}</span>`)
          .join("")}
      </div>
      <div class="panel">
        <h3>Example resolved path</h3>
        <p>${getProperties()[0].hierarchy}</p>
      </div>
    </section>
  `;
}

function landingPage() {
  return `
    <section class="landing-hero">
      <img src="/assets/ai-property-hero.png" alt="Premium home with AI property interface" />
      <div class="landing-copy">
        <p class="eyebrow">AI Real Estate Operating System for India</p>
        <h1>Buy, sell, rent, invest, verify, visit, and close property in one trusted platform.</h1>
        <p>Nivas OS combines property discovery, AI consulting, locality intelligence, verification, legal assistance, investor tools, site visits, deals, brokers, builders, and role dashboards.</p>
        <div class="ai-search">
          <input id="global-query" value="I need a verified 3 BHK near metro under INR 1.2 Cr" />
          <a class="button" href="/search/" data-link>Search</a>
        </div>
      </div>
    </section>
    <section class="section compact-section">
      <div class="section-heading split">
        <div><p class="eyebrow">Clear paths</p><h2>Use landing for trust and go deeper for decisions.</h2></div>
        <a class="button ghost" href="/consultant/" data-link>Talk to AI Consultant</a>
      </div>
      <div class="module-grid">
        ${[
          ["Property Discovery", "/search/"],
          ["AI Property Consultant", "/consultant/"],
          ["AI Investment Advisor", "/investor/"],
          ["Locality Intelligence", "/locality/whitefield/"],
          ["Property Marketplace", "/search/"],
          ["Broker Ecosystem", "/brokers/"],
          ["Builder Ecosystem", "/builders/"],
          ["Verification System", "/legal/"],
          ["Full Screen Map", "/map/"],
          ["Legal Hub", "/legal/"],
          ["Visit Management", "/site-visits/"],
          ["Deal Management", "/deals/"],
        ]
          .map(([label, href]) => `<a class="module-card" href="${href}" data-link><strong>${label}</strong><span>Open workspace</span></a>`)
          .join("")}
      </div>
    </section>
    <section class="section">
      <div class="section-heading"><p class="eyebrow">Featured projects</p><h2>Verified properties ranked by confidence.</h2></div>
      ${propertyCards(getProperties().slice(0, 3))}
      <div class="trust-badge-row">
        ${["Owner Verified", "Broker Verified", "Builder Verified", "Property Verified", "Document Verified", "Location Verified", "Image Verified", "Legal Verified"]
          .map((badge) => `<span>${badge}</span>`)
          .join("")}
      </div>
    </section>
    ${hierarchyView()}
  `;
}

function searchPage() {
  return `
    ${page("Property Discovery", "Search Experience", "Advanced search across state, city, area, locality, property type, land type, budget, size, bedrooms, amenities, investment potential, rental yield, builder, verification, and possession status.", `<a class="button" href="/map/" data-link>Open map discovery</a>`)}
    <section class="section">
      <div class="section-heading">
        <p class="eyebrow">Property Marketplace</p>
        <h2>Owners, Brokers, Dealers, Builders, and Developers can list verified inventory.</h2>
      </div>
      <div class="filter-grid">
        ${["State", "City", "Area", "Locality", "Property Type", "Land Type", "Budget", "Area Size", "Bedrooms", "Amenities", "Investment Potential", "Rental Yield", "Builder", "Verification Status", "Possession Status"]
          .map((label) => `<label>${label}<select><option>Any ${label}</option><option>Verified only</option></select></label>`)
          .join("")}
      </div>
      <div class="recommendation-strip">
        ${["Best Match Properties", "Best Investment Properties", "Best Rental Opportunities", "Best Growth Areas", "Best Family Areas", "Best Student Areas", "Best Commercial Opportunities"]
          .map((item) => `<button type="button">${item}</button>`)
          .join("")}
      </div>
      ${propertyCards()}
    </section>
  `;
}

function propertyPage() {
  const p = getProperties()[0];
  return `
    ${page(p.title, "Property Details", `${p.hierarchy}. A decision-ready detail page with gallery, videos, virtual tour, floor plans, verification, market analysis, and deal actions.`, `<a class="button" href="/site-visits/" data-link>Book visit</a><a class="button ghost" href="/deals/" data-link>Create offer</a>`)}
    <section class="section detail-layout">
      <div class="gallery-panel" style="--media:${p.image}"><span>Gallery</span><span>Videos</span><span>Virtual Tour</span><span>Floor Plans</span></div>
      <div class="detail-stack">
        ${metricGrid([
          ["Property Score", p.score],
          ["Trust Score", p.trust],
          ["Builder Score", p.builder],
          ["Area Score", p.areaScore],
          ["Investment Score", p.investment],
          ["Risk Score", p.risk],
        ])}
        <div class="module-grid two">
          ${["Overview", "Specifications", "Amenities", "Documents", "Legal Details", "Ownership Details", "Builder Details", "Nearby Places", "Travel Times", "Map View", "Area Analysis", "Price Analysis", "Market Trends", "Rental Yield", "Future Growth Potential", "Comparison", "Similar Properties", "Questions And Answers"]
            .map((item) => `<article class="module-card"><strong>${item}</strong><span>${item === "Documents" ? "Document Verified" : "Decision-ready section"}</span></article>`)
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function mapPage() {
  return `
    ${page("Full Screen Property Map", "Map Experience", "Map-based discovery with property, civic, risk, demand, and heatmap layers.", `<a class="button" href="/search/" data-link>Back to search</a>`)}
    <section class="map-page">
      <div class="real-map-shell">
        <div id="leaflet-map" class="real-map" aria-label="Interactive property map"></div>
        <div class="map-loading" id="map-loading">Loading free OpenStreetMap map...</div>
      </div>
      <aside class="layer-panel">
        ${mapLayers.map((layer, index) => `<button class="layer-toggle ${index < 8 ? "active" : ""}" type="button" data-map-layer="${layer}"><span>${layer}</span><span>${index < 8 ? "On" : "Off"}</span></button>`).join("")}
      </aside>
    </section>
  `;
}

function ensureLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (leafletLoadPromise) return leafletLoadPromise;

  leafletLoadPromise = new Promise((resolve, reject) => {
    if (!document.querySelector("#leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error("Leaflet could not load. Check internet connectivity."));
    document.body.appendChild(script);
  });

  return leafletLoadPromise;
}

function poiIcon(color) {
  return window.L.divIcon({
    className: "poi-icon",
    html: `<span style="background:${color}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function heatCircle(lat, lng, color, label) {
  return window.L.circle([lat, lng], {
    radius: 1800,
    color,
    fillColor: color,
    fillOpacity: 0.18,
    weight: 1,
  }).bindPopup(label);
}

async function initLeafletMap() {
  const container = document.querySelector("#leaflet-map");
  if (!container) return;

  const loading = document.querySelector("#map-loading");
  try {
    const L = await ensureLeaflet();
    if (!document.querySelector("#leaflet-map")) return;

    activeLayerGroups = {};
    activeMap = L.map("leaflet-map", {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([12.9698, 77.7499], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(activeMap);

    const selectedListing = new URLSearchParams(window.location.search).get("listing");
    let selectedMarker = null;
    const propertyGroup = L.layerGroup(
      getProperties().map((property) => {
        const marker = L.marker([property.lat, property.lng])
          .bindPopup(`<strong>${property.title}</strong><br>${property.price}<br>${property.area}, ${property.city}`);
        if (property.id === selectedListing) selectedMarker = marker;
        return marker;
      })
    );
    activeLayerGroups.Properties = propertyGroup.addTo(activeMap);

    const colors = {
      Schools: "#2f6fed",
      Colleges: "#6b5278",
      Hospitals: "#d95c45",
      Metro: "#0b7a5a",
      Railway: "#aa7a23",
      Airport: "#171717",
      Shopping: "#4f8a72",
      Parks: "#2c9c68",
      "Industrial Areas": "#5b6472",
      Highways: "#d97706",
    };

    Object.entries(mapPois).forEach(([layerName, pois]) => {
      activeLayerGroups[layerName] = L.layerGroup(
        pois.map(([name, lat, lng]) => L.marker([lat, lng], { icon: poiIcon(colors[layerName] || "#171717") }).bindPopup(`<strong>${layerName}</strong><br>${name}`))
      );
    });

    activeLayerGroups.Traffic = L.layerGroup([
      L.polyline(
        [
          [12.9964, 77.6964],
          [12.9877, 77.7426],
          [12.9698, 77.7499],
        ],
        { color: "#d97706", weight: 5, opacity: 0.72 }
      ).bindPopup("Traffic signal: peak congestion corridor"),
    ]);

    activeLayerGroups.Pollution = L.layerGroup([heatCircle(12.982, 77.731, "#d95c45", "Pollution signal: moderate arterial exposure")]);
    activeLayerGroups.Crime = L.layerGroup([heatCircle(12.956, 77.744, "#6b5278", "Crime signal: low to moderate")]);
    activeLayerGroups["Development Projects"] = L.layerGroup([heatCircle(12.996, 77.758, "#2f6fed", "Development project: metro and civic upgrades")]);
    activeLayerGroups["Price Heatmaps"] = L.layerGroup([heatCircle(12.9698, 77.7499, "#0b7a5a", "Price heat: premium verified corridor")]);
    activeLayerGroups["Rental Heatmaps"] = L.layerGroup([heatCircle(12.985, 77.735, "#aa7a23", "Rental heat: high tenant demand")]);
    activeLayerGroups["Demand Heatmaps"] = L.layerGroup([heatCircle(12.976, 77.728, "#2f6fed", "Demand heat: strong buyer and rental demand")]);

    document.querySelectorAll("[data-map-layer].active").forEach((button) => {
      const group = activeLayerGroups[button.dataset.mapLayer];
      if (group && !activeMap.hasLayer(group)) group.addTo(activeMap);
    });

    if (loading) loading.remove();
    if (selectedMarker) {
      activeMap.setView(selectedMarker.getLatLng(), 16);
      selectedMarker.openPopup();
    }
    setTimeout(() => activeMap.invalidateSize(), 100);
  } catch (error) {
    if (loading) loading.textContent = error.message;
  }
}

function toggleMapLayer(button) {
  const layerName = button.dataset.mapLayer;
  const group = activeLayerGroups[layerName];
  if (!activeMap || !group) return;
  if (button.classList.contains("active")) {
    group.addTo(activeMap);
  } else {
    activeMap.removeLayer(group);
  }
}

async function initListingMapPicker() {
  const container = document.querySelector("#listing-map-picker");
  const form = document.querySelector("[data-listing-form]");
  if (!container || !form) return;

  const latInput = form.elements.lat;
  const lngInput = form.elements.lng;
  const cityInput = form.elements.city;
  const areaInput = form.elements.area;
  const localityInput = form.elements.locality;
  const loading = document.querySelector("#listing-map-loading");

  const readPosition = () => [
    Number(latInput.value || 12.9698),
    Number(lngInput.value || 77.7499),
  ];

  try {
    const L = await ensureLeaflet();
    if (!document.querySelector("#listing-map-picker")) return;

    const listingMap = L.map("listing-map-picker", {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView(readPosition(), 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(listingMap);

    const marker = L.marker(readPosition(), { draggable: true })
      .addTo(listingMap)
      .bindPopup("Selected listing location");

    const syncPosition = (lat, lng, shouldMoveMap = true) => {
      const fixedLat = Number(lat).toFixed(6);
      const fixedLng = Number(lng).toFixed(6);
      latInput.value = fixedLat;
      lngInput.value = fixedLng;
      marker.setLatLng([Number(fixedLat), Number(fixedLng)]);
      if (shouldMoveMap) listingMap.setView([Number(fixedLat), Number(fixedLng)], Math.max(listingMap.getZoom(), 15));
    };

    listingMap.on("click", (event) => {
      syncPosition(event.latlng.lat, event.latlng.lng, false);
    });

    marker.on("dragend", () => {
      const position = marker.getLatLng();
      syncPosition(position.lat, position.lng, false);
    });

    [latInput, lngInput].forEach((input) => {
      input.addEventListener("change", () => {
        const [lat, lng] = readPosition();
        syncPosition(lat, lng);
      });
    });

    form.querySelectorAll("[data-location-preset]").forEach((button) => {
      button.addEventListener("click", () => {
        cityInput.value = button.dataset.city || cityInput.value;
        areaInput.value = button.dataset.area || areaInput.value;
        localityInput.value = button.dataset.locality || localityInput.value;
        syncPosition(button.dataset.lat, button.dataset.lng);
      });
    });

    if (loading) loading.remove();
    setTimeout(() => listingMap.invalidateSize(), 100);
  } catch (error) {
    if (loading) loading.textContent = error.message;
  }
}

function localityPage() {
  return `
    ${page("Whitefield Locality Intelligence", "Locality Intelligence", "Safety, crime, traffic, pollution, air quality, water, internet, education, healthcare, transport, shopping, livability, rental demand, investment, future growth, reviews, and sentiment.", `<a class="button" href="/map/" data-link>View on map</a>`)}
    <section class="section">
      ${metricGrid([["Livability Score", 91], ["Family Score", 89], ["Rental Demand", 86], ["Investment Score", 84]])}
      <div class="score-grid">
        ${localityScores.map(([label, score, note]) => `<article><span>${label}</span><strong>${score}</strong><p>${note}</p></article>`).join("")}
      </div>
      <div class="panel"><h3>Development Pipeline</h3><p>Metro extensions, road upgrades, tech-park expansion, civic works, and future growth corridors are tracked as investment and livability signals.</p></div>
      <div class="panel"><h3>Area Reviews and Resident Reviews</h3><p>Area sentiment is positive for schools, commute, and daily convenience; negative signals are traffic and construction noise.</p></div>
    </section>
  `;
}

function consultantPage() {
  return `
    ${page("AI Property Consultant", "Core Advisory", "A professional advisor flow for budget analysis, city recommendation, locality recommendation, risk, investment, growth, property suggestions, and decision guidance.", `<button class="button" type="button" data-send-consultant>Ask advisor</button>`)}
    <section class="section advisor-layout">
      <div class="chat-panel">
        <div class="chat-log" id="chat-log">
          <p><strong>User:</strong> I have 50 lakh budget.</p>
          <p><strong>Nivas AI:</strong> I will first check city fit, property type, loan readiness, risk tolerance, and whether you want self-use or investment.</p>
        </div>
        <textarea id="advisor-input">I want agricultural land with future growth potential and legal risk check.</textarea>
      </div>
      <div class="module-grid">
        ${["Budget Analysis", "City Recommendation", "Locality Recommendation", "Risk Analysis", "Investment Analysis", "Growth Analysis", "Property Suggestions", "Decision Guidance", "NRI Advisory", "Commercial Property", "Rental Income", "3 BHK near metro"]
          .map((item) => `<article class="module-card"><strong>${item}</strong><span>Step-by-step advisor module</span></article>`)
          .join("")}
      </div>
    </section>
    <section class="section">
      <div class="section-heading"><p class="eyebrow">AI Land Consultant</p><h2>Dedicated land advisory system.</h2></div>
      <div class="module-grid">
        ${["Agricultural Land", "Residential Land", "Commercial Land", "Industrial Land", "Future Growth Corridors", "Upcoming Development Zones", "Road Connectivity", "Government Projects", "Investment Potential", "Risk Factors", "Land Verification Checklist", "Legal Risk Indicators"]
          .map((item) => `<article class="module-card"><strong>${item}</strong><span>Land advisory signal</span></article>`)
          .join("")}
      </div>
    </section>
  `;
}

function investorPage() {
  return `
    ${page("Investor Hub", "AI Investment Advisor", "Rental yield, cash flow, appreciation, demand growth, supply growth, area growth, risk, exit potential, investment score, portfolio tracking, and market insights.", `<a class="button" href="/compare/" data-link>Compare investments</a>`)}
    <section class="section">
      ${metricGrid([["Rental Yield", "4.2%"], ["Cash Flow", "INR 18k"], ["Appreciation Potential", "High"], ["Investment Score", "89"]])}
      <div class="module-grid">
        ${["Demand Growth", "Supply Growth", "Area Growth", "Risk Assessment", "Exit Potential", "Portfolio Tracking", "Market Insights", "Best Growth Areas"]
          .map((item) => `<article class="module-card"><strong>${item}</strong><span>Investor decision metric</span></article>`)
          .join("")}
      </div>
    </section>
  `;
}

function legalPage() {
  return `
    ${page("Legal Hub", "Legal Assistance", "Property purchase, registry, RERA, verification, fraud awareness, risk assessment, and buyer protection guidance.", `<a class="button" href="/deals/" data-link>Open closing checklist</a>`)}
    <section class="section checklist-grid">${legalItems.map((item) => `<article><strong>${item}</strong><p>Checklist, status, risk notes, owner/broker/builder accountability, and next action.</p></article>`).join("")}</section>
  `;
}

function authPage() {
  if (currentUser) {
    return `
      ${page("Your Nivas OS Account", "Account", "Your account is connected to Supabase Auth. Set your role so dashboards and listings behave correctly.", `<button class="button ghost" type="button" data-sign-out>Sign out</button>`)}
      <section class="section auth-layout">
        <form class="os-form" data-profile-form>
          <label>Full name<input name="full_name" value="${currentProfile?.full_name || ""}" required /></label>
          <label>Phone<input name="phone" value="${currentProfile?.phone || ""}" /></label>
          <label>City<input name="city" value="${currentProfile?.city || ""}" /></label>
          <label>Company name<input name="company_name" value="${currentProfile?.company_name || ""}" /></label>
          <label>Role<select name="role">
            ${["buyer", "seller", "broker", "builder", "admin"].map((role) => `<option value="${role}" ${currentProfile?.role === role ? "selected" : ""}>${role}</option>`).join("")}
          </select></label>
          <button class="button" type="submit">Save profile</button>
        </form>
        <div class="panel"><h3>Logged in as</h3><p>${currentUser.email}</p><p>Role controls listing ownership, visits, deals, broker/builder workflows, and admin queues.</p></div>
      </section>
    `;
  }

  return `
    ${page("Login or Sign Up", "Supabase Auth", "Create an account to list property, add land, book visits, create offers, upload documents, and manage dashboards.", "")}
    <section class="section auth-layout">
      <form class="os-form" data-auth-form="sign-in">
        <h2>Sign in</h2>
        <label>Email<input name="email" type="email" required /></label>
        <label>Password<input name="password" type="password" required /></label>
        <button class="button" type="submit">Sign in</button>
      </form>
      <form class="os-form" data-auth-form="sign-up">
        <h2>Create account</h2>
        <label>Email<input name="email" type="email" required /></label>
        <label>Password<input name="password" type="password" minlength="6" required /></label>
        <label>Role<select name="role">
          <option value="buyer">buyer</option>
          <option value="seller">seller</option>
          <option value="broker">broker</option>
          <option value="builder">builder</option>
        </select></label>
        <button class="button" type="submit">Create account</button>
      </form>
    </section>
  `;
}

function listPropertyPage() {
  if (!currentUser) {
    return `${page("List Property or Land", "Marketplace", "Login first to add property, jameen, agricultural land, commercial land, or builder inventory.", "")}${requireAuthMessage()}`;
  }

  return `
    ${page("List Property or Land", "Property Marketplace", "Owners, brokers, dealers, builders, and developers can create property and land inventory with verification fields.", "")}
    <section class="section auth-layout">
      <form class="os-form wide" data-listing-form>
        <div class="form-grid">
          <label>Listing kind<select name="listing_kind" data-listing-kind><option value="property">Property</option><option value="land">Land / Jameen</option></select></label>
          <label>Land type<select name="land_type"><option value="">Not land</option><option value="agricultural">Agricultural Land</option><option value="residential">Residential Land</option><option value="commercial">Commercial Land</option><option value="industrial">Industrial Land</option></select></label>
          <label>Title<input name="title" value="Verified 3 BHK near metro" required /></label>
          <label>City<input name="city" value="Bengaluru" required /></label>
          <label>Area<input name="area" value="Whitefield" required /></label>
          <label>Locality<input name="locality" value="Kadugodi" required /></label>
          <label>Type<input name="type" value="3 BHK Apartment" required /></label>
          <label>Price<input name="price" value="INR 1.18 Cr" required /></label>
          <label>Budget numeric<input name="budget" type="number" value="118" /></label>
          <label>Size<input name="size" value="1,620 sq ft" /></label>
          <label>Bedrooms<input name="bedrooms" type="number" value="3" /></label>
          <label>Possession<input name="possession" value="Ready to move" /></label>
          <label>Latitude<input name="lat" type="number" step="0.000001" value="12.9698" required /></label>
          <label>Longitude<input name="lng" type="number" step="0.000001" value="77.7499" required /></label>
        </div>
        <div class="listing-map-card">
          <div>
            <p class="eyebrow">Map Location</p>
            <h3>Select exact land or property pin</h3>
            <p>Click on the free OpenStreetMap preview or drag the pin. The selected coordinates are saved with the listing and appear on the discovery map.</p>
          </div>
          <div class="location-presets" aria-label="Quick location presets">
            <button type="button" data-location-preset data-city="Bengaluru" data-area="Whitefield" data-locality="Kadugodi" data-lat="12.9698" data-lng="77.7499">Whitefield</button>
            <button type="button" data-location-preset data-city="Gurugram" data-area="Golf Course Extension" data-locality="Sector 67" data-lat="28.3984" data-lng="77.0551">Gurugram</button>
            <button type="button" data-location-preset data-city="Pune" data-area="Hinjewadi" data-locality="Phase 2" data-lat="18.5913" data-lng="73.7389">Pune</button>
          </div>
          <div class="listing-map-shell">
            <div id="listing-map-picker" class="listing-map-picker" aria-label="Select listing location on map"></div>
            <div class="map-loading" id="listing-map-loading">Loading free map picker...</div>
          </div>
          <p class="map-helper">For jameen listings, place the pin on the plot gate, road edge, or nearest verified boundary point.</p>
        </div>
        <label>Hierarchy<input name="hierarchy" value="India / Karnataka / Bengaluru / East / Whitefield / Kadugodi / Society / Project / Tower / Unit" required /></label>
        <label>Amenities<textarea name="amenities">Clubhouse, pool, security, EV parking</textarea></label>
        <label>Property image<input name="image_file" type="file" accept="image/*" /></label>
        <button class="button" type="submit">Save listing to Supabase</button>
      </form>
      <div class="panel">
        <h3>What this saves</h3>
        <p>The listing is inserted into Supabase with your user id as owner. It appears on Search and Map after the table policies are set up.</p>
        <div class="source-note">
          <strong>Real inventory sources</strong>
          <span>Use owner submissions, builder sheets, broker CSVs, land dealer inventory, PG operator lists, and verified field survey data. Avoid copying listings from other marketplaces without permission.</span>
        </div>
        <form class="os-form compact-import" data-bulk-import-form>
          <h3>Bulk import real listings</h3>
          <p>Paste CSV rows for flats, PGs, plots, jameen, villas, shops, offices, or builder units. Imported rows appear on Search and Map with a pending verification label.</p>
          <label>CSV inventory<textarea name="csv" data-import-csv rows="9">title,category,city,area,locality,type,price,budget,size,bedrooms,possession,lat,lng,amenities
Real PG near metro,pg,Bengaluru,Whitefield,Kadugodi,PG / Co-living,INR 12000 monthly,0,Single sharing,0,Available now,12.970800,77.751300,"Food, wifi, security"
Residential plot near highway,plot,Pune,Hinjewadi,Phase 2,Residential Plot,INR 42 Lakh,42,1200 sq ft,0,Immediate,18.591300,73.738900,"Road access, gated boundary"</textarea></label>
          <button class="button ghost" type="submit">Import CSV to Supabase</button>
        </form>
      </div>
    </section>
  `;
}

function rolePage(role) {
  const data = roleData[role];
  const ecosystemLabel = role === "brokers" ? "Broker Ecosystem" : role === "builders" ? "Builder Ecosystem" : "Role-Based Experience";
  return `
    ${page(data.title, ecosystemLabel, "Dedicated operating workflow with clean analytics, action queues, documents, communication, and conversion guidance.", `<a class="button" href="/deals/" data-link>Open deals</a>`)}
    <section class="section">
      ${metricGrid(data.metrics)}
      <div class="module-grid">${data.flows.map((flow) => `<article class="module-card"><strong>${flow}</strong><span>Operational workspace</span></article>`).join("")}</div>
    </section>
  `;
}

function comparePage() {
  const rows = ["Price", "Area", "Amenities", "Builder", "Travel Time", "Investment Potential", "Rental Yield", "Safety", "Growth", "Maintenance", "Pros", "Cons", "Trust Score"];
  const compared = getProperties().slice(0, 3);
  return `
    ${page("Property Comparison", "Compare", "Side-by-side decisions across price, area, amenities, builder, travel time, investment potential, rental yield, safety, growth, maintenance, pros, cons, and trust.", "")}
    <section class="section compare-table">
      ${rows.map((row) => `<div class="compare-row"><strong>${row}</strong>${compared.map((p) => `<span>${row === "Price" ? p.price : row === "Trust Score" ? p.trust : row === "Rental Yield" ? p.yield : row === "Travel Time" ? p.commute : row === "Investment Potential" ? p.investment : row === "Amenities" ? p.amenities : p.area}</span>`).join("")}</div>`).join("")}
    </section>
  `;
}

function visitsPage() {
  return `
    ${page("Site Visit Management", "Visit Operations", "Book, reschedule, cancel, track, receive reminders, leave feedback, and manage multiple visits.", `<button class="button" type="button" data-empty-state>Show empty state</button>`)}
    ${currentUser ? `<section class="section"><form class="os-form" data-visit-form><h2>Book real visit</h2><label>Property<select name="property_id">${getProperties().map((p) => `<option value="${p.id}">${p.title}</option>`).join("")}</select></label><label>Date and time<input name="scheduled_at" type="datetime-local" required /></label><button class="button" type="submit">Book visit in Supabase</button></form></section>` : requireAuthMessage()}
    <section class="section board-grid">${visits.map(([flow, property, time, status]) => `<article><span>${flow}</span><h3>${property}</h3><p>${time}</p><strong>${status}</strong></article>`).join("")}</section>
  `;
}

function dealsPage() {
  return `
    ${page("Deal Management", "Deal OS", "Offer creation, negotiation tracking, deal timeline, document exchange, progress tracking, and closing checklist.", `<a class="button" href="/legal/" data-link>Legal checklist</a>`)}
    ${currentUser ? `<section class="section"><form class="os-form" data-deal-form><h2>Create real offer</h2><label>Property<select name="property_id">${getProperties().map((p) => `<option value="${p.id}">${p.title}</option>`).join("")}</select></label><label>Offer amount<input name="offer_amount" type="number" value="11200000" required /></label><button class="button" type="submit">Create offer in Supabase</button></form></section>` : requireAuthMessage()}
    <section class="section board-grid">${deals.map(([flow, property, value, status]) => `<article><span>${flow}</span><h3>${property}</h3><p>${value}</p><strong>${status}</strong></article>`).join("")}</section>
  `;
}

function notFoundPage() {
  return page("Page not found", "Empty State", "This route is not configured yet. Use the navigation to return to a working workspace.", `<a class="button" href="/" data-link>Go home</a>`);
}

function renderRoute() {
  renderShell();
  const current = path();
  const routes = {
    "/": landingPage,
    "/search": searchPage,
    "/property/aster-park": propertyPage,
    "/map": mapPage,
    "/locality/whitefield": localityPage,
    "/consultant": consultantPage,
    "/investor": investorPage,
    "/legal": legalPage,
    "/auth": authPage,
    "/list-property": listPropertyPage,
    "/buyers": () => rolePage("buyers"),
    "/sellers": () => rolePage("sellers"),
    "/brokers": () => rolePage("brokers"),
    "/builders": () => rolePage("builders"),
    "/admin": () => rolePage("admin"),
    "/compare": comparePage,
    "/site-visits": visitsPage,
    "/deals": dealsPage,
  };
  app.innerHTML = (routes[current] || notFoundPage)();
  document.title = `Nivas OS | ${current === "/" ? "Home" : current.split("/").filter(Boolean).join(" / ")}`;
  app.focus({ preventScroll: true });
  if (current === "/map") {
    initLeafletMap();
  }
  if (current === "/list-property") {
    initListingMapPicker();
  }
}

function navigate(href) {
  window.history.pushState({}, "", href);
  renderRoute();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  if (rows.length < 2) return [];

  const headers = rows[0].map((header) => slugify(header).replace(/-/g, "_"));
  return rows.slice(1).map((values) =>
    headers.reduce((item, header, index) => {
      item[header] = values[index] || "";
      return item;
    }, {})
  );
}

function normalizeInventoryKind(row) {
  const raw = `${row.category || ""} ${row.type || ""} ${row.listing_kind || ""}`.toLowerCase();
  if (raw.includes("plot") || raw.includes("land") || raw.includes("jameen") || raw.includes("agricultural")) {
    return "land";
  }
  return "property";
}

function normalizeLandType(row) {
  const raw = `${row.category || ""} ${row.type || ""} ${row.land_type || ""}`.toLowerCase();
  if (raw.includes("agricultural") || raw.includes("farm")) return "agricultural";
  if (raw.includes("industrial")) return "industrial";
  if (raw.includes("commercial") || raw.includes("shop") || raw.includes("office")) return "commercial";
  if (raw.includes("plot") || raw.includes("land") || raw.includes("jameen")) return "residential";
  return null;
}

function normalizeImportedListing(row, index) {
  const title = row.title || row.name || `Imported listing ${index + 1}`;
  const listingKind = normalizeInventoryKind(row);
  const lat = Number(row.lat || row.latitude);
  const lng = Number(row.lng || row.longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error(`Row ${index + 2}: lat/lng missing or invalid.`);
  }

  return {
    id: `${slugify(title)}-${Date.now()}-${index}`,
    owner_id: currentUser.id,
    listing_kind: listingKind,
    land_type: listingKind === "land" ? normalizeLandType(row) : null,
    status: "published",
    title,
    city: row.city || "Unknown city",
    area: row.area || row.zone || "Unknown area",
    locality: row.locality || row.location || row.area || "Unknown locality",
    hierarchy: row.hierarchy || `India / ${row.city || "Unknown city"} / ${row.area || "Unknown area"} / ${row.locality || row.location || "Unknown locality"}`,
    type: row.type || row.category || (listingKind === "land" ? "Land / Plot" : "Property"),
    price: row.price || row.rent || "Price on request",
    budget: Number(row.budget || row.budget_numeric || row.price_numeric || 0),
    size: row.size || row.area_size || "",
    bedrooms: Number(row.bedrooms || row.bhk || 0),
    possession: row.possession || row.availability || "To be verified",
    verification: "Real inventory import - pending verification",
    owner_type: currentProfile?.role || "owner",
    score: 64,
    trust: 52,
    builder: 0,
    area_score: 60,
    investment: listingKind === "land" ? 66 : 58,
    risk: 42,
    yield: row.yield || (String(row.category || row.type || "").toLowerCase().includes("pg") ? "Rental income" : "To be verified"),
    growth: row.growth || "To be verified",
    commute: row.commute || "To be verified",
    amenities: [row.amenities, row.source ? `Source: ${row.source}` : "", row.contact ? `Contact: ${row.contact}` : ""].filter(Boolean).join(" | "),
    image: "linear-gradient(135deg, #f6f1e8, #8aa6a3 46%, #263238)",
    lat,
    lng,
  };
}

async function upsertProfileFromForm(form, userId) {
  const client = await getSupabaseClient();
  const payload = Object.fromEntries(new FormData(form).entries());
  const { error } = await client.from("profiles").upsert({
    id: userId,
    full_name: payload.full_name || "",
    phone: payload.phone || "",
    role: payload.role || "buyer",
    company_name: payload.company_name || "",
    city: payload.city || "",
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  await loadProfile();
}

async function saveListing(form) {
  if (!currentUser) throw new Error("Login required.");
  const client = await getSupabaseClient();
  const data = new FormData(form);
  const title = data.get("title");
  const id = `${slugify(title)}-${Date.now()}`;
  let image = "linear-gradient(135deg, #ccbfae, #7f9788 46%, #2b3740)";
  const file = data.get("image_file");

  if (file && file.name) {
    const path = `${currentUser.id}/${id}-${slugify(file.name)}`;
    const upload = await client.storage.from("property-images").upload(path, file, { upsert: true });
    if (upload.error) throw upload.error;
    const publicUrl = client.storage.from("property-images").getPublicUrl(path);
    image = `url("${publicUrl.data.publicUrl}")`;
  }

  const payload = {
    id,
    owner_id: currentUser.id,
    listing_kind: data.get("listing_kind"),
    land_type: data.get("land_type") || null,
    status: "published",
    title,
    city: data.get("city"),
    area: data.get("area"),
    locality: data.get("locality"),
    hierarchy: data.get("hierarchy"),
    type: data.get("type"),
    price: data.get("price"),
    budget: Number(data.get("budget") || 0),
    size: data.get("size"),
    bedrooms: Number(data.get("bedrooms") || 0),
    possession: data.get("possession"),
    verification: "Owner Verified",
    owner_type: currentProfile?.role || "owner",
    score: 78,
    trust: 72,
    builder: 0,
    area_score: 76,
    investment: 74,
    risk: 28,
    yield: data.get("listing_kind") === "land" ? "NA" : "3.2%",
    growth: "Medium",
    commute: "To be verified",
    amenities: data.get("amenities"),
    image,
    lat: Number(data.get("lat")),
    lng: Number(data.get("lng")),
  };

  const { error } = await client.from("properties").insert(payload);
  if (error) throw error;
  await loadSupabaseProperties();
  return id;
}

async function importBulkListings(form) {
  if (!currentUser) throw new Error("Login required.");
  const client = await getSupabaseClient();
  const rows = parseCsv(new FormData(form).get("csv") || "");
  if (!rows.length) throw new Error("CSV needs a header row and at least one listing row.");
  const payload = rows.map((row, index) => normalizeImportedListing(row, index));
  const { error } = await client.from("properties").insert(payload);
  if (error) throw error;
  await loadSupabaseProperties();
  return payload.length;
}

document.addEventListener("submit", async (event) => {
  const authForm = event.target.closest("[data-auth-form]");
  const profileForm = event.target.closest("[data-profile-form]");
  const listingForm = event.target.closest("[data-listing-form]");
  const bulkImportForm = event.target.closest("[data-bulk-import-form]");
  const visitForm = event.target.closest("[data-visit-form]");
  const dealForm = event.target.closest("[data-deal-form]");

  if (!authForm && !profileForm && !listingForm && !bulkImportForm && !visitForm && !dealForm) return;
  event.preventDefault();

  try {
    const client = await getSupabaseClient();

    if (authForm) {
      const values = Object.fromEntries(new FormData(authForm).entries());
      if (authForm.dataset.authForm === "sign-up") {
        const { data, error } = await client.auth.signUp({
          email: values.email,
          password: values.password,
        });
        if (error) throw error;
        if (data.user) {
          await client.from("profiles").upsert({ id: data.user.id, role: values.role || "buyer" });
        }
        showToast("Account created. Check email confirmation if Supabase requires it.");
      } else {
        const { error } = await client.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        if (error) throw error;
        showToast("Signed in.");
      }
      return;
    }

    if (profileForm) {
      await upsertProfileFromForm(profileForm, currentUser.id);
      showToast("Profile saved.");
      renderRoute();
      return;
    }

    if (listingForm) {
      const id = await saveListing(listingForm);
      showToast("Listing saved to Supabase.");
      navigate(`/map/?listing=${encodeURIComponent(id)}`);
      return id;
    }

    if (bulkImportForm) {
      const count = await importBulkListings(bulkImportForm);
      showToast(`${count} real inventory listings imported.`);
      navigate("/map/");
      return count;
    }

    if (visitForm) {
      if (!currentUser) throw new Error("Login required.");
      const values = Object.fromEntries(new FormData(visitForm).entries());
      const { error } = await client.from("site_visits").insert({
        property_id: values.property_id,
        visitor_id: currentUser.id,
        scheduled_at: values.scheduled_at,
        status: "requested",
      });
      if (error) throw error;
      showToast("Visit booked in Supabase.");
      return;
    }

    if (dealForm) {
      if (!currentUser) throw new Error("Login required.");
      const values = Object.fromEntries(new FormData(dealForm).entries());
      const { error } = await client.from("deals").insert({
        property_id: values.property_id,
        buyer_id: currentUser.id,
        offer_amount: Number(values.offer_amount),
        status: "offer_created",
        timeline: [{ label: "Offer Creation", at: new Date().toISOString() }],
      });
      if (error) throw error;
      showToast("Offer created in Supabase.");
    }
  } catch (error) {
    showToast(error.message || "Supabase action failed. Run supabase-setup.sql and try again.");
  }
});

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-sign-out]")) {
    event.preventDefault();
    getSupabaseClient()
      .then((client) => client.auth.signOut())
      .then(() => {
        currentUser = null;
        currentProfile = null;
        showToast("Signed out.");
        navigate("/");
      });
    return;
  }

  const link = event.target.closest("[data-link]");
  if (link) {
    event.preventDefault();
    navigate(link.getAttribute("href"));
    return;
  }

  const layer = event.target.closest(".layer-toggle");
  if (layer) {
    layer.classList.toggle("active");
    const status = layer.querySelector("span:last-child");
    if (status) status.textContent = layer.classList.contains("active") ? "On" : "Off";
    toggleMapLayer(layer);
  }

  if (event.target.closest("[data-send-consultant]")) {
    const input = document.querySelector("#advisor-input");
    const log = document.querySelector("#chat-log");
    if (input && log) {
      log.insertAdjacentHTML("beforeend", `<p><strong>User:</strong> ${input.value}</p><p><strong>Nivas AI:</strong> I will check land type, road connectivity, government projects, legal risk indicators, growth corridors, and exit potential before recommending options.</p>`);
      input.value = "Show properties with low risk and high rental demand.";
    }
  }

  if (event.target.closest("[data-empty-state]")) {
    drawerRoot.innerHTML = `<aside class="toast">No visits found for this filter. Try upcoming visits or book a verified slot.</aside>`;
    setTimeout(() => (drawerRoot.innerHTML = ""), 2200);
  }
});

window.addEventListener("popstate", renderRoute);
renderRoute();
loadSupabaseProperties();
initializeAuth();
