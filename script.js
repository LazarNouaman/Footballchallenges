// تعريف المتغيرات الأساسية
let players = []; // قائمة اللاعبين
let currentIndex = 0; // اللاعب الحالي
let currentClue = 0; // التلميح الحالي
let score = 0; // النقاط
let timer; // المؤقت
let timeLeft = 30; // الوقت المتبقي

window.onload = function() {
  document.getElementById("rulesPopup").style.display = "block"; // عرض نافذة الشروط
  document.getElementById("overlay").style.display = "block"; // عرض التعتيم الخلفي
};

// بدء اللعبة عند الضغط على زر "ابدأ"
function startGame() {
  // إخفاء نافذة الشروط والتعتيم الخلفي
  document.getElementById("rulesPopup").style.display = "none";
  document.getElementById("overlay").style.display = "none";
  
  // بدء اللعبة
  fetch('players.json')
    .then(response => response.json())
    .then(data => {
      players = data; // تخزين بيانات اللاعبين
      shufflePlayers(); // خلط ترتيب اللاعبين
      renderClues(); // عرض أول تلميح
      startTimer(); // بدء المؤقت
    })
    .catch(error => console.error('خطأ في تحميل البيانات:', error));
}

// دالة لخلط ترتيب اللاعبين
function shufflePlayers() {
players.sort(() => Math.random() - 0.5); // ترتيب عشوائي باستخدام مقارنة عشوائية
}

// التحقق من إجابة اللاعب
function checkAnswer() {
const answer = document.getElementById("answer").value.trim().toLowerCase(); // قراءة الإجابة وتحويلها إلى أحرف صغيرة

if (!answer) {
showMessagePopup("الرجاء إدخال إجابة!"); // عرض رسالة إذا لم يتم إدخال إجابة
return;
}

// استخدام مكتبة Fuse.js للبحث الغامض مع إعدادات مرونة
const options = {
keys: ['name'], // البحث في أسماء اللاعبين
threshold: 0.8, // السماح بأخطاء بسيطة
};

const fuse = new Fuse(players, options); // تهيئة البحث الغامض
const results = fuse.search(answer); // البحث عن تطابق للإجابة

if (results.length > 0) {
const matchedPlayer = results[0].item; // اللاعب الذي تم العثور عليه
if (matchedPlayer.name.toLowerCase() === players[currentIndex].name.toLowerCase()) {
  // إذا كانت الإجابة صحيحة
  alertPopup(matchedPlayer.name, matchedPlayer.image); // عرض نافذة النجاح
  updateScore(5 - currentClue); // زيادة النقاط بناءً على عدد التلميحات المستخدمة
} else {
  showMessagePopup("ليس هو!"); // عرض رسالة للخطأ
  showNextClue();
}
} else {
showNextClue(); // عرض التلميح التالي إذا لم تكن الإجابة صحيحة
}

document.getElementById("answer").value = ""; // مسح حقل الإجابة بعد كل محاولة
}

// تحديث النقاط
function updateScore(points) {
score += points; // إضافة النقاط إلى المجموع
document.getElementById("score").innerText = `النقاط : ${score}`; // تحديث عرض النقاط
}

// عرض التلميح التالي
function showNextClue() {
if (currentClue < players[currentIndex].clues.length - 1) {
currentClue++; // الانتقال إلى التلميح التالي
renderClues(); // عرض التلميحات المحدثة
resetTimer(); // إعادة ضبط المؤقت
} else {
showMessagePopup(`الإجابة الصحيحة هي: ${players[currentIndex].name}`); // عرض الإجابة الصحيحة إذا انتهت التلميحات
nextPlayer();
}
}

// الانتقال إلى اللاعب التالي
function nextPlayer() {
currentIndex = (currentIndex + 1) % players.length; // الانتقال إلى اللاعب التالي (مع إعادة البداية عند الانتهاء)
currentClue = 0; // إعادة التلميحات إلى التلميح الأول
renderClues(); // عرض التلميحات الجديدة
resetTimer(); // إعادة ضبط المؤقت
}

// عرض التلميحات الحالية
function renderClues() {
const cluesContainer = document.getElementById("clues");
cluesContainer.innerHTML = players[currentIndex].clues
.slice(0, currentClue + 1) // عرض التلميحات حتى التلميح الحالي فقط
.map(clue => `<div class="clue">${clue}</div>`) // إنشاء العناصر HTML للتلميحات
.join('');
}

// نافذة النجاح
function alertPopup(name, imageUrl) {
const popup = document.getElementById("popup");
const overlay = document.getElementById("overlay");
document.getElementById("playerName").innerText = ` احسنت اللاعب هو : ${name} ` ; // اسم اللاعب
document.getElementById("playerImage").src = imageUrl; // صورة اللاعب
popup.style.display = "block"; // عرض النافذة
overlay.style.display = "block"; // عرض التعتيم الخلفي
}

// إغلاق نافذة النجاح
function closePopup() {
document.getElementById("popup").style.display = "none"; // إخفاء النافذة
document.getElementById("overlay").style.display = "none"; // إخفاء التعتيم الخلفي
nextPlayer(); // الانتقال إلى اللاعب التالي بعد إغلاق النافذة
}

// عرض رسالة توجيهية
function showMessagePopup(message) {
const messagePopup = document.getElementById("messagePopup");
document.getElementById("messageText").innerText = message; // تعيين نص الرسالة
messagePopup.style.display = "block"; // عرض النافذة
}

// إغلاق رسالة التوجيه
function closeMessagePopup() {
document.getElementById("messagePopup").style.display = "none"; // إخفاء النافذة
}

// بدء المؤقت
function startTimer() {
timeLeft = 30; // تعيين وقت البداية
timer = setInterval(() => {
timeLeft--; // تقليل الوقت بمقدار ثانية واحدة
document.getElementById("timer").innerText = ` ${timeLeft}`; // تحديث عرض الوقت
if (timeLeft <= 0) {
  clearInterval(timer); // إيقاف المؤقت إذا انتهى الوقت
  showNextClue(); // عرض التلميح التالي عند انتهاء الوقت
}
}, 1000); // تحديث كل ثانية
}

// إعادة ضبط المؤقت
function resetTimer() {
clearInterval(timer); // إيقاف المؤقت الحالي
startTimer(); // بدء مؤقت جديد
}

