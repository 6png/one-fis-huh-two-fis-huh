const appState = {
    weather: 'sunny',
    time: 'dawn',
    hobby: 'fish',
    levels: { fish: 1, bug: 1, bird: 1 }
};

let hobbyData = { fish: [], bug: [], bird: [] };

async function initData() {
    try {
        const categories = Object.keys(hobbyData);
        for (const cat of categories) {
            const response = await fetch(`./assets/data/${cat}.json`);
            hobbyData[cat] = await response.json();
        }
        updateDisplay();
    } catch (err) {
        console.error("Failed to load JSON files:", err);
    }
}

function updateDisplay() {
    const { hobby, weather, time, levels } = appState;
    if (!hobbyData[hobby]) return;

    const filtered = hobbyData[hobby].filter(item => {
        return item.weather[weather] === true && 
               item.times[time] === true && 
               item.lvl <= (levels[hobby] || 1);
    });

    console.log(`--- Filtering: ${hobby} | ${weather} | ${time} | Lvl: ${levels[hobby]} ---`);
    console.table(filtered);
}

const handleGroupClick = (selector, stateKey) => {
    const group = document.querySelector(selector);
    if (!group) return;
    group.addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;
        group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        appState[stateKey] = btn.dataset.value;
        saveState();
        updateDisplay();
    });
};

function saveState() {
    localStorage.setItem('appState', JSON.stringify(appState));
}

document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('appState');
    if (saved) {
        const parsed = JSON.parse(saved);
        // Deep merge to ensure .levels exists even if the save is old/broken
        Object.assign(appState, parsed);
        appState.levels = { ...appState.levels, ...parsed.levels };
    }
  
    document.querySelector('.tab-bar').addEventListener('click', (e) => {
        const stepBtn = e.target.closest('.step-btn');
        if (!stepBtn) return;

        e.stopPropagation();
        const tab = stepBtn.closest('.tab-link');
        const hobby = tab.dataset.value;
        const direction = parseInt(stepBtn.dataset.dir);
        
        // Fix: Force integer conversion and provide fallback to prevent NaN
        const currentLvl = parseInt(appState.levels[hobby]) || 1;
        appState.levels[hobby] = Math.max(1, Math.min(14, currentLvl + direction));
        
        tab.querySelector('.lvl-badge').textContent = appState.levels[hobby];
        saveState();
        updateDisplay();
    });

    // Panzoom & UI Init
    const mapImage = document.querySelector('.map-container img');
    if (mapImage) {
        const panzoom = Panzoom(mapImage, { maxScale: 5, minScale: 0.1, contain: false });
        const parent = mapImage.parentElement;
        parent.addEventListener('wheel', panzoom.zoomWithWheel);
        parent.addEventListener('mousedown', () => parent.style.cursor = 'grabbing');
        parent.addEventListener('mouseup', () => parent.style.cursor = 'grab');
    }

    handleGroupClick('.filter-group.weather', 'weather');
    handleGroupClick('.filter-group.time', 'time');
    // Ensure hobby selection is tracked separately from level buttons
    const tabs = document.querySelectorAll('.tab-link');
    tabs.forEach(t => t.addEventListener('click', (e) => {
        if(e.target.closest('.step-btn')) return;
        appState.hobby = t.dataset.value;
        saveState();
        updateDisplay();
    }));

    initData();
});

function toggleWindow() {
    document.getElementById('ui-window').classList.toggle('minimized');
}