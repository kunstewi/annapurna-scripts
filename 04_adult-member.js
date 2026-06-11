// ============================================================
// ANNAPURNA BHANDAR — ADULT MEMBER PAGE
// Paste entire script in DevTools Console -> Enter
// ============================================================

const DATA = {
  member_type: "Adult",
  member_name: "kanai kumar", 
  relation_with_head: "Grandson",
  dob: "26/01/2005", 
  gender: "male", 
  category: "ur",
  religion: "hindu",
  mobile: "8509546605",
  yes_no_after_mobile: "No", // disability 
  aadhaar: "221373659682", 
  epic_no: "RJR98432", 
  assembly_constituency: "285", 
  constituency_no: "285", 
  part_no: "",
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(check, timeoutMs = 10000, intervalMs = 250) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const value = check();
    if (value) return value;
    await sleep(intervalMs);
  }
  return null;
}

function normRaw(value) {
  return String(value ?? "").trim();
}

function normName(value) {
  return normRaw(value).toUpperCase();
}

function normDigits(value) {
  return String(value ?? "").replace(/\D/g, "");
}

function normID(value) {
  return normRaw(value).toUpperCase().replace(/\s+/g, "");
}

function normDOB(value) {
  const raw = normRaw(value);
  if (!raw) return "";

  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(raw)) return raw;

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;

  const dash = raw.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dash) return `${dash[1]}/${dash[2]}/${dash[3]}`;

  return raw;
}

function normDateInputValue(value) {
  const dob = normDOB(value);
  const parts = dob.split("/");
  if (parts.length !== 3) return dob;
  return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
}

