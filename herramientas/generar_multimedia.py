"""
Genera los archivos multimedia del sitio en frontend/public/media:

  - video-promocional.mp4  (diapositivas + narración, 2 a 4 minutos)
  - video-promocional.vtt  (subtítulos en español)
  - video-poster.jpg       (portada del video)
  - mensaje-bienvenida.mp3 (audio de ~1 minuto)

Requisitos: Windows (voz "Microsoft Sabina Desktop", es-MX), Python con
Pillow y ffmpeg en el PATH. Uso:

    python herramientas/generar_multimedia.py

Puedes reemplazar el video por uno grabado por el equipo con el mismo nombre
de archivo; el sitio lo toma sin cambios en el código.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import textwrap
import wave
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "frontend" / "public" / "media"
FUENTES = Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts"
VOZ = "Microsoft Sabina Desktop"

ANCHO, ALTO = 1280, 720
MARCA = (69, 106, 209)
MARCA_OSCURA = (20, 37, 83)
ACENTOS = [(14, 159, 142), (234, 163, 0), (194, 57, 179), (129, 160, 232)]

ESCENAS = [
    {
        "titulo": "The Web Hosting",
        "puntos": ["Quiénes somos", "Nuestro objetivo", "Promoción del mes", "Consejos para elegir"],
        "voz": "Hola, te damos la bienvenida a The Web Hosting. En este video te contamos quiénes somos, "
        "cuál es nuestro objetivo, la promoción de este mes y algunos consejos para elegir el hosting ideal para tu proyecto.",
    },
    {
        "titulo": "Nuestro objetivo",
        "puntos": ["Tu sitio en línea, rápido y seguro", "Precios justos en pesos mexicanos", "Nosotros cuidamos los servidores"],
        "voz": "Nuestro objetivo es que cualquier persona o negocio tenga su sitio web en línea de forma rápida, segura "
        "y a un precio justo. Nos encargamos de los servidores, la seguridad y los respaldos, para que tú te concentres "
        "en hacer crecer tu proyecto.",
    },
    {
        "titulo": "Un plan para cada etapa",
        "puntos": ["Compartido y WordPress", "VPS con acceso root", "Cloud con escalado automático", "Servidores dedicados"],
        "voz": "Ofrecemos hosting compartido para empezar, planes optimizados para WordPress, servidores virtuales con "
        "recursos garantizados, nube con escalado automático y servidores dedicados para los proyectos más exigentes. "
        "En la sección Planes puedes buscar, comparar y descargar la ficha técnica en PDF de cada uno.",
    },
    {
        "titulo": "Todo incluido",
        "puntos": ["Certificado SSL gratis", "Protección contra malware", "Respaldos automáticos", "99.9 % de disponibilidad"],
        "voz": "Todos los planes incluyen certificado SSL gratis, protección contra malware, respaldos automáticos y una "
        "garantía de disponibilidad del noventa y nueve punto nueve por ciento. Además, migramos tu sitio desde otro "
        "proveedor sin costo.",
    },
    {
        "titulo": "Promoción del mes",
        "puntos": ["Dominio .com gratis el primer año", "Migración sin costo", "30 días de garantía de reembolso"],
        "voz": "Este mes, al contratar cualquier plan anual te regalamos tu dominio punto com durante el primer año y la "
        "migración de tu sitio. Y tienes treinta días de garantía: si no quedas satisfecho, te devolvemos tu dinero.",
    },
    {
        "titulo": "Consejos para elegir",
        "puntos": ["1. ¿Empiezas? Plan compartido", "2. ¿Tienda en línea? WP Pro o VPS", "3. Revisa respaldos y soporte"],
        "voz": "Tres consejos para elegir bien. Uno: si estás empezando con un blog o una página informativa, un plan "
        "compartido es suficiente. Dos: si tienes una tienda en línea, elige WordPress Pro o un servidor virtual para "
        "tener más velocidad. Tres: revisa siempre la frecuencia de los respaldos y el tipo de soporte que incluye el plan.",
    },
    {
        "titulo": "Ayuda las 24 horas",
        "puntos": ["Chat con Hosti a cualquier hora", "Formulario de contacto", "contacto@thewebhosting.test"],
        "voz": "¿Tienes dudas? Nuestro asistente Hosti te responde en el chat a cualquier hora del día, y nuestro equipo "
        "te atiende desde el formulario de contacto. Gracias por ver este video. The Web Hosting: tu sitio en línea, hoy mismo.",
    },
]

AUDIO_BIENVENIDA = (
    "Hola, gracias por visitar The Web Hosting. Tenemos planes de hosting compartido desde cuarenta y nueve pesos al mes, "
    "planes optimizados para WordPress, servidores virtuales, nube y servidores dedicados. Todos incluyen certificado SSL "
    "gratis, respaldos automáticos y soporte las veinticuatro horas. Este mes, al contratar un plan anual, tu dominio punto "
    "com es gratis el primer año y migramos tu sitio sin costo. Si tienes preguntas, abre el chat de ayuda en la esquina "
    "inferior derecha o escríbenos desde la sección de contacto. ¡Te esperamos!"
)


def fuente(nombre, tamano):
    return ImageFont.truetype(str(FUENTES / nombre), tamano)


def sintetizar(texto, destino, temporal):
    """Narración con la voz del sistema (System.Speech) en un WAV."""
    archivo_texto = temporal / f"{destino.stem}.txt"
    archivo_texto.write_text(texto, encoding="utf-8")
    script = (
        "Add-Type -AssemblyName System.Speech;"
        "$s = New-Object System.Speech.Synthesis.SpeechSynthesizer;"
        f"$s.SelectVoice('{VOZ}'); $s.Rate = -1;"
        f"$s.SetOutputToWaveFile('{destino}');"
        f"$s.Speak([IO.File]::ReadAllText('{archivo_texto}', [Text.Encoding]::UTF8));"
        "$s.Dispose()"
    )
    subprocess.run(["powershell", "-NoProfile", "-Command", script], check=True)


def duracion_wav(ruta):
    with wave.open(str(ruta)) as w:
        return w.getnframes() / w.getframerate()


def logo(draw, x, y, escala=1.0):
    t = lambda v: int(v * escala)
    draw.rounded_rectangle([x, y, x + t(64), y + t(64)], radius=t(14), fill=MARCA)
    for i, color in enumerate([(218, 229, 254), (172, 194, 246), (255, 255, 255)]):
        yy = y + t(14 + i * 13)
        draw.rounded_rectangle([x + t(14), yy, x + t(50), yy + t(10)], radius=t(3), fill=color)
        draw.ellipse([x + t(40), yy + t(2), x + t(46), yy + t(8)], fill=MARCA)


def diapositiva(escena, indice, total, destino):
    img = Image.new("RGB", (ANCHO, ALTO), MARCA_OSCURA)
    # Degradado diagonal de marca.
    capa = Image.new("RGB", (ANCHO, ALTO))
    pix = capa.load()
    for xx in range(0, ANCHO, 4):
        for yy in range(0, ALTO, 4):
            f = min(1, (xx / ANCHO) * 0.7 + (yy / ALTO) * 0.3)
            c = tuple(int(MARCA_OSCURA[k] + (MARCA[k] - MARCA_OSCURA[k]) * f) for k in range(3))
            for dx in range(4):
                for dy in range(4):
                    if xx + dx < ANCHO and yy + dy < ALTO:
                        pix[xx + dx, yy + dy] = c
    img.paste(capa)

    # Formas que se superponen (estilo Fluent), difuminadas en el fondo.
    formas = Image.new("RGBA", (ANCHO, ALTO), (0, 0, 0, 0))
    d = ImageDraw.Draw(formas)
    a = ACENTOS[indice % len(ACENTOS)]
    d.ellipse([880, 380, 1280, 780], fill=a + (150,))
    d.ellipse([1010, 60, 1230, 280], fill=ACENTOS[(indice + 1) % 4] + (130,))
    d.rounded_rectangle([780, 180, 1060, 460], radius=40, fill=(255, 255, 255, 40))
    formas = formas.filter(ImageFilter.GaussianBlur(2))
    img.paste(formas, (0, 0), formas)

    draw = ImageDraw.Draw(img)
    logo(draw, 80, 64, 0.75)
    draw.text((140, 68), "The Web Hosting", font=fuente("seguisb.ttf", 30), fill="white")
    draw.text((ANCHO - 80, 70), f"{indice + 1} / {total}", font=fuente("segoeui.ttf", 24), fill=(218, 229, 254), anchor="ra")

    titulo = "\n".join(textwrap.wrap(escena["titulo"], 22))
    draw.multiline_text((80, 180), titulo, font=fuente("seguisb.ttf", 72), fill="white", spacing=6)
    alto_titulo = draw.multiline_textbbox((80, 180), titulo, font=fuente("seguisb.ttf", 72), spacing=6)[3]

    y = alto_titulo + 48
    for punto in escena["puntos"]:
        draw.ellipse([84, y + 14, 98, y + 28], fill=a)
        draw.text((118, y), punto, font=fuente("segoeui.ttf", 36), fill=(243, 247, 254))
        y += 60
    img.save(destino, quality=90)


def tiempo_vtt(s):
    h, rem = divmod(s, 3600)
    m, seg = divmod(rem, 60)
    return f"{int(h):02d}:{int(m):02d}:{seg:06.3f}"


def frases(texto):
    partes, actual = [], ""
    for palabra in texto.split():
        actual = f"{actual} {palabra}".strip()
        if palabra.endswith((".", "?", ":")) or len(actual) > 90:
            partes.append(actual)
            actual = ""
    if actual:
        partes.append(actual)
    return partes


def main():
    if not shutil.which("ffmpeg"):
        sys.exit("No se encontró ffmpeg en el PATH.")
    SALIDA.mkdir(parents=True, exist_ok=True)
    temporal = Path(tempfile.mkdtemp(prefix="twh-media-"))
    print("Trabajando en", temporal)

    clips, cues, inicio = [], [], 0.0
    PAUSA = 0.9
    for i, escena in enumerate(ESCENAS):
        wav = temporal / f"voz{i}.wav"
        png = temporal / f"diapo{i}.png"
        clip = temporal / f"clip{i}.mp4"
        sintetizar(escena["voz"], wav, temporal)
        diapositiva(escena, i, len(ESCENAS), png)
        dur = duracion_wav(wav) + PAUSA
        subprocess.run(
            [
                "ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-framerate", "30", "-i", str(png), "-i", str(wav),
                "-af", f"apad=pad_dur={PAUSA}", "-t", f"{dur:.3f}",
                "-vf", f"fade=t=in:st=0:d=0.4,fade=t=out:st={dur - 0.4:.3f}:d=0.4,format=yuv420p",
                "-c:v", "libx264", "-tune", "stillimage", "-preset", "medium", "-crf", "24",
                "-c:a", "aac", "-b:a", "128k", "-ar", "44100", "-ac", "1", str(clip),
            ],
            check=True,
        )
        clips.append(clip)
        # Subtítulos: el tiempo de la escena se reparte entre frases según su longitud.
        partes = frases(escena["voz"])
        habla = dur - PAUSA
        total_chars = sum(len(p) for p in partes)
        t = inicio
        for p in partes:
            d_p = habla * len(p) / total_chars
            cues.append((t, t + d_p, p))
            t += d_p
        inicio += dur
        if i == 0:
            Image.open(png).convert("RGB").save(SALIDA / "video-poster.jpg", quality=82, optimize=True, progressive=True)

    lista = temporal / "lista.txt"
    lista.write_text("".join(f"file '{c.as_posix()}'\n" for c in clips), encoding="utf-8")
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lista), "-c", "copy",
         "-movflags", "+faststart", str(SALIDA / "video-promocional.mp4")],
        check=True,
    )

    vtt = ["WEBVTT", ""]
    for n, (a, b, texto) in enumerate(cues, 1):
        vtt += [str(n), f"{tiempo_vtt(a)} --> {tiempo_vtt(b)}", texto, ""]
    (SALIDA / "video-promocional.vtt").write_text("\n".join(vtt), encoding="utf-8")

    wav = temporal / "bienvenida.wav"
    sintetizar(AUDIO_BIENVENIDA, wav, temporal)
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-af", "loudnorm", "-c:a", "libmp3lame", "-b:a", "64k",
         "-ac", "1", str(SALIDA / "mensaje-bienvenida.mp3")],
        check=True,
    )

    duracion_audio = duracion_wav(wav)
    shutil.rmtree(temporal, ignore_errors=True)
    print(json.dumps({"video_segundos": round(inicio, 1), "audio_segundos": round(duracion_audio, 1)}))
    print("Listo:", SALIDA)


if __name__ == "__main__":
    main()
