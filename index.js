const midaFoto = 1000;
var usuari = false;
var nom, contrasenya;
var scriptURL = "https://script.google.com/macros/s/AKfycbwO6FnBnaBmxrzPRyLDhV8D6pW7Pe6V8-SYIdSHZXMmg8JqjJwQz8H8zA8wl3U6u2pW/exec"
var foto_feta;

window.onload = function() {    
  document.getElementById("fitxer").addEventListener("change", function(event) {
     readURL(this);
  });
}

function readURL(input) { 
    if(input.files[0] != undefined) {
      let canvas = document.getElementById("canvas");
      let ctx = canvas.getContext("2d");
      let img = new Image;
      img.src = URL.createObjectURL(input.files[0]);
      img.onload = function() {
          let iw=img.width;
          let ih=img.height;
          let scale=Math.min((midaFoto/iw),(midaFoto/ih));
          let iwScaled=iw*scale;
          let ihScaled=ih*scale;
          canvas.width=iwScaled;
          canvas.height=ihScaled;
          ctx.drawImage(img,0,0,iwScaled,ihScaled);
          canvas.style.display = "none";
          document.getElementById("camera").style.display = "none";
          document.getElementById("foto").src = canvas.toDataURL("image/jpeg",0.5);
          document.getElementById("desar").style.display = "block";
          foto_feta = canvas.toDataURL("image/jpeg",0.5);
      }
    } else {
      console.log("Error: no s'ha obtingut cap fitxer.");
    }
}

function desa_foto() {

}

function canvi_seccio(num_boto) {
    if (usuari) {
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
    let vull_sortir = window.confirm("Vols tancar la sessió?");
    if (vull_sortir) {
        location.reload();
    }
}

function nou_usuari() {
    nom = document.getElementById("nom_usuari").value;
    contrasenya = document.getElementById("contrasenya").value;
    let consulta_1 = scriptURL + "?query=select&where=usuari&is=" + nom;
    fetch(consulta_1)
        .then((resposta) => {
            return resposta.json();
        })
        .then((resposta) => {
            if(resposta.length == 0) {
                let consulta_2 = scriptURL + "?query=insert&values=" + nom + "$$" + contrasenya;
                fetch(consulta_2)
                    .then((resposta) => {
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
    nom = document.getElementById("nom_usuari").value;
    contrasenya = document.getElementById("contrasenya").value;
    let consulta = scriptURL + "?query=select&from=usuaris&where=usuari&is=" + nom + "&and=contrasenya&equal=" + contrasenya;
    fetch(consulta)
        .then((resposta) => {
            return resposta.json();
        })
        .then((resposta) => {
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
    usuari = true;
    document.getElementById("seccio_0").style.display = "none";
    canvi_seccio(1); 
}