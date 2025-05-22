import json
import re

def parse_word_text(text_block):
    data = {
        "title": None,
        "teleprompterEs": "",
        "teleprompterEn": "",
        "videoDescriptionEs": "",
        "videoDescriptionEn": "",
        "tagsListEs": "",
        "tagsListEn": "",
        "pinnedCommentEs": "",
        "pinnedCommentEn": "",
        "tiktokDescriptionEs": "",
        "tiktokDescriptionEn": "",
        "twitterPostEs": "",
        "twitterPostEn": "",
        "facebookDescriptionEs": "",
        "facebookDescriptionEn": "",
        "tags": [] # This will be derived from tagsListEs
    }

    # Clean text and split into lines
    lines = text_block.strip().split('\n')

    # Detect if it's the new numbered format
    if lines and re.match(r'^\d+\.\s', lines[0]):
        return parse_numbered_format(text_block, data)
    else:
        # Use original format
        return parse_original_format(text_block, data)

def truncate_twitter_post(text, max_length=180):
    """Truncates text to not exceed Twitter's limit, trying to cut at a space."""
    if len(text) <= max_length:
        return text
    # Truncate at the last space before the limit
    truncated = text[:max_length].rsplit(' ', 1)[0]
    return truncated

def parse_original_format(text_block, data):
    lines = text_block.strip().split('\n')

    # Extract title (first non-empty line)
    for i, line in enumerate(lines):
        if line.strip():
            data["title"] = line.strip()
            lines = lines[i+1:]
            break

    i = 0
    while i < len(lines):
        line = lines[i].strip()
        line_lower = line.lower()

        # Dictionary of sections and their fields
        section_map = {
            "descripción optimizada": ("videoDescriptionEs", "videoDescriptionEn"),
            "description optimized": ("videoDescriptionEs", "videoDescriptionEn"),
            "comentario para pinear": ("pinnedCommentEs", "pinnedCommentEn"),
            "pinned comment": ("pinnedCommentEs", "pinnedCommentEn"),
            "descripción simplificada": ("tiktokDescriptionEs", "tiktokDescriptionEn"),
            "simplified description": ("tiktokDescriptionEs", "tiktokDescriptionEn"),
            "descripción para x": ("twitterPostEs", "twitterPostEn"),
            "description for x": ("twitterPostEs", "twitterPostEn"),
            "descripción para facebook": ("facebookDescriptionEs", "facebookDescriptionEn"),
            "description for facebook": ("facebookDescriptionEs", "facebookDescriptionEn"),
            "lista de tags": ("tagsListEs", "tagsListEn"),
            "tags list": ("tagsListEs", "tagsListEn"),
            "teleprompter": ("teleprompterEs", "teleprompterEn"),
            "tags": ("tags", "tags"),
            "etiquetas": ("tags", "tags")
        }

        matched_section = None
        for key in section_map.keys():
            if line_lower.startswith(key):
                matched_section = key
                break

        if matched_section:
            # Detect language in header
            campo_es, campo_en = section_map[matched_section]
            is_es = any(x in line_lower for x in ["español", "(español"])
            is_en = any(x in line_lower for x in ["inglés", "(inglés", "english", "(english"])
            i += 1
            content = []
            current_lang = None
            es_content = []
            en_content = []

            # Find the start of the next section
            while i < len(lines) and not any(lines[i].strip().lower().startswith(k) for k in section_map.keys()):
                line = lines[i].strip()
                if not line:
                    i += 1
                    continue

                # Detect language change
                if line.lower().startswith("español:"):
                    current_lang = "es"
                    i += 1
                    continue
                elif line.lower().startswith("inglés:") or line.lower().startswith("ingles:"):
                    current_lang = "en"
                    i += 1
                    continue

                # Assign content according to current language
                if current_lang == "es":
                    es_content.append(line)
                elif current_lang == "en":
                    en_content.append(line)
                else:
                    # If no language detected, use heuristics
                    if any(x in line for x in ["¿", "á", "é", "í", "ó", "ú", "ñ"]):
                        es_content.append(line)
                    else:
                        en_content.append(line)
                i += 1

            # Process content according to section type
            if campo_es == "tags" and campo_en == "tags":
                # For specific tags section, take only the first 3
                all_tags = []
                # Process Spanish content
                if es_content:
                    es_tags = [tag.strip() for tag in ", ".join(es_content).split(",") if tag.strip()]
                    all_tags.extend(es_tags)
                # Process English content
                if en_content:
                    en_tags = [tag.strip() for tag in ", ".join(en_content).split(",") if tag.strip()]
                    all_tags.extend(en_tags)
                # Remove duplicates and take first 3
                data["tags"] = list(dict.fromkeys(all_tags))[:3]
            elif campo_es == "tagsListEs" or campo_en == "tagsListEn":
                # For tags, join with commas and clean
                if es_content:
                    data["tagsListEs"] = ", ".join(es_content).strip()
                if en_content:
                    data["tagsListEn"] = ", ".join(en_content).strip()
                # Also update tags field with first 3 unique tags
                all_tags = []
                if es_content:
                    es_tags = [tag.strip() for tag in ", ".join(es_content).split(",") if tag.strip()]
                    all_tags.extend(es_tags)
                if en_content:
                    en_tags = [tag.strip() for tag in ", ".join(en_content).split(",") if tag.strip()]
                    all_tags.extend(en_tags)
                data["tags"] = list(dict.fromkeys(all_tags))[:3]
            else:
                # For other sections, join with line breaks
                if es_content:
                    data[campo_es] = "\n".join(es_content)
                if en_content:
                    data[campo_en] = "\n".join(en_content)

            # Truncate if it's a Twitter post
            if campo_es == "twitterPostEs" and data[campo_es]:
                data[campo_es] = truncate_twitter_post(data[campo_es])
            if campo_en == "twitterPostEn" and data[campo_en]:
                data[campo_en] = truncate_twitter_post(data[campo_en])

            continue
        else:
            i += 1
    return data

