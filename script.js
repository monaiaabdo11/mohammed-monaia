// =====================================================
// SETTINGS — change the event details here only
// =====================================================
const CONFIG = {
    year: 2026,
    month: 10,        // 1-12
    day: 24,
    hour: 19,         // 24h format (19 = 7 PM)
    minute: 0,
    timeLabel: "7:00 PM"
};

const target = new Date(CONFIG.year, CONFIG.month - 1, CONFIG.day, CONFIG.hour, CONFIG.minute);
const $ = (id) => document.getElementById(id);

$("eventTime").textContent = CONFIG.timeLabel;

// =====================================================
// FALLING PETALS (cover)
// =====================================================
const petals = $("petals");
for (let i = 0; i < 22; i++) {
    const s = document.createElement("span");
    s.style.left = Math.random() * 100 + "%";
    s.style.animationDuration = (9 + Math.random() * 8) + "s";
    s.style.animationDelay = (-Math.random() * 14) + "s";
    s.style.scale = (0.6 + Math.random() * 0.9);
    s.style.opacity = (0.55 + Math.random() * 0.45);
    petals.appendChild(s);
}

// =====================================================
// MUSIC
// =====================================================
const music = $("music");
const musicBtn = $("musicBtn");

function setMusicUI(on) { musicBtn.classList.toggle("off", !on); }

function startMusic() {
    music.volume = 0.6;
    const p = music.play();
    if (p && p.then) p.then(() => setMusicUI(true)).catch(() => setMusicUI(false));
}

musicBtn.addEventListener("click", () => {
    if (music.paused) { music.play().then(() => setMusicUI(true)).catch(() => {}); }
    else { music.pause(); setMusicUI(false); }
});

// =====================================================
// OPEN INVITATION
// =====================================================
$("openBtn").addEventListener("click", () => {
    startMusic();                       // must run inside the click for phones to allow sound
    $("cover").classList.add("leaving");

    setTimeout(() => {
        $("cover").hidden = true;
        $("main").hidden = false;
        musicBtn.hidden = !!music.error;
        window.scrollTo(0, 0);
    }, 700);
});

// if the song file is missing, hide the music button
music.addEventListener("error", () => { musicBtn.hidden = true; });

// =====================================================
// CALENDAR (built automatically from the date above)
// =====================================================
(function buildCalendar() {
    const grid = $("calGrid");
    const monthName = target.toLocaleString("en-US", { month: "long" });
    $("calMonth").textContent = monthName + " " + CONFIG.year;

    ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].forEach((d) => {
        const s = document.createElement("span");
        s.className = "dow";
        s.textContent = d;
        grid.appendChild(s);
    });

    const first = new Date(CONFIG.year, CONFIG.month - 1, 1);
    const offset = (first.getDay() + 6) % 7;                 // Monday first
    const total = new Date(CONFIG.year, CONFIG.month, 0).getDate();

    for (let i = 0; i < offset; i++) grid.appendChild(document.createElement("span"));

    for (let d = 1; d <= total; d++) {
        const s = document.createElement("span");
        s.textContent = d;
        if (d === CONFIG.day) s.className = "today";
        grid.appendChild(s);
    }
})();

// =====================================================
// COUNTDOWN
// =====================================================
function tick() {
    let diff = target - new Date();
    if (diff < 0) diff = 0;

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    $("days").textContent = String(d).padStart(3, "0");
    $("hours").textContent = String(h).padStart(2, "0");
    $("minutes").textContent = String(m).padStart(2, "0");
    $("seconds").textContent = String(s).padStart(2, "0");
}
tick();
setInterval(tick, 1000);

// =====================================================
// RSVP POPUP + FORM
// =====================================================
const popup = $("popup");
const form = $("rsvpForm");
const fullName = $("fullName");
const nameError = $("nameError");
const attendanceError = $("attendanceError");
const successMessage = $("successMessage");

const formParts = () => [
    fullName, document.querySelector(".attendance"),
    document.querySelector("#rsvpForm textarea"), document.querySelector(".submit-wrapper")
];

function resetForm() {
    formParts().forEach((el) => (el.style.display = ""));
    successMessage.style.display = "none";
    form.reset();
    nameError.style.display = "none";
    attendanceError.style.display = "none";
    fullName.classList.remove("input-error");
    document.querySelectorAll(".attendance-card").forEach((c) => c.classList.remove("attendance-error"));
}

$("openForm").addEventListener("click", () => { resetForm(); popup.classList.add("show"); });
$("closePopup").addEventListener("click", () => popup.classList.remove("show"));
popup.addEventListener("click", (e) => { if (e.target === popup) popup.classList.remove("show"); });

form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    nameError.style.display = "none";
    attendanceError.style.display = "none";
    fullName.classList.remove("input-error");
    document.querySelectorAll(".attendance-card").forEach((c) => c.classList.remove("attendance-error"));

    if (fullName.value.trim() === "") {
        valid = false;
        fullName.classList.add("input-error");
        nameError.style.display = "block";
        nameError.textContent = "Please enter your name.";
    }

    if (!document.querySelector('input[name="attendance"]:checked')) {
        valid = false;
        attendanceError.style.display = "block";
        attendanceError.textContent = "Please choose one of the options.";
        document.querySelectorAll(".attendance-card").forEach((c) => c.classList.add("attendance-error"));
    }

    if (!valid) return;

    const btn = $("submitBtn");
    btn.disabled = true;

    fetch("https://api.web3forms.com/submit", { method: "POST", body: new FormData(form) })
        .then((r) => r.json())
        .then((data) => {
            if (data.success) {
                formParts().forEach((el) => (el.style.display = "none"));
                successMessage.style.display = "block";
                setTimeout(() => popup.classList.remove("show"), 3500);
            } else {
                alert("Something went wrong, please try again.");
            }
        })
        .catch(() => alert("Something went wrong, please try again."))
        .finally(() => { btn.disabled = false; });
});