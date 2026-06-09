// ============================================================
// ANNAPURNA BHANDAR — PAGE 1: Basic Info + Aadhaar + Address + Voter
// Paste entire script in DevTools Console → Enter
// ============================================================

// ─── YOUR DATA — type casually, all lowercase is fine ────────
const DATA = {
  hof_name: "kanai kumar", // any case → auto UPPER CASE
  dob: "20/11/1999", // any format: 20/11/1999 or 1999-11-20
  gender: "male", // male / female / other
  category: "ur", // ur/gen → UR (Unreserved), sc, st, obc-a, obc-b
  religion: "hindu", // hindu / islam / christian etc
  mobile: "9876543210",
  total_members: "4",
  disability: "n", // y/yes/n/no
  aadhaar: "221373659682", // spaces ok, auto-stripped
  address: "village rampur, po suri",
  district: "birbhum",
  area_type: "r", // r/rural/u/urban
  pincode: "731104",
  post_office: "Chinpai BO", // new added
  police_station: "sadaipur ps",
  block_mc_name: "dubrajpur", // new added
  gp_ward_name: "chinpai", // new added
  epic_no: "rjr8973428", // auto UPPER CASE
  constituency: "285 - Suri",
  part_no: "",
};
// ─────────────────────────────────────────────────────────────

