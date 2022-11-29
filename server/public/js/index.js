function pokazhaslo() {
  const eye = document.querySelector("#eye");
  const pass = document.querySelector("#pass");
  if (pass.getAttribute("type") === "password") {
    pass.setAttribute("type", "text");
  } else {
    pass.setAttribute("type", "password");
  }
  eye.classList.toggle("fa-eye-slash");
}
