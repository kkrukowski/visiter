// Toggle password
let togglePasswordElem = document.querySelectorAll(".password__toggle--icon");

Array.from(togglePasswordElem).forEach((elem) => {
  elem.addEventListener("click", () => {
    const passwordElem = elem.parentElement.firstElementChild;
    const togglePasswordIcon = elem.firstElementChild;
    console.log(passwordElem);
    const inputAttribute = passwordElem.getAttribute("type");
    if (inputAttribute === "password") {
      passwordElem.setAttribute("type", "text");
      togglePasswordIcon.classList.replace("fa-eye", "fa-eye-slash");
    }
    if (inputAttribute === "text") {
      passwordElem.setAttribute("type", "password");
      togglePasswordIcon.classList.replace("fa-eye-slash", "fa-eye");
    }
  });
});