function parseDOB(value) {
  const dob = normDOB(value);
  const parts = dob.split("/");
  if (parts.length !== 3) return null;

  const day = Number(parts[0]);
  const month = Number(parts[1]);
  const year = Number(parts[2]);
  if (!day || !month || !year) return null;

  const parsed = new Date(year, month - 1, day);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

function getAgeFromDOB(value) {
  const dob = parseDOB(value);
  if (!dob) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const dayDiff = today.getDate() - dob.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
}

function isAdultByDOB(value) {
  const age = getAgeFromDOB(value);
  return age == null ? null : age >= 18;
}

function normMemberType(value) {
  const v = normRaw(value).toLowerCase();
  return v === "c" || v.startsWith("chi") ? "Child" : "Adult";
}

function normRelation(value) {
  const v = normRaw(value).toLowerCase();
  if (v.startsWith("fat")) return "Father";
  if (v.startsWith("mot")) return "Mother";
  if (v.startsWith("hus")) return "Husband";
  if (v.startsWith("wif")) return "Wife";
  return normRaw(value);
}

function normGender(value) {
  const v = normRaw(value).toLowerCase();
  if (v === "m" || v.startsWith("mal")) return "Male";
  if (v === "f" || v.startsWith("fem")) return "Female";
  if (v === "o" || v.startsWith("oth")) return "Other";
  return normRaw(value);
}

function normCategory(value) {
  const v = normRaw(value)
    .toLowerCase()
    .replace(/[\s()_-]/g, "");

  if (
    v === "ur" ||
    v === "gen" ||
    v === "general" ||
    v === "unreserved" ||
    v === "urunreservedcategory"
  ) {
    return "UR";
  }

  if (v === "ews" || v === "urews" || v.includes("economicallyweaker")) {
    return "UR-EWS";
  }

  if (v === "sc" || v.includes("scheduledcaste")) return "SC";
  if (v === "st" || v.includes("scheduledtribe")) return "ST";
  return normRaw(value);
}

function normReligion(value) {
  const v = normRaw(value).toLowerCase();
  if (!v) return "";
  if (v.startsWith("bud")) return "Buddhism";
  if (v.startsWith("chr")) return "Christianity";
  if (v.startsWith("hin")) return "Hinduism";
  if (v.startsWith("isl") || v.startsWith("mus")) return "Islam";
  return normRaw(value);
}

function normYesNo(value) {
  const v = normRaw(value).toLowerCase();
  return v === "y" || v === "yes" || v === "true" ? "Yes" : "No";
}

function getModel() {
  return {
    member_type: DATA.member_type ?? DATA.type ?? "Adult",
    member_name: DATA.member_name ?? DATA.name ?? "",
    relation_with_head:
      DATA.relation_with_head ?? DATA.relation_with_hof ?? DATA.relation ?? "",
    dob: DATA.dob ?? DATA.date_of_birth ?? "",
    gender: DATA.gender ?? "",
    category: DATA.category ?? "",
    religion: DATA.religion ?? "",
    mobile: DATA.mobile ?? DATA.contact_no ?? DATA.contact ?? "",
    yes_no_after_mobile:
      DATA.yes_no_after_mobile ?? DATA.radio_group_1 ?? DATA.mobile_radio ?? "",
    aadhaar: DATA.aadhaar ?? DATA.aadhaar_no ?? DATA.aadhar ?? "",
    epic_no: DATA.epic_no ?? DATA.epic ?? DATA.epic_id ?? DATA.voter_no ?? "",
    assembly_constituency:
      DATA.assembly_constituency ?? DATA.constituency ?? DATA.ac_name ?? "",
    constituency_no:
      DATA.constituency_no ?? DATA.ac_no ?? DATA.assembly_no ?? DATA.no ?? "",
    part_no: DATA.part_no ?? DATA.part ?? "",
  };
}

function getFields() {
  return Array.from(document.querySelectorAll("input, select, textarea")).filter(
    (el) => el.getBoundingClientRect().height > 0,
  );
}

function getVisibleInputs(selector) {
  return Array.from(document.querySelectorAll(selector)).filter(
    (el) => el.getBoundingClientRect().height > 0,
  );
}

function getVisibleSelects() {
  return getVisibleInputs("select");
}

function isTextLikeField(el) {
  if (!el) return false;
  if (el.tagName === "TEXTAREA") return true;
  if (el.tagName !== "INPUT") return false;

  const type = String(el.type || "").toLowerCase();
  return ["", "text", "tel", "search", "number", "email"].includes(type);
}

function getVisibleTextLikeFields() {
  return getFields().filter((el) => isTextLikeField(el));
}

function getOptionTexts(el) {
  if (!el || el.tagName !== "SELECT") return [];
  return Array.from(el.options)
    .map((option) => String(option.text || "").trim().toLowerCase())
    .filter(Boolean);
}

function extractLabel(el) {
  return (
    (
      (el.id ? document.querySelector(`label[for="${el.id}"]`) : null) ||
      el.closest("label") ||
      el.previousElementSibling ||
      el.parentElement?.previousElementSibling ||
      el.closest("div")?.querySelector("span:first-child, p:first-child") ||
      el.closest("div")?.querySelector("label")
    )?.textContent || ""
  )
    .replace(/\s+/g, " ")
    .trim();
}

function getFieldHintBlob(el) {
  return [
    el.placeholder || "",
    el.name || "",
    el.id || "",
    extractLabel(el),
    el.getAttribute("aria-label") || "",
    el.getAttribute("formcontrolname") || "",
  ]
    .join(" ")
    .toLowerCase();
}

function findByLabel(keywords, type = null) {
  const wanted = keywords.map((keyword) => String(keyword).toLowerCase());

  for (const el of getFields()) {
    if (type && el.tagName !== type && el.type !== type) continue;
    const haystack = getFieldHintBlob(el);
    if (wanted.some((keyword) => haystack.includes(keyword))) return el;
  }

  return null;
}

function findBestTextField({
  keywords = [],
  disallowKeywords = [],
  exclude = [],
  preferredIndex = null,
} = {}) {
  const excluded = new Set(exclude.filter(Boolean));
  const fields = getVisibleTextLikeFields().filter((el) => !excluded.has(el));
  if (!fields.length) return null;

  const wanted = keywords.map((keyword) => String(keyword).toLowerCase());
  const disallowed = disallowKeywords.map((keyword) =>
    String(keyword).toLowerCase(),
  );

  let bestField = null;
  let bestScore = -Infinity;

  fields.forEach((field, index) => {
    const blob = getFieldHintBlob(field);
    if (disallowed.some((keyword) => blob.includes(keyword))) return;

    let score = 0;
    for (const keyword of wanted) {
      if (keyword && blob.includes(keyword)) score += 10;
    }

    if (preferredIndex != null) {
      score -= Math.abs(index - preferredIndex);
    }

    if (score > bestScore) {
      bestScore = score;
      bestField = field;
    }
  });

  return bestScore >= 0 ? bestField : null;
}

function fill(el, value) {
  if (!el || value == null || value === "") return false;

  const proto =
    el.tagName === "SELECT"
      ? HTMLSelectElement.prototype
      : el.tagName === "TEXTAREA"
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;

  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (setter) setter.call(el, value);
  else el.value = value;

  ["input", "change", "blur"].forEach((eventName) =>
    el.dispatchEvent(new Event(eventName, { bubbles: true })),
  );

  return true;
}

function selectOption(el, text) {
  if (!el || !text || el.tagName !== "SELECT") return false;

  const needle = normRaw(text).toLowerCase();
  const options = Array.from(el.options);
  const match =
    options.find((o) => o.text.trim().toLowerCase() === needle) ||
    options.find((o) => String(o.value).trim().toLowerCase() === needle) ||
    options.find((o) => o.text.trim().toLowerCase().startsWith(needle)) ||
    options.find((o) => String(o.value).trim().toLowerCase().startsWith(needle)) ||
    options.find((o) => o.text.trim().toLowerCase().includes(needle)) ||
    options.find((o) => String(o.value).trim().toLowerCase().includes(needle));

  if (!match) {
    console.warn(
      `⚠️  No match for "${text}". Available: ${options
        .map((o) => o.text)
        .filter(Boolean)
        .join(" | ")}`,
    );
    return false;
  }

  return fill(el, match.value);
}

function hasUsableOptions(el) {
  if (!el || el.tagName !== "SELECT") return false;
  return Array.from(el.options).some((o) => {
    const text = String(o.text || "").trim();
    return text && !/^select\b/i.test(text);
  });
}

async function waitForSelectReady(keywords, timeoutMs = 10000) {
  return waitFor(() => {
    const field = findByLabel(keywords, "SELECT");
    if (!field) return null;
    return hasUsableOptions(field) ? field : null;
  }, timeoutMs);
}

function findSelectByOptionText(keywords) {
  const wanted = keywords.map((k) => String(k).trim().toLowerCase()).filter(Boolean);
  if (!wanted.length) return null;

  const readySelects = getVisibleSelects().filter((el) => hasUsableOptions(el));
  let bestMatch = null;
  let bestScore = 0;

  for (const select of readySelects) {
    const optionBlob = getOptionTexts(select).join(" ");
    const score = wanted.filter((keyword) => optionBlob.includes(keyword)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = select;
    }
  }

  return bestScore > 0 ? bestMatch : null;
}

async function waitForSelectByOptionText(keywords, timeoutMs = 2000) {
  return waitFor(() => findSelectByOptionText(keywords), timeoutMs, 100);
}

function getVisibleAutocompleteOptions() {
  return Array.from(
    document.querySelectorAll(
      'mat-option, .ng-option, [role="option"], .dropdown-item, li[class*="option"], .autocomplete-item',
    ),
  ).filter((el) => el.getBoundingClientRect().height > 0);
}

function getOptionText(el) {
  return String(el?.textContent || "")
    .replace(/\s+/g, " ")
    .trim();
}

function dispatchKey(el, key) {
  ["keydown", "keyup"].forEach((type) => {
    el.dispatchEvent(
      new KeyboardEvent(type, {
        key,
        code: key,
        bubbles: true,
      }),
    );
  });
}

function clickElement(el) {
  if (!el) return false;
  ["mouseenter", "mousemove", "mousedown", "mouseup", "click"].forEach((type) => {
    el.dispatchEvent(new MouseEvent(type, { bubbles: true }));
  });
  if (typeof el.click === "function") el.click();
  return true;
}

async function fillSearch(el, text) {
  if (!el || !text) return false;

  el.focus();
  fill(el, text);
  dispatchKey(el, "ArrowDown");

  const option = await waitFor(() => {
    const needle = normRaw(text).toLowerCase();
    const options = getVisibleAutocompleteOptions();
    if (!options.length) return null;

    return (
      options.find((opt) => getOptionText(opt).toLowerCase() === needle) ||
      options.find((opt) => getOptionText(opt).toLowerCase().startsWith(needle)) ||
      options.find((opt) => getOptionText(opt).toLowerCase().includes(needle)) ||
      options[0]
    );
  }, 1800, 100);

  if (option) {
    clickElement(option);
    return true;
  }

  dispatchKey(el, "Enter");
  await sleep(150);
  return normRaw(el.value).toLowerCase() === normRaw(text).toLowerCase();
}

function getRadioGroups() {
  const radios = getVisibleInputs('input[type="radio"]');
  const groups = [];
  const seenNames = new Set();

  for (const radio of radios) {
    const name = radio.name?.trim();
    if (name && !seenNames.has(name)) {
      seenNames.add(name);
      groups.push(radios.filter((r) => r.name === name));
    }
  }

  if (groups.length) return groups;

  for (let i = 0; i < radios.length; i += 2) {
    groups.push(radios.slice(i, i + 2));
  }

  return groups;
}

function clickRadioInGroup(groupIndex, value) {
  if (value == null || value === "") return false;

  const groups = getRadioGroups();
  const group = groups[groupIndex];
  if (!group?.length) {
    console.warn(`⚠️  Radio group ${groupIndex + 1} not found`);
    return false;
  }

  const wanted = normRaw(value).toLowerCase();
  const match = group.find((radio) => {
    const labelText = extractLabel(radio).toLowerCase();
    const aria = String(radio.getAttribute("aria-label") || "").toLowerCase();
    const rawValue = String(radio.value || "").toLowerCase();
    return (
      labelText === wanted ||
      rawValue === wanted ||
      labelText.startsWith(wanted) ||
      rawValue.startsWith(wanted) ||
      labelText.includes(wanted) ||
      aria.includes(wanted)
    );
  });

  const fallback =
    group.find((radio) => extractLabel(radio).toLowerCase().startsWith(wanted)) ||
    (wanted === "yes" ? group[0] : wanted === "no" ? group[group.length - 1] : null);

  const target = match || fallback;
  if (!target) return false;

  target.click();
  target.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

async function waitForAdultTextFields(minCount = 3, timeoutMs = 6000) {
  return waitFor(() => {
    const fields = getVisibleTextLikeFields();
    return fields.length >= minCount ? fields : null;
  }, timeoutMs);
}

async function fillFieldElement(field, value, label) {
  if (!field || value == null || value === "") return null;
  fill(field, value);
  console.log(`  ✓ ${label.padEnd(32)} -> "${value}"`);
  return field;
}

async function fillOrderedTextField({
  orderIndex,
  value,
  label,
  keywords = [],
  disallowKeywords = [],
  exclude = [],
  timeoutMs = 6000,
}) {
  if (value == null || value === "") return null;

  const field = await waitFor(() => {
    const best = findBestTextField({
      keywords,
      disallowKeywords,
      exclude,
      preferredIndex: orderIndex,
    });
    if (best) return best;

    const fields = getVisibleTextLikeFields().filter(
      (el) => !exclude.filter(Boolean).includes(el),
    );
    return fields[orderIndex] || null;
  }, timeoutMs);

  if (!field) {
    console.warn(`⚠️  ${label} -> field not found`);
    return null;
  }

  return fillFieldElement(field, value, label);
}

async function fillDOB(value) {
  if (value == null || value === "") return null;

  const field = await waitFor(
    () => findByLabel(["date of birth", "dob"]) || getFields().find((el) => el.type === "date"),
    6000,
  );

  if (!field) {
    console.warn("⚠️  Date of Birth -> field not found");
    return null;
  }

  const normalized = field.type === "date" ? normDateInputValue(value) : normDOB(value);
  fill(field, normalized);
  console.log(`  ✓ ${"Date of Birth".padEnd(32)} -> "${normalized}"`);
  return field;
}

async function selectField(keywords, value, label, extra = {}) {
  if (value == null || value === "") return null;

  const { optionKeywords = [], labelTimeoutMs = 2500, optionTimeoutMs = 1500 } = extra;

  const field =
    (await waitForSelectReady(keywords, labelTimeoutMs)) ||
    (await waitForSelectByOptionText(optionKeywords, optionTimeoutMs));

  if (!field) {
    console.warn(`⚠️  ${label} -> field not found`);
    return null;
  }

  const ok = selectOption(field, value);
  if (ok) {
    console.log(`  ✓ ${label.padEnd(32)} -> "${value}"`);
  } else {
    console.warn(`⚠️  ${label} -> "${value}"`);
  }

  return field;
}

async function fillAssemblyConstituency(value) {
  if (value == null || value === "") return null;

  const field = await waitFor(() => {
    return (
      findBestTextField({
        keywords: ["assembly constituency", "search constituency", "constituency"],
        disallowKeywords: ["part no", "aadhaar", "epic", "contact"],
        preferredIndex: 4,
      }) ||
      null
    );
  }, 6000);

  if (!field) {
    console.warn("⚠️  Assembly Constituency -> field not found");
    return null;
  }

  const picked = await fillSearch(field, value);
  const shown = picked ? value : `${value} (typed)`;
  console.log(`  ✓ ${"Assembly Constituency".padEnd(32)} -> "${shown}"`);
  return field;
}

async function waitForVoterBlock(timeoutMs = 4000) {
  return waitFor(() => {
    const epicField = findByLabel(["epic no", "epic number", "epic", "voter id", "voter number"]);
    const constituencyField = findByLabel(["assembly constituency", "search constituency"]);
    const partField = findByLabel(["part no", "part number"]);
    return epicField || constituencyField || partField || null;
  }, timeoutMs);
}

async function fillAdultMemberPage() {
  const model = getModel();
  const fields = getFields();

  console.log(
    `%c👤 Annapurna Adult Member Filler — ${fields.length} fields found`,
    "color:#2e7d32;font-weight:bold;font-size:13px",
  );

  const memberType = normMemberType(model.member_type);
  if (clickRadioInGroup(0, memberType)) {
    console.log(`  ✓ ${"Member Type".padEnd(32)} -> "${memberType}"`);
    await sleep(400);
  } else {
    console.warn(`⚠️  Member Type -> "${memberType}"`);
  }

  await waitForAdultTextFields(3, 6000);

  await fillOrderedTextField({
    orderIndex: 0,
    value: normName(model.member_name),
    label: "Member Name",
    keywords: ["name", "as per aadhaar", "official id"],
  });

  await selectField(
    ["relation with head of family", "relation"],
    normRelation(model.relation_with_head),
    "Relation with Head",
    {
      optionKeywords: ["father", "mother", "husband", "wife"],
    },
  );

  await fillDOB(model.dob);

  await selectField(["gender"], normGender(model.gender), "Gender", {
    optionKeywords: ["male", "female", "other"],
  });

  await selectField(["category"], normCategory(model.category), "Category", {
    optionKeywords: ["unreserved", "ews", "scheduled caste", "scheduled tribe"],
  });

  await selectField(["religion"], normReligion(model.religion), "Religion", {
    optionKeywords: ["buddhism", "christianity", "hinduism", "islam"],
  });

  await fillOrderedTextField({
    orderIndex: 1,
    value: normDigits(model.mobile),
    label: "Contact No",
    keywords: ["contact no", "aadhaar linked mobile", "mobile", "contact"],
  });

  const trailingYesNo = normYesNo(model.yes_no_after_mobile);
  if (model.yes_no_after_mobile !== "") {
    if (clickRadioInGroup(1, trailingYesNo)) {
      console.log(`  ✓ ${"Yes / No After Mobile".padEnd(32)} -> "${trailingYesNo}"`);
    } else {
      console.warn(`⚠️  Yes / No After Mobile -> "${trailingYesNo}"`);
    }
  }

  await fillOrderedTextField({
    orderIndex: 2,
    value: normDigits(model.aadhaar),
    label: "Aadhaar No",
    keywords: ["aadhaar no", "aadhaar number", "aadhar no", "aadhar number", "aadhaar"],
  });

  const adultByDOB = isAdultByDOB(model.dob);
  if (adultByDOB === false) {
    console.log(`  ↷ ${"Voter Details".padEnd(32)} -> skipped (DOB under 18)`);
  } else {
    await waitForVoterBlock(4000);

    await fillOrderedTextField({
      orderIndex: 3,
      value: normID(model.epic_no),
      label: "EPIC No",
      keywords: ["epic no", "epic number", "epic", "voter id", "voter number"],
      timeoutMs: 3000,
    });

    await fillAssemblyConstituency(normRaw(model.assembly_constituency));

    await fillOrderedTextField({
      orderIndex: 5,
      value: normRaw(model.constituency_no),
      label: "Constituency No",
      keywords: ["constituency no", "assembly no", "no."],
      disallowKeywords: ["part no", "aadhaar", "epic", "contact"],
      timeoutMs: 3000,
    });

    await fillOrderedTextField({
      orderIndex: 6,
      value: normRaw(model.part_no),
      label: "Part No",
      keywords: ["part no", "part number"],
      timeoutMs: 3000,
    });
  }

  if (adultByDOB == null) {
    console.log(`  ↷ ${"Age Check".padEnd(32)} -> DOB format not parsed; voter fields handled if visible`);
  }

  console.log(
    "%c✅ Done! Check any ⚠️ warnings above.",
    "color:#2e7d32;font-weight:bold;font-size:13px",
  );
}

void fillAdultMemberPage();
