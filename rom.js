document.addEventListener('DOMContentLoaded', () => {
  setThemeFromSystem();
  loadROMDetails();
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setThemeFromSystem);

function setThemeFromSystem() {
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.body.classList.toggle('light-mode', !isDarkMode);
}

async function loadROMDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const romId = urlParams.get('id');

  if (!romId) {
    document.getElementById('rom-header').innerHTML = '<p class="p-4 text-red-500">Error: No ROM selected.</p>';
    return;
  }

  try {
    const romsResponse = await fetch('assets/roms.json');
    const roms = await romsResponse.json();
    const rom = roms.find(r => r.id === romId);

    if (!rom) {
      document.getElementById('rom-header').innerHTML = '<p class="p-4 text-red-500">Error: ROM not found.</p>';
      return;
    }

    document.title = `${rom.title} - OEM Ports`;

    const headerContainer = document.getElementById('rom-header');
    headerContainer.innerHTML = `
      <div class="flex justify-center rounded-lg mb-6 p-4">
        <img src="${rom.image}" alt="${rom.title} Logo" class="w-full max-w-md h-auto object-contain">
      </div>
      <h2 class="text-3xl font-bold mb-2">${rom.title}</h2>
      <p class="desc text-lg">${rom.description}</p>
    `;

    if (rom.releases) {
      const releasesResponse = await fetch(`${rom.releases}?t=${new Date().getTime()}`, { cache: 'no-store' });
      const releases = await releasesResponse.json();
      renderReleases(releases);
    }

  } catch (error) {
    console.error('Error loading ROM details:', error);
    document.getElementById('rom-header').innerHTML = '<p class="p-4 text-red-500">Failed to load data. Please try again later.</p>';
  }
}

function renderReleases(releases) {
  const container = document.getElementById('releases-container');
  container.innerHTML = '';

  const reversedReleases = [...releases].reverse();

  reversedReleases.forEach((release, index) => {
    const card = document.createElement('div');
    card.className = 'card flex flex-col p-5';

    const isLatest = index === 0;
    
    const latestTag = isLatest 
      ? `<span class="border border-green-500 text-green-600 dark:text-green-400 dark:border-green-400 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider select-none cursor-default">Latest</span>` 
      : '';

    const headerHtml = `
      <div class="mb-4">
        <div class="flex items-center gap-3">
          <h3 class="text-2xl font-bold">${release.version}</h3>
          ${latestTag}
        </div>
        <p class="text-sm device-text mt-1">${release.date}</p>
      </div>
    `;

    const createOutlineBtn = (text, url) => {
      if (!url) return '';
      if (url.includes('telegra.ph')) {
        return `<button onclick="openReaderModal('${url}')" class="border border-gray-400 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors px-4 py-1.5 rounded-xl text-sm font-medium">${text}</button>`;
      }
      return `<a href="${url}" target="_blank" class="border border-gray-400 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors px-4 py-1.5 rounded-xl text-sm font-medium">${text}</a>`;
    };

    const linksHtml = `
      <div class="flex flex-wrap gap-2">
        ${createOutlineBtn('Changelog', release.changelog)}
        ${createOutlineBtn('Notes', release.notes)}
        ${createOutlineBtn('Screenshots', release.screenshots)}
      </div>
    `;

    let downloadsHtml = '<div class="flex flex-wrap gap-2">';
    if (release.downloads && release.downloads.length > 0) {
      release.downloads.forEach(dl => {
        downloadsHtml += `<button onclick="openDownloadModal('${dl.link}')" class="border border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-colors px-4 py-1.5 rounded-xl text-sm font-semibold">${dl.device}</button>`;
      });
    }
    downloadsHtml += '</div>';
    downloadsHtml += '</div>';

    const bottomHtml = `
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-2">
        ${linksHtml}
        ${downloadsHtml}
      </div>
    `;

    card.innerHTML = headerHtml + bottomHtml;
    container.appendChild(card);
  });
}

let countdownInterval;

function openDownloadModal(url) {
  const modal = document.getElementById('download-modal');
  const modalContent = modal.querySelector('.card');
  const proceedBtn = document.getElementById('proceed-btn');
  
  proceedBtn.classList.add('pointer-events-none', 'opacity-50');
  proceedBtn.href = "#"; 
  let timeLeft = 5;
  proceedBtn.innerText = `Proceed (${timeLeft})`;

  proceedBtn.onclick = null;

  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    modalContent.classList.remove('scale-95');
  }, 10);

  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) {
      proceedBtn.innerText = `Proceed (${timeLeft})`;
    } else {
      clearInterval(countdownInterval);
      proceedBtn.innerText = 'Proceed';
      proceedBtn.href = url;
      proceedBtn.classList.remove('pointer-events-none', 'opacity-50');
      
      proceedBtn.onclick = () => closeDownloadModal();
    }
  }, 1000);
}

