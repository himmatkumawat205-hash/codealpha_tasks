'use strict';

const photos = [
  {id:'alpine', title:'Where the earth meets the sky', category:'Nature', ratio:'4 / 5', alt:'An alpine valley with forested slopes and rocky mountains beneath a blue, cloud-filled sky', tags:'mountain alpine peaks forest valley blue'},
  {id:'coast', title:'The ocean, uninterrupted', category:'Nature', ratio:'5 / 4', alt:'Blue ocean waves rolling toward the shore under an open sky', tags:'ocean sea blue waves water'},
  {id:'forest', title:'Into the quiet', category:'Nature', ratio:'4 / 5', alt:'Sunlight filtering through tall trees in a lush green forest', tags:'forest trees green woodland sunlight'},
  {id:'starlight', title:'Under a thousand stars', category:'Nature', ratio:'1 / 1', alt:'A snow-covered mountain beneath a sky full of stars', tags:'night stars mountain snow purple sky'},
  {id:'reflection', title:'A world in reflection', category:'Nature', ratio:'5 / 4', alt:'Mountains and a waterside cabin reflected in a still alpine lake', tags:'lake mountains reflection water cabin'},
  {id:'lines', title:'Less, but better', category:'Architecture', ratio:'1 / 1', alt:'Sculptural white architecture with clean geometric lines against the sky', tags:'white minimal building modern geometry'},
  {id:'curves', title:'Built for a different view', category:'Architecture', ratio:'4 / 5', alt:'A dramatic black-and-white view looking up at a stepped skyscraper', tags:'building skyscraper structure modern black white'},
  {id:'upward', title:'Always look up', category:'Architecture', ratio:'4 / 5', alt:'An upward view of a striking contemporary building and its sculptural facade', tags:'building facade geometric urban sky'},
  {id:'home', title:'Somewhere to call home', category:'Architecture', ratio:'5 / 4', alt:'A welcoming house framed by trees and greenery', tags:'home house garden green residential'},
  {id:'riviera', title:'A postcard kind of afternoon', category:'Travel', ratio:'4 / 5', alt:'Colorful coastal buildings overlooking the Mediterranean in Cinque Terre', tags:'italy village cinque terre colorful coast sea'},
  {id:'island', title:'The slow way around', category:'Travel', ratio:'4 / 5', alt:'Sunlit white architecture on a Greek island overlooking the blue sea', tags:'greece santorini island white blue summer'},
  {id:'shore', title:'Nowhere else to be', category:'Travel', ratio:'5 / 4', alt:'Soft ocean waves washing over an empty sandy beach at sunset', tags:'beach sunset sand turquoise holiday ocean'},
  {id:'lakeside', title:'Take the scenic route', category:'Travel', ratio:'1 / 1', alt:'A peaceful lakeside landscape surrounded by mountains and greenery', tags:'lake mountains journey water green'},
  {id:'wandering', title:'A little further from ordinary', category:'Travel', ratio:'4 / 5', alt:'A sunlit open landscape beneath a wide, soft-colored sky', tags:'landscape road wandering sunset adventure'},
  {id:'spectrum', title:'Somewhere between colors', category:'Abstract', ratio:'4 / 5', alt:'An expressive abstract composition of luminous blended colors', tags:'color light gradient luminous pink blue'},
  {id:'fluid', title:'Let it flow', category:'Abstract', ratio:'1 / 1', alt:'Vibrant flowing shapes and colors in an abstract visual composition', tags:'color fluid art pattern pink purple'},
  {id:'bloom', title:'Color outside the lines', category:'Abstract', ratio:'4 / 5', alt:'Swirling, richly colored paint creating an expressive abstract texture', tags:'paint orange yellow blue ink texture colorful'},
  {id:'chromatic', title:'A different frequency', category:'Abstract', ratio:'5 / 4', alt:'An abstract interplay of vivid colors, light, and layered shapes', tags:'color abstract light texture spectrum'}
];

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const validIds = new Set(photos.map(photo => photo.id));
let saved = new Set();
try {
  const stored = JSON.parse(localStorage.getItem('still-favorites') || '[]');
  if (Array.isArray(stored)) saved = new Set(stored.filter(id => validIds.has(id)));
} catch { /* The gallery also works when browser storage is unavailable. */ }

let category = 'All';
let savedOnly = false;
let visiblePhotos = [];
let lightboxPhotos = [];
let currentIndex = 0;
let toastTimer;
let returnFocus;
let touchStart = null;
const lightbox = $('#lightbox');
const aboutDialog = $('#about-dialog');
const heartIcon = '<svg aria-hidden="true"><use href="#i-heart"/></svg>';

function notify(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 2200);
}

