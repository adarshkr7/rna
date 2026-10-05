import teamData from './data/team.json';

interface TeamMember {
  name: string;
  role: string;
  subteam: string;
  image: string;
  linkedin: string;
  rollNo?: string;
}

const coordinators: TeamMember[] = [
  { name: 'Sahil Jorvekar', role: 'Coordinator', subteam: 'leadership', image: '/Screenshot 2026-10-05 at 7.06.27 PM.png', linkedin: '', rollNo: '2401PH06' },
  { name: 'Kanishk Desai', role: 'Coordinator', subteam: 'leadership', image: '/Screenshot 2026-10-05 at 7.09.55 PM.png', linkedin: '', rollNo: '2401EC23' },
];

function renderTeamCards(containerId: string, members: TeamMember[], cardClass: string) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error(`Could not find element #${containerId} in DOM.`);
    return;
  }

  container.innerHTML = '';

  members.forEach((member: TeamMember) => {
    const card = document.createElement('article');
    card.className = `team-card ${cardClass}`;
    card.innerHTML = `
      <button class="member-avatar" type="button" data-roll-no="${member.rollNo || ''}" aria-label="View ${member.name}'s full profile">
        <img 
          src="${member.image || '/images/logo.svg'}" 
          alt="${member.name}" 
          onerror="this.onerror=null; this.src='/images/logo.svg';"
        />
      </button>
      <div class="member-info">
        <h3 class="member-name">${member.name}</h3>
        <span class="member-role">${member.role}</span>
        ${member.linkedin ? `
          <a href="${member.linkedin}" target="_blank" rel="noopener noreferrer" class="member-social-link" aria-label="${member.name}'s LinkedIn Profile">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z"/>
            </svg>
            <span>LinkedIn</span>
          </a>
        ` : ''}
      </div>
    `;
    container.appendChild(card);
  });
}

function renderSubcoordinators(filter: string = 'all') {
  const members = filter === 'all'
    ? (teamData as TeamMember[])
    : (teamData as TeamMember[]).filter(member => member.subteam === filter);

  if (members.length === 0) {
    const container = document.getElementById('team-grid-container');
    if (container) {
      container.innerHTML = '<p class="team-empty-state">No members found for this sub-team.</p>';
    }
    return;
  }

  renderTeamCards('team-grid-container', members, '');
}

// Ensure execution after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    renderTeamCards('coordinator-grid-container', coordinators, 'team-card--coordinator');
    renderSubcoordinators();
  });
} else {
  renderTeamCards('coordinator-grid-container', coordinators, 'team-card--coordinator');
  renderSubcoordinators();
}

// Attach filter listeners
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const target = e.currentTarget as HTMLButtonElement;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    target.classList.add('active');

    const filter = target.getAttribute('data-filter') || 'all';
    renderSubcoordinators(filter);
  });
});

const photoDialog = document.getElementById('photo-dialog') as HTMLDialogElement | null;
const enlargedPhoto = photoDialog?.querySelector('img');
const enlargedName = photoDialog?.querySelector<HTMLElement>('.photo-dialog-name');
const enlargedRole = photoDialog?.querySelector<HTMLElement>('.photo-dialog-role');
const enlargedRollNo = photoDialog?.querySelector<HTMLElement>('.photo-dialog-roll-no');
const enlargedLinkedIn = photoDialog?.querySelector<HTMLAnchorElement>('.photo-dialog-linkedin');
const missingLinkedIn = photoDialog?.querySelector<HTMLElement>('.photo-dialog-linkedin-missing');
let dialogScrollPosition = 0;

document.addEventListener('click', event => {
  const trigger = (event.target as HTMLElement).closest<HTMLButtonElement>('.member-avatar');
  const image = trigger?.querySelector('img');
  const card = trigger?.closest('.team-card');
  const linkedIn = card?.querySelector<HTMLAnchorElement>('.member-social-link');

  if (trigger && image && photoDialog && enlargedPhoto && enlargedName && enlargedRole && enlargedRollNo && enlargedLinkedIn && missingLinkedIn) {
    enlargedPhoto.src = image.currentSrc || image.src;
    enlargedPhoto.alt = image.alt;
    enlargedName.textContent = image.alt;
    enlargedRole.textContent = card?.querySelector('.member-role')?.textContent || 'Role not provided';
    enlargedRollNo.textContent = trigger.dataset.rollNo || 'Not provided';
    enlargedLinkedIn.hidden = !linkedIn;
    missingLinkedIn.hidden = Boolean(linkedIn);
    if (linkedIn) {
      enlargedLinkedIn.href = linkedIn.href;
    }
    dialogScrollPosition = window.scrollY;
    photoDialog.showModal();
  }
});

photoDialog?.querySelector('.photo-dialog-close')?.addEventListener('click', () => photoDialog.close());
photoDialog?.addEventListener('close', () => {
  requestAnimationFrame(() => window.scrollTo(0, dialogScrollPosition));
});
photoDialog?.addEventListener('click', event => {
  if (event.target === photoDialog) photoDialog.close();
});