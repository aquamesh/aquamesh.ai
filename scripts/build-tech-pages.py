"""Build hardware.html and modeling.html from company.html's shell (header, sprite, footer).

    python3 scripts/build-tech-pages.py

Page-local styles only; styles.css is not touched. Copy has no em dashes.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DECK = Path("/Users/arbei/Claude/Projects/aquamesh-leads/100plus")
src = (ROOT / "company.html").read_text()

# icons: reuse the deck's stroke icons (same 24x24, stroke=currentColor convention as the site)
syms = {}
for f in (DECK / "_symbols.html", DECK / "build.py"):
    for m in re.finditer(r'<symbol id="(i-[\w-]+)" viewBox="0 0 24 24">(.*?)</symbol>', f.read_text(), flags=re.S):
        syms.setdefault(m.group(1), m.group(2))
NEED = ["i-eye", "i-gauge", "i-radio", "i-router", "i-cube", "i-plug", "i-cycle", "i-shield", "i-db", "i-flask",
        "i-drop", "i-flame", "i-tower", "i-ro", "i-wave", "i-pump", "i-bolt", "i-factory", "i-hand", "i-bot", "i-spark", "i-check"]
extra = "".join(f'<symbol id="{k}" viewBox="0 0 24 24">{syms[k]}</symbol>' for k in NEED if k in syms and f'id="{k}"' not in src)
extra += ('<symbol id="i-chip" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/>'
          '<path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/></symbol>'
          '<symbol id="i-sound" viewBox="0 0 24 24"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></symbol>'
          '<symbol id="i-cal" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></symbol>')

head_end = src.index("</head>")
body_start = src.index("<body>")
sprite_end = src.index("</svg>", body_start) + len("</svg>")
header = src[sprite_end:src.index("</header>") + len("</header>")]
footer = src[src.index('<footer class="footer">'):]
footer = re.sub(r"<script>\s*// The address is never in the markup.*?</script>\s*", "", footer, flags=re.S)
sprite = src[body_start:sprite_end].replace("</svg>", extra + "</svg>")
fonts_css = re.search(r'<link rel="icon".*?<link rel="stylesheet" href="styles\.css\?v=\d+" />', src, flags=re.S).group(0)


def head(path, title, desc, crumb):
    ld = ('{"@context":"https://schema.org","@graph":[{"@type":"WebPage","@id":"https://aquamesh.ai/%s#page","url":"https://aquamesh.ai/%s",'
          '"name":"%s","isPartOf":{"@id":"https://aquamesh.ai/#website"},"about":{"@id":"https://aquamesh.ai/#organization"},"inLanguage":"en"},'
          '{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://aquamesh.ai"},'
          '{"@type":"ListItem","position":2,"name":"%s","item":"https://aquamesh.ai/%s"}]}]}') % (path, path, title, crumb, path)
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title}</title>
  <meta name="description" content="{desc}" />
  <link rel="canonical" href="https://aquamesh.ai/{path}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{desc}" />
  <meta property="og:image" content="https://aquamesh.ai/assets/og.png" />
  <meta name="twitter:card" content="summary_large_image" />
  {fonts_css}
  <script type="application/ld+json">{ld}</script>
"""


def ic(name, cls=""):
    return f'<svg class="ic{(" " + cls) if cls else ""}"><use href="#{name}" /></svg>'


CLOSING = """    <section class="closing">
      <div class="wrap closing-inner">
        <h2>{h}</h2>
        <p class="lead">{p}</p>
        <div class="actions">
          <a class="btn" href="mailto:info@aquamesh.ai?subject=Demo%20request">Book a demo <svg class="ic"><use href="#i-arrow" /></svg></a>
          <a class="mail" href="mailto:info@aquamesh.ai"><svg class="ic"><use href="#i-mail" /></svg>info@aquamesh.ai</a>
        </div>
      </div>
    </section>"""

