# Blocages et contournements

## Mise en ligne : GitHub Pages n’est pas activé (action requise)
Le workflow `.github/workflows/deploy.yml` construit et teste l’app avec succès, mais l’étape de déploiement échoue :
« Failed to create deployment (status: 404) … Ensure GitHub Pages has been enabled ».

À faire (2 minutes) :
1. Ouvre https://github.com/thomasbouletcoaching-lab/worship-acaemy/settings/pages
2. « Build and deployment » → Source : **GitHub Actions**.
3. Par défaut, l’environnement `github-pages` n’accepte souvent que la branche par défaut (`main`). Deux options :
   - fusionner la branche `claude/exciting-pasteur-66lo86` dans `main` (recommandé), ou
   - dans Settings → Environments → github-pages, autoriser aussi `claude/*`.
4. Relance le workflow (onglet Actions → « Déployer sur GitHub Pages » → Run workflow).

L’app sera alors à : https://thomasbouletcoaching-lab.github.io/worship-acaemy/

## Notion
Base « Bibliothèque » : https://app.notion.com/p/17b1396e26d54167818dc8acca2c71e4
Publiée par 9 agents (un premier lot de 13, puis 8 tranches). Une limite d’usage a interrompu la publication une fois ; les agents ont repris en vérifiant les Id existants pour éviter les doublons.

## Non vérifié avec du matériel
- Clavier MIDI réel et micro réel : la logique (détection, évaluation) est testée avec des signaux simulés, pas avec un instrument.
- Le son est synthétisé (pas d’échantillons) : correct pour apprendre, pas un piano de concert.

## Historique
- Première vague de rédacteurs et de relecteurs lancée sans liste de fichiers (erreur de consigne) : relancée correctement.
- Limites d’usage atteintes deux fois par les agents ; travail repris après la réinitialisation.
