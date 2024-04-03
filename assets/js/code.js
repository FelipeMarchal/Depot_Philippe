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
	
	const nbsp = String.fromCharCode(160);
	
	const texte = document.getElementById(`fileDisplayArea`).innerText;
	const delim = document.getElementById(`delimID`).value;
	
	if (texte.length > 0) {

	// on remplace tous les caractères de fin de ligne ou tabulation (éventuellement à compléter) par des espaces
	texte0 = texte.replace(RegExp("(\\n|\\r|\\t)","g"),' ');
	
	// on ajoute un espace derrière les apostrophes pour les garder dans le texte => "s'", "l'", etc. compteront pour 2 caractères, "qu'" pour 3, etc.
	texte0 = texte0.replace(/['’]/g,"' ");  
	
	// en cas de besoin, on peut mettre en commentaires la ligne suivante
	texte0 = texte0.toLowerCase();                                                  
	
	mots = multipleSplit(texte0, delim); // voir explications fonction ci-dessous
	nMots = mots.length;
	
	// on met les mots dans un objet, pour calculer la fréquence des mots en cas de besoin
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
			longMots[lg][2] +=  m + ' ';
			longMots[lg][3] ++;
		}
	};

	analyse = `Le texte comprend ${nMots} mots.`;
	
	analyse += `\n\nListe des mots triés par longueur :`;
	
	analyse += '\n+' + '-'.repeat(59) + '+';
	analyse += '\n|Longueur|Fréquence|' + nbsp.repeat(18) + 'Mots' + nbsp.repeat(18) + '|';
	analyse += '\n|' + '-'.repeat(59) + '|';
	
	/* pour construire un tableau bien colonné, j'ai développé une fonction
	ajoutant des espaces insécables (Ascii 160) à gauche (nombres) ou à droite (texte),
	car les espaces simples ( Ascii 32) sont "tassés" dans html;
    j'ai également chois la police Courier New dans le fichiers css.
	NB : je n'ai pas réussi à gérer un tableau HTML dans 'page-analysis' en javascript */	
		
	longMots.forEach ( lg => {
 		if (lg[1]>0) {
			analyse += '\n|'+ ajoutCarac(lg[0], 7, 'gauche', nbsp) + nbsp + '|' + ajoutCarac(lg[1], 8, 'gauche', nbsp) + nbsp + '|' + nbsp;
			tab_m=lg[2].split(' ');
			m=''
			for (i=0;i<tab_m.length;i++) {
				if (m.length+tab_m[i].length > 32) {
					analyse += ajoutCarac(m, 38, 'droite', nbsp) + nbsp + '|';
					m = '';
					analyse += '\n|'+ nbsp.repeat(8) + '|' + nbsp.repeat(9) + '|' + nbsp;
				};
				m+=tab_m[i]+','+nbsp
			}
			m = m.slice(0,m.length-4) + ' (' + lg[3] + ')';
			analyse+=ajoutCarac(m , 38, 'droite', nbsp) + nbsp + '|';
		};
	});
	analyse += '\n+' + '-'.repeat(59) + '+';
		
	let pageAnalysis = document.getElementById(`page-analysis`);
	pageAnalysis.innerText = analyse

}}
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
function ajoutCarac(texte, longueur, cote, carac) {
	
	if (cote[0].toLowerCase() === 'g') {
		texte0=carac.repeat(longueur)+texte;
		texte0=texte0.slice(texte0.length-longueur);}
	else {
		texte0=texte+carac.repeat(longueur);
		texte0=texte0.slice(0, longueur);}

	return texte0;
}