// ============================================================
// ANNAPURNA BHANDAR — HOF ASSETS / INSURANCE PAGE
// Paste entire script in DevTools Console -> Enter
// ============================================================

const DATA = {
  radio_group_1: "No", // 3 pucca room
  radio_group_2: "No", // land
  total_landholding: "", // acre multiple by 10, katha to decimal multiple by 6.6
  owns_non_commercial_motorized_vehicle: "No",
  has_health_insurance: "Yes",
  insurance_type: "Government",
  government_scheme: "Swasthya Sathi",
  urn_number: "0928139012839092384",
};;

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

function getFields() {
  return Array.from(document.querySelectorAll("input, select, textarea")).filter(
    (el) => el.getBoundingClientRect().height > 0,
  );
}

function getVisibleRadios() {
  return Array.from(document.querySelectorAll('input[type="radio"]')).filter(
    (el) => el.getBoundingClientRect().height > 0,
  );
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

  const needle = String(text).trim().toLowerCase();
  const options = Array.from(el.options);
  const match =
    options.find((o) => o.text.trim().toLowerCase() === needle) ||
    options.find((o) => String(o.value).trim().toLowerCase() === needle) ||
    options.find((o) => o.text.trim().toLowerCase().startsWith(needle)) ||
    options.find((o) => o.text.trim().toLowerCase().includes(needle));

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

function extractLabel(el) {
  return (
    (
      (el.id ? document.querySelector(`label[for="${el.id}"]`) : null) ||
      el.closest("label") ||
      el.closest("div")?.querySelector("label") ||
      el.parentElement?.previousElementSibling
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

async function waitForSelectReady(keywords, timeoutMs = 10000) {
  return waitFor(() => {
    const field = findByLabel(keywords, "SELECT");
    if (!field) return null;
    return hasUsableOptions(field) ? field : null;
  }, timeoutMs);
}

function getRadioGroups() {
  const radios = getVisibleRadios();
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
    group.find((radio) => {
      const labelText = extractLabel(radio).toLowerCase();
      return labelText.startsWith(wanted);
    }) || (wanted === "yes" ? group[0] : group[group.length - 1]);

  const target = match || fallback;
  if (!target) return false;

  target.click();
  target.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

async function selectField(keywords, value, label) {
  if (value == null || value === "") return null;

  const field = await waitForSelectReady(keywords, 12000);
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

async function fillHofAssetsPage() {
  const fields = getFields();
  console.log(
    `%c🌾 Annapurna Assets Filler — ${fields.length} fields found`,
    "color:#2e7d32;font-weight:bold;font-size:13px",
  );

  const radio1 = normYesNo(DATA.radio_group_1);
  const radio2 = normYesNo(DATA.radio_group_2);

  if (clickRadioInGroup(0, radio1)) {
    console.log(`  ✓ ${"Radio Group 1".padEnd(32)} -> "${radio1}"`);
  }

  if (clickRadioInGroup(1, radio2)) {
    console.log(`  ✓ ${"Radio Group 2".padEnd(32)} -> "${radio2}"`);
  }

  await fillTextField(
    ["size of total landholding", "landholding", "in decimal", "deci"],
    normRaw(DATA.total_landholding),
    "Total Landholding",
  );

  await selectField(
    [
      "does any family member own non commercial motorize",
      "non commercial motorize",
      "motorized",
      "motorize",
    ],
    normYesNo(DATA.owns_non_commercial_motorized_vehicle),
    "Owns Non-Commercial Vehicle",
  );

  const insuranceChoice = normYesNo(DATA.has_health_insurance);
  await selectField(
    ["has health insurance", "health insurance"],
    insuranceChoice,
    "Has Health Insurance",
  );

  if (insuranceChoice === "Yes") {
    await selectField(
      ["insurance type"],
      normRaw(DATA.insurance_type),
      "Insurance Type",
    );

    if (/^government$/i.test(normRaw(DATA.insurance_type))) {
      await selectField(
        ["government scheme", "scheme"],
        normRaw(DATA.government_scheme),
        "Government Scheme",
      );
    }

    await fillTextField(
      ["urn number", "urn"],
      normRaw(DATA.urn_number),
      "URN Number",
    );
  }

  console.log(
    "%c✅ Done! Check any ⚠️ warnings above.",
    "color:#2e7d32;font-weight:bold;font-size:13px",
  );
}

void fillHofAssetsPage();