def parse_numbered_format(text_block, data):
    # Clean text and split into lines
    lines = text_block.strip().split('\n')

    # Initialize variables to store sections
    current_section = None
    section_content = {}
    section_number = 0
    i = 0  # Initialize the counter

    while i < len(lines):
        line = lines[i].strip()
        line_lower = line.lower()

        # Check if it's a new numbered section
        if re.match(r'^\d+\.\s', line):
            # Save previous section if it exists
            if current_section:
                save_section_content(data, current_section, section_content)

            # Extract section number and title
            match = re.match(r'(\d+)\.\s*(.*)', line)
            if match:
                section_number = int(match.group(1))
                section_title = match.group(2).strip()
                current_section = section_title
                section_content = {"es": "", "en": ""}
            i += 1
            continue

        # Capture content until the next numbered section
        if current_section:
            if not section_content.get("es") and not section_content.get("en"):
                # If no content yet, add to the first available language
                if "(español)" in current_section.lower() or "(spanish)" in current_section.lower():
                    section_content["es"] = line
                elif "(inglés)" in current_section.lower() or "(english)" in current_section.lower():
                    section_content["en"] = line
                else:
                    # If no language specified, use heuristics
                    if any(x in line for x in ["¿", "á", "é", "í", "ó", "ú", "ñ"]):
                        section_content["es"] = line
                    else:
                        section_content["en"] = line
            else:
                # Append to existing content
                if section_content.get("es"):
                    section_content["es"] += "\n" + line
                elif section_content.get("en"):
                    section_content["en"] += "\n" + line
        i += 1

    # Process the last section
    if current_section:
        save_section_content(data, current_section, section_content)

    # Derive tags from tagsListEs if it exists
    if data.get("tagsListEs"):
        # Try to find a comma separator
        if "," in data["tagsListEs"]:
            # Limit to only the first 3 tags
            all_tags = [tag.strip() for tag in data["tagsListEs"].split(",")]
            data["tags"] = all_tags[:3]  # Take only the first 3
        else:
            # If no commas, use the full text as a single tag
            data["tags"] = [data["tagsListEs"].strip()][:1]  # Maximum 1 tag if no commas

    return data

