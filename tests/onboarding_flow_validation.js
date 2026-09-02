const fs = require('fs');
const vm = require('vm');

function createContext() {
  const storage = {};
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null; },
    setItem(key, value) { storage[key] = String(value); },
    removeItem(key) { delete storage[key]; }
  };

  const onboardingContainer = { innerHTML: '' };
  const modal = {
    classList: { add() {}, remove() {}, contains() { return false; } }
  };

  const document = {
    body: {},
    querySelectorAll() { return []; },
    querySelector() { return null; },
    addEventListener() {},
    removeEventListener() {},
    getElementById(id) {
      if (id === 'onboardingModal') return modal;
      if (id === 'onboardingContainer') return onboardingContainer;
      return { classList: { add() {}, remove() {}, contains() { return false; } }, innerHTML: '', style: {} };
    },
    createElement() {
      return { classList: { add() {}, remove() {}, contains() { return false; } }, style: {}, innerHTML: '', appendChild() {}, addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; }, remove() {}, setAttribute() {} };
    }
  };

  return {
    console,
    window: { CURRENT_USER: { id: 42, username: 'alice', points: 0, avatar: '', shopId: null, role: 'buyer' }, setTimeout(fn) { return fn(); }, clearTimeout() {}, clearInterval() {}, ag7SpotTutorialRunning: false },
    document,
    localStorage,
    navigator: {},
    setTimeout(fn) { return fn(); },
    clearTimeout() {},
    clearInterval() {},
    showToast() {},
    navigateTo() {},
    getUserPosition: async () => ({ lat: 48.8566, lng: 2.3522 }),
    SHOPS: [{ id: 1, category: 'food', lat: 48.8566, lng: 2.3522 }],
    getDistanceBetween() { return 0; },
    saveUserCategories() { return true; },
    startAg7SpotTutorial() {},
    isAg7SpotTutorialDone() { return false; },
    markAg7SpotTutorialDone() {},
    getRecommendationProfile() { return { preferred_categories: [], followed_shops: [], recent_interactions: [], stats: { views: 0, reservations: 0, follows: 0, clicks: 0 }, updated_at: null }; },
    saveRecommendationProfile() { return null; }
  };
}

const context = createContext();
const code = fs.readFileSync('./components/onboarding.js', 'utf8');
vm.runInNewContext(code, context, { filename: './components/onboarding.js' });

if (typeof context.shouldShowOnboardingForUser !== 'function') throw new Error('missing shouldShowOnboardingForUser');
if (typeof context.markOnboardingDone !== 'function') throw new Error('missing markOnboardingDone');
if (typeof context.completeOnboardingFlow !== 'function') throw new Error('missing completeOnboardingFlow');

const userId = 42;
context.markOnboardingDone(userId);
if (context.shouldShowOnboardingForUser(userId) !== false) throw new Error('Onboarding should be done after completion');
context.localStorage.removeItem(`onboarding_done_${userId}`);
if (context.shouldShowOnboardingForUser(userId) !== true) throw new Error('Onboarding should show again when missing');
context.completeOnboardingFlow(userId, ['food']);
if (context.localStorage.getItem('onboarding_done_42') !== 'true') throw new Error('onboarding flag not stored');
context.renderOnboarding();
if (!context.document.getElementById('onboardingContainer').innerHTML.includes('Bienvenue sur Ag7Spot')) throw new Error('missing onboarding title');
if (!context.document.getElementById('onboardingContainer').innerHTML.includes('Découvrir ma carte')) throw new Error('missing continue CTA');

console.log('VALIDATION_OK');
