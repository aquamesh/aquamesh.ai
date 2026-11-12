# Product pages under products/, run from build-tech-pages.py (shares head, sprite, header,
# footer, ic, CHECK and CLOSING). Only facts we can stand behind: anything not yet confirmed
# (MechTrack mounting, gateway radios, compute blade release) is left out rather than guessed.
import re as _re

def rebase(html):
    """Prefix relative href/src values with ../ for pages one folder down."""
    def fix(m):
        attr, q, url = m.group(1), m.group(2), m.group(3)
        if _re.match(r"(https?:|mailto:|tel:|#|/|data:|\.\./)", url):
            return m.group(0)
        return f"{attr}={q}../{url}"
    return _re.sub(r'(href|src)=(["\'])([^"\']*)', fix, html)

PD_CSS = """<style>
.pd-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:clamp(28px,5vw,64px);align-items:center}
.pd-shot{border-radius:24px;background:linear-gradient(180deg,#f5f8fe,#dfe8fb);min-height:420px;display:flex;align-items:center;justify-content:center;position:relative}
.pd-shot img{max-height:360px;max-width:80%;width:auto;height:auto;display:block}
.pd-shot.wide img{max-width:88%;max-height:170px}
.pd-tags{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0 0}
.pd-tags span{font-size:.78rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;border-radius:99px;padding:5px 11px;background:var(--green-tint);color:var(--green)}
.pd-tags span.soon{background:var(--navy);color:#fff}
.pd-tags span.plain{background:var(--tint);color:var(--blue)}
.pd-hero .actions{margin-top:26px;display:flex;flex-wrap:wrap;gap:12px 18px;align-items:center}
.pd-hero .lnk{font-weight:700;color:var(--blue);text-decoration:none;display:inline-flex;gap:6px;align-items:center}
.pd-feat{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}
.pd-feat article{background:#fff;border:1px solid var(--rule);border-radius:var(--radius);padding:22px;display:flex;flex-direction:column;gap:10px}
.pd-feat i{width:46px;height:46px;border-radius:14px;background:var(--tint);color:var(--blue);display:flex;align-items:center;justify-content:center;font-style:normal}
.pd-feat i .ic{width:24px;height:24px}
.pd-feat h3{font-size:1.15rem;letter-spacing:-.01em}
.pd-feat p{color:var(--ink-2);line-height:1.55;font-size:.97rem}
.pd-methods{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.pd-methods div{border-radius:16px;padding:18px;background:#fff;border:1px solid var(--rule)}
.pd-methods b{display:inline-block;color:#fff;border-radius:99px;padding:4px 12px;font-size:.92rem}
.pd-methods p{margin-top:10px;color:var(--ink);font-weight:600;line-height:1.45}
.pd-methods small{display:block;margin-top:6px;color:var(--ink-3);font-size:.85rem}
.pd-two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(24px,4vw,56px);align-items:start}
.pd-uses{display:flex;flex-wrap:wrap;gap:8px}
.pd-uses span{font-weight:700;color:var(--ink);background:#fff;border:1px solid var(--rule);border-radius:99px;padding:8px 14px;font-size:.95rem}
.pd-spec{margin:0;border-top:1px solid var(--rule)}
.pd-spec div{display:grid;grid-template-columns:150px 1fr;gap:16px;padding:12px 0;border-bottom:1px solid var(--rule)}
.pd-spec dt{font-size:.8rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3);padding-top:2px}
.pd-spec dd{margin:0;color:var(--ink);line-height:1.5}
.pd-proof{display:flex;flex-wrap:wrap;gap:12px;margin-top:18px}
.pd-proof a,.pd-proof span{display:inline-flex;align-items:center;gap:8px;font-weight:700;font-size:.92rem;color:var(--green);background:var(--green-tint);border-radius:99px;padding:7px 14px;text-decoration:none}
.pd-proof .ic{width:1.05em;height:1.05em;stroke-width:2.4}
.pd-more{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.pd-more a{display:flex;align-items:center;gap:14px;padding:12px 14px;border:1px solid var(--rule);border-radius:14px;background:#fff;text-decoration:none;color:inherit}
.pd-more a:hover{border-color:var(--blue)}
.pd-more .im{flex:none;width:58px;height:58px;border-radius:12px;background:linear-gradient(180deg,#f5f8fe,#e4ebfb);display:flex;align-items:center;justify-content:center}
.pd-more .im img{max-width:48px;max-height:48px;width:auto;height:auto}
.pd-more b{display:block;color:var(--ink)}
.pd-more small{display:block;color:var(--ink-3);font-size:.86rem}
@media (max-width:980px){.pd-hero,.pd-two{grid-template-columns:1fr}.pd-shot{min-height:300px}.pd-shot img{max-height:260px}.pd-feat,.pd-methods,.pd-more{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:560px){.pd-feat,.pd-methods{grid-template-columns:1fr}.pd-more{grid-template-columns:1fr}.pd-spec div{grid-template-columns:1fr;gap:4px}}
</style>"""