def process_numbered_section(data, section_title, content):
    """Process numbered sections of the new format"""
    section_title_lower = section_title.lower()

    # Teleprompter Script (English)
    if "script de teleprompter" in section_title_lower or "teleprompter script" in section_title_lower:
        if "(inglés)" in section_title_lower or "(english)" in section_title_lower:
            data["teleprompterEn"] = content.strip()
        else:
            data["teleprompterEs"] = content.strip()

    # Attractive Title (SEO)
    elif "título" in section_title_lower or "title" in section_title_lower:
        # Look for specific Spanish and English lines
        for line in content.split('\n'):
            line = line.strip()
            if line.startswith("Español:"):
                data["title"] = line.replace("Español:", "").strip()
            elif line.startswith("Inglés:"):
                # We could also store the English title if needed
                pass

    # YouTube Description
    elif "descripción para youtube" in section_title_lower or "youtube description" in section_title_lower:
        if "(español)" in section_title_lower or "spanish" in section_title_lower:
            data["videoDescriptionEs"] = content.strip()
        elif "(inglés)" in section_title_lower or "(english)" in section_title_lower:
            data["videoDescriptionEn"] = content.strip()

    # Tags para YouTube
    elif "tags para youtube" in section_title_lower or "youtube tags" in section_title_lower:
        if "(español)" in section_title_lower or "spanish" in section_title_lower:
            data["tagsListEs"] = content.strip()
        elif "(inglés)" in section_title_lower or "(english)" in section_title_lower:
            data["tagsListEn"] = content.strip()

    # Comentario para Pinear
    elif "comentario para pinear" in section_title_lower or "pinned comment" in section_title_lower:
        if "(español)" in section_title_lower or "spanish" in section_title_lower:
            data["pinnedCommentEs"] = content.strip()
        elif "(inglés)" in section_title_lower or "(english)" in section_title_lower:
            data["pinnedCommentEn"] = content.strip()

    # Descripción para TikTok
    elif "descripción para tiktok" in section_title_lower or "tiktok description" in section_title_lower:
        if "(español)" in section_title_lower or "spanish" in section_title_lower:
            data["tiktokDescriptionEs"] = content.strip()
        elif "(inglés)" in section_title_lower or "(english)" in section_title_lower:
            data["tiktokDescriptionEn"] = content.strip()

    # Descripción para X/Twitter
    elif "descripción para x" in section_title_lower or "x description" in section_title_lower:
        if "(español)" in section_title_lower or "spanish" in section_title_lower:
            data["twitterPostEs"] = content.strip()
        elif "(inglés)" in section_title_lower or "(english)" in section_title_lower:
            data["twitterPostEn"] = content.strip()

    # Descripción para Facebook
    elif "descripción para facebook" in section_title_lower or "facebook description" in section_title_lower:
        if "(español)" in section_title_lower or "spanish" in section_title_lower:
            data["facebookDescriptionEs"] = content.strip()
        elif "(inglés)" in section_title_lower or "(english)" in section_title_lower:
            data["facebookDescriptionEn"] = content.strip()

def is_new_section(line):
    """Determines if a line marks the start of a new section"""
    section_markers = [
        "teleprompter",
        "description (spanish)", "description (english)",
        "tags (spanish)", "tags (english)",
        "pinned comment (spanish)", "pinned comment (english)",
        "tiktok description (spanish)", "tiktok description (english)",
        "x post (spanish)", "x post (english)",
        "facebook post (spanish)", "facebook post (english)",
        "comentario", "lista de tags",
        "descripción simplificada", "descripcion simplificada",
        "post para x", "descripción para x",
        "descripción para un post", "descripcion para un post"
    ]

    return any(line.startswith(marker) or line == marker for marker in section_markers)

def extract_tags(text):
    """Extracts hashtags and keywords from text"""
    # First extract hashtags
    hashtags = re.findall(r'#\w+', text)
    
    # Then extract keywords (words that are not hashtags)
    words = text.split()
    keywords = [word for word in words if not word.startswith('#') and len(word) > 2]
    
    # Combine both lists and remove duplicates
    all_tags = list(set(hashtags + keywords))
    
    # Return first 20 tags to avoid length issues
    return all_tags[:20]

