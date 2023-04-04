var dropdownContent = document.getElementById("dropdown--content");
var category = document.getElementById("category");
var categoryText = document.getElementById("category--text");
category.addEventListener("click", showOptions);
function showOptions(){
    console.log("xdd")
    dropdownContent.style.display = "block";
}
window.onclick = function(event) {
    console.log(event.target);
    console.log("ddx");
    conole.log(category);
    console.log(event.target != category);
    if (event.target != category && event.target != dropdownContent && event.target != categoryText) {
        console.log("none");
        dropdownContent.style.display = "none";
    }
  }
