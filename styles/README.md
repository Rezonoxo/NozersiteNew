# Styles

Pliki sa ladowane sekwencyjnie w tej kolejnosci:

1. `00-base.css`
2. `10-sections-a.css`
3. `20-sections-b.css`
4. `30-shell-and-overlays.css`
5. `40-components.css`
6. `50-pages-and-responsive.css`

Podzial:

- `00-base.css`:
  reset, global styles, cursor, contact modal, podstawowe utility
- `10-sections-a.css`:
  early section styles i starsze bloki kart/widgetow
- `20-sections-b.css`:
  kolejne sekcje i widgety srodkowej czesci arkusza
- `30-shell-and-overlays.css`:
  wakeup, nav, layout shell, overlays, settings
- `40-components.css`:
  mini player, projects, modern cards
- `50-pages-and-responsive.css`:
  spotify history, nowy page polish, responsive overrides, final overrides

Zostawiaj override'y jak najpozniej w kolejnosci plikow. Jesli styl naprawia starszy blok, zwykle powinien trafic do pozniejszego pliku, nie do wczesniejszego.
