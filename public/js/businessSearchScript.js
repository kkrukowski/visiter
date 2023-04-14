var dropdownContent = document.getElementById("dropdown--content");
var category = document.getElementById("category");
var categoryText = document.getElementsByClassName("category--text")[0];
var tags = document.getElementsByClassName("tag")[0];
console.log("script")
category.addEventListener("click", () => {
    console.log("script")
  dropdownContent.style.display = "flex";
});
dropdownContent.addEventListener("click", (event) => {
  event.stopPropagation();
})
window.onclick = (event) => {
  console.log(event.target);
  if (event.target != category && event.target != dropdownContent && event.target != categoryText && event.target != tags) {
    dropdownContent.style.display = "none";
  }
}