function renderGallery() {
  const query = $('#search').value.trim().toLowerCase();
  visiblePhotos = photos.filter(photo => (category === 'All' || photo.category === category)
    && (!savedOnly || saved.has(photo.id))
    && query.split(/\s+/).every(word => `${photo.title} ${photo.category} ${photo.tags}`.toLowerCase().includes(word)));
  $('#gallery').innerHTML = visiblePhotos.map((photo, index) => `
    <article class="image-card" style="--ratio:${photo.ratio};--delay:${Math.min(index, 7) * 30}ms">
      <div class="image-container">
        <button class="image-open" data-open="${photo.id}" aria-label="View ${photo.title}">
          <img src="assets/${photo.id}.jpg" alt="${photo.alt}" loading="${index < 4 ? 'eager' : 'lazy'}" decoding="async" width="1000" height="1200">
          <span class="view-hint" aria-hidden="true">Take a closer look <svg><use href="#i-diagonal"/></svg></span>
        </button>
        <button class="save-button ${saved.has(photo.id) ? 'saved' : ''}" data-save="${photo.id}" aria-label="${saved.has(photo.id) ? 'Unsave' : 'Save'} ${photo.title}" aria-pressed="${saved.has(photo.id)}">${heartIcon}</button>
      </div>
      <div class="image-caption"><h3>${photo.title}</h3><span class="image-category">${photo.category}</span></div>
    </article>`).join('');
  const count = visiblePhotos.length;
  $('#result-count').textContent = `${count} ${count === 1 ? 'moment' : 'moments'} ${savedOnly ? 'saved for later' : 'to explore'}`;
  $('#collection-title').textContent = savedOnly ? 'Your saved moments' : category === 'All' ? 'The collection' : category;
  $('#empty-state').hidden = count > 0;
  $('#collection-end').hidden = count === 0;
  $('#surprise').disabled = count === 0;
  const noFavorites = savedOnly && saved.size === 0;
  $('#empty-title').textContent = noFavorites ? 'Keep a little inspiration.' : 'A new perspective is out there.';
  $('#empty-description').textContent = noFavorites ? 'Tap the heart on any photograph to keep it here for another look.' : 'Try a different search or explore another category.';
  $('#saved-count').textContent = saved.size;
  $$('.filter').forEach(button => {
    const active = button.dataset.category === category;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', active);
  });
  $('#explore-nav').classList.toggle('active', !savedOnly);
  $('#saved-nav').classList.toggle('active', savedOnly);
  $('#explore-nav').toggleAttribute('aria-current', !savedOnly);
  $('#saved-nav').toggleAttribute('aria-current', savedOnly);
  (savedOnly ? $('#saved-nav') : $('#explore-nav')).setAttribute('aria-current', 'page');
}

function resetGallery() {
  category = 'All';
  savedOnly = false;
  $('#search').value = '';
  renderGallery();
}

function toggleSave(id) {
  const wasSaved = saved.has(id);
  wasSaved ? saved.delete(id) : saved.add(id);
  let persisted = true;
  try { localStorage.setItem('still-favorites', JSON.stringify([...saved])); }
  catch { persisted = false; }
  $('#saved-count').textContent = saved.size;
  // Update controls in place so saving never interrupts keyboard focus or scroll position.
  const cardButton = $(`[data-save="${id}"]`);
  if (cardButton) {
    cardButton.classList.toggle('saved', !wasSaved);
    cardButton.setAttribute('aria-pressed', !wasSaved);
    const photo = photos.find(item => item.id === id);
    cardButton.setAttribute('aria-label', `${wasSaved ? 'Save' : 'Unsave'} ${photo.title}`);
  }
  if (savedOnly && !lightbox.open) {
    const priorIndex = visiblePhotos.findIndex(photo => photo.id === id);
    renderGallery();
    const buttons = $$('[data-save]');
    (buttons[Math.min(priorIndex, buttons.length - 1)] || $('#reset-filters')).focus({preventScroll:true});
  }
  if (lightbox.open) updateLightboxSave();
  notify(wasSaved ? 'Removed from your saved moments' : persisted ? 'Added to your saved moments' : 'Saved for this visit; browser storage is unavailable');
}

function updateLightboxSave() {
  const photo = lightboxPhotos[currentIndex];
  const isSaved = saved.has(photo.id);
  $('#lightbox-save').classList.toggle('saved', isSaved);
  $('#lightbox-save').setAttribute('aria-pressed', isSaved);
  $('#lightbox-save').setAttribute('aria-label', `${isSaved ? 'Unsave' : 'Save'} ${photo.title}`);
}

