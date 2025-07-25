tailwind.config = {
  darkMode: 'media',
  theme: {
    extend: {},
  },
};

document.addEventListener('DOMContentLoaded', function() {
  loadROMs();
  initTabs();
});

function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const currentActiveTab = document.querySelector('.tab-content.active');
      const newTabId = this.getAttribute('data-tab') + '-tab';
      const newTabContent = document.getElementById(newTabId);
      
      if (currentActiveTab === newTabContent) return;

      const currentIndex = Array.from(tabButtons).findIndex(btn => btn.classList.contains('active'));
      const newIndex = Array.from(tabButtons).findIndex(btn => btn === this);
      const direction = newIndex > currentIndex ? 'right' : 'left';

      currentActiveTab.classList.add(direction === 'right' ? 'slide-out-left' : 'slide-out-right');
      newTabContent.classList.add(direction === 'right' ? 'slide-out-right' : 'slide-out-left');
      newTabContent.classList.remove('hidden');
      
      tabButtons.forEach(btn => {
        btn.classList.remove('active');
      });
      this.classList.add('active');

      setTimeout(() => {
        currentActiveTab.classList.remove('active', 'slide-out-left', 'slide-out-right');
        currentActiveTab.classList.add('hidden');
        
        newTabContent.classList.add('active');
        newTabContent.classList.remove('slide-out-left', 'slide-out-right');
        
        if (newTabId === 'roms-tab' && document.getElementById('roms-container').innerHTML.trim() === '') {
          loadROMs();
        }
        else if (newTabId === 'kernels-tab' && document.getElementById('kernels-container').innerHTML.trim() === '') {
          loadKernels();
        }
        else if (newTabId === 'flashing-tab' && document.getElementById('flashing-container').innerHTML.trim() === '') {
          loadFlashingGuide();
        }
      }, 100);
    });
  });

  const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
  if (activeTab === 'roms') loadROMs();
  else if (activeTab === 'kernels') loadKernels();
  else if (activeTab === 'flashing') loadFlashingGuide();
}

function loadROMs() {
  fetch('assets/roms.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(roms => {
      const container = document.getElementById('roms-container');
      container.innerHTML = ''; // Clear any loading/placeholder content
      
      roms.forEach(rom => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <img src="${rom.image}" alt="${rom.title} Logo" class="mb-4 w-full h-auto rounded-lg">
          <h2 class="text-xl font-semibold mb-1">${rom.title}</h2>
          <p class="desc mb-2">${rom.description}</p>
          <p class="text-sm device-text">Devices: ${rom.devices}</p>
          <button onclick="loadModal('${rom.infoUrl}')" 
              class="inline-block mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-200">
            Info
          </button>
          <a href="${rom.downloadUrl}" target="_blank" rel="noopener noreferrer" 
             class="inline-block mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-200">
            Downloads
          </a>
        `;
        container.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Error loading ROMs data:', error);
      const container = document.getElementById('roms-container');
      container.innerHTML = `
        <div class="col-span-full text-center py-8">
          <div class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg inline-block">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Failed to load Data. Please try again later.
          </div>
        </div>
      `;
    });
}

function loadKernels() {
  fetch('assets/kernels.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(kernels => {
      const container = document.getElementById('kernels-container');
      container.innerHTML = '';
      
      kernels.forEach(kernel => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <img src="${kernel.image}" alt="${kernel.title} Logo" class="mb-4 w-full h-auto rounded-lg">
          <h2 class="text-xl font-semibold mb-1">${kernel.title}</h2>
          <p class="desc mb-2">${kernel.description}</p>
          <p class="text-sm device-text">Devices: ${kernel.devices}</p>
          <a href="${kernel.sourceUrl}" target="_blank" rel="noopener noreferrer" 
             class="inline-block mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-200">
            Source
          </a>
          <a href="${kernel.downloadUrl}" target="_blank" rel="noopener noreferrer" 
             class="inline-block mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-200">
            Downloads
          </a>
        `;
        container.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Error loading ROMs data:', error);
      const container = document.getElementById('roms-container');
      container.innerHTML = `
        <div class="col-span-full text-center py-8">
          <div class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg inline-block">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Failed to load Data. Please try again later.
          </div>
        </div>
      `;
    });
}

function loadFlashingGuide() {
  const container = document.getElementById('flashing-container');
  container.innerHTML = `
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  `;
  
  fetch('assets/flashing_guide.html')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load guide');
      }
      return response.text();
    })
    .then(html => {
      container.innerHTML = html;
      
      const style = document.createElement('style');
      container.appendChild(style);
    })
    .catch(error => {
      console.error('Error loading flashing guide:', error);
      container.innerHTML = `
        <div class="p-4 text-center text-red-500">
          Failed to load guide. <a href="assets/flashing_guide.html" target="_blank" class="underline">Open directly</a>
        </div>
      `;
    });
}

function toggleTheme() {
  const body = document.body;
  const btn = document.querySelector('.theme-toggle-btn');
  body.classList.toggle('light-mode');
  btn.textContent = body.classList.contains('light-mode') ? '☀️' : '🌙';
}

function loadModal(url) {
  const modal = document.getElementById('infoModal');
  const modalContent = document.getElementById('modalContent');
  modalContent.innerHTML = `
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  `;
  
  modal.classList.remove('hidden');
  fetch(url)
    .then(response => response.text())
    .then(html => {
      modalContent.innerHTML = html;
      
      const style = document.createElement('style');
      style.textContent = `
        .modal-content img { max-width: 100%; }
        .modal-content { padding: 1rem; }
      `;
      modalContent.appendChild(style);
    })
    .catch(error => {
      modalContent.innerHTML = `
        <div class="p-4 text-center text-red-500">
          Failed to load content. <a href="${url}" target="_blank" class="underline">Open directly</a>
        </div>
      `;
    });
}

function closeModal() {
  document.getElementById('infoModal').classList.add('hidden');
  document.getElementById('modalContent').innerHTML = '';
}