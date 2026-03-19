const appState = {
  weather: 'sunny',
  time: 'dawn',
  hobby: 'fish',
  level: 1
}

document.addEventListener('DOMContentLoaded', () => {
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

    const handleGroupClick = (selector, stateKey) => {
        const group = document.querySelector(selector);
        group.addEventListener('click', e => {
            const btn = e.target.closest('button');
            if (!btn) return;

            // 1. Update UI (Active Class)
            group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 2. Update Global State using data-value attribute
            appState[stateKey] = btn.dataset.value;
            
            console.log("Current States:", appState);
            // updateDisplay(); // You can call a function here to refresh your map icons
        });
    };

    handleGroupClick('.filter-group.weather', 'weather');
    handleGroupClick('.filter-group.time', 'time');
    handleGroupClick('.tab-bar', 'hobby');
  });

function toggleWindow() {
    const win = document.getElementById('ui-window');
    win.classList.toggle('minimized');
}
