let localStream;
let recorder;
let recordChunk
const { remote: { dialog } } = require('electron');
const fs = require('fs');
const JsonDB = require('node-json-db');
const swal = require('sweetalert2')
const $ = require("jquery");
const exec = require('child_process').exec;
const os = require("os");
const spawn = require('child_process').spawn;
//Il s'agit d'une version récente de javascript, on peut utiliser "const" en plus de "var"
//Les "require" servent juste à importer les divers librairies nécessaires


//initialization de ffmpeg (ce n'est pas la même version sous mac et sous linux)
//ffmpeg est l'outil qui permet de convertir les vidéos de webm jusqu'en mp4
if (os.platform()=="darwin") {
	var ffmpeg = "./lib/mac/ffmpeg";
} else if(os.platform()=="linux") {
	var ffmpeg = "./lib/linux/ffmpeg/ffmpeg";
} else {
	var ffmpeg = "./lib/win/ffmpeg/ffmpeg.exe"
}


//On stocke les métadatas dans un fichier JSON "metas.json"
//a terme ce sera peut être directement dans un fichier tableur
var metas = new JsonDB("metas",true ,true);


//On récupère les flux vidéos et audio
navigator.mediaDevices.getUserMedia({
	video: {
				width: { min : 1280,
					ideal: 1920 },
				height: {
					min : 720,
					ideal: 1080 }
				},
	audio: true
}).then(stream => {
    localStream = stream;
    preview.srcObject = stream;
});


//à l'appui sur le bouton d'enregistrement
btnRecord.onclick = function() {
	//Si on enregistre pas déjà
    if (this.textContent === 'Record Start') {
		//On commence à enregistrer
        recorder = new MediaRecorder(localStream);
        recorder.ondataavailable = e => {
            recordChunk.push(e.data);
        };
        recordChunk = [];
        recorder.start();
		//On passe l'état à "en cours d'enregistrement"
        this.textContent = 'Record Stop';
		//On applique la classe "en cours d'enregistrement" au bouton
		this.classList.toggle('Rec');
	//Si on est en train d'enregistrer
    } else {
		//On arrête
        recorder.stop();
        let blob = new Blob(recordChunk);
        let dlURL = URL.createObjectURL(blob);
        let dt = new Date();
		//On change l'état
        this.textContent = 'Record Start';
		//On sauvegarde la vidéo
		setTimeout(saveVideo,200);
		//On enlève la classe "en cours d'enregistrement" au bouton
		this.classList.toggle('Rec');
    }
};


//Cette fonction gère les métadonnées et la sauvegarde sur le disque une fois
//l'enregistrement terminé
saveVideo = _ => {

    var keyboard = exec('osk', (error, stdout, stderr) => {
        if (error) {
            console.error(error);
            return;
        }
    });

		swal({
	  title: 'Merci pour votre participation',
	  //HTML du popup pour les métadatas de la vidéo
	  html:
	  	'Titre' +
	    '<input id="swal-input1" class="swal2-input">' +
		'Un commentaire ?' +
	    '<input id="swal-input2" class="swal2-input">' +
		'Nom' +
		'<input id="swal-input3" class="swal2-input">' +
	'Email' +
	'<input id="swal-input4" class="swal2-input" type="email">',
	  preConfirm: function () {
	    return new Promise(function (resolve, reject) {
				if ($('#swal-input4').val().match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
					resolve([
						$('#swal-input1').val(),
						$('#swal-input2').val(),
						$('#swal-input3').val(),
						$('#swal-input4').val(),
					])
				} else {
					reject("Veuillez entrer une adresse email valide")
				}
	    })
	  },
	  onOpen: function () {
	    $('#swal-input1').focus()
	  }
	}).then(function (result) {
		// Ajout des métadonnées de la vidéo à la base de données
		console.log(keyboard.pid);
		kill = exec('taskkill /IM osk.exe');
		var videos = metas.getData("/videos");
		var filename = "event_" + (videos.length + 1);
		metas.push("/videos[]", {titre:result[0],commentaire:result[1],nom:result[2],email:result[3], fichier: filename});
		swal(
	  //Alerte qui préviens que les données sont enregistrées
		    {
				title: 'Vidéo ajoutée !',
		    text:'Merci pour votre participation',
		    type:'success',
				timer: 10000
		 	}
		).then(()=>{intro.classList.toggle("next")}).catch(()=>{intro.classList.toggle("next")})
	}).catch(()=>{intro.classList.toggle("next")})

	const blob = new Blob(recordChunk);
    let fr = new FileReader();
    fr.onload = _ => {
        save(fr.result);
    }
    fr.readAsArrayBuffer(blob);
}

function save(arrayBuffer) {
	//Sauvegarde de la vidéo en webm
    let buffer = new Buffer(arrayBuffer);
    let dt = new Date();
	var videos = metas.getData("/videos");
	var filename = "./video/event_" + videos.length;
	//On enregistre le fichier en webm
    fs.writeFile(filename + ".webm" , buffer, function(err) {
        if (err) {
            swal("Une erreur est survenue en crééant le fichier : " + err.message);
        }
		else {
			const ls = spawn(ffmpeg, ['-i', filename+".webm", "-c:v","libx264","-crf","20","-c:a","aac","-strict","experimental", filename+".mp4"]);

			// ls.stdout.on('data', (data) => {
			//   console.log(`stdout: ${data}`);
			// });
			//
			// ls.stderr.on('data', (data) => {
			//   console.log(`stderr: ${data}`);
			// });
			//
			ls.on('close', (code) => {
			  console.log(`child process exited with code ${code}`);
			});
			// exec(ffmpeg+" -i "+ filename + ".webm -c:v libx264 -crf 20 -c:a aac -strict experimental "+filename+".mp4" ,function(err, out, code){
			// 	// if (!err) {
			// 	//
			// 	// }
			// 	console.log(err, out, code);
			// 	return 0;
			// })
		}
    });
}