PRODUCTS = [
  dict(slug="aquaspectra", img="aquaspectra.webp", name="AquaSpectra&trade;", plain="AquaSpectra", typ="Spectral water probe",
       h="See what is in the water.", tags=[("Available", ""), ("Patent pending", "plain")],
       lead="A rugged inline probe that reads the full spectral fingerprint of your process water, continuously. It shows what changed and why as it happens, not in tomorrow's lab result.",
       cta2=("../case-studies/starch-plant.html", "See the starch project"),
       desc="AquaSpectra inline spectral probe: UV-Vis and fluorescence with NIR and Raman options. Reads protein residues, fermentation activity, starch, sugars and alcohols in process water.",
       methods=[("UV-Vis", "#8f9ab0", "Organic load, color and turbidity", "The baseline every spectral sensor reads"),
                ("Fluorescence", "#2449e8", "Protein-like residues, fermentation activity, protein vs. humic organics", "Food soil after cleaning, live fermentation"),
                ("NIR", "#0ea5c6", "Starch, sugars and product solids", "Option, fitted to your application"),
                ("Raman", "#0b1026", "Molecular fingerprints of sugars and alcohols", "Option, fitted to your application")],
       feats=[("i-shield", "Protect product", "Catch carryover, composition drift or residual product before it becomes rework."),
              ("i-gauge", "Control the process", "Track batches, transitions and CIP endpoints, and run closer to target."),
              ("i-drop", "Cut waste", "See product loss and organic load heading for the drain, while there is time to act."),
              ("i-flask", "Built on your samples", "The spectrum is watched for change and calibrated to your own product and lab results.")],
       uses=["Dairy", "Brewing and fermentation", "Beverages", "Starch and corn milling", "Sauces and prepared food", "Fats and oils", "CIP and cleaning chemistry", "Wastewater and reuse"],
       specs=[("Methods", "UV-Vis and fluorescence, with NIR and Raman options"),
              ("Spectral windows", "UV/Vis 190 to 440 nm, NIR 900 to 1,700 nm"),
              ("Readings", "Every few seconds, continuously"),
              ("Mounting", "Inline, with a flanged process connection"),
              ("Calibration", "To your own product and lab samples"),
              ("Connects to", "AquaLink Hub or your network, into the AquaMesh platform")],
       proof=[("../case-studies/starch-plant.html", "NIR starch tracking, corn wet milling"), (None, "First built for Scripps Institution of Oceanography")]),
  dict(slug="mechtrack", img="mechtrack.webp", name="MechTrack&trade;", plain="MechTrack", typ="Machine health",
       h="Catch machine problems before they stop a line.", tags=[],
       lead="A compact sensor for pumps and motors. It tracks vibration, ultrasound and temperature, and machine learning turns them into early warnings tied to the process the machine is serving.",
       desc="MechTrack machine-health sensor for pumps and motors: vibration, ultrasound and temperature with machine learning, tied to plant process data.",
       feats=[("i-spark", "Three signals in one", "Vibration, ultrasound and temperature from a single sensor on the machine."),
              ("i-bot", "Learns each machine", "Machine learning sets a normal pattern for every machine and flags when it starts to drift."),
              ("i-factory", "Machine plus process", "Reads machine health next to flow, pressure and energy, so a failing pump is told apart from a process change."),
              ("i-check", "Plan the fix", "Warnings reach the AquaMesh platform with what to check, before a breakdown forces the timing.")],
       uses=["Pumps", "Motors", "Blowers", "Fans", "Mixers and agitators"],
       specs=[("Senses", "Vibration, ultrasound and temperature"),
              ("Analysis", "Machine learning for each machine, in the AquaMesh platform"),
              ("Built for", "Pumps, motors and other rotating equipment"),
              ("Connects to", "AquaLink Hub, into the AquaMesh platform")]),
  dict(slug="asona", img="asona.webp", name="asona&trade;", plain="asona", typ="AI acoustic camera",
       h="The vision layer for next-gen factories.", tags=[("Coming soon", "soon")],
       lead="A camera that sees sound. asona places what it hears on a live picture of the plant, so failing equipment, leaks and hazards show up exactly where they are, as they start.",
       cta1=("mailto:info@aquamesh.ai?subject=asona%20early%20access", "Get early access"),
       desc="asona AI acoustic camera (coming soon): sees sound on a live camera view to find failing equipment, leaks and hazards for predictive maintenance and safety.",
       feats=[("i-eye", "See sound", "Many microphones map sound onto the camera image in real time, including sounds too high for people to hear."),
              ("i-cycle", "Maintenance", "Hears worn bearings and failing equipment early, so repairs are planned instead of forced."),
              ("i-drop", "Leaks and hazards", "Pinpoints air and steam leaks and unusual sounds that signal a hazard, across a whole area at once."),
              ("i-bot", "Into the platform", "Each finding lands on the plant's digital twin with what to check and what it costs to wait.")],
       uses=["Compressed air", "Steam systems", "Pumps and motors", "Conveyors", "Valves and fittings", "Safety rounds"],
       specs=[("Status", "In development. Join early access for first units."),
              ("Senses", "Sound, mapped onto a live camera view"),
              ("Finds", "Maintenance issues, leaks and hazards"),
              ("Connects to", "The AquaMesh platform and digital twin")]),
  dict(slug="aqualink-hub", img="aqualink-hub.webp", name="AquaLink&trade; Hub", plain="AquaLink Hub", typ="Industrial gateway",
       h="Every sensor, one secure link.", tags=[],
       lead="A rugged gateway that brings our sensors and the ones you already run onto one connection to the AquaMesh platform.",
       desc="AquaLink Hub industrial gateway: connects AquaMesh sensors and existing instruments over OPC UA, MQTT and Modbus to the AquaMesh platform.",
       feats=[("i-plug", "Speaks plant protocols", "Reads OPC UA, MQTT and Modbus, so existing instruments join without rewiring."),
              ("i-router", "Multi-network", "Uses the network your site allows to reach the platform."),
              ("i-check", "Reports its own health", "Tells the platform it is up and streaming, so a quiet sensor is never mistaken for a quiet plant."),
              ("i-shield", "Read-only to start", "Nothing on your plant changes without your team's approval.")],
       uses=["AquaSpectra", "MechTrack", "asona", "PLCs", "Existing instruments"],
       specs=[("Protocols", "OPC UA, MQTT, Modbus"),
              ("Connects", "AquaMesh sensors and existing instruments"),
              ("Health", "Reports its status to the platform"),
              ("Control", "Read-only to start")]),
  dict(slug="compute-blade", img="edge-computer.webp", name="AquaMesh compute blade", plain="Compute blade", typ="Edge computer", wide=True,
       h="The models, on site.", tags=[],
       lead="Runs AquaMesh's models next to your control system, so decisions don't wait on the cloud. When you are ready, it carries out approved changes through your existing PLC or SCADA.",
       desc="AquaMesh compute blade edge computer: runs AquaMesh models on site and carries out operator-approved changes through existing PLC and SCADA systems.",
       feats=[("i-chip", "Real-time models on site", "The plant's models run beside the control system, close to the data."),
              ("i-hand", "Approved changes only", "Setpoints, valves, pumps and dosing change only when your team approves."),
              ("i-shield", "Inside validated limits", "Safety, quality and compliance limits are hard limits the agents never cross."),
              ("i-cycle", "Back to advisory any time", "Switch between advise, approve and automate whenever you choose.")],
       uses=["Setpoints", "Valves", "Pumps", "Chemical dosing", "Energy and water use"],
       specs=[("Runs", "AquaMesh models and agents"),
              ("Control", "Through your existing PLC or SCADA, approved changes only"),
              ("Modes", "Advise, approve or automate"),
              ("Form", "Rack-mount")]),
]


