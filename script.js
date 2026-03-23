const appState = {
    weather: 'sunny',
    time: 'dawn',
    hobby: 'fish',
    levels: { fish: 1, bug: 1, bird: 1 }
}

const DATA = {
    critters: {},
    locs: []
}

async function initData() {
    try {
        const categories = Object.keys(DATA.critters);
        const fetches = categories.map(cat =>
            fetch(`./assets/data/${cat}.json`).then(r => r.json())
        );
        const locFetch = fetch('./assets/data/locations.json').then(r => r.json());
        const results = await Promise.all([...fetches, locFetch]);
        categories.forEach((cat, i) => DATA.critters[cat] = results[i]);
        DATA.locs = results[results.length - 1];

        console.log("Data loaded:", DATA.critters, DATA.locs);
        renderPins();
        updateDisplay();
    } catch (err) {
        console.error("Failed to load data:", err);
    }
}

function updateDisplay() {
    const { hobby, weather, time, levels } = appState;
    const filtered = DATA.critters[hobby].filter(item => {
        return item.weather[weather] === true &&
               item.times[time] === true &&
               item.lvl <= levels[hobby];
    });
}

function critterIconPath(name, category) {
    return `assets/map-icons/${category}/${name.replace(/ /g, '_')}.png`;
}



function isCritterVisible(item) {
    const { weather, time, levels } = appState;
    return item.weather[weather] === true &&
           item.times[time] === true &&
           item.lvl <= levels[item.category];
}

function renderPins() {
    const pinsEl = document.getElementById('map-pins');
    const panelsEl = document.getElementById('map-panels');
    const stemsEl = document.getElementById('map-stems');
    pinsEl.innerHTML = '';
    panelsEl.innerHTML = '';
    stemsEl.innerHTML = '';

    const PANEL_OFFSET = 30;

    DATA.locs.forEach(loc => {
        const critters = getCrittersForLocation(loc.id);
        if (critters.length === 0) return; // Skip if no data at all

        const isGeneric = loc.type === 'generic';
        const isArea = loc.type === 'area';

        // Create Panel
        const panel = document.createElement('div');
        panel.className = 'map-panel' + (isArea ? ' area' : '') + (isGeneric ? ' generic' : '');
        
        // LOGIC: Default to visible if there are critters
        const startVisible = critters.length > 0;
        if (!startVisible) {
            panel.classList.add('hidden');
        }

        panel.dataset.locationId = loc.id;
        panel.style.left = loc.x + 'px';
        panel.style.top = (loc.y - PANEL_OFFSET) + 'px';
        panel.style.transform = 'translate(-50%, -100%)';

        // ... (label and grid creation code remains the same) ...
        const label = document.createElement('div');
        label.className = 'map-panel-label';
        label.textContent = loc.label;
        panel.appendChild(label);

        const grid = document.createElement('div');
        grid.className = 'map-panel-grid';
        critters.forEach(item => {
            const img = document.createElement('img');
            img.src = critterIconPath(item.name, item.category);
            img.dataset.critterName = item.name;
            img.dataset.category = item.category;
            grid.appendChild(img);
        });
        panel.appendChild(grid);
        panelsEl.appendChild(panel);

        if (!isGeneric) {
            const pin = document.createElement('div');
            pin.className = 'map-pin';
            pin.style.left = loc.x + 'px';
            pin.style.top = loc.y + 'px';
            
            // Sync pin style if starting hidden
            if (!startVisible) pin.classList.add('hidden-panel');
            pinsEl.appendChild(pin);

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('class', 'map-stem');
            line.setAttribute('id', `stem-${loc.id}`);
            line.setAttribute('x1', loc.x);
            line.setAttribute('y1', loc.y);
            line.setAttribute('x2', loc.x);
            line.setAttribute('y2', loc.y - PANEL_OFFSET);
            
            // Sync stem visibility
            line.style.display = startVisible ? '' : 'none';
            stemsEl.appendChild(line);

            pin.addEventListener('click', () => {
                const isNowHidden = panel.classList.toggle('hidden');
                line.style.display = isNowHidden ? 'none' : '';
                pin.classList.toggle('hidden-panel', isNowHidden);
            });
        }
    });

    requestAnimationFrame(() => {
        resolveOverlaps();
        updatePanel();
    });
}

