// =========================================
// SEARCH SERVICE
// Fournit une fonction utilitaire pour matcher une requête multi-mots
// en construisant une RegExp avec lookaheads afin d'autoriser les mots
// dans n'importe quel ordre.
// =========================================
function escapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildQueryRegex(query) {
    if (!query) return null;
    const terms = String(query).trim().split(/\s+/).filter(Boolean).map(escapeRegExp);
    if (terms.length === 0) return null;
    const lookaheads = terms.map(t => `(?=.*${t})`).join('');
    return new RegExp(lookaheads + '.*', 'i');
}

function matchesQuery(text, query) {
    if (!query || String(query).trim() === '') return true;
    if (!text) return false;
    const rx = buildQueryRegex(query);
    if (!rx) return true;
    return rx.test(text);
}

// Exposer globalement pour pages qui chargent le script
window.matchesQuery = matchesQuery;
