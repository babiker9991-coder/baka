document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const status = document.getElementById("status");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
      status.textContent = "الرجاء تعبئة جميع الحقول.";
      status.style.color = "red";
      return;
    }

    status.textContent = "تم إرسال رسالتك بنجاح ✅";
    status.style.color = "green";
    form.reset();
  });
});