function resolveOverlaps() {
    
}

function updatePanel() {
    document.querySelectorAll('.map-panel').forEach(panel => {
        
    });
}

const handleGroupClick = (selector, stateKey) => {
    const group = document.querySelector(selector);
    group.addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;
        group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        appState[stateKey] = btn.dataset.value;
        localStorage.setItem('appState', JSON.stringify(appState));
        if (stateKey === 'time') moveTimeBubble(btn, true);
        updateDisplay();
    });
};

function moveTimeBubble(btn, animate) {
    const bubble = document.getElementById('time-bubble');
    if (!bubble) return;
    if (!animate) bubble.style.transition = 'none';
    bubble.style.left = btn.offsetLeft + 'px';
    bubble.style.width = btn.offsetWidth + 'px';
    if (!animate) requestAnimationFrame(() => { bubble.style.transition = ''; });
}

function syncTimeBubble() {
    const active = document.querySelector('.filter-group.time .time-btn.active');
    if (active) moveTimeBubble(active, false);
}

document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('appState');
    if (saved) {
        Object.assign(appState, JSON.parse(saved));

        const timeBtn = document.querySelector(`.time-btn[data-value="${appState.time}"]`);
        if (timeBtn) {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            timeBtn.classList.add('active');
        }
        const weatherBtn = document.querySelector(`.weather-btn[data-value="${appState.weather}"]`);
        if (weatherBtn) {
            document.querySelectorAll('.weather-btn').forEach(b => b.classList.remove('active'));
            weatherBtn.classList.add('active');
        }
        document.querySelectorAll('.tab-link[data-value]').forEach(tab => {
            const hobby = tab.dataset.value;
            if (appState.levels[hobby]) {
                tab.querySelector('.lvl-badge').textContent = appState.levels[hobby];
            }
        });
    }

    requestAnimationFrame(() => syncTimeBubble());
    window.addEventListener('resize', () => syncTimeBubble());

    document.querySelector('.tab-bar').addEventListener('click', (e) => {
        const stepBtn = e.target.closest('.step-btn');
        if (!stepBtn) return;
        e.stopPropagation();
        const tab = stepBtn.closest('.tab-link');
        const hobby = tab.dataset.value;
        const direction = parseInt(stepBtn.dataset.dir);
        appState.levels[hobby] = Math.max(1, Math.min(14, appState.levels[hobby] + direction));
        tab.querySelector('.lvl-badge').textContent = appState.levels[hobby];
        updateDisplay();
        localStorage.setItem('appState', JSON.stringify(appState));
    });

    
    const svg = d3.select("#map-container");
    const map = d3.select("#map-world");

    const zoom = d3.zoom()
        .scaleExtent([0.2, 5])
        .on("zoom", (event) => {
            map.style("transform", `translate(${event.transform.x}px, ${event.transform.y}px) scale(${event.transform.k})`);
        });

    svg.call(zoom);

    // Center it immediately:
    const initialScale = 0.6;
    const centerX = (window.innerWidth - 2004 * initialScale) / 2;
    const centerY = (window.innerHeight - 2002 * initialScale) / 2;

    svg.call(zoom.transform, d3.zoomIdentity.translate(centerX, centerY).scale(initialScale));  
    
    handleGroupClick('.filter-group.weather', 'weather');
    handleGroupClick('.filter-group.time', 'time');
    handleGroupClick('.tab-bar', 'hobby');

    // enablePinPlacement(); // uncomment to place pins

    initData();
});

function toggleWindow() {
    const win = document.getElementById('ui-window');
    win.classList.toggle('minimized');
}