def save_section_content(data, section_title, section_content):
    section_title_lower = section_title.lower()

    # Teleprompter Script
    if "script de teleprompter" in section_title_lower or "teleprompter script" in section_title_lower:
        if "(inglés)" in section_title_lower or "(english)" in section_title_lower:
            data["teleprompterEn"] = section_content.get("en", "").strip()
        else:
            data["teleprompterEs"] = section_content.get("es", "").strip()

    # Attractive Title (SEO)
    elif "título" in section_title_lower or "title" in section_title_lower:
        # Look for specific Spanish and English lines
        content = section_content.get("es", "") + "\n" + section_content.get("en", "")
        for line in content.split('\n'):
            line = line.strip()
            if line.startswith("Español:"):
                data["title"] = line.replace("Español:", "").strip()
            elif line.startswith("Inglés:"):
                # We could also store the English title if needed
                pass

    # YouTube Description
    elif "descripción para youtube" in section_title_lower or "youtube description" in section_title_lower:
        if "(español)" in section_title_lower or "spanish" in section_title_lower:
            data["videoDescriptionEs"] = section_content.get("es", "").strip()
        elif "(inglés)" in section_title_lower or "(english)" in section_title_lower:
            data["videoDescriptionEn"] = section_content.get("en", "").strip()

    # Tags List
    elif "lista de tags" in section_title_lower or "tags list" in section_title_lower:
        if "(español)" in section_title_lower or "spanish" in section_title_lower:
            data["tagsListEs"] = section_content.get("es", "").strip()
        elif "(inglés)" in section_title_lower or "(english)" in section_title_lower:
            data["tagsListEn"] = section_content.get("en", "").strip()

    # Pinned Comment
    elif "comentario pineado" in section_title_lower or "pinned comment" in section_title_lower:
        if "(español)" in section_title_lower or "spanish" in section_title_lower:
            data["pinnedCommentEs"] = section_content.get("es", "").strip()
        elif "(inglés)" in section_title_lower or "(english)" in section_title_lower:
            data["pinnedCommentEn"] = section_content.get("en", "").strip()

    # TikTok Description
    elif "descripción para tiktok" in section_title_lower or "tiktok description" in section_title_lower:
        if "(español)" in section_title_lower or "spanish" in section_title_lower:
            data["tiktokDescriptionEs"] = section_content.get("es", "").strip()
        elif "(inglés)" in section_title_lower or "(english)" in section_title_lower:
            data["tiktokDescriptionEn"] = section_content.get("en", "").strip()

    # X/Twitter Post
    elif "post para x" in section_title_lower or "x post" in section_title_lower:
        if "(español)" in section_title_lower or "spanish" in section_title_lower:
            data["twitterPostEs"] = truncate_twitter_post(section_content.get("es", "").strip())
        elif "(inglés)" in section_title_lower or "(english)" in section_title_lower:
            data["twitterPostEn"] = truncate_twitter_post(section_content.get("en", "").strip())

    # Facebook Description
    elif "descripción para facebook" in section_title_lower or "facebook description" in section_title_lower:
        if "(español)" in section_title_lower or "spanish" in section_title_lower:
            data["facebookDescriptionEs"] = section_content.get("es", "").strip()
        elif "(inglés)" in section_title_lower or "(english)" in section_title_lower:
            data["facebookDescriptionEn"] = section_content.get("en", "").strip()

def generate_curl_command(parsed_data, api_url):
    payload = {
        "title": parsed_data.get("title", "Unspecified Title"),
        "publishedEs": False,
        "publishedEn": False,
        "publishedDateEs": None,
        "publishedDateEn": None,
        "publishedUrlEs": "",
        "publishedUrlEn": "",
        "teleprompterEs": parsed_data.get("teleprompterEs", ""),
        "teleprompterEn": parsed_data.get("teleprompterEn", ""),
        "videoDescriptionEs": parsed_data.get("videoDescriptionEs", ""),
        "videoDescriptionEn": parsed_data.get("videoDescriptionEn", ""),
        "tagsListEs": parsed_data.get("tagsListEs", ""),
        "tagsListEn": parsed_data.get("tagsListEn", ""),
        "pinnedCommentEs": parsed_data.get("pinnedCommentEs", ""),
        "pinnedCommentEn": parsed_data.get("pinnedCommentEn", ""),
        "tiktokDescriptionEs": parsed_data.get("tiktokDescriptionEs", ""),
        "tiktokDescriptionEn": parsed_data.get("tiktokDescriptionEn", ""),
        "twitterPostEs": parsed_data.get("twitterPostEs", ""),
        "twitterPostEn": parsed_data.get("twitterPostEn", ""),
        "facebookDescriptionEs": parsed_data.get("facebookDescriptionEs", ""),
        "facebookDescriptionEn": parsed_data.get("facebookDescriptionEn", ""),
        "tags": parsed_data.get("tags", [])
    }

    # First generate JSON without escaping quotes
    json_payload_str = json.dumps(payload, indent=2, ensure_ascii=False)

    # Then escape all single quotes in the final JSON
    # The bash escape for a single quote is: ' -> '\''
    escaped_json = json_payload_str.replace("'", "'\\''")

    # The curl command with consistent formatting
    curl_command = f"curl -X POST {api_url} \\\n  -H \"Content-Type: application/json\" \\\n  -d '{escaped_json}'"

    return curl_command

