var modal = document.getElementById("modal");
var btnEdit = document.getElementsByClassName("user__edit")[0];
var span = document.getElementsByClassName("close")[0];


btnEdit.onclick = function () {
    console.log("halo")
    modal.style.display = "block";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}

span.onclick = function () {
    modal.style.display = "none";
    document.body.style.backgroundColor = "initial";
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
        document.body.style.backgroundColor = "initial";
    }
}


function editPanel(btn) {
    console.log(btn.value)
    var divsToEdit = document.getElementsByClassName('toEdit');
    var divsEditPanel = document.getElementsByClassName('editPanel');

    for (var i = 0; i < divsToEdit.length; i++) {
        if (divsToEdit[i].id == btn.value) {
            divsToEdit[i].style.display = 'none';
            divsEditPanel[i].style.display = 'none';
        }
        else {
            divsToEdit[i].style.display = 'flex';
        }
    }
    for (var i = 0; i < divsEditPanel.length; i++) {
        if (divsEditPanel[i].id == btn.value) {
            divsEditPanel[i].style.display = 'flex';
        }
        else {
            divsEditPanel[i].style.display = 'none';
        }
    }
}