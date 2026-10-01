/* Diagrams referenced from posts as {{diagram:name}}. Inline SVG so they stay
   sharp at any size, theme with the site's palette, and cost no extra request. */
const INK = '#0b1026', INK3 = '#66728a', BLUE = '#2449e8', RULE = '#dfe6f3',
      TINT = '#e9effd', RED = '#c2410c', GREEN = '#137a4b';

export const DIAGRAMS = {

/* twin basins on one air header — reused from the industrial water page */
'twin-basins': `<svg class="dia" viewBox="0 0 960 300" role="img" aria-label="Two basins on shared airflow over the same period. Basin 1 holds a median of 5.35 mg/L of dissolved oxygen with its blower pinned at 99.99%; Basin 2 sits inside the posted range of 0.5 to 1.5 mg/L at 0.49 mg/L.">
  <g font-family="Plus Jakarta Sans, sans-serif">
    <rect x="70" y="150" width="820" height="46" fill="${TINT}"/>
    <text x="80" y="214" font-size="13" font-weight="600" fill="${BLUE}">POSTED RANGE 0.5–1.5 mg/L</text>
    <path d="M70 60 C 150 66, 230 54, 310 62 S 470 56, 550 64 S 710 58, 890 62" fill="none" stroke="${RED}" stroke-width="3"/>
    <path d="M70 176 C 150 170, 230 182, 310 174 S 470 180, 550 172 S 710 178, 890 174" fill="none" stroke="${BLUE}" stroke-width="3"/>
    <text x="70" y="44" font-size="15" font-weight="700" fill="${RED}">Basin 1 — median 5.35 mg/L, blower pinned at 99.99%</text>
    <text x="70" y="248" font-size="15" font-weight="700" fill="${BLUE}">Basin 2 — median 0.49 mg/L, same shared airflow</text>
    <path d="M905 62 V174" stroke="${INK3}" stroke-width="1.5" stroke-dasharray="4 4"/>
    <text x="898" y="120" text-anchor="end" font-size="14" font-weight="700" fill="${INK}">3.6× the posted limit</text>
  </g>
</svg>`,

/* duty share between a lead and lag asset */
'duty-split': `<svg class="dia" viewBox="0 0 960 300" role="img" aria-label="Run hours for two RAS pumps. Over 25 days the lead pump ran 504 hours against its twin's 232. Lifetime counters show 44,299 hours against 30,953.">
  <g font-family="Plus Jakarta Sans, sans-serif">
    <text x="60" y="38" font-size="13" font-weight="700" letter-spacing="2" fill="${INK3}">RUN HOURS, SAME 25 DAYS</text>
    <rect x="60" y="58" width="620" height="44" rx="8" fill="${RED}"/>
    <rect x="60" y="116" width="285" height="44" rx="8" fill="${BLUE}" opacity="0.35"/>
    <text x="76" y="86" font-size="17" font-weight="700" fill="#fff">Pump A — 504 h</text>
    <text x="76" y="144" font-size="17" font-weight="700" fill="${INK}">Pump B — 232 h</text>
    <text x="700" y="86" font-size="14" font-weight="700" fill="${RED}">84% duty</text>
    <text x="365" y="144" font-size="14" font-weight="700" fill="${INK3}">39% duty</text>
    <path d="M60 196 H900" stroke="${RULE}" stroke-width="2"/>
    <text x="60" y="228" font-size="13" font-weight="700" letter-spacing="2" fill="${INK3}">LIFETIME COUNTERS — THE GAP COMPOUNDING</text>
    <text x="60" y="262" font-size="21" font-weight="800" fill="${RED}">44,299 h</text>
    <text x="210" y="262" font-size="21" font-weight="800" fill="${INK3}">30,953 h</text>
    <text x="370" y="262" font-size="15" fill="${INK3}">— the standby is the one you will need</text>
  </g>
</svg>`,

/* starts per hour against manufacturer guidance */
'pump-starts': `<svg class="dia" viewBox="0 0 960 260" role="img" aria-label="Pump starts per hour. Manufacturer guidance is near six an hour. Observed range was 13 to 28, with one asset logging 143 in an hour — a start every 25 seconds.">
  <g font-family="Plus Jakarta Sans, sans-serif">
    <path d="M60 150 H900" stroke="${RULE}" stroke-width="3"/>
    <g>
      <path d="M100 136 V164" stroke="${GREEN}" stroke-width="3"/>
      <text x="100" y="124" text-anchor="middle" font-size="14" font-weight="700" fill="${GREEN}">~6/h</text>
      <text x="100" y="192" text-anchor="middle" font-size="13" fill="${INK3}">guidance</text>
    </g>
    <rect x="196" y="140" width="190" height="20" rx="10" fill="${RED}" opacity="0.25"/>
    <text x="291" y="124" text-anchor="middle" font-size="14" font-weight="700" fill="${RED}">13–28/h</text>
    <text x="291" y="192" text-anchor="middle" font-size="13" fill="${INK3}">observed range</text>
    <g>
      <circle cx="840" cy="150" r="11" fill="${RED}"/>
      <text x="840" y="120" text-anchor="middle" font-size="19" font-weight="800" fill="${RED}">143/h</text>
      <text x="840" y="192" text-anchor="middle" font-size="13" fill="${INK3}">one asset</text>
      <text x="840" y="214" text-anchor="middle" font-size="13" font-weight="700" fill="${INK}">a start every 25 seconds</text>
    </g>
    <text x="60" y="40" font-size="15" fill="${INK3}">Every start draws locked-rotor current. Run hours are not the expensive variable.</text>
  </g>
</svg>`,

/* calibrated parameter vs change analysis */
'calibration-vs-change': `<svg class="dia" viewBox="0 0 960 330" role="img" aria-label="Two uses of the same spectrum. Reporting a calibrated concentration needs a site-specific model that drifts as composition changes. Change analysis compares the spectrum against the plant's own reference and correlates deviation with plant state, so it survives recipe and seasonal variation.">
  <g font-family="Plus Jakarta Sans, sans-serif">
    <rect x="40" y="46" width="410" height="250" rx="14" fill="#fff" stroke="${RULE}"/>
    <rect x="510" y="46" width="410" height="250" rx="14" fill="#fff" stroke="${GREEN}" stroke-width="1.5"/>
    <text x="60" y="34" font-size="13" font-weight="700" letter-spacing="2" fill="${RED}">REPORTING A CONCENTRATION</text>
    <text x="530" y="34" font-size="13" font-weight="700" letter-spacing="2" fill="${GREEN}">WATCHING FOR CHANGE</text>

    <text x="70" y="86" font-size="15" font-weight="700" fill="${INK}">spectrum</text>
    <path d="M150 80 H210" stroke="${INK3}" stroke-width="2"/>
    <text x="222" y="86" font-size="15" font-weight="700" fill="${INK}">calibration model</text>
    <path d="M240 100 V130" stroke="${INK3}" stroke-width="2"/>
    <text x="70" y="146" font-size="15" font-weight="700" fill="${INK}">“COD = 212 mg/L”</text>
    <text x="70" y="186" font-size="14" fill="${INK3}">site-specific · drifts with composition</text>
    <text x="70" y="210" font-size="14" fill="${INK3}">degrades quietly, still looks plausible</text>
    <rect x="70" y="232" width="350" height="40" rx="8" fill="${RED}" opacity="0.08"/>
    <text x="86" y="257" font-size="14" font-weight="700" fill="${RED}">needs recalibration to stay true</text>

    <text x="540" y="86" font-size="15" font-weight="700" fill="${INK}">spectrum vs your own reference</text>
    <path d="M710 100 V130" stroke="${INK3}" stroke-width="2"/>
    <text x="540" y="146" font-size="15" font-weight="700" fill="${INK}">deviation, correlated to plant state</text>
    <text x="540" y="186" font-size="14" fill="${INK3}">survives recipe and seasonal change</text>
    <text x="540" y="210" font-size="14" fill="${INK3}">drift shows up as drift, not a wrong number</text>
    <rect x="540" y="232" width="350" height="40" rx="8" fill="${GREEN}" opacity="0.08"/>
    <text x="556" y="257" font-size="14" font-weight="700" fill="${GREEN}">BOD is the one value we calibrate</text>
  </g>
</svg>`
};
