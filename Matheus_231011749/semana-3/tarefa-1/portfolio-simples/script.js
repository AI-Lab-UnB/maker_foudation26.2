
document.addEventListener('DOMContentLoaded', () => {
    const toAboutBtn = document.getElementById('toAboutBtn');
    const toHeroBtn = document.getElementById('toHeroBtn');
    const heroSection = document.getElementById('hero');
    const aboutSection = document.getElementById('about');

    const aboutTriggers = [
        document.getElementById('toAboutBtn'),
        document.getElementById('dockTerminalBtn')
    ].filter(Boolean);

    if (aboutSection) {
        aboutTriggers.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.pushState(null, '', '#about');
            });
        });
    }

    if (toHeroBtn && heroSection) {
        toHeroBtn.addEventListener('click', (e) => {
            e.preventDefault();
            heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.pushState(null, '', '#hero');
        });
    }

    const dockSkillLinks = document.querySelectorAll('.dock-item[href^="#skill-"]');
    dockSkillLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetCard = document.getElementById(targetId);

            if (targetCard) {
                targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                document.querySelectorAll('.skill-card.highlight-pulse').forEach(el => {
                    el.classList.remove('highlight-pulse');
                });

                targetCard.classList.add('highlight-pulse');
                setTimeout(() => {
                    targetCard.classList.remove('highlight-pulse');
                }, 1800);
            }
        });
    });

    window.addEventListener('keydown', (e) => {
        if (['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) {
            return;
        }

        if (e.key === 'ArrowDown' || e.key === 'j') {
            if (window.scrollY < (heroSection.offsetHeight / 2)) {
                aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else if (e.key === 'ArrowUp' || e.key === 'k' || e.key === 'Escape') {
            if (window.scrollY > (heroSection.offsetHeight / 3)) {
                heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
});
