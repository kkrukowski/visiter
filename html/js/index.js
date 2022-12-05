function pokazhaslo() {
  const eye = document.querySelector("#eye");
  const pass = document.querySelector("#pass");
  if (pass.getAttribute("type") === "text") {
    pass.setAttribute("type", "password");
  } else {  
    pass.setAttribute("type", "text");
  }
  eye.classList.toggle("fa-eye-slash");

}
function przyp_haslo(){
document.querySelector("#sekcja_logowanie").innerHTML="<img src='pic/logo.PNG' <h3>Wysłaliśmy kod na adres E-mail:</h3> <label for='email'></label> <input type='email' name='email' autocomplete placeholder='Kod'> <button id='submit' onclick='przyp_haslo()' value='Wyślij'> Wyślij </button>"

}