def generate_update_curl_command(parsed_data, api_url, content_id):
    """
    Generates a curl command to update an existing content.

    Args:
        parsed_data (dict): Parsed document data
        api_url (str): Base API URL
        content_id (str): ID of the content to update

    Returns:
        str: Curl command to update the entry
    """
    payload = {
        "title": parsed_data.get("title", "Unspecified Title"),
        "teleprompterEs": parsed_data.get("teleprompterEs", ""),
        "teleprompterEn": parsed_data.get("teleprompterEn", ""),
        "videoDescriptionEs": parsed_data.get("videoDescriptionEs", ""),
        "videoDescriptionEn": parsed_data.get("videoDescriptionEn", ""),
        "tagsListEs": parsed_data.get("tagsListEs", ""),
        "tagsListEn": parsed_data.get("tagsListEn", ""),
        "pinnedCommentEs": parsed_data.get("pinnedCommentEs", ""),
        "pinnedCommentEn": parsed_data.get("pinnedCommentEn", ""),
        "tiktokDescriptionEs": parsed_data.get("tiktokDescriptionEs", ""),
        "tiktokDescriptionEn": parsed_data.get("tiktokDescriptionEn", ""),
        "twitterPostEs": parsed_data.get("twitterPostEs", ""),
        "twitterPostEn": parsed_data.get("twitterPostEn", ""),
        "facebookDescriptionEs": parsed_data.get("facebookDescriptionEs", ""),
        "facebookDescriptionEn": parsed_data.get("facebookDescriptionEn", ""),
        "tags": parsed_data.get("tags", [])
    }

    # Generate JSON without escaping quotes
    json_payload_str = json.dumps(payload, indent=2, ensure_ascii=False)

    # Escape all single quotes in the final JSON
    escaped_json = json_payload_str.replace("'", "'\\''")

    # The curl command with consistent formatting using PUT for update
    update_url = f"{api_url}/{content_id}"
    curl_command = f"curl -X PUT {update_url} \\\n  -H \"Content-Type: application/json\" \\\n  -d '{escaped_json}'"

    return curl_command