function closeDownloadModal() {
  const modal = document.getElementById('download-modal');
  const modalContent = modal.querySelector('.card');
  
  modal.classList.add('opacity-0');
  modalContent.classList.add('scale-95');
  
  clearInterval(countdownInterval);
  
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 300);
}

document.addEventListener('DOMContentLoaded', () => {
  
  document.getElementById('close-modal-btn').addEventListener('click', closeDownloadModal);
  
  document.getElementById('download-modal').addEventListener('click', (e) => {
    if (e.target.id === 'download-modal') {
      closeDownloadModal();
    }
  });
});

async function openReaderModal(url) {
  const modal = document.getElementById('reader-modal');
  const modalCard = modal.querySelector('.card');
  const titleEl = document.getElementById('reader-title');
  const contentEl = document.getElementById('reader-content');

  titleEl.innerText = "Loading...";
  contentEl.innerHTML = `<div class="flex justify-center items-center h-32"><div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>`;
  
  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    modalCard.classList.remove('scale-95');
  }, 10);

  try {
    const path = url.split('/').pop();
    
    const response = await fetch(`https://api.telegra.ph/getPage/${path}?return_content=true`);
    const data = await response.json();

    if (data.ok) {
      titleEl.innerText = data.result.title;
      contentEl.innerHTML = parseTelegraphNodes(data.result.content);
    } else {
      throw new Error('Post not found');
    }
  } catch (error) {
    titleEl.innerText = "Error";
    contentEl.innerHTML = `<div class="text-red-500 text-center py-8">Failed to load content. <br><br><a href="${url}" target="_blank" class="bg-blue-600 text-white px-4 py-2 rounded-lg mt-4 inline-block hover:bg-blue-700">Open in new tab instead</a></div>`;
  }
}

function parseTelegraphNodes(nodes) {
  if (!nodes) return '';
  let html = '';
  
  for (const node of nodes) {
    if (typeof node === 'string') {
      html += node.replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/\n/g, "<br>");
    } else {
      let { tag, attrs, children } = node;
      let attrStr = '';
      
      if (attrs) {
         if (tag === 'img' && attrs.src && attrs.src.startsWith('/')) {
            attrs.src = 'https://telegra.ph' + attrs.src;
         }
         for (const [key, value] of Object.entries(attrs)) {
            attrStr += ` ${key}="${value.toString().replace(/"/g, '&quot;')}"`;
         }
      }
      
      let classes = '';
      if (tag === 'p') classes = ' class="mb-4 leading-relaxed whitespace-pre-wrap"';
      else if (tag === 'a') classes = ' class="text-blue-500 hover:underline" target="_blank"';
      else if (tag === 'ul') classes = ' class="list-disc pl-6 mb-4 space-y-1 marker:text-gray-500"';
      else if (tag === 'ol') classes = ' class="list-decimal pl-6 mb-4 space-y-1 marker:text-gray-500"';
      else if (tag === 'h3' || tag === 'h4') classes = ' class="text-xl font-bold mt-8 mb-3 text-gray-800 dark:text-gray-100"';
      else if (tag === 'blockquote') classes = ' class="border-l-4 border-gray-400 dark:border-gray-600 pl-4 py-1 mb-4 italic text-gray-600 dark:text-gray-400"';
      else if (tag === 'img') classes = ' class="rounded-xl max-w-full h-auto my-6 shadow-md"';
      else if (tag === 'code') classes = ' class="bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400"';

      html += `<${tag}${attrStr}${classes}>`;
      
      if (children) {
        html += parseTelegraphNodes(children);
      }
      
      if (!['img', 'br', 'hr'].includes(tag)) {
        html += `</${tag}>`;
      }
    }
  }
  return html;
}

function closeReaderModal() {
  const modal = document.getElementById('reader-modal');
  const modalCard = modal.querySelector('.card');
  
  modal.classList.add('opacity-0');
  modalCard.classList.add('scale-95');
  
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 300);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('close-reader-btn').addEventListener('click', closeReaderModal);
  
  document.getElementById('reader-modal').addEventListener('click', (e) => {
    if (e.target.id === 'reader-modal') {
      closeReaderModal();
    }
  });
});