function showPhoto() {
  const photo = lightboxPhotos[currentIndex];
  const image = $('#lightbox-image');
  image.classList.remove('changing');
  image.src = `assets/${photo.id}.jpg`;
  image.alt = photo.alt;
  void image.offsetWidth;
  image.classList.add('changing');
  $('#lightbox-title').textContent = photo.title;
  $('#lightbox-category').textContent = photo.category;
  $('#lightbox-counter').textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(lightboxPhotos.length).padStart(2, '0')}`;
  $('#lightbox-announcement').textContent = `${photo.title}. Image ${currentIndex + 1} of ${lightboxPhotos.length}.`;
  $('#download-image').href = `assets/${photo.id}.jpg`;
  $('#download-image').download = `still-${photo.id}.jpg`;
  $('#previous').disabled = lightboxPhotos.length < 2;
  $('#next').disabled = lightboxPhotos.length < 2;
  updateLightboxSave();
  if (lightboxPhotos.length > 1) {
    const preload = new Image();
    preload.src = `assets/${lightboxPhotos[(currentIndex + 1) % lightboxPhotos.length].id}.jpg`;
  }
}

function openLightbox(id) {
  lightboxPhotos = [...visiblePhotos];
  currentIndex = lightboxPhotos.findIndex(photo => photo.id === id);
  if (currentIndex < 0) return;
  returnFocus = document.activeElement;
  showPhoto();
  lightbox.showModal();
  document.body.classList.add('body-locked');
  $('#close-lightbox').focus();
}

function navigate(direction) {
  currentIndex = (currentIndex + direction + lightboxPhotos.length) % lightboxPhotos.length;
  showPhoto();
}

$('#gallery').addEventListener('click', event => {
  const saveButton = event.target.closest('[data-save]');
  const openButton = event.target.closest('[data-open]');
  if (saveButton) toggleSave(saveButton.dataset.save);
  else if (openButton) openLightbox(openButton.dataset.open);
});
$$('.filter').forEach(button => button.addEventListener('click', () => {category = button.dataset.category; renderGallery();}));
$('#search').addEventListener('input', renderGallery);
$('#reset-filters').addEventListener('click', resetGallery);
$('#explore-nav').addEventListener('click', resetGallery);
$('#saved-nav').addEventListener('click', () => {savedOnly = true; category = 'All'; $('#search').value = ''; renderGallery();});
$('#surprise').addEventListener('click', () => {if (visiblePhotos.length) openLightbox(visiblePhotos[Math.floor(Math.random() * visiblePhotos.length)].id);});
$$('[data-layout]').forEach(button => button.addEventListener('click', () => {
  $('#gallery').classList.toggle('compact', button.dataset.layout === 'compact');
  $$('[data-layout]').forEach(item => {item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', item === button);});
}));
$('#previous').addEventListener('click', () => navigate(-1));
$('#next').addEventListener('click', () => navigate(1));
$('#close-lightbox').addEventListener('click', () => lightbox.close());
$('#lightbox-save').addEventListener('click', () => toggleSave(lightboxPhotos[currentIndex].id));
lightbox.addEventListener('click', event => {if (event.target === lightbox || event.target.classList.contains('lightbox-image-wrap')) lightbox.close();});
lightbox.addEventListener('close', () => {
  document.body.classList.remove('body-locked');
  if (savedOnly) renderGallery();
  const originalId = returnFocus?.dataset?.open;
  const focusTarget = returnFocus?.isConnected ? returnFocus : originalId ? $(`[data-open="${originalId}"]`) : null;
  (focusTarget || $('#saved-nav')).focus({preventScroll:true});
});
$('#lightbox-stage').addEventListener('touchstart', event => {touchStart = event.touches.length === 1 ? {x:event.touches[0].clientX, y:event.touches[0].clientY} : null;}, {passive:true});
$('#lightbox-stage').addEventListener('touchend', event => {
  if (!touchStart) return;
  const dx = event.changedTouches[0].clientX - touchStart.x;
  const dy = event.changedTouches[0].clientY - touchStart.y;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) navigate(dx < 0 ? 1 : -1);
  touchStart = null;
}, {passive:true});
$('#lightbox-stage').addEventListener('touchcancel', () => {touchStart = null;}, {passive:true});
document.addEventListener('keydown', event => {
  if (lightbox.open && ['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {
    event.preventDefault();
    if (event.key === 'Home' || event.key === 'End') {currentIndex = event.key === 'Home' ? 0 : lightboxPhotos.length - 1; showPhoto();}
    else navigate(event.key === 'ArrowRight' ? 1 : -1);
  } else if (event.key === '/' && !lightbox.open && !aboutDialog.open && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
    event.preventDefault(); $('#search').focus();
  }
});
$('#about-nav').addEventListener('click', () => {aboutDialog.showModal(); document.body.classList.add('body-locked');});
$('#close-about').addEventListener('click', () => aboutDialog.close());
aboutDialog.addEventListener('close', () => document.body.classList.remove('body-locked'));
aboutDialog.addEventListener('click', event => {
  const rect = aboutDialog.getBoundingClientRect();
  if (event.target === aboutDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) aboutDialog.close();
});
$('#back-top').addEventListener('click', () => window.scrollTo({top:0, behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}));
renderGallery();