# ───────────────────────── hardware ─────────────────────────
HW_CSS = """<style>
.hw-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}
.hw{display:flex;flex-direction:column;background:#fff;border:1px solid var(--rule);border-radius:var(--radius);overflow:hidden}
.hw-shot{position:relative;height:250px;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,#f5f8fe,#e4ebfb)}
.hw-shot img{max-height:200px;max-width:78%;width:auto;height:auto;display:block}
.hw-shot.wide img{max-width:86%;max-height:120px}
.hw-badge{position:absolute;left:16px;top:16px;font-size:.78rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;border-radius:99px;padding:5px 11px;background:#fff;color:var(--green);border:1px solid #cfe9db}
.hw-badge.soon{background:var(--navy);color:#fff;border-color:var(--navy)}
.hw-body{padding:22px 24px 24px;display:flex;flex-direction:column;gap:10px;flex:1}
.hw-type{font-size:.8rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--blue)}
.hw h3{font-size:1.5rem;letter-spacing:-.02em}
.hw-line{color:var(--ink);font-weight:600;line-height:1.45}
.hw ul{list-style:none;margin:2px 0 0;padding:0;display:flex;flex-direction:column;gap:8px}
.hw li{display:flex;gap:10px;color:var(--ink-2);line-height:1.45;font-size:.97rem}
.hw li .ic{color:var(--blue);margin-top:2px;width:1.05em;height:1.05em;stroke-width:2.4}
.hw-link{margin-top:auto;padding-top:8px;font-weight:700;color:var(--blue);text-decoration:none;display:inline-flex;align-items:center;gap:6px}
.hw-link:hover{text-decoration:underline}
.hw.any .hw-shot{background:#fff;border-bottom:1px dashed #c3d0f3}
.hw-any{display:flex;flex-direction:column;align-items:center;gap:14px}
.hw-any .disc2{width:86px;height:86px;border-radius:50%;background:var(--tint);color:var(--blue);display:flex;align-items:center;justify-content:center}
.hw-any .disc2 .ic{width:40px;height:40px}
.hw-chips{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
.hw-chips span{font-family:var(--mono);font-size:.78rem;color:var(--ink-2);background:var(--wash);border:1px solid var(--rule);border-radius:8px;padding:4px 8px}
.flow{display:grid;grid-template-columns:1.25fr auto 1fr auto 1fr auto 1fr;align-items:stretch;gap:14px}
.flow-step{background:#fff;border:1px solid var(--rule);border-radius:var(--radius);padding:20px;display:flex;flex-direction:column;gap:8px}
.flow-step .ic{width:30px;height:30px;color:var(--blue)}
.flow-step b{font-size:1.08rem;color:var(--ink)}
.flow-step span{color:var(--ink-3);font-size:.95rem;line-height:1.45}
.flow-arrow{display:flex;align-items:center;color:var(--blue)}
.flow-arrow .ic{width:26px;height:26px}
.perks{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;margin-top:40px}
.perks div{border-top:2px solid var(--blue);padding-top:14px}
.perks b{display:block;font-size:1.15rem;color:var(--ink)}
.perks span{display:block;margin-top:6px;color:var(--ink-3);line-height:1.5}
@media (max-width:980px){.hw-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.flow{grid-template-columns:1fr}.flow-arrow{justify-content:center;transform:rotate(90deg)}.perks{grid-template-columns:1fr}}
@media (max-width:620px){.hw-grid{grid-template-columns:1fr}.hw-shot{height:220px}}
</style>"""

CHECK = ic("i-check")


def card(img, alt, typ, name, line, bullets, badge=None, link=None, wide=False):
    b = ""
    if badge:
        b = f'<span class="hw-badge{" soon" if badge == "Coming soon" else ""}">{badge}</span>'
    lis = "".join(f"<li>{CHECK}<span>{x}</span></li>" for x in bullets)
    ln = f'<a class="hw-link" href="{link[0]}">{link[1]} {ic("i-arrow")}</a>' if link else ""
    return f"""        <article class="hw">
          <div class="hw-shot{' wide' if wide else ''}">{b}<img src="assets/hardware/{img}" alt="{alt}" loading="lazy" decoding="async" /></div>
          <div class="hw-body">
            <p class="hw-type">{typ}</p>
            <h3>{name}</h3>
            <p class="hw-line">{line}</p>
            <ul>{lis}</ul>
            {ln}
          </div>
        </article>"""


