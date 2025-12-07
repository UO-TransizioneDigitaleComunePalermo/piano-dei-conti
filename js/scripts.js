// Highlight search term matches inside Exhibit table results
document.addEventListener("DOMContentLoaded", () => {
  const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const setup = () => {
    const searchInput =
      document.querySelector("input.exhibit-text-facet-input") ||
      document.querySelector('div[ex\\:role="facet"] input');
    const viewPanel = document.querySelector('[ex\\:role="viewPanel"]');
    if (!searchInput || !viewPanel) return false;

    const highlight = (term) => {
      viewPanel.querySelectorAll("mark.exhibit-highlight").forEach((m) => {
        m.replaceWith(m.textContent);
      });
      if (!term) return;
      const re = new RegExp(`(${escapeRegex(term)})`, "gi");
      viewPanel.querySelectorAll("td, a, span").forEach((el) => {
        if (!el.childElementCount) {
          el.innerHTML = el.textContent.replace(
            re,
            '<mark class="exhibit-highlight">$1</mark>'
          );
        }
      });
    };

    const debounced = (() => {
      let t;
      return () => {
        clearTimeout(t);
        t = setTimeout(() => highlight(searchInput.value.trim()), 150);
      };
    })();

    searchInput.addEventListener("input", debounced);
    const observer = new MutationObserver(debounced);
    observer.observe(viewPanel, { childList: true, subtree: true });
    return true;
  };

  const waitForExhibit = () => {
    if (setup()) return;
    setTimeout(waitForExhibit, 300);
  };

  waitForExhibit();
});








// Force Exhibit CSV importer to set a label using 'Codice_completo_PDC' when missing,
// otherwise the dataset is rejected for lacking a label.
(function ensureExhibitLabels() {
  const install = () => {
    if (!window.Exhibit || !Exhibit.Importer || !Exhibit.Importer.Csv) return false;
    const orig = Exhibit.Importer.Csv.parse;
    Exhibit.Importer.Csv.parse = function (url, content, callback, link) {
      orig(url, content, function (data) {
        if (data && Array.isArray(data.items)) {
          data.items.forEach((item) => {
            if (!item.label && item.Codice_completo_PDC) {
              item.label = item.Codice_completo_PDC;
            }
          });
        }
        callback(data);
      }, link);
    };
    return true;
  };

  const waitAndInstall = () => {
    if (!install()) {
      setTimeout(waitAndInstall, 100);
    }
  };

  waitAndInstall();
})();

