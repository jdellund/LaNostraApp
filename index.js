const midaFoto = 1000;
let validat = false;
let usuari, contrasenya;
let storage = window.localStorage;
let scriptURL = "https://script.google.com/macros/s/AKfycbwO6FnBnaBmxrzPRyLDhV8D6pW7Pe6V8-SYIdSHZXMmg8JqjJwQz8H8zA8wl3U6u2pW/exec"
let foto_feta;

window.onload = () => {    
    usuari = storage.getItem("usuari");
    let stringDatabase = storage.getItem("database");
    if (usuari != "" && usuari != null) {
        inicia_sessio();
    }
    if(stringDatabase == null) {
        indexedDB.open("Dades").onupgradeneeded = event => { 
            let db = event.target.result;    
            db.createObjectStore("Fotos", {keyPath: "ID", autoIncrement:true});
        }
        storage.setItem("database","sí");
    }
    document.getElementById("fitxer").addEventListener("change", function(event) {
        carrega_imatge(this);
    });
}

function carrega_imatge(input) { 
    if(input.files[0] != undefined) {
        let canvas = document.getElementById("canvas");
        let ctx = canvas.getContext("2d");
        let img = new Image;
        img.src = URL.createObjectURL(input.files[0]);
        img.onload = () => {
            let scale = Math.min((midaFoto/img.width),(midaFoto/img.height));
            let iwScaled = img.width * scale;
            let ihScaled = img.height * scale;
            canvas.width = iwScaled;
            canvas.height = ihScaled;
            ctx.drawImage(img,0,0,iwScaled,ihScaled);
            canvas.style.display = "none";
            document.getElementById("camera").style.display = "none";
            document.getElementById("foto").src = canvas.toDataURL("image/jpeg",0.5);
            document.getElementById("desar").style.display = "unset";
            foto_feta = canvas.toDataURL("image/jpeg",0.5);
        }
    } else {
      console.log("Error: no s'ha obtingut cap imatge.");
    }
}

function desa_foto() {
    let nou_registre = {
        Usuari: usuari,
        Data: data_hora(new Date(Date.now())),
        Foto: foto_feta
    };
    indexedDB.open("Dades").onsuccess = event => { 
        let db = event.target.result;    
        let obsObjStore = db.transaction("Fotos", "readwrite").objectStore("Fotos");
        let request = obsObjStore.add(nou_registre);
        request.onsuccess = () => {
            document.getElementById("desar").style.display = "none";
            window.alert("La foto s'ha desat correctament.")
        };
    };
}

function canvi_seccio(num_boto) {
    if (validat) {
        const menu = document.getElementById("menu");
        const num_botons = menu.children.length;
        for (let i = 1; i < num_botons; i++) {
            let boto = document.getElementById("boto_" + i);
            let seccio = document.getElementById("seccio_" + i);
            if (i == num_boto) {
                boto.style.color = "#950E17";
                boto.style.backgroundColor = "#FCDEE0";
                seccio.style.display = "flex";
            }
            else {
                boto.style.color = "white";
                boto.style.backgroundColor = "#950E17";
                seccio.style.display = "none";
            }
        }
    }
}

function sortida() {
    if (validat) {
        let vull_sortir = window.confirm("Vols tancar la sessió?");
        if (vull_sortir) {
            storage.setItem("usuari", "");
            location.reload();
        }
    }
}

function nou_usuari() {
    usuari = document.getElementById("nom_usuari").value;
    contrasenya = document.getElementById("contrasenya").value;
    let consulta_1 = scriptURL + "?query=select&where=usuari&is=" + usuari;
    fetch(consulta_1)
        .then(resposta => resposta.json())
        .then(resposta => {
            if(resposta.length == 0) {
                let consulta_2 = scriptURL + "?query=insert&values=" + usuari + "$$" + contrasenya;
                fetch(consulta_2)
                    .then(resposta => {
                        if (resposta.ok) {
                            window.alert("S'ha completat el registre d'usuari.")                          
                            inicia_sessio();
                        }
                        else {
                            window.alert("S'ha produït un error en el registre d'usuari.")
                        }
                    })
            } 
            else {
                window.alert("Ja existeix un usuari amb aquest nom.");
            }
        });
}

function inici_sessio() {
    usuari = document.getElementById("nom_usuari").value;
    contrasenya = document.getElementById("contrasenya").value;
    let consulta = scriptURL + "?query=select&from=usuaris&where=usuari&is=" + usuari + "&and=contrasenya&equal=" + contrasenya;
    fetch(consulta)
        .then(resposta => resposta.json())
        .then(resposta => {
            if(resposta.length == 0) {
                window.alert("El nom d'usuari o la contrasenya no són correctes.");
            }
            else {
                window.alert("S'ha iniciat correctament la sessió.");
                inicia_sessio();
            }
        });
}

function inicia_sessio() {
    validat = true;
    storage.setItem("usuari", usuari);
    document.getElementById("seccio_0").style.display = "none";
    canvi_seccio(1); 
}

function data_hora(date) {
    let any = date.getFullYear();
    let mes = (date.getMonth() + 1).toString();
    let dia = date.getDate().toString();
    let hora = date.getHours().toString();
    let minut = date.getMinutes().toString();
    let segon = date.getSeconds().toString();
    if (mes.length < 2) mes = '0' + mes;
    if (dia.length < 2) dia = '0' + dia;
    if (hora.length < 2) hora = '0' + hora;
    if (minut.length < 2) minut = '0' + minut;
    if (segon.length < 2) segon = '0' + segon;
    return any + '-' + mes + '-' + dia + '_' + hora + ':' + minut + ':' + segon;
}