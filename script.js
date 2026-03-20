const appState = {
  weather: 'sunny',
  time: 'dawn',
  hobby: 'fish',
  levels: {
    "fish": 1,
    "bug": 1,
    "bird": 1
  }
}

// 1. Create a place to store the data once it's fetched
let hobbyData = {
    fish: [],
    bug: [],
    bird: []
};

// 2. Fetch the files from assets/data/
async function initData() {
    try {
        const categories = Object.keys(hobbyData);
        for (const cat of categories) {
            const response = await fetch(`./assets/data/${cat}.json`);
            hobbyData[cat] = await response.json();
        }
        console.log("Data loaded successfully:", hobbyData);
        updateDisplay(); // Run initial filter
    } catch (err) {
        console.error("Failed to load JSON files:", err);
    }
}

// 3. The filtering logic
function updateDisplay() {
    const { hobby, weather, time, levels } = appState;
    
    // Filter the selected category based on the boolean keys in your JSON
    const filtered = hobbyData[hobby].filter(item => {
        const matchesWeather = item.weather[weather] === true;
        const matchesTime = item.times[time] === true;
        const matchesLevel = item.lvl <= levels[hobby];
        
        return matchesWeather && matchesTime && matchesLevel;
    });

    console.log(`--- Filtering for: ${hobby} | ${weather} | ${time} ---`);
    console.table(filtered); // Using table makes it easier to read in console
}

// 4. Update your handleGroupClick to trigger the filter
const handleGroupClick = (selector, stateKey) => {
    const group = document.querySelector(selector);
    group.addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;

        group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        appState[stateKey] = btn.dataset.value;
        localStorage.setItem('appState', JSON.stringify(appState));

        // Trigger the filter each time a button is clicked
        updateDisplay(); 
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('appState');
    if (saved) Object.assign(appState, JSON.parse(saved));
  
    document.querySelector('.tab-bar').addEventListener('click', (e) => {
        const stepBtn = e.target.closest('.step-btn');
        if (!stepBtn) return;

        e.stopPropagation(); // Stop the tab-link from firing its click
        
        const tab = stepBtn.closest('.tab-link');
        const hobby = tab.dataset.value;
        const direction = parseInt(stepBtn.dataset.dir);
        
        // Update State
        appState.levels[hobby] = Math.max(1, Math.min(14, appState.levels[hobby] + direction));
        
        // Update UI Badge
        tab.querySelector('.lvl-badge').textContent = appState.levels[hobby];
        
        updateDisplay();
        localStorage.setItem('appState', JSON.stringify(appState));
    });

    const mapImage = document.querySelector('.map-container img');
    
    if (!mapImage) return; // Safety check

    const panzoom = Panzoom(mapImage, {
        maxScale: 5,
        minScale: 0.1,
        contain: false, // Allows dragging into the blue void
        handleStartEvent: (event) => {
            event.preventDefault(); // Prevents browser ghosting/interference
        }
    });

    // Important: Panzoom sometimes needs to know the parent is the trigger
    const parent = mapImage.parentElement;
    parent.addEventListener('wheel', panzoom.zoomWithWheel);

    // Force a pointer-event refresh
    mapImage.style.pointerEvents = 'auto';
        
    // Fix: Panzoom requires the parent to handle the wheel events
    parent.addEventListener('wheel', panzoom.zoomWithWheel);

    // Visual cursor feedback
    parent.addEventListener('mousedown', () => parent.style.cursor = 'grabbing');
    parent.addEventListener('mouseup', () => parent.style.cursor = 'grab');

    handleGroupClick('.filter-group.weather', 'weather');
    handleGroupClick('.filter-group.time', 'time');
    handleGroupClick('.tab-bar', 'hobby');

    initData()
  });



function toggleWindow() {
    const win = document.getElementById('ui-window');
    win.classList.toggle('minimized');
}
