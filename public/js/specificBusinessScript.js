var modal = document.getElementsByClassName("modal");
var span = document.getElementsByClassName("close");
var btnOpinionAdd = document.getElementById("addOpinion");
btnOpinionAdd.onclick = function (event) {
    modal[0].style.display = "block";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}
span[0].onclick = function () {
    modal[0].style.display = "none";
    document.body.style.backgroundColor = "initial"; // przywrócenie koloru tła strony
}
window.onclick = function (event) {
    if (event.target == modal[0]) {
        modal[0].style.display = "none";
        document.body.style.backgroundColor = "initial";
    }
}
