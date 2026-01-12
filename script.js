const firebaseConfig = { databaseURL: "https://m-legacy-5cf2b-default-rtdb.firebaseio.com/" };
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const container = document.getElementById('canvas-container');
const mCanvas = document.getElementById('mainCanvas');
const fCanvas = document.getElementById('fireCanvas');
const mCtx = mCanvas.getContext('2d');
const fCtx = fCanvas.getContext('2d');

mCanvas.width = fCanvas.width = 10000;
mCanvas.height = fCanvas.height = 10000;

let scale = 0.1; 
let posX = 0, posY = 0;
let isDragging = false;
let startX, startY;

// মাউস হুইল জুম
window.addEventListener('wheel', (e) => {
    if (e.target.closest('#view-viewport')) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        scale = Math.min(Math.max(0.05, scale * delta), 1);
        applyTransform();
    }
}, { passive: false });

// ড্র্যাগিং (নাড়াচাড়া) লজিক
const viewport = document.getElementById('view-viewport');

viewport.onmousedown = (e) => {
    isDragging = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
};

window.onmouseup = () => isDragging = false;

window.onmousemove = (e) => {
    if (isDragging) {
        posX = e.clientX - startX;
        posY = e.clientY - startY;
        applyTransform();
    }
    // ফায়ার ইফেক্ট
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    createFire(x, y);
};

function applyTransform() {
    container.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}
applyTransform();

let particles = [];
function createFire(x, y) {
    for(let i=0; i<5; i++) particles.push({x, y, vx:(Math.random()-0.5)*15, vy:(Math.random()-0.5)*15, life:20});
}

function animate() {
    fCtx.clearRect(0,0,10000,10000);
    particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.life--;
        fCtx.fillStyle = `rgba(0, 255, 204, ${p.life/20})`;
        fCtx.fillRect(p.x, p.y, 15, 15);
        if(p.life <= 0) particles.splice(i, 1);
    });
    requestAnimationFrame(animate);
}
animate();

// ছবি লোড
db.ref('pixels').on('value', snap => {
    const data = snap.val() || {};
    Object.keys(data).forEach(id => {
        let p = data[id];
        let img = new Image(); img.src = p.imageUrl;
        img.onload = () => mCtx.drawImage(img, ((id-1)%160)*200, Math.floor((id-1)/160)*200, 200, 200);
    });
});

function copy(t){ navigator.clipboard.writeText(t).then(()=>alert("Copied!")); }