// ── Normalizers ───────────────────────────────────────────────
function normName(s) {
  return String(s).trim().toUpperCase();
}
function normAddress(s) {
  return String(s)
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
function normID(s) {
  return String(s).trim().toUpperCase().replace(/\s/g, "");
}
function normAadhaar(s) {
  return String(s).replace(/\D/g, "");
}
function normRaw(s) {
  return String(s).trim();
}

function normDOB(s) {
  s = String(s).trim();
  // Already DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) return s;
  // YYYY-MM-DD → DD/MM/YYYY
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  // DD-MM-YYYY → DD/MM/YYYY
  const m2 = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (m2) return `${m2[1]}/${m2[2]}/${m2[3]}`;
  return s;
}

function normGender(s) {
  const g = String(s).toLowerCase().trim();
  if (g === "m" || g.startsWith("mal")) return "Male";
  if (g === "f" || g.startsWith("fem")) return "Female";
  return "Other";
}

function normCategory(s) {
  const c = String(s)
    .toLowerCase()
    .replace(/[\s\-]/g, "");
  if (c === "ur" || c === "gen" || c === "general" || c === "unreserved")
    return "UR";
  if (c === "sc") return "SC";
  if (c === "st") return "ST";
  if (c === "obca" || c === "obc-a") return "OBC-A";
  if (c === "obcb" || c === "obc-b") return "OBC-B";
  if (c === "pvtg") return "PVTG";
  return String(s).trim();
}

function normArea(s) {
  const a = String(s).toLowerCase().trim();
  if (a === "r" || a.startsWith("rur")) return "Rural";
  if (a === "u" || a.startsWith("urb")) return "Urban";
  return String(s).trim();
}

function normDisability(s) {
  const d = String(s).toLowerCase().trim();
  return d === "y" || d === "yes" ? "Yes" : "No";
}

// ── Core fill helpers ─────────────────────────────────────────
function getFields() {
  return Array.from(
    document.querySelectorAll("input, select, textarea"),
  ).filter((el) => el.getBoundingClientRect().height > 0);
}

function fill(el, value) {
  if (!el || value == null || value === "") return false;
  const tag = el.tagName;
  const proto =
    tag === "SELECT"
      ? HTMLSelectElement.prototype
      : tag === "TEXTAREA"
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (setter) setter.call(el, value);
  else el.value = value;
  ["input", "change", "blur"].forEach((e) =>
    el.dispatchEvent(new Event(e, { bubbles: true })),
  );
  return true;
}

// Fuzzy dropdown — exact → startsWith → includes, all case-insensitive
function selectOption(el, text) {
  if (!el || !text) return false;
  if (el.tagName !== "SELECT") {
    console.warn(`⚠️  Not a SELECT:`, el);
    return false;
  }
  const t = String(text).toLowerCase().trim();
  const opts = Array.from(el.options);
  const match =
    opts.find((o) => o.text.toLowerCase() === t) ||
    opts.find((o) => o.value.toLowerCase() === t) ||
    opts.find((o) => o.text.toLowerCase().startsWith(t)) ||
    opts.find((o) => o.value.toLowerCase().startsWith(t)) ||
    opts.find((o) => o.text.toLowerCase().includes(t)) ||
    opts.find((o) => o.value.toLowerCase().includes(t));
  if (match) {
    fill(el, match.value);
    return true;
  }
  console.warn(
    `⚠️  No match for "${text}". Available: ${opts
      .map((o) => o.text)
      .filter((t) => t)
      .join(" | ")}`,
  );
  return false;
}

function clickRadio(value) {
  const val = String(value).toLowerCase().trim();
  for (const r of document.querySelectorAll('input[type="radio"]')) {
    const labelEl =
      document.querySelector(`label[for="${r.id}"]`) ||
      r.closest("label") ||
      r.nextElementSibling;
    const labelText = (labelEl?.textContent || "").trim().toLowerCase();
    const rval = (r.value || "").toLowerCase();
    if (labelText === val || rval === val || labelText.startsWith(val)) {
      r.click();
      r.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }
  }
  console.warn(`⚠️  Radio not found for "${value}"`);
  return false;
}

async function fillSearch(el, text) {
  if (!el || !text) return;
  el.focus();
  fill(el, text);
  await new Promise((r) => setTimeout(r, 1000));
  const opt = document.querySelector(
    'mat-option, .ng-option, [role="option"], .dropdown-item, li[class*="option"], .autocomplete-item',
  );
  if (opt) {
    opt.click();
    return true;
  }
  console.warn(
    `⚠️  Constituency dropdown didn't appear for "${text}" — select manually`,
  );
  return false;
}

// ── Find field by label text (robust, doesn't rely on index) ──
function findByLabel(keywords, type = null) {
  const fields = getFields();
  for (const el of fields) {
    if (type && el.type !== type && el.tagName !== type) continue;
    // Check placeholder
    if (el.placeholder) {
      const ph = el.placeholder.toLowerCase();
      if (keywords.some((k) => ph.includes(k.toLowerCase()))) return el;
    }
    // Check nearby label
    const label =
      (
        (el.id ? document.querySelector(`label[for="${el.id}"]`) : null) ||
        el.closest("label") ||
        el.closest("div")?.querySelector("label") ||
        el.parentElement?.previousElementSibling
      )?.textContent
        ?.trim()
        .toLowerCase() || "";
    if (keywords.some((k) => label.includes(k.toLowerCase()))) return el;
  }
  return null;
}

// ── Fill by label — most reliable for this Angular app ────────
async function fillPage1() {
  const f = getFields();
  console.log(
    `%c🌾 Annapurna Filler — ${f.length} fields found`,
    "color:#2e7d32;font-weight:bold;font-size:13px",
  );

  const log = (label, val, ok = true) =>
    console.log(`  ${ok ? "✓" : "⚠"} ${label.padEnd(22)} → "${val}"`);
  const warn = (label, val) => log(label, val, false);

  // ── Strategy: find each field by label text, not index ──────
  // This is immune to index shifts from hidden/dynamic fields

  // HOF Name
  const fName = findByLabel(["hof name", "as per aadhaar", "official id"]);
  if (fName) {
    fill(fName, normName(DATA.hof_name));
    log("HOF Name", normName(DATA.hof_name));
  } else warn("HOF Name", "field not found");

  // DOB — look for date input
  const fDob =
    findByLabel(["date of birth", "dob"]) || f.find((el) => el.type === "date");
  if (fDob) {
    // Try date input (needs YYYY-MM-DD) vs text input (needs DD/MM/YYYY)
    const dobVal =
      fDob.type === "date"
        ? (() => {
            const d = normDOB(DATA.dob);
            const p = d.split("/");
            return p.length === 3
              ? `${p[2]}-${p[1].padStart(2, "0")}-${p[0].padStart(2, "0")}`
              : d;
          })()
        : normDOB(DATA.dob);
    fill(fDob, dobVal);
    log("Date of Birth", dobVal);
  } else warn("DOB", "field not found");

  // Gender
  const fGender =
    findByLabel(["gender"], "SELECT") ||
    f.find(
      (el) =>
        el.tagName === "SELECT" &&
        el.options.length > 0 &&
        Array.from(el.options).some((o) =>
          o.text.toLowerCase().includes("male"),
        ),
    );
  if (fGender) {
    selectOption(fGender, normGender(DATA.gender));
    log("Gender", normGender(DATA.gender));
  } else warn("Gender", "field not found");

  // Category
  const fCat = f.find(
    (el) =>
      el.tagName === "SELECT" &&
      Array.from(el.options).some((o) => /unreserved|SC|ST|OBC/i.test(o.text)),
  );
  if (fCat) {
    selectOption(fCat, normCategory(DATA.category));
    log("Category", normCategory(DATA.category));
  } else warn("Category", "field not found");

  // Religion
  const fRel = f.find(
    (el) =>
      el.tagName === "SELECT" &&
      Array.from(el.options).some((o) =>
        /hindu|islam|christian|buddhis/i.test(o.text),
      ),
  );
  if (fRel) {
    selectOption(fRel, DATA.religion);
    log("Religion", DATA.religion);
  } else warn("Religion", "field not found");

  // Mobile
  const fMobile =
    findByLabel(["contact", "mobile", "phone"]) ||
    f.find(
      (el) =>
        el.type === "tel" ||
        (el.type === "number" && el.placeholder?.includes("mobile")),
    );
  if (fMobile) {
    fill(fMobile, normRaw(DATA.mobile));
    log("Mobile", DATA.mobile);
  } else warn("Mobile", "field not found");

  // Total members
  const fMembers = findByLabel(["total", "family member", "including hof"]);
  if (fMembers) {
    fill(fMembers, normRaw(DATA.total_members));
    log("Total Members", DATA.total_members);
  } else warn("Total Members", "field not found");

  // Disability radio
  clickRadio(normDisability(DATA.disability));
  log("Disability", normDisability(DATA.disability));

  // Aadhaar
  const fAadhaar = findByLabel(["aadhaar no", "aadhar no", "aadhaar num"]);
  if (fAadhaar) {
    fill(fAadhaar, normAadhaar(DATA.aadhaar));
    log("Aadhaar", normAadhaar(DATA.aadhaar));
  } else warn("Aadhaar", "field not found");

  // Address
  const fAddr =
    findByLabel(["permanent address", "address"]) ||
    f.find((el) => el.tagName === "TEXTAREA");
  if (fAddr) {
    fill(fAddr, normAddress(DATA.address));
    log("Address", normAddress(DATA.address));
  } else warn("Address", "field not found");

  // District
  const fDist = f.find(
    (el) =>
      el.tagName === "SELECT" &&
      Array.from(el.options).some((o) =>
        /birbhum|purba|paschim|kolkata|malda|murshi/i.test(o.text),
      ),
  );
  if (fDist && DATA.district) {
    selectOption(fDist, DATA.district);
    log("District", DATA.district);
  }

  // Area Type
  const fArea = f.find(
    (el) =>
      el.tagName === "SELECT" &&
      Array.from(el.options).some((o) => /rural|urban/i.test(o.text)),
  );
  if (fArea) {
    selectOption(fArea, normArea(DATA.area_type));
    log("Area Type", normArea(DATA.area_type));
  } else warn("Area Type", "field not found");

  // Pincode
  const fPin = f.find(
    (el) =>
      el.tagName === "SELECT" &&
      Array.from(el.options).some((o) => /\d{6}/.test(o.text || o.value)),
  );
  if (fPin) {
    selectOption(fPin, DATA.pincode);
    log("Pincode", DATA.pincode);
  } else {
    const fPinText = findByLabel(["pincode", "pin code", "postal"]);
    if (fPinText) {
      fill(fPinText, DATA.pincode);
      log("Pincode", DATA.pincode);
    } else warn("Pincode", "field not found");
  }

  // Police Station
  const fPolice = f.find(
    (el) =>
      el.tagName === "SELECT" &&
      Array.from(el.options).some((o) => /police|station|ps /i.test(o.text)),
  );
  if (fPolice) {
    selectOption(fPolice, DATA.police_station);
    log("Police Station", DATA.police_station);
  } else warn("Police Station", "field not found");

  // EPIC No
  const fEpic = findByLabel(["epic", "voter"]);
  if (fEpic) {
    fill(fEpic, normID(DATA.epic_no));
    log("EPIC No", normID(DATA.epic_no));
  } else warn("EPIC No", "field not found");

  // Constituency (autocomplete search)
  const fConst =
    findByLabel(["constituency", "assembly"]) ||
    f.find((el) => el.placeholder?.toLowerCase().includes("constituency"));
  if (fConst) {
    await fillSearch(fConst, DATA.constituency);
    log("Constituency", DATA.constituency);
  } else warn("Constituency", "field not found");

  // Part No
  const fPart =
    findByLabel(["part no", "part number"]) ||
    f.find((el) => el.placeholder?.toLowerCase().includes("no."));
  if (fPart) {
    fill(fPart, normRaw(DATA.part_no));
    log("Part No", DATA.part_no);
  } else warn("Part No", "field not found");

  console.log(
    "%c✅ Done! Check any ⚠️ warnings above.",
    "color:#2e7d32;font-weight:bold;font-size:13px",
  );
}

fillPage1();
