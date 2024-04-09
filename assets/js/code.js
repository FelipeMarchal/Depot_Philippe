window.onload = function() {
    let fileInput = document.getElementById('fileInput');
    let fileDisplayArea = document.getElementById('fileDisplayArea');

    // On "écoute" si le fichier donné a été modifié.
    // Si on a donné un nouveau fichier, on essaie de le lire.
    fileInput.addEventListener('change', function(e) {
        // Dans le HTML (ligne 22), fileInput est un élément de tag "input" avec un attribut type="file".
        // On peut récupérer les fichiers données avec le champs ".files" au niveau du javascript.
        // On peut potentiellement donner plusieurs fichiers,
        // mais ici on n'en lit qu'un seul, le premier, donc indice 0.
        let file = fileInput.files[0];
        // on utilise cette expression régulière pour vérifier qu'on a bien un fichier textString.
        let textType = new RegExp("text.*");

        if (file.type.match(textType)) { // on vérifie qu'on a bien un fichier textString
            // lecture du fichier. D'abord, on crée un objet qui sait lire un fichier.
            var reader = new FileReader();

            // on dit au lecteur de fichier de placer le résultat de la lecture
            // dans la zone d'affichage du textString.
            reader.onload = function(e) {
                fileDisplayArea.innerText = reader.result;
            }

            // on lit concrètement le fichier.
            // Cette lecture lancera automatiquement la fonction "onload" juste au-dessus.
            reader.readAsText(file);    

            document.getElementById("logger").innerHTML = '<span class="infolog">Fichier chargé avec succès</span>';
        } else { // pas un fichier textString : message d'erreur.
            fileDisplayArea.innerText = "";
            document.getElementById("logger").innerHTML = '<span class="errorlog">Type de fichier non supporté !</span>';
        }
    });
}
function segmentation() {

	const texte = document.getElementById(`fileDisplayArea`).innerText;
	if (texte.length === 0) {alert('Veuillez SVP choisir votre texte !');return}
	
	const delim = document.getElementById(`delimID`).value;
	if (delim.length === 0) {alert('Veuillez SVP indiquer vos délimiteurs de mots !');return}

	mots = tokenisation(texte, delim);
	nMots = mots.length;
	
	// on met les mots dans un objet, pour calculer la fréquence des mots
	freqMots = [];
    mots.forEach (m => {if (freqMots[m]) {freqMots[m]++;} else {freqMots[m]=1;}});

	// on met les mots dans un objet longueur de mots, pour y mettre la fréaunce et tous les mots ayant cette longueur
	longMots = [];
	for (let i=0;i<50;i++){longMots.push([i, 0, '', 0])}; // a priori, il ne devrait pas y avoir des mots de plus de 50 caractères !
	
	for (m in freqMots) {
		lg=m.length;
		if (lg>0) {
			fr=freqMots[m]
			longMots[lg][1] += fr;
			longMots[lg][2] +=  m + ', ';
			longMots[lg][3] ++;
		}
	};
	// Début du remplissage de page-analysis que l'on commence par vider-----------------------------------------------------
	pageAnalysis = document.getElementById("page-analysis");
	pageAnalysis.innerHTML = "";

	// ligne total :
	total = document.createElement("h3");
	total.textContent = "Le texte comprend " + nMots + " mots.";
	pageAnalysis.appendChild(total);

	// ligne titre du tableau :
	titre = document.createElement("h3");
	titre.textContent = "Liste des mots triés par longueur :";
	pageAnalysis.appendChild(titre);

	// tableau :
	tableau = document.createElement("table"); tableau.border = "1";
	entete = document.createElement("tr");
	colonnes = ["Longueur","Fréquence","Mots"];
	colonnes.forEach(c => {
		colonne = document.createElement("th");
		colonne.textContent = c;
		entete.appendChild(colonne);
	});
	tableau.appendChild(entete);

	// on remplit le tableau à partir de longMots :
	longMots.forEach ( lg => {
		
 		if (lg[1]>0) {		
			longueur=lg[0];freq=lg[1];m=lg[2]
			m = m.slice(0,m.length-2) + ' ('+ lg[3] + ')';
			ligTable = document.createElement("tr");
		
			cel = document.createElement("td"); cel.align="center"; cel.textContent = longueur; ligTable.appendChild(cel);
			cel = document.createElement("td"); cel.align="center"; cel.textContent = freq; ligTable.appendChild(cel);
			cel = document.createElement("td"); cel.textContent = " " + m; ligTable.appendChild(cel);

			tableau.appendChild(ligTable);
		}
	});
	pageAnalysis.appendChild(tableau);

}
function cooccurrences() {

	const texte = document.getElementById(`fileDisplayArea`).innerText;
	if (texte.length === 0) {alert('Veuillez SVP choisir votre texte !');return}
	
	const delim = document.getElementById(`delimID`).value;
	if (delim.length === 0) {alert('Veuillez SVP indiquer vos délimiteurs de mots !');return}

	const poleID = document.getElementById(`poleID`).value;
	if (poleID.length === 0) {alert('Veuillez SVP indiquer votre pôle !');return}
	
	const lgID = document.getElementById(`lgID`).value;
	if (lgID === '0') {alert('Veuillez SVP indiquer une longueur positive !');return}
	
	mots = tokenisation(texte, delim);
	if (!mots.includes(poleID)) {alert('Attention ! Votre pôle ne figure pas dans le texte !');return}	
	
	nMots = mots.length;

	// structure de coocc : clé(mot), [fréquence à gauche, fréquence à droite]
	coocc = []; 
	for (let i=0;i<nMots;i++){
		if (mots[i]===poleID){
			for (j=1;j<=lgID;j++) {
				if (i-j>0) {
					m=mots[i-j]
					if (coocc[m]){coocc[m][0]++} else {coocc[m]=[1,0]}}
				if (i+j<nMots) {
					m=mots[i+j]
					if (coocc[m]){coocc[m][1]++} else {coocc[m]=[0,1]}}
	}}};

	//pour trier selon la cofréquence décroissante, on transforme l'objet coocc en objet de tableaux
	// structure de coocc_tri : mot, [cofréquence, fréquence à gauche, fréquence à droite]
	coocc_tri=[]
	for (m in coocc) {coocc_tri.push([m, coocc[m][0]+coocc[m][1], coocc[m][0], coocc[m][1]]);}
	coocc_tri.sort((a, b) => b[1] - a[1]);	

	// Début du remplissage de page-analysis que l'on commence par vider----------------------------------------------------
	pageAnalysis = document.getElementById("page-analysis");
	pageAnalysis.innerHTML = "";

	// ligne total :
	total = document.createElement("h3");
	total.textContent = "Dans l'intervalle de " + lgID + " mot(s) autour du mot '" + poleID + "', il y a au total " + coocc_tri.length + " mots différents :";
	pageAnalysis.appendChild(total);

	// tableau :
	tableau = document.createElement("table"); tableau.border = "1";
	entete = document.createElement("tr");
	colonnes = ["Cooccurrent(s)","Co-fréquence","Fréquence gauche","%Fréquence gauche","Fréquence droite","%Fréquence droite"];
	colonnes.forEach(c => {
		colonne = document.createElement("th");
		colonne.textContent = c;
		entete.appendChild(colonne);
	});
	tableau.appendChild(entete);

	// on remplit le tableau à partir de coocc_tri :
	coocc_tri.forEach ( c => {
		
		m=c[0];cofreq=c[1];freq_g=c[2];freq_d=c[3];
		p_freq_g = Math.round(100*freq_g/cofreq);p_freq_d=100-p_freq_g;
		
		ligTable = document.createElement("tr");
		
		cel = document.createElement("td"); cel.textContent = " "+m; ligTable.appendChild(cel);
		cel = document.createElement("td"); cel.align="center"; cel.textContent = cofreq; ligTable.appendChild(cel);
		cel = document.createElement("td"); cel.align="center"; cel.textContent = freq_g; ligTable.appendChild(cel);
		cel = document.createElement("td"); cel.align="center"; cel.textContent = p_freq_g+"%"; ligTable.appendChild(cel);
		cel = document.createElement("td"); cel.align="center"; cel.textContent = freq_d; ligTable.appendChild(cel);
		cel = document.createElement("td"); cel.align="center"; cel.textContent = p_freq_d+"%"; ligTable.appendChild(cel);
		
		tableau.appendChild(ligTable);
	});
	pageAnalysis.appendChild(tableau);

}
function tokenisation(texte, delim, mode = 1, casse = false) {
	
	/* mode = 1 : segmentation à partir des séparateurs (délimiteurs)
	   mode = 2 : segmentation à partir des caractères autorisés dans les mots :
				  lettres, chiffres, caractères diacritiques (dont accentués et spéciaux français) et caractères grecs */
				  
	// on remplace tous les caractères de fin de ligne ou tabulation (éventuellement à compléter) par des espaces
	texte0 = texte.replace(RegExp("(\\n|\\r|\\t)","g"),' ');
	
	// on ajoute un espace derrière les apostrophes pour les garder dans le texte => "s'", "l'", etc. compteront pour 2 caractères, "qu'" pour 3, etc.
	texte0 = texte0.replace(/['’]/g,"' ");  
	
	// d'après le paramètre en entrée 'casse' (true = sensible à la casse)
	if (!casse) {texte0 = texte0.toLowerCase()};                                                  
	
	switch (mode) {
		case 1 : return multipleSplit(texte0, delim);
		case 2 : return texte0.match(/['’\wÁ-ɀΑ-ϖ]+/g);
	}
}
function multipleSplit(textString, separators) {
/* je n'ai pas réussi à mettre au point un regex, à travers la fonction RegExp,
permettant de faire un split sur plusieurs séparateurs, ceci à cause des caractères génériques;
j'ai donc développé une fonction sans regex                                                    */
	
	let text0 = textString;
	
	separators = separators.replace(' ',''); // on terminera obligatoirement par le séparateur espace
	for (i=0;i<separators.length;i++) {text0=text0.split(separators[i]).join(' ');};
	
	/* remplacement de toutes les séquences de plusieurs espaces par un seul espace,
	suppression des espaces à gauche et à droite, puis split sur le caractère espace */
	words = text0.replace(/ +/g, ' ').trim().split(' '); 
	
	return words;

}