# --- Main execution ---
if __name__ == "__main__":
    api_url = "http://localhost:3000/api/contents" # Or your actual API endpoint

    print("Paste the complete Word text here (Ctrl+D or Ctrl+Z and Enter to finish in Unix/Windows):")
    word_text_input = []
    while True:
        try:
            line = input()
            word_text_input.append(line)
        except EOFError:
            break

    full_text = "\n".join(word_text_input)

    if not full_text.strip():
        print("\nNo text entered. Using example text for demonstration.")
        # Example text for the Super Bowl content provided by the user
        full_text = """
¿Es la Inteligencia Artificial el Último Gran Invento? 🤖 OpenAI Revoluciona la Super Bowl
Guion
(0-5 segundos)
Visual: Montaje de la animación puntillista del anuncio de OpenAI, destacando el fuego, la rueda y terminando con la IA. Texto en pantalla: "¿Es la IA el próximo gran avance?"
 Narrador: "¿Es la inteligencia artificial el próximo gran invento de la humanidad? OpenAI acaba de gastar 14 millones de dólares para convencernos de que sí."

(5-15 segundos)
Visual: Cortes rápidos entre el anuncio del Super Bowl y una toma del narrador frente a una pizarra con "OpenAI" escrito en ella.
 Narrador: "El Super Bowl no es solo deporte. Es también el escaparate donde las grandes empresas tecnológicas muestran su visión del futuro. Y este año, OpenAI ha dado mucho de qué hablar con un anuncio que no vendía coches, ni refrescos, ni móviles… sino inteligencia artificial."

(15-30 segundos)
Visual: Muestra ejemplos prácticos de la IA en acción: redactando un plan de negocio, traduciendo idiomas, resumiendo un artículo de investigación y ayudando a un estudiante con sus deberes.
 Narrador: "En su anuncio, OpenAI no habló de robots que dominen el mundo ni de superinteligencias que nos controlen. Mostró cómo la IA ya está ayudando en cosas del día a día: desde crear planes de negocio hasta traducir idiomas, resumir investigaciones complejas o incluso ayudar a los niños con sus deberes. Es decir, la IA como una herramienta práctica y accesible para todos."

(30-45 segundos)
Visual: Imágenes detrás de cámaras, si están disponibles, o material de archivo de animadores trabajando. Contrasta esto con breves clips de la IA Sora de OpenAI generando ideas para vídeos.
 Narrador: "Pero aquí viene lo interesante. Aunque OpenAI utilizó su IA llamada Sora para planificar el anuncio, la animación final fue completamente hecha por humanos. ¿Por qué? Quizás para tranquilizar a quienes temen que la IA sustituya los trabajos creativos. Es un mensaje sutil, pero importante: la IA no está aquí para reemplazarnos, sino para complementarnos."

(45-60 segundos)
Visual: Pantalla dividida. En un lado, un clip de Sam Altman. En el otro, titulares de noticias sobre ética de la IA o la pérdida de empleos.
 Narrador: "El director de marketing de OpenAI lo llamó 'el amanecer de la era de la inteligencia'. Pero, ¿es realmente el inicio de algo revolucionario o simplemente una estrategia de marketing bien pensada? Porque, seamos sinceros, OpenAI no solo está vendiendo tecnología, está vendiendo confianza. Y eso es algo que no se gana fácilmente, sobre todo cuando hablamos de una tecnología tan disruptiva como la inteligencia artificial."

(60-75 segundos)
Visual: Fragmentos del "desastre" del anuncio de IA de Google seguidos del anuncio de OpenAI. Texto en pantalla: "La autenticidad importa."
 Narrador: "Recordemos que no todas las empresas han acertado con sus anuncios de IA. Google, por ejemplo, tuvo un tropiezo importante con su presentación de Bard, su modelo de IA, que generó respuestas incorrectas en directo. OpenAI, en cambio, ha apostado por un enfoque más humano y auténtico, mostrando cómo la IA puede mejorar nuestras vidas sin generar miedo."

(75-90 segundos)
Visual: Cortes rápidos de personas diversas utilizando IA en sus móviles, tablets y portátiles.
 Narrador: "La inteligencia artificial ya está aquí. Es poderosa, sí, pero también plantea muchas preguntas. ¿Qué trabajos cambiará? ¿Qué impacto tendrá en la educación, en la creatividad, en nuestra forma de comunicarnos? Y, sobre todo, ¿cómo podemos asegurarnos de que esta tecnología se utilice de forma ética y responsable?"

(90-110 segundos)
Visual: Imágenes de archivo de avances tecnológicos históricos: la rueda, la imprenta, la electricidad, y luego la IA.
 Narrador: "La historia nos ha enseñado que las grandes innovaciones siempre generan dudas al principio. La rueda, la imprenta, la electricidad… todas fueron vistas con escepticismo en su momento. ¿Será la inteligencia artificial el próximo gran salto de la humanidad? ¿O estamos inflando una burbuja tecnológica que podría estallar?"

(110-120 segundos)
Visual: Pantalla final con la pregunta: "¿Está la IA sobrevalorada o es nuestra mejor apuesta?" Texto en pantalla: "Déjame tu opinión en los comentarios."
 Narrador: "Y tú, ¿qué opinas? ¿Es la IA el próximo fuego o rueda, una innovación que cambiará todo? ¿O solo es otra moda pasajera? Déjame tu comentario y no olvides darle a like y suscribirte a mi canal para más noticias sobre tecnología e inteligencia artificial. Esto ha sido The IT Guy y nos vemos en la próxima."

Teleprompter
Español:
 ¿Es la Inteligencia Artificial el último gran invento de la humanidad? OpenAI acaba de gastar 14 millones de dólares para convencernos de que sí. La Super Bowl no es solo un evento deportivo, es también el escaparate donde las grandes empresas tecnológicas muestran su visión de futuro. Y este año OpenAI ha dado mucho de qué hablar con un anuncio que no vendía ni coches, ni refrescos ni móviles, sino Inteligencia Artificial. Hola, soy Colin y hoy te voy a hablar del anuncio de OpenAI en la Super Bowl. En lugar de imágenes con robots futuristas o Inteligencia Artificiales controlando el mundo, lo que realmente mostraron fue cómo la IA está mejorando nuestro día a día. Nos explicaron cómo puede ayudarnos a crear planes de negocio, traducir idiomas, resumir investigaciones complejas e incluso apoyar a los niños con sus deberes. Es decir, la IA se está convirtiendo en una herramienta práctica y accesible para todos. Pero aquí viene lo interesante. Aunque OpenAI utilizó su IA llamada Sora para planificar el anuncio, la animación fue completamente hecha por humanos. ¿Por qué? Quizás para tranquilizar a quienes temen que la IA sustituye los trabajos creativos. El director de marketing de OpenAI lo llamó el amanecer de la era de la inteligencia, pero ¿es realmente el inicio de algo revolucionario o simplemente una estrategia de marketing bien pensada? Recordemos que no todas las empresas han acertado con sus anuncios de IA. Google, por ejemplo, tuvo un tropiezo importante con su presentación de Bard, su modelo de IA, que generó respuestas incorrectas en directo. OpenAI, en cambio, ha apostado por un enfoque más humano y auténtico, mostrando cómo la IA puede mejorar nuestras vidas sin generar miedo. La inteligencia artificial ya está aquí. Es poderosa, sí, pero también plantea muchas preguntas. ¿Qué trabajos cambiará? ¿Qué impacto tendrá en la educación, en la creatividad, en nuestra forma de comunicarnos? Pero ¿tú qué opinas? ¿Será la inteligencia artificial el último gran salto de la humanidad e incluso quizás el último? Déjame tu comentario y no olvides darle like y suscribirte a mi canal para más noticias sobre tecnología e inteligencia artificial. Yo soy Colin, esto ha sido The IT Guy y nos vemos en la próxima.

Ingles:
Is Artificial Intelligence Humanity's Last Great Invention?, OpenAI has just spent 14 million dollars to convince us that it might be.
The Super Bowl is not just a sporting event; it's also the stage where major tech companies showcase their vision of the future. And this year, OpenAI gave us plenty to talk about with an ad that didn't sell cars, sodas, or phones—it sold Artificial Intelligence.
Hi, I'm Colin, and today I'm going to talk about OpenAI's ad during the Super Bowl. Instead of showing images of futuristic robots or AIs taking over the world, what they really showcased was how AI is improving our daily lives. They explained how it can help us create business plans, translate languages, summarize complex research, and even support kids with their homework. In short, AI is becoming a practical and accessible tool for everyone.
But here's the interesting part. Although OpenAI used its AI, called Sora, to plan the ad, the animation was entirely created by humans. Why? Perhaps to reassure those who fear that AI will replace creative jobs. OpenAI's marketing director called it the dawn of the age of intelligence. But is it really the beginning of something revolutionary, or just a well-thought-out marketing strategy?
Let's not forget that not all companies have succeeded with their AI campaigns. Google, for example, had a major stumble with its presentation of Bard, their AI model, which gave incorrect answers live. OpenAI, on the other hand, took a more human and authentic approach, showing how AI can enhance our lives without creating fear.
Artificial intelligence is already here. It's powerful, yes, but it also raises many questions. What jobs will it change? What impact will it have on education, creativity, and how we communicate?
But what do you think? Will artificial intelligence be humanity's last great leap forward—or perhaps even the last one? Leave me your thoughts in the comments, and don't forget to like and subscribe to my channel for more news about technology and artificial intelligence.
I'm Colin, this has been The IT Guy, and I'll see you in the next one!

Descripción optimizada para SEO (español)
🌟 ¿Es la Inteligencia Artificial el último gran invento de la humanidad? 🌟
OpenAI ha revolucionado la Super Bowl con un anuncio que no vendía coches ni refrescos, sino Inteligencia Artificial. Descubre cómo la IA está transformando nuestras vidas: desde crear planes de negocio hasta ayudar a los niños con sus deberes. Pero, ¿es este el amanecer de una nueva era o solo una estrategia de marketing? 🤔
💡 En este video, exploramos:
Cómo OpenAI utilizó su IA llamada Sora para planificar el anuncio.
Por qué la animación fue creada por humanos y no por IA.
El impacto de la IA en la educación, creatividad y comunicación.
📌 ¡Déjame tu opinión en los comentarios!
 🔔 No olvides suscribirte para más contenido sobre tecnología e inteligencia artificial.
🌐 Mis redes sociales:
 X: https://x.com/diaitigai
 YouTube: https://www.youtube.com/@diaitigai9856
 Facebook: https://www.facebook.com/diaitigai
 Medium: https://medium.com/@colin.moreno.burgess
 🎶 Música creada por mí usando Suno: https://suno.com/invite/@diaitigai9599
#InteligenciaArtificial #OpenAI #SuperBowl #Tecnología #Futuro

Descripción optimizada para SEO (inglés)
🌟 Is Artificial Intelligence Humanity's Last Great Invention? 🌟
OpenAI shook up the Super Bowl with an ad that didn't sell cars or sodas but Artificial Intelligence. Discover how AI is transforming our lives—from creating business plans to helping kids with their homework. But is this the dawn of a new era or just a clever marketing strategy? 🤔
💡 In this video, we explore:
How OpenAI used its AI, Sora, to plan the ad.
Why the animation was created by humans, not AI.
The impact of AI on education, creativity, and communication.
📌 Share your thoughts in the comments!
 🔔 Don't forget to subscribe for more tech and AI content.
🌐 My social media:
 X: https://x.com/diaitigai
 YouTube: https://www.youtube.com/@diaitigai9856
 Facebook: https://www.facebook.com/diaitigai
 Medium: https://medium.com/@colin.moreno.burgess
 🎶 Music created by me using Suno: https://suno.com/invite/@diaitigai9599
#ArtificialIntelligence #OpenAI #SuperBowl #Technology #Future

Lista de tags (español e inglés)
inteligencia artificial, OpenAI, Super Bowl 2025, tecnología del futuro, IA en la vida diaria, impacto de la inteligencia artificial, anuncios de OpenAI, era de la inteligencia, creatividad y tecnología, educación y tecnología, inteligencia artificial práctica, OpenAI Sora, marketing de inteligencia artificial, futuro de la tecnología, inteligencia artificial y creatividad, OpenAI Super Bowl ad, artificial intelligence, OpenAI, Super Bowl 2025, future technology, AI in daily life, impact of artificial intelligence, OpenAI ads, dawn of intelligence, creativity and technology, education and AI, practical AI, OpenAI Sora, AI marketing, future of technology, AI and creativity

Comentario para pinear (español)
¿Qué opinas sobre el anuncio de OpenAI en la Super Bowl? 🤔 ¿Es la inteligencia artificial el último gran invento de la humanidad? ¡Déjame tu comentario y suscríbete para más contenido sobre tecnología y IA!

Comentario para pinear (inglés)
What do you think about OpenAI's Super Bowl ad? 🤔 Is artificial intelligence humanity's last great invention? Leave your thoughts in the comments and subscribe for more tech and AI content!

Descripción simplificada para TikTok (español)
¿Es la IA el último gran invento de la humanidad? 🤖 OpenAI revoluciona la Super Bowl mostrando cómo la IA mejora nuestras vidas. ¡Descúbrelo!
 #InteligenciaArtificial #OpenAI #SuperBowl #Tecnología #Futuro

Descripción simplificada para TikTok (inglés)
Is AI humanity's last great invention? 🤖 OpenAI shakes up the Super Bowl, showing how AI is improving our lives. Find out more!
 #ArtificialIntelligence #OpenAI #SuperBowl #Technology #Future

Descripción para X (español)
¿Es la IA el último gran invento de la humanidad? 🤖 OpenAI revoluciona la Super Bowl mostrando cómo la IA mejora nuestras vidas. #InteligenciaArtificial #OpenAI

Descripción para X (inglés)
Is AI humanity's last great invention? 🤖 OpenAI shakes up the Super Bowl, showing how AI is improving our lives. #ArtificialIntelligence #OpenAI

Descripción para Facebook (español)
🌟 ¿Es la Inteligencia Artificial el último gran invento de la humanidad? 🌟
 OpenAI ha revolucionado la Super Bowl con un anuncio que muestra cómo la IA está transformando nuestras vidas. Desde planes de negocio hasta ayudar con los deberes, la IA está aquí para quedarse. Pero, ¿es este el amanecer de una nueva era o solo una estrategia de marketing? 🤔
📌 ¡Déjame tu opinión en los comentarios y no olvides suscribirte para más contenido sobre tecnología e inteligencia artificial!
#InteligenciaArtificial #OpenAI #SuperBowl #Tecnología #Futuro

Descripción para Facebook (inglés)
🌟 Is Artificial Intelligence humanity's last great invention? 🌟
 OpenAI shook up the Super Bowl with an ad showing how AI is transforming our lives. From business plans to helping with homework, AI is here to stay. But is this the dawn of a new era or just a clever marketing strategy? 🤔
📌 Share your thoughts in the comments and don't forget to subscribe for more tech and AI content!
#ArtificialIntelligence #OpenAI #SuperBowl #Technology #Future
"""

    print("\n--- Texto Ingresado para Parsear ---")
    print(full_text[:500] + "..." if len(full_text) > 500 else full_text) # Print a snippet
    print("--- Fin Texto Ingresado ---\n")

    parsed_content = parse_word_text(full_text)

    print("\n--- Datos Parseados (Revisar) ---")
    for key, value in parsed_content.items():
        if isinstance(value, str) and len(value) > 100:
            print(f'"{key}": "{value[:100]}..."')
        else:
            print(f'"{key}": {json.dumps(value, ensure_ascii=False)}') # Use json.dumps for proper string quoting
    print("--- Fin Datos Parseados ---\n")

    curl_cmd = generate_curl_command(parsed_content, api_url)

    print("\n--- Comando cURL Generado ---")
    print(curl_cmd)
    print("--- Fin Comando cURL ---")
