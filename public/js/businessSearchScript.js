var dropdownContent = document.getElementById("dropdown--content");
var category = document.getElementById("category");
var categoryText = document.getElementById("category--text");
category.addEventListener("click", showOptions);
function showOptions(){
    console.log("xdd")
    dropdownContent.style.display = "block";
}
window.onclick = function(event) {
    console.log("halo")
    if (event.target != category && event.target != dropdownContent && event.target != categoryText) {
        dropdownContent.style.display = "none";
    }
  }
