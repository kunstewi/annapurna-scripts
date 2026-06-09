# Page Scripts — How to Use

## For pages I've already built scripts for:
1. Open the form page in Chrome
2. Open DevTools → Console (Cmd+Option+J)
3. Open the script file in any text editor
4. Select all (Cmd+A) → Copy
5. Paste into Console → Enter
6. Done ✅

## For NEW pages I haven't built yet:
1. Navigate to the new page/section
2. Open Console
3. Paste the contents of INSPECTOR.js → Enter
4. Copy the output
5. Send it to Claude → get a new fill script in minutes

## Scripts available:
- page1_basic_info.js     → Basic Info + Aadhaar + Address + Voter Card (Page 1)
- page2_ration_card.js    → (build after sharing Page 2 inspector output)
- page3_assets.js         → (build after sharing Page 3 inspector output)
- page4_income.js         → (build after sharing Page 4 inspector output)
- page5_identity_docs.js  → (build after sharing Page 5 inspector output)
- page6_govt_schemes.js   → (build after sharing Page 6 inspector output)

## Updating your data:
Each script has a DATA block at the top — only edit that section.
The rest of the script handles the form logic automatically.
