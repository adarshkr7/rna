const galleryPhotos = [
  'WhatsApp Image 2026-10-03 at 22.37.31 (1).jpeg',
  'WhatsApp Image 2026-10-03 at 22.37.31 (2).jpeg',
  'WhatsApp Image 2026-10-03 at 22.37.31.jpeg',
  'WhatsApp Image 2026-10-03 at 22.37.32 (1).jpeg',
  'WhatsApp Image 2026-10-03 at 22.37.32.jpeg',
  'WhatsApp Image 2026-10-03 at 22.37.33 (1).jpeg',
  'WhatsApp Image 2026-10-03 at 22.37.33 (2).jpeg',
  'WhatsApp Image 2026-10-03 at 22.37.33.jpeg',
  'WhatsApp Image 2026-10-03 at 22.37.34 (1).jpeg',
  'WhatsApp Image 2026-10-03 at 22.37.34.jpeg',
  'WhatsApp Image 2026-10-03 at 22.37.44.jpeg',
  'WhatsApp Image 2026-10-03 at 22.37.45 (1).jpeg',
  'WhatsApp Image 2026-10-03 at 22.37.45 (2).jpeg',
  'WhatsApp Image 2026-10-03 at 22.37.45.jpeg',
  'WhatsApp Image 2026-10-03 at 22.37.46 (1).jpeg',
  'WhatsApp Image 2026-10-03 at 22.37.46 (2).jpeg',
  'WhatsApp Image 2026-10-03 at 22.37.46 (3).jpeg',
  'WhatsApp Image 2026-10-03 at 22.37.46.jpeg',
  'WhatsApp Image 2026-10-03 at 22.37.47 (1).jpeg',
  'WhatsApp Image 2026-10-03 at 22.37.47.jpeg',
];

const galleryGrid = document.getElementById('gallery-grid');
const lightbox = document.getElementById('gallery-lightbox') as HTMLDialogElement | null;
const expandedImage = lightbox?.querySelector('img');

if (galleryGrid) {
  galleryPhotos.forEach((photo, index) => {
    const figure = document.createElement('figure');
    figure.className = 'gallery-item';
    figure.innerHTML = `
      <button class="gallery-photo-button" type="button" aria-label="Expand team photo ${index + 1}">
        <img src="/gallery/${encodeURIComponent(photo)}" alt="RNA team photo ${index + 1}" loading="${index < 4 ? 'eager' : 'lazy'}" decoding="async">
      </button>
    `;
    galleryGrid.appendChild(figure);
  });
}

const galleryCount = document.getElementById('gallery-count');
if (galleryCount) galleryCount.textContent = String(galleryPhotos.length);

galleryGrid?.addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('.gallery-photo-button');
  const image = button?.querySelector('img');

  if (image && lightbox && expandedImage) {
    expandedImage.src = image.currentSrc || image.src;
    expandedImage.alt = image.alt;
    lightbox.showModal();
  }
});

lightbox?.querySelector('.gallery-lightbox-close')?.addEventListener('click', () => lightbox.close());
lightbox?.addEventListener('click', event => {
  if (event.target === lightbox) lightbox.close();
});