cards = "\n".join([
    card("aquaspectra.webp", "AquaSpectra stainless spectral probe", "Spectral water probe", "AquaSpectra&trade;",
         "Sees what is in your process water, not just how much.",
         ["UV-Vis and fluorescence, with NIR and Raman options",
          "Reads protein residues, fermentation activity, starch, sugars and alcohols",
          "Calibrated to your own product and samples"],
         badge="Available", link=("products/aquaspectra.html", "Learn more")),
    card("mechtrack.webp", "MechTrack machine health sensor", "Machine health", "MechTrack&trade;",
         "Catches pump and motor problems before they stop a line.",
         ["Machine learning on vibration, ultrasound and temperature",
          "Built for pumps and motors",
          "Machine health and process data in one view"], link=("products/mechtrack.html", "Learn more")),
    card("asona.webp", "asona AI acoustic camera", "AI acoustic camera", "asona&trade;",
         "The vision layer for next-gen factories.",
         ["Maintenance: hears failing bearings and equipment early",
          "Hazards and leaks: pinpoints the source on a live camera view",
          "Turns sound into findings the platform can act on"],
         badge="Coming soon", link=("products/asona.html", "Learn more")),
    card("aqualink-hub.webp", "AquaLink Hub industrial gateway", "Industrial gateway", "AquaLink&trade; Hub",
         "A rugged, multi-network link from every sensor to the cloud.",
         ["Connects our sensors and the ones you already have",
          "Sends data securely to the AquaMesh platform",
          "Built for plant conditions"], link=("products/aqualink-hub.html", "Learn more")),
    card("edge-computer.webp", "AquaMesh compute blade", "Edge computer", "AquaMesh compute blade",
         "Runs the models on site, next to your control system.",
         ["Real-time models in the plant",
          "Carries out approved changes through your PLC or SCADA",
          "Back to advisory at any time"], wide=True, link=("products/compute-blade.html", "Learn more")),
    f"""        <article class="hw any">
          <div class="hw-shot"><div class="hw-any"><div class="disc2">{ic("i-plug")}</div>
            <div class="hw-chips"><span>OPC UA</span><span>MQTT</span><span>Modbus</span></div></div></div>
          <div class="hw-body">
            <p class="hw-type">Your sensors</p>
            <h3>Any sensor</h3>
            <p class="hw-line">Already installed? Keep it.</p>
            <ul><li>{CHECK}<span>Reads the sensors, PLCs and historians you already run</span></li>
              <li>{CHECK}<span>Adds off-the-shelf sensors where needed</span></li>
              <li>{CHECK}<span>Vendor-neutral: your equipment, your control system</span></li></ul>
          </div>
        </article>"""])

flow = f"""        <div class="flow">
          <div class="flow-step">{ic("i-eye")}<b>Sensors</b><span>AquaSpectra, MechTrack, asona, and the sensors you already have</span></div>
          <div class="flow-arrow">{ic("i-arrow")}</div>
          <div class="flow-step">{ic("i-router")}<b>AquaLink Hub</b><span>One secure link for every sensor</span></div>
          <div class="flow-arrow">{ic("i-arrow")}</div>
          <div class="flow-step">{ic("i-chip")}<b>Compute blade</b><span>Models and approved control, on site</span></div>
          <div class="flow-arrow">{ic("i-arrow")}</div>
          <div class="flow-step">{ic("i-bot")}<b>AquaMesh platform</b><span>Findings, the digital twin and AI agents</span></div>
        </div>"""

hardware = head("hardware.html", "AquaMesh Hardware | Sensors and edge for industrial water",
                "AquaSpectra spectral probe, MechTrack machine health, asona AI acoustic camera (coming soon), AquaLink Hub gateway and the AquaMesh compute blade. Works with the sensors you already have.",
                "Hardware") + HW_CSS + "\n</head>\n" + sprite + header + f"""

  <main class="cs">
    <section class="section cs-head">
      <div class="wrap">
        <p class="eyebrow">Hardware</p>
        <h1>Built for the plant floor. <span class="accent">Works with what you have.</span></h1>
        <p class="lead">Start on the data your plant already records. Add our hardware only where it pays: to see what is in the water, how the machines are running and what the plant sounds like.</p>
      </div>
    </section>

    <section class="section" style="padding-top:clamp(36px,5vw,56px)">
      <div class="wrap">
        <div class="hw-grid">
{cards}
        </div>
      </div>
    </section>

    <section class="section wash">
      <div class="wrap">
        <div class="head">
          <p class="eyebrow">How it connects</p>
          <h2>From the sensor to <span class="accent">the decision.</span></h2>
        </div>
{flow}
        <div class="perks">
          <div><b>Start on data alone</b><span>The free audit runs on what you already record. Hardware comes later, only where it pays.</span></div>
          <div><b>About a third of the cost</b><span>Our sensors cost about a third of comparable instruments.</span></div>
          <div><b>Small and fast to install</b><span>Compact sensors and an edge computer that fit in tight spaces.</span></div>
        </div>
      </div>
    </section>

""" + CLOSING.format(h="Not sure what to add?", p="Start with the free audit. It shows where your data runs out, and only then what is worth installing.") + """
  </main>
  """ + footer

