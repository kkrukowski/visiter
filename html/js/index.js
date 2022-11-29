function rejestracja() {
  document.getElementById("sekcja").innerHTML = `<br>
    <img src="pic/logo.PNG">
    <h3>LOGOWANIE</h3>
    <form action="/rejestracja.html" method="get">
        <input type="email" value="E-mail">
        <br><br>
        <input type="text" value="Imie">
        <br><br>
        <input type="text" value="Nazwisko">
        <br><br>
        <p id="pleclabel">Płeć:</p>
        <div id="plec">
        <label><input type="radio" name="plec">Mężczyzna</label>           
        <label><input type="radio" name="plec">Kobieta</label>
        </div>
        <br>
        <input id="pass" for="pass" type="text" autocomplete="current-password" value="Hasło">
        <i  class="far fa-eye" id="eye" onclick="pokazhaslo()"></i><br> <br>
        <input id="submit" type="submit" value="Zarejestruj się"><br><br>
    </form>`;
  document.getElementById("sekcja").style.height = "auto";
}

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
