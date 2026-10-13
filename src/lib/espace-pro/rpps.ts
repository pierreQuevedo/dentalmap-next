/**
 * Le numéro RPPS : onze chiffres, le dernier est une clé de Luhn.
 *
 * La clé attrape la plupart des fautes de frappe, une lettre changée ou deux
 * chiffres inversés, avant même d'interroger la base : « Vérifiez le numéro »
 * vaut mieux que « Aucune fiche ne correspond ».
 */
export function nettoyerRpps(saisie: string): string {
  return saisie.replace(/[\s.-]/g, '')
}

export function ressembleRpps(saisie: string): boolean {
  return /^\d{11}$/.test(nettoyerRpps(saisie))
}

export function rppsValide(saisie: string): boolean {
  const rpps = nettoyerRpps(saisie)
  if (!/^\d{11}$/.test(rpps)) return false
  let somme = 0
  for (let i = 0; i < 11; i++) {
    let c = Number(rpps[10 - i])
    if (i % 2 === 1) {
      c *= 2
      if (c > 9) c -= 9
    }
    somme += c
  }
  return somme % 10 === 0
}

/** « •••••••6789 » : les quatre derniers chiffres, pour départager des homonymes sans tout exposer. */
export function rppsMasque(rpps: string | null): string | null {
  return rpps ? `${'•'.repeat(7)}${rpps.slice(-4)}` : null
}
