let pantalla_carregada = false;
let crono_splash = false;
let validat = false;
let usuari, contrasenya, seccio_origen;
let storage = window.localStorage;
let scriptURL = "https://script.google.com/macros/s/AKfycbwO6FnBnaBmxrzPRyLDhV8D6pW7Pe6V8-SYIdSHZXMmg8JqjJwQz8H8zA8wl3U6u2pW/exec";

window.onload = () => { 
    let base_de_dades = storage.getItem("base_de_dades");   
    if(base_de_dades == null) {
        indexedDB.open("Dades").onupgradeneeded = event => {   
            event.target.result.createObjectStore("Fotos", {keyPath: "ID", autoIncrement:true}).createIndex('Usuari_index', 'Usuari');;
        }
        storage.setItem("base_de_dades","ok");
    }
    document.getElementById("obturador").addEventListener("change", function() {
        if(this.files[0] != undefined) {
            let canvas = document.getElementById("canvas");
            let context = canvas.getContext("2d");
            let imatge = new Image;
            imatge.src = URL.createObjectURL(this.files[0]);
            imatge.onload = () => {
                canvas.width = imatge.width;
                canvas.height = imatge.height;                
                context.drawImage(imatge,0,0,imatge.width,imatge.height);
                document.getElementById("foto").src = canvas.toDataURL("image/jpeg");
                document.getElementById("icona_camera").style.display = "none";
                document.getElementById("desa").style.display = "unset";
            }
        }
    });
    pantalla_carregada = true;
    if (crono_splash) {
        inici();
    }
}

setTimeout(() => {
    crono_splash = true;
    if (pantalla_carregada) {
        inici();
    }
}, "1000")

function inici() {
    document.getElementById("splash").style.display = "none";
    document.getElementById("superior").classList.remove("ocult");
    document.getElementById("menu").style.display = "flex";
    usuari = storage.getItem("usuari");
    if (usuari != "" && usuari != null) {
        inicia_sessio();
    } else {
        document.getElementById("seccio_0").style.display = "flex";
    }
}


function desa_foto() {
    let nou_registre = {
        Usuari: usuari,
        Data: data_hora(new Date(Date.now())),
        Foto: document.getElementById("foto").src
    };
    indexedDB.open("Dades").onsuccess = event => {   
        event.target.result.transaction("Fotos", "readwrite").objectStore("Fotos").add(nou_registre).onsuccess = () => {
            document.getElementById("desa").style.display = "none";
            alert("La foto s'ha desat correctament.");
        };
    };
}

function mostra_foto(id) {
    let canvas = document.getElementById("canvas");
    let context = canvas.getContext("2d");
    let imatge = new Image;
    if (id == 0) {
        seccio_origen = 2;
        document.getElementById("seccio_2").style.display = "none";
        imatge.src = document.getElementById("foto").src;
    }
    else {
        seccio_origen = 3;
        indexedDB.open("Dades").onsuccess = event => {
            event.target.result.transaction(["Fotos"], "readonly").objectStore("Fotos").get(id).onsuccess = event => {
                document.getElementById("seccio_3").style.display = "none";
                imatge.src = event.target.result["Foto"];
            }
        }
    }
    imatge.onload = () => {
        if (imatge.width > imatge.height) {
            canvas.width = imatge.height;
            canvas.height = imatge.width;
            context.translate(imatge.height, 0);
            context.rotate(Math.PI / 2);
        } else {
            canvas.width = imatge.width;
            canvas.height = imatge.height;
        }
        context.drawImage(imatge,0,0,imatge.width,imatge.height);
        document.getElementById("foto_gran").src = canvas.toDataURL("image/jpeg", 0.5);
    }
    document.getElementById("superior").classList.add("ocult");
    document.getElementById("menu").style.display = "none";
    document.getElementById("div_gran").style.display = "flex";
}

function esborra_foto(id) {
    let vull_esborrar = window.confirm("Vols esborrar la foto?");
    if (vull_esborrar) {
        indexedDB.open("Dades").onsuccess = event => {   
                event.target.result.transaction("Fotos", "readwrite").objectStore("Fotos").delete(id).onsuccess = () => {
                alert("La foto s'ha esborrat.");
                canvia_seccio(3);
            };
        };
    }
}

function retorn_a_seccio() {
    document.getElementById("superior").classList.remove("ocult");
    document.getElementById("menu").style.display = "flex";
    document.getElementById("div_gran").style.display = "none";
    if (seccio_origen == 2) {
        document.getElementById("seccio_2").style.display = "flex";
    } else {
        document.getElementById("seccio_3").style.display = "flex";
    }
}

function canvia_seccio(num_boto) {
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
    if (num_boto == 3) {
        omple_llista();
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

    let loader = document.getElementById("loader");
    loader.style.display = "unset";
    loader.style.animationPlayState = "running";

    fetch(consulta_1)
        .then(resposta => resposta.json())
        .then(resposta => {
            if(resposta.length == 0) {
                let consulta_2 = scriptURL + "?query=insert&values=" + usuari + "$$" + contrasenya;
                fetch(consulta_2)
                    .then(resposta => {
                        if (resposta.ok) {
                            alert("S'ha completat el registre d'usuari.");                          
                            inicia_sessio();
                        }
                        else {
                            alert("S'ha produït un error en el registre d'usuari.");
                        }
                    })
            } 
            else {
                alert("Ja existeix un usuari amb aquest nom.");
            }
            loader.style.animationPlayState = "paused";
            loader.style.display = "none";
        });
}

function inici_sessio() {
    usuari = document.getElementById("nom_usuari").value;
    contrasenya = document.getElementById("contrasenya").value;
    let consulta = scriptURL + "?query=select&from=usuaris&where=usuari&is=" + usuari + "&and=contrasenya&equal=" + contrasenya;

    let loader = document.getElementById("loader");
    loader.style.display = "unset";
    loader.style.animationPlayState = "running";

    fetch(consulta)
        .then(resposta => resposta.json())
        .then(resposta => {
            loader.style.animationPlayState = "paused";
            loader.style.display = "none";
            if(resposta.length == 0) {
                alert("El nom d'usuari o la contrasenya no són correctes.");
            }
            else {
                alert("S'ha iniciat correctament la sessió.");
                inicia_sessio();
            }
        });
}

function inicia_sessio() {
    validat = true;
    storage.setItem("usuari", usuari);
    document.getElementById("seccio_0").style.display = "none";
    canvia_seccio(1); 
}

function omple_llista() {
    let llista = '';
    indexedDB.open("Dades").onsuccess = event => {
        event.target.result.transaction(["Fotos"], "readonly").objectStore("Fotos").index("Usuari_index").getAll(usuari).onsuccess = event => {
            dades = event.target.result;
            for (i in dades) {
                llista+= '<div class="llista_fila" class="centrat"><div><img src="';
                llista+= dades[i]["Foto"];
                llista+= '" onclick="mostra_foto(';
                llista+= dades[i]["ID"];
                llista+= ')" /></div><span>'; 
                llista+= dades[i]["Data"];
                llista+= '</span><span class="material-icons" onclick="esborra_foto(';
                llista+= dades[i]["ID"];
                llista+= ')">delete</span></div>';         
            }
            document.getElementById("llista_fotos").innerHTML = llista;
        }
    }
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
    return dia + '/' + mes + '/' + any + ' - ' + hora + ':' + minut + ':' + segon;
}