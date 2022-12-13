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
function przyp_haslo(){
document.querySelector("#sekcja_logowanie").innerHTML="<img src='pic/logo.PNG'> <h4>Wysłaliśmy kod na adres E-mail:</h4> <label for='email'></label> <input type='email' name='email' autocomplete placeholder='Kod'> <button id='submit' onclick='przyp_haslo()' value='Wyślij'> Wyślij </button>"

}