def closing_for(d):
    if d["slug"] == "asona":
        c = CLOSING.format(h="Be first to try asona.", p="We are lining up the first plants. Tell us where it would help most.")
        c = c.replace('href="mailto:info@aquamesh.ai?subject=Demo%20request">Book a demo', 'href="mailto:info@aquamesh.ai?subject=asona%20early%20access">Get early access')
        return rebase(c)
    return rebase(CLOSING.format(h="See it on your plant.", p="Start with the free audit on the data you already record. We add hardware only where it pays."))


def product_page(d):
    path = f"products/{d['slug']}.html"
    title = f"{d['plain']} | {d['typ']} | AquaMesh"
    tags = "".join(f'<span class="{c}">{t}</span>' for t, c in d["tags"])
    cta1 = d.get("cta1", ("mailto:info@aquamesh.ai?subject=Demo%20request", "Book a demo"))
    cta2 = d.get("cta2")
    acts = f'<a class="btn" href="{cta1[0]}">{cta1[1]} {ic("i-arrow")}</a>'
    if cta2:
        acts += f'<a class="lnk" href="{cta2[0]}">{cta2[1]} {ic("i-arrow")}</a>'
    acts += f'<a class="lnk" href="../hardware.html">All hardware {ic("i-arrow")}</a>'
    feats = "".join(f'<article><i>{ic(a)}</i><h3>{b}</h3><p>{c}</p></article>' for a, b, c in d["feats"])
    methods = ""
    if d.get("methods"):
        cells = "".join(f'<div><b style="background:{col}">{m}</b><p>{r}</p><small>{n}</small></div>' for m, col, r, n in d["methods"])
        methods = f"""
    <section class="section">
      <div class="wrap">
        <div class="head"><p class="eyebrow">Four ways to see</p><h2>More than absorbance. <span class="accent">The chemistry.</span></h2></div>
        <div class="pd-methods">{cells}</div>
      </div>
    </section>"""
    uses = "".join(f"<span>{u}</span>" for u in d["uses"])
    specs = "".join(f"<div><dt>{a}</dt><dd>{b}</dd></div>" for a, b in d["specs"])
    proof = ""
    if d.get("proof"):
        items = "".join((f'<a href="{u}">{ic("i-check")}{t}</a>' if u else f'<span>{ic("i-check")}{t}</span>') for u, t in d["proof"])
        proof = f'<div class="pd-proof">{items}</div>'
    others = [o for o in PRODUCTS if o["slug"] != d["slug"]]
    more = "".join(f'<a href="{o["slug"]}.html"><span class="im"><img src="../assets/hardware/{o["img"]}" alt="" loading="lazy" decoding="async" /></span>'
                   f'<span><b>{o["name"]}</b><small>{o["typ"]}{" &middot; coming soon" if any(t == "Coming soon" for t, _ in o["tags"]) else ""}</small></span></a>' for o in others)
    shell_header = rebase(header)
    shell_sprite = sprite
    shell_footer = rebase(footer)
    h = head(path, title, d["desc"], d["plain"]).replace('href="assets/', 'href="../assets/').replace('href="styles.css', 'href="../styles.css')
    # breadcrumb: Home > Hardware > product
    h = h.replace('{"@type":"ListItem","position":2,"name":"%s","item":"https://aquamesh.ai/%s"}' % (d["plain"], path),
                  '{"@type":"ListItem","position":2,"name":"Hardware","item":"https://aquamesh.ai/hardware.html"},'
                  '{"@type":"ListItem","position":3,"name":"%s","item":"https://aquamesh.ai/%s"}' % (d["plain"], path))
    html = h + PD_CSS + "\n</head>\n" + shell_sprite + shell_header + f"""

  <main class="cs">
    <section class="section cs-head">
      <div class="wrap pd-hero">
        <div class="pd-shot{' wide' if d.get('wide') else ''}"><img src="../assets/hardware/{d['img']}" alt="{d['plain']}" decoding="async" /></div>
        <div>
          <p class="eyebrow"><a href="../hardware.html" style="color:inherit;text-decoration:none">Hardware</a> &middot; {d['typ']}</p>
          <h1>{d['name']} <span class="accent">{d['h']}</span></h1>
          {f'<div class="pd-tags">{tags}</div>' if tags else ''}
          <p class="lead" style="margin-top:18px">{d['lead']}</p>
          <div class="actions">{acts}</div>
        </div>
      </div>
    </section>
{methods}
    <section class="section{' wash' if d.get('methods') else ''}">
      <div class="wrap">
        <div class="head"><p class="eyebrow">What it does</p><h2>Built to pay for itself.</h2></div>
        <div class="pd-feat">{feats}</div>
      </div>
    </section>

    <section class="section{'' if d.get('methods') else ' wash'}">
      <div class="wrap pd-two">
        <div>
          <p class="eyebrow">Where it fits</p>
          <h2 style="margin:12px 0 22px">Made for the plant floor.</h2>
          <div class="pd-uses">{uses}</div>
          {proof}
        </div>
        <div>
          <p class="eyebrow">At a glance</p>
          <dl class="pd-spec" style="margin-top:18px">{specs}</dl>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="head"><p class="eyebrow">Works together</p><h2>The rest of the <span class="accent">AquaMesh hardware.</span></h2></div>
        <div class="pd-more">{more}</div>
      </div>
    </section>

""" + closing_for(d) + """
  </main>
  """ + shell_footer
    assert "—" not in html.split('<main class="cs">')[1].split("<footer")[0], f"em dash in {path}"
    (ROOT / "products").mkdir(exist_ok=True)
    (ROOT / path).write_text(html)
    return path


print("wrote", ", ".join(product_page(d) for d in PRODUCTS))
