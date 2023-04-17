var listBox = document.getElementById("listbox");
var selectedOptions = document.getElementById("selectedOptions");
var spans = document.getElementsByTagName("span");
var listOfTags = ['Fryzjerstwo', 'Sprzątanie', 'Kurs', 'Nauka', 'Turystyka', 'Pomoc'].sort();
var tagInput = document.getElementById("tagInput");


$('div').on('click', 'span', function () { //usuwanie tagów
    var spanValue = $(this).attr("value");
    var tagToDelete = selectedOptions.querySelector(`tag[value='${spanValue}']`);
    selectedOptions.removeChild(tagToDelete);

    tagInput.value = tagInput.value.replace(new RegExp(spanValue + ';?\s*', 'g'), ''); // usuwanie tagów z hidden inputa

    var option = document.createElement("option");
    option.setAttribute("value", spanValue);
    option.textContent = spanValue;
    listBox.appendChild(option)
});

function showOptions() {
    listBox.style.display = "block";
    selectedOptions.style.borderRadius = "20px 20px 0px 0px";
    selectedOptions.style.marginBottom = "0px";
}
listBox.addEventListener("click", function () {
    var option = listBox.options[listBox.selectedIndex];
    if (option) {
        var value = option.value;
        var text = option.text;
        listBox.removeChild(option);
        var tag = document.createElement("tag");
        tag.setAttribute("value", text);
        var close = document.createElement("span")
        close.setAttribute("value", text);
        var p = document.createElement("p")
        p.textContent = text;
        close.textContent = "x";
        tag.appendChild(p);
        tag.appendChild(close);

        if (tagInput.value == "") { // dodawanie tagów do hidden inputa
            tagInput.value = text;
        } else {
            tagInput.value = tagInput.value + ";" + text;
        }

        console.log(tagInput.value);
        selectedOptions.appendChild(tag);
        spans = document.getElementsByTagName("span");
    }
});


window.onclick = function (event) {
    if (event.target != listBox && event.target != selectedOptions) {
        listBox.style.display = "none";
        selectedOptions.style.borderRadius = "20px";
        selectedOptions.style.marginBottom = "10px";
    }
}
