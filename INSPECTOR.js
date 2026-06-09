// ============================================================
// FIELD INSPECTOR — paste on ANY page to see all field indices
// Share the output with Claude to build the fill script for that page
// ============================================================

(function() {
  const fields = Array.from(document.querySelectorAll('input, select, textarea'))
    .filter(el => el.getBoundingClientRect().height > 0);

  console.log('%c📋 FIELD MAP — ' + fields.length + ' visible fields', 
    'color: #2e7d32; font-weight: bold; font-size: 14px');
  console.log('%cShare this with Claude to build the fill script', 
    'color: #666; font-size: 11px');
  console.log('─'.repeat(80));

  fields.forEach((el, i) => {
    // Try every possible way to get a label
    const byFor = el.id ? document.querySelector(`label[for="${el.id}"]`)?.textContent?.trim() : '';
    const byParent = el.closest('label')?.textContent?.trim();
    const byPrev = el.previousElementSibling?.textContent?.trim();
    const bySibling = el.parentElement?.previousElementSibling?.textContent?.trim();
    const bySpan = el.closest('div')?.querySelector('span:first-child, p:first-child')?.textContent?.trim();

    const label = (byFor || byParent || byPrev || bySibling || bySpan || '').replace(/\s+/g, ' ').slice(0, 50);

    // For selects, show available options
    let options = '';
    if (el.tagName === 'SELECT') {
      options = ' [' + Array.from(el.options).map(o => o.text).filter(t => t && t !== 'Select...').slice(0, 5).join(' | ') + ']';
    }

    const type = el.type === 'select-one' ? 'SELECT' : el.type || el.tagName;
    const ph = el.placeholder ? ` ph="${el.placeholder}"` : '';
    const val = el.value ? ` val="${el.value}"` : '';

    console.log(`[${String(i).padStart(2, '0')}] ${type.padEnd(10)} label="${label}"${ph}${val}${options}`);
  });

  console.log('─'.repeat(80));
  console.log('%cCopy all of the above and send to Claude', 'color: #2e7d32; font-weight: bold');
})();
