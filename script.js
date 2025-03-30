const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let currentTool = 'pencil';
let startX, startY;
let currentX, currentY;
let scale = 1;
let currentBrushStyle = 'round';
let sprayDensity = 50;
let currentShape = 'rectangle';

// Set canvas size
canvas.width = 1200;
canvas.height = 800;

// Tool elements
const tools = {
    pencil: document.getElementById('pencil'),
    brushBtn: document.getElementById('brushBtn'),
    eraser: document.getElementById('eraser'),
    shapesBtn: document.getElementById('shapesBtn'),
    line: document.getElementById('line'),
    text: document.getElementById('text'),
    emoji: document.getElementById('emoji'),
    colorPicker: document.getElementById('colorPicker'),
    brushSize: document.getElementById('brushSize'),
    textInput: document.getElementById('textInput'),
    zoomIn: document.getElementById('zoomIn'),
    zoomOut: document.getElementById('zoomOut'),
    clear: document.getElementById('clear')
};

// Brush styles dropdown
const brushStyles = document.querySelector('.brush-styles');
const brushStyleOptions = document.querySelectorAll('.brush-style');

// Shapes menu
const shapesMenu = document.querySelector('.shapes-menu');
const shapeOptions = document.querySelectorAll('.shape-option');

tools.brushBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    brushStyles.style.display = brushStyles.style.display === 'none' ? 'block' : 'none';
});

document.addEventListener('click', () => {
    brushStyles.style.display = 'none';
});

brushStyleOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        e.stopPropagation();
        currentBrushStyle = option.dataset.style;
        brushStyleOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        brushStyles.style.display = 'none';
    });
});

tools.shapesBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    shapesMenu.style.display = shapesMenu.style.display === 'none' ? 'block' : 'none';
});

document.addEventListener('click', () => {
    shapesMenu.style.display = 'none';
});

shapeOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        e.stopPropagation();
        currentShape = option.dataset.shape;
        shapeOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        shapesMenu.style.display = 'none';
        currentTool = 'shape';
    });
});

// Tool selection
Object.keys(tools).forEach(tool => {
    if (tools[tool] && tools[tool].classList) {
        tools[tool].addEventListener('click', () => {
            document.querySelectorAll('.tool-button').forEach(btn => btn.classList.remove('active'));
            if (tools[tool].classList) {
                tools[tool].classList.add('active');
            }
            currentTool = tool;
        });
    }
});

// Drawing functions
function drawPencil(e) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    ctx.lineWidth = tools.brushSize.value;
    ctx.lineCap = 'round';
    ctx.strokeStyle = tools.colorPicker.value;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function drawBrush(e) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    ctx.lineWidth = tools.brushSize.value;
    ctx.strokeStyle = tools.colorPicker.value;
    
    switch(currentBrushStyle) {
        case 'round':
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineTo(x, y);
            ctx.stroke();
            break;
            
        case 'square':
            ctx.lineCap = 'square';
            ctx.lineJoin = 'miter';
            ctx.lineTo(x, y);
            ctx.stroke();
            break;
            
        case 'spray':
            for(let i = 0; i < sprayDensity; i++) {
                const offsetX = (Math.random() - 0.5) * tools.brushSize.value * 2;
                const offsetY = (Math.random() - 0.5) * tools.brushSize.value * 2;
                ctx.beginPath();
                ctx.arc(x + offsetX, y + offsetY, 1, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
            
        case 'calligraphy':
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = tools.brushSize.value * 0.5;
            ctx.lineTo(x, y);
            ctx.stroke();
            break;
            
        case 'texture':
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineTo(x, y);
            ctx.stroke();
            // Add texture effect
            ctx.save();
            ctx.globalAlpha = 0.3;
            for(let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(x - tools.brushSize.value/2, y);
                ctx.lineTo(x + tools.brushSize.value/2, y);
                ctx.stroke();
                ctx.rotate(Math.PI / 3);
            }
            ctx.restore();
            break;
    }
    
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function drawEraser(e) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    ctx.lineWidth = tools.brushSize.value;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ffffff';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function drawShape(e) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    currentX = (e.clientX - rect.left) / scale;
    currentY = (e.clientY - rect.top) / scale;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.strokeStyle = tools.colorPicker.value;
    ctx.lineWidth = tools.brushSize.value;
    
    switch(currentShape) {
        case 'rectangle':
            ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);
            break;
            
        case 'circle':
            const radius = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
            ctx.arc(startX, startY, radius, 0, Math.PI * 2);
            break;
            
        case 'triangle':
            ctx.moveTo(startX, startY);
            ctx.lineTo(currentX, currentY);
            ctx.lineTo(startX - (currentX - startX), currentY);
            ctx.closePath();
            break;
            
        case 'hexagon':
            const hexRadius = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
            for(let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                const x = startX + hexRadius * Math.cos(angle);
                const y = startY + hexRadius * Math.sin(angle);
                if(i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            break;
            
        case 'star':
            const starRadius = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
            for(let i = 0; i < 10; i++) {
                const angle = (i * Math.PI) / 5;
                const radius = i % 2 === 0 ? starRadius : starRadius * 0.5;
                const x = startX + radius * Math.cos(angle);
                const y = startY + radius * Math.sin(angle);
                if(i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            break;
            
        case 'arrow':
            const arrowLength = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
            const angle = Math.atan2(currentY - startY, currentX - startX);
            const arrowWidth = tools.brushSize.value * 2;
            
            ctx.moveTo(startX, startY);
            ctx.lineTo(currentX, currentY);
            
            // Arrow head
            ctx.moveTo(currentX, currentY);
            ctx.lineTo(currentX - arrowWidth * Math.cos(angle - Math.PI/6), currentY - arrowWidth * Math.sin(angle - Math.PI/6));
            ctx.moveTo(currentX, currentY);
            ctx.lineTo(currentX - arrowWidth * Math.cos(angle + Math.PI/6), currentY - arrowWidth * Math.sin(angle + Math.PI/6));
            break;
    }
    
    ctx.stroke();
}

function addText(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    ctx.font = `${tools.brushSize.value}px Arial`;
    ctx.fillStyle = tools.colorPicker.value;
    ctx.fillText(tools.textInput.value, x, y);
}

function addEmoji(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    ctx.font = `${tools.brushSize.value}px Arial`;
    ctx.fillText('😊', x, y);
}

// Event listeners
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    startX = (e.clientX - rect.left) / scale;
    startY = (e.clientY - rect.top) / scale;
    ctx.beginPath();
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    
    switch(currentTool) {
        case 'pencil':
            drawPencil(e);
            break;
        case 'brushBtn':
            drawBrush(e);
            break;
        case 'eraser':
            drawEraser(e);
            break;
        case 'shape':
            drawShape(e);
            break;
        case 'line':
            drawShape(e);
            break;
    }
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    ctx.beginPath();
});

canvas.addEventListener('click', (e) => {
    if (currentTool === 'text') {
        addText(e);
    } else if (currentTool === 'emoji') {
        addEmoji(e);
    }
});

// Zoom functionality
tools.zoomIn.addEventListener('click', () => {
    scale *= 1.2;
    canvas.style.transform = `scale(${scale})`;
});

tools.zoomOut.addEventListener('click', () => {
    scale /= 1.2;
    canvas.style.transform = `scale(${scale})`;
});

// Clear canvas
tools.clear.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Set initial active tool
tools.pencil.classList.add('active'); 