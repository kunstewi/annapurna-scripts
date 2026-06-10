// ============================================================
// ANNAPURNA BHANDAR — INCOME PAGE
// Paste entire script in DevTools Console -> Enter
// ============================================================

const DATA = {
  // Known group: choosing "Yes" reveals PAN No. *
  has_pan_card: "Yes",
  pan_number: "ABCDE1234F",

  // Inspector only exposed generic Yes / No for the other radio groups,
  // so these are filled by visible group order on the page.
  radio_group_2: "No",

  income_amount_rs: "12000",

  occupation_types: [
    "Government Sector",
    "Part-time job",
  ],

  highest_educational_qualification: "12th/Uchcha Madhyamik",

  radio_group_3: "No",
  radio_group_4: "No",
  radio_group_5: "No",
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

function normYesNo(value) {
  const v = String(value ?? "")
    .trim()
    .toLowerCase();
  return v === "y" || v === "yes" || v === "true" ? "Yes" : "No";
}

function normPAN(value) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function normList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normRaw(item)).filter(Boolean);
  }
  return normRaw(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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

function getOptionTexts(el) {
  if (!el || el.tagName !== "SELECT") return [];
  return Array.from(el.options)
    .map((option) => String(option.text || "").trim().toLowerCase())
    .filter(Boolean);
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

function setChecked(el, wanted) {
  if (!el || el.checked === wanted) return true;
  el.click();
  el.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function extractLabel(el) {
  return (
    (
      (el.id ? document.querySelector(`label[for="${el.id}"]`) : null) ||
      el.closest("label") ||
      el.parentElement?.previousElementSibling ||
      el.closest("div")?.querySelector("span:first-child, p:first-child") ||
      el.closest("div")?.querySelector("label")
    )?.textContent || ""
  )
    .replace(/\s+/g, " ")
    .trim();
}

function findByLabel(keywords, type = null) {
  const wanted = keywords.map((k) => k.toLowerCase());

  for (const el of getFields()) {
    if (type && el.tagName !== type && el.type !== type) continue;

    const haystacks = [
      el.placeholder || "",
      el.name || "",
      el.id || "",
      extractLabel(el),
      el.getAttribute("aria-label") || "",
    ]
      .join(" ")
      .toLowerCase();

    if (wanted.some((k) => haystacks.includes(k))) return el;
  }

  return null;
}

function selectOption(el, text) {
  if (!el || !text || el.tagName !== "SELECT") return false;

  const needle = String(text).trim().toLowerCase();
  const options = Array.from(el.options);
  const match =
    options.find((o) => o.text.trim().toLowerCase() === needle) ||
    options.find((o) => String(o.value).trim().toLowerCase() === needle) ||
    options.find((o) => o.text.trim().toLowerCase().startsWith(needle)) ||
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

async function waitForAnySelectReady(timeoutMs = 10000) {
  return waitFor(() => {
    const selects = getVisibleSelects().filter((el) => hasUsableOptions(el));
    return selects.length === 1 ? selects[0] : null;
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
  const groups = getRadioGroups();
  const group = groups[groupIndex];
  if (!group?.length) {
    console.warn(`⚠️  Radio group ${groupIndex + 1} not found`);
    return false;
  }

  const wanted = normYesNo(value).toLowerCase();
  const match = group.find((radio) => {
    const labelText = extractLabel(radio).toLowerCase();
    const aria = String(radio.getAttribute("aria-label") || "").toLowerCase();
    const rawValue = String(radio.value || "").toLowerCase();
    return (
      labelText.includes(wanted) ||
      aria.includes(wanted) ||
      rawValue === wanted
    );
  });

  const fallback =
    group.find((radio) => extractLabel(radio).toLowerCase().startsWith(wanted)) ||
    (wanted === "yes" ? group[0] : group[group.length - 1]);

  const target = match || fallback;
  if (!target) return false;

  target.click();
  target.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function getOccupationCheckboxes() {
  return getVisibleInputs('input[type="checkbox"]').map((checkbox) => ({
    el: checkbox,
    label: extractLabel(checkbox),
  }));
}

function syncOccupationCheckboxes(values) {
  const wantedList = normList(values);
  if (!wantedList.length) return false;

  const wanted = wantedList.map((item) => item.toLowerCase());
  const options = getOccupationCheckboxes();

  if (!options.length) {
    console.warn("⚠️  Occupation checkbox group not found");
    return false;
  }

  const matched = new Set();

  for (const option of options) {
    const label = option.label.toLowerCase();
    const shouldCheck = wanted.some(
      (item) =>
        label === item ||
        label.startsWith(item) ||
        label.includes(item) ||
        item.includes(label),
    );

    if (shouldCheck) {
      matched.add(option.label);
      setChecked(option.el, true);
    } else {
      setChecked(option.el, false);
    }
  }

  const missing = wantedList.filter(
    (item) =>
      !options.some((option) =>
        option.label.toLowerCase().includes(item.toLowerCase()),
      ),
  );

  if (missing.length) {
    console.warn(
      `⚠️  Occupation option(s) not found: ${missing.join(", ")}`,
    );
  }

  console.log(
    `  ✓ ${"Occupation Types".padEnd(32)} -> "${wantedList.join(", ")}"`,
  );
  return matched.size > 0;
}

async function fillTextField(keywords, value, label, timeoutMs = 6000) {
  if (value == null || value === "") return null;

  const field = await waitFor(() => findByLabel(keywords), timeoutMs);
  if (!field) {
    console.warn(`⚠️  ${label} -> field not found`);
    return null;
  }

  fill(field, value);
  console.log(`  ✓ ${label.padEnd(32)} -> "${value}"`);
  return field;
}

async function fillIncomeAmount(value) {
  if (value == null || value === "") return null;

  const field =
    (await waitFor(
      () => findByLabel(["income", "monthly", "annual", "rs"], "number"),
      4000,
    )) ||
    getVisibleInputs('input[type="number"]')[0] ||
    null;

  if (!field) {
    console.warn("⚠️  Income Amount -> field not found");
    return null;
  }

  fill(field, value);
  console.log(`  ✓ ${"Income Amount".padEnd(32)} -> "${value}"`);
  return field;
}

async function selectField(keywords, value, label, extra = {}) {
  if (value == null || value === "") return null;

  const {
    optionKeywords = [],
    labelTimeoutMs = 1500,
    optionTimeoutMs = 1500,
    anyTimeoutMs = 500,
  } = extra;

  const field =
    (await waitForSelectReady(keywords, labelTimeoutMs)) ||
    (await waitForSelectByOptionText(optionKeywords, optionTimeoutMs)) ||
    (await waitForAnySelectReady(anyTimeoutMs));
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

async function fillIncomePage() {
  const fields = getFields();
  console.log(
    `%c💼 Annapurna Income Filler — ${fields.length} fields found`,
    "color:#2e7d32;font-weight:bold;font-size:13px",
  );

  const panChoice = normYesNo(DATA.has_pan_card);
  if (clickRadioInGroup(0, panChoice)) {
    console.log(`  ✓ ${"Has PAN Card".padEnd(32)} -> "${panChoice}"`);
  }

  if (panChoice === "Yes") {
    await fillTextField(
      ["pan no", "pan number", "pan"],
      normPAN(DATA.pan_number),
      "PAN Number",
      8000,
    );
  }

  const radio2 = normYesNo(DATA.radio_group_2);
  if (clickRadioInGroup(1, radio2)) {
    console.log(`  ✓ ${"Radio Group 2".padEnd(32)} -> "${radio2}"`);
  }

  await fillIncomeAmount(normRaw(DATA.income_amount_rs));
  syncOccupationCheckboxes(DATA.occupation_types);

  await selectField(
    ["highest educational qualification", "qualification", "educational"],
    normRaw(DATA.highest_educational_qualification),
    "Highest Qualification",
    {
      optionKeywords: [
        "illiterate",
        "lower than 10th",
        "10th",
        "madhyamik",
        "12th",
        "uchcha madhyamik",
      ],
    },
  );

  const trailingGroups = [
    ["Radio Group 3", DATA.radio_group_3],
    ["Radio Group 4", DATA.radio_group_4],
    ["Radio Group 5", DATA.radio_group_5],
  ];

  for (const [index, [label, value]] of trailingGroups.entries()) {
    const choice = normYesNo(value);
    if (clickRadioInGroup(index + 2, choice)) {
      console.log(`  ✓ ${label.padEnd(32)} -> "${choice}"`);
    }
  }

  console.log(
    "%c✅ Done! Check any ⚠️ warnings above.",
    "color:#2e7d32;font-weight:bold;font-size:13px",
  );
}

void fillIncomePage();
