var modal = document.getElementsByClassName("modal");
var btnWorkerAdd = document.getElementById("addWorker");
var btnServiceAdd = document.getElementById("addService");
var span = document.getElementsByClassName("close");
var btnEdit = document.getElementsByClassName("business__edit")[0];

function setInfo(businessId, serviceId, name, description, price) {
    console.log(businessId, serviceId, name, description, price);
    let form = document.getElementById('formEditService');
    form.setAttribute('action', '/business/myBusiness/' + businessId + '/editService/' + serviceId);
    let nameInput = document.getElementById('editServiceName');
    let descInput = document.getElementById('editServiceDesc');
    let priceInput = document.getElementById('editServicePrice');

    console.log(nameInput);
    nameInput.value = name;
    descInput.value = description;
    priceInput.value = price;

    modal[2].style.display = "block";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)"; // wyszarzenie strony

}

btnWorkerAdd.onclick = function (event) {
    modal[0].style.display = "block";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}

btnServiceAdd.onclick = function () {
    modal[1].style.display = "block";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}
btnEdit.onclick = function () {
    modal[3].style.display = "flex";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}

span[0].onclick = function () {
    modal[0].style.display = "none";
    document.body.style.backgroundColor = "initial"; // przywrócenie koloru tła strony
}

span[1].onclick = function () {
    modal[1].style.display = "none";
    document.body.style.backgroundColor = "initial";
}
span[2].onclick = function () {
    modal[2].style.display = "none";
    document.body.style.backgroundColor = "initial";
}
span[3].onclick = function () {
    modal[3].style.display = "none";
    document.body.style.backgroundColor = "initial";
}

window.onclick = function (event) {
    if (event.target == modal[0] || event.target == modal[1] || event.target == modal[2] || event.target == modal[3]) {
        modal[0].style.display = "none";
        modal[1].style.display = "none";
        modal[2].style.display = "none";
        modal[3].style.display = "none";
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