# ───────────────────────── modeling ─────────────────────────
MD_CSS = """<style>
.md-feat{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}
.md-feat article{background:#fff;border:1px solid var(--rule);border-radius:var(--radius);padding:24px;display:flex;flex-direction:column;gap:10px}
.md-feat .n{display:flex;align-items:center;gap:12px}
.md-feat .n i{width:46px;height:46px;border-radius:14px;background:var(--tint);color:var(--blue);display:flex;align-items:center;justify-content:center;font-style:normal}
.md-feat .n i .ic{width:24px;height:24px}
.md-feat h3{font-size:1.3rem;letter-spacing:-.02em}
.md-feat p{color:var(--ink-2);line-height:1.55}
.md-feat article.wide{grid-column:span 2;background:var(--navy);border-color:var(--navy)}
.md-feat article.wide h3{color:#fff}.md-feat article.wide p{color:#c9d4f2}
.md-feat article.wide .n i{background:rgba(255,255,255,.12);color:#fff}
.md-modes{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}
.md-modes span{font-size:.9rem;font-weight:700;border-radius:99px;padding:6px 14px;background:rgba(255,255,255,.1);color:#fff}
.md-modes span:last-child{background:var(--blue)}
.units{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.unit{display:flex;gap:14px;align-items:flex-start;background:#fff;border:1px solid var(--rule);border-radius:14px;padding:16px 18px}
.unit i{flex:none;width:40px;height:40px;border-radius:12px;background:var(--tint);color:var(--blue);display:flex;align-items:center;justify-content:center;font-style:normal}
.unit i .ic{width:21px;height:21px}
.unit b{display:block;color:var(--ink);font-size:1.02rem}
.unit span{display:block;margin-top:3px;color:var(--ink-3);font-size:.93rem;line-height:1.4}
.md-why{display:grid;grid-template-columns:1fr 1fr;gap:22px}
.md-why div{border-radius:var(--radius);padding:24px;border:1px solid var(--rule);background:#fff}
.md-why div.us{border-color:var(--blue);background:var(--tint)}
.md-why p.k{font-size:.8rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3)}
.md-why div.us p.k{color:var(--blue)}
.md-why b{display:block;margin-top:8px;font-size:1.25rem;color:var(--ink);letter-spacing:-.01em}
.md-why ul{margin:12px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;color:var(--ink-2);line-height:1.5}
.md-why li{position:relative;padding-left:22px}
.md-why li::before{content:"";position:absolute;left:2px;top:.6em;width:8px;height:8px;border-radius:50%;background:#aab3c5}
.md-why div.us li::before{background:var(--blue)}
@media (max-width:980px){.md-feat,.units{grid-template-columns:repeat(2,minmax(0,1fr))}.md-feat article.wide{grid-column:span 2}}
@media (max-width:620px){.md-feat,.units,.md-why{grid-template-columns:1fr}.md-feat article.wide{grid-column:auto}}
</style>"""


def feat(icn, title, text, wide=False, extra=""):
    return f"""          <article{' class="wide"' if wide else ''}>
            <div class="n"><i>{ic(icn)}</i><h3>{title}</h3></div>
            <p>{text}</p>{extra}
          </article>"""


