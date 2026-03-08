# Scripts

Pliki sa ladowane sekwencyjnie w tej kolejnosci:

1. `00-config.js`
2. `10-ui-core.js`
3. `20-music.js`
4. `30-widgets.js`
5. `40-presence-and-boot.js`

Podzial:

- `00-config.js`:
  stan aplikacji, dane, helpery, reveal-on-scroll, odroczone widgety
- `10-ui-core.js`:
  settings, wyszukiwarki sekcji, modale, kontakt, external redirect
- `20-music.js`:
  player glowny, mini player, playlista, drag/snap
- `30-widgets.js`:
  facts, weather, favorites, wakeup overlay, starfield, nawigacja
- `40-presence-and-boot.js`:
  Discord/Lanyard presence oraz glowny `DOMContentLoaded`

Jesli przenosisz funkcje miedzy plikami, zachowaj zaleznosci "od ogolu do bootstrapa".
