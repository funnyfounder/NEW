const LS_KEYS = {
  consent: 'nr_consent',
  prefs: 'nr_prefs',
  stats: 'nr_runtime_stats'
};

export const Local = {
  setConsent(val){ localStorage.setItem(LS_KEYS.consent, JSON.stringify(!!val)); },
  getConsent(){ try{return JSON.parse(localStorage.getItem(LS_KEYS.consent) || 'false')}catch{return false} },
  setPrefs(p){ localStorage.setItem(LS_KEYS.prefs, JSON.stringify(p || {})) },
  getPrefs(){ try{return JSON.parse(localStorage.getItem(LS_KEYS.prefs)||'{}')}catch{return{}} },
  setRuntimeStats(s){ localStorage.setItem(LS_KEYS.stats, JSON.stringify(s||{})) },
  getRuntimeStats(){ try{return JSON.parse(localStorage.getItem(LS_KEYS.stats)||'{}')}catch{return{}} },
};