feats = "\n".join([
    feat("i-cycle", "Learns your plant",
         "Re-fits to live data every 15 minutes. Works out the rates nobody measures directly, like how fast a membrane fouls or how well a diffuser really transfers air, and shows how sure it is."),
    feat("i-wave", "Plans ahead",
         "Tests each plan against many possible futures across load, weather and water chemistry, then picks the cheapest one that stays inside your permits and quality limits."),
    feat("i-factory", "Sees the whole site",
         "Balances water across the plant, flags meters that disagree, and finds reuse between assets, like RO reject going into the cooling tower."),
    feat("i-cal", "Schedules the work",
         "Plans cleans, regenerations and backwashes by cost and risk, not by the calendar."),
    feat("i-shield", "Safe by design",
         "Every agent move is simulated first, kept inside hard limits and logged in a record that can't be edited. Your controllers keep running the plant. You choose how far the agents go.",
         wide=True, extra='\n            <div class="md-modes"><span>Advise</span><span>Approve</span><span>Automate</span></div>'),
])


def unit(icn, name, text):
    return f'          <div class="unit"><i>{ic(icn)}</i><div><b>{name}</b><span>{text}</span></div></div>'


units = "\n".join([
    unit("i-tower", "Cooling towers", "Cycles, blowdown, scaling and inhibitor dose"),
    unit("i-ro", "RO and NF", "Fouling, cleaning timing and membrane life"),
    unit("i-flame", "Boilers", "Blowdown, chemistry limits and fuel"),
    unit("i-cycle", "Ion exchange", "Capacity and regeneration timing"),
    unit("i-flask", "Neutralizers", "pH and reagent dose"),
    unit("i-spark", "Biological treatment", "Aeration and nitrogen, run to the permit"),
    unit("i-gauge", "Distillation", "Column steam, reflux and product strength"),
    unit("i-drop", "Water chemistry", "Speciation and scaling indices, including silica"),
    unit("i-pump", "Pumps", "Schedules against power prices and tank levels"),
])

modeling = head("modeling.html", "AquaMesh Modeling | Physics models of your plant",
                "Self-calibrating physics models of cooling towers, RO, boilers, ion exchange, biological treatment, distillation and more. Every fix is tested against many possible futures before it reaches the plant.",
                "Modeling") + MD_CSS + "\n</head>\n" + sprite + header + f"""

  <main class="cs">
    <section class="section cs-head">
      <div class="wrap">
        <p class="eyebrow">Modeling</p>
        <h1>A physics model of your plant. <span class="accent">Every fix tested first.</span></h1>
        <p class="lead">Data shows what happened. Physics explains why, and what would happen if you changed something. AquaMesh keeps a working model of each unit in your plant, matched to your live data, so every recommendation is tested before it reaches the line.</p>
      </div>
    </section>

    <section class="section" style="padding-top:clamp(36px,5vw,56px)">
      <div class="wrap">
        <div class="md-feat">
{feats}
        </div>
      </div>
    </section>

    <section class="section wash">
      <div class="wrap">
        <div class="head">
          <p class="eyebrow">Unit library</p>
          <h2>One model for each <span class="accent">part of your plant.</span></h2>
          <p class="lead">Each unit runs on the same core, so calibration, forecasting and scheduling work the same way across the site.</p>
        </div>
        <div class="units">
{units}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="head">
          <p class="eyebrow">Why physics</p>
          <h2>Curve-fitting learns the past. <span class="accent">Physics handles what's next.</span></h2>
        </div>
        <div class="md-why">
          <div><p class="k">Data-only models</p><b>Fit a curve to history</b>
            <ul><li>Good at what already happened</li><li>Unsure outside the conditions they have seen</li><li>Can't say why a number moved</li></ul></div>
          <div class="us"><p class="k">AquaMesh</p><b>A calibrated model of each unit</b>
            <ul><li>Tests changes the plant has never tried</li><li>Names the cause behind a change</li><li>Shows its confidence with every answer</li></ul></div>
        </div>
      </div>
    </section>

""" + CLOSING.format(h="See what your plant's model would say.", p="Start with the free audit on the data you already record. The model is built from it.") + """
  </main>
  """ + footer

(ROOT / "hardware.html").write_text(hardware)
(ROOT / "modeling.html").write_text(modeling)
for name, h in (("hardware.html", hardware), ("modeling.html", modeling)):
    assert "—" not in h.split('<main class="cs">')[1].split('<footer')[0], f"em dash in {name} copy"
print("wrote hardware.html, modeling.html")
exec((ROOT / "scripts" / "product_pages.py").read_text())
