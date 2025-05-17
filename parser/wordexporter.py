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

    # Limpiar el texto y dividirlo en líneas
    lines = text_block.strip().split('\n')

    # Extrae el título (primera línea no vacía)
    for i, line in enumerate(lines):
        if line.strip():
            data["title"] = line.strip()
            lines = lines[i+1:]
            break

    # Encontrar secciones principales
    i = 0
    section_content = {}
    current_section = None

    while i < len(lines):
        line = lines[i].strip()
        line_lower = line.lower()

        # Determinar si esta línea indica un cambio de sección principal
        if line_lower == "teleprompter" or line_lower.startswith("teleprompter "):
            # Guardar sección anterior si existe
            if current_section:
                save_section_content(data, current_section, section_content)

            current_section = "teleprompter"
            section_content = {"es": "", "en": ""}
            i += 1

        elif line_lower == "description (spanish)" or line_lower == "descripcion video" or line_lower == "descripción video":
            if current_section:
                save_section_content(data, current_section, section_content)

            current_section = "video_description"
            section_content = {"es": "", "en": ""}

            # Si ya incluye el idioma, asignar directamente
            if line_lower == "description (spanish)":
                i += 1
                # Capturar contenido hasta la siguiente sección o hasta "Description (English)"
                start_index = i
                while i < len(lines) and not lines[i].lower() == "description (english)" and not is_new_section(lines[i].lower()):
                    i += 1

                # Guardar contenido
                if i > start_index:
                    section_content["es"] = "\n".join(lines[start_index:i])

                # Si el siguiente es "Description (English)", procesarlo
                if i < len(lines) and lines[i].lower() == "description (english)":
                    i += 1
                    start_index = i
                    while i < len(lines) and not is_new_section(lines[i].lower()):
                        i += 1

                    if i > start_index:
                        section_content["en"] = "\n".join(lines[start_index:i])

                continue
            else:
                i += 1

        elif line_lower == "description (english)":
            if current_section != "video_description":
                if current_section:
                    save_section_content(data, current_section, section_content)
                current_section = "video_description"
                section_content = {"es": "", "en": ""}

            i += 1
            # Capturar contenido hasta la siguiente sección
            start_index = i
            while i < len(lines) and not is_new_section(lines[i].lower()):
                i += 1

            # Guardar contenido
            if i > start_index:
                section_content["en"] = "\n".join(lines[start_index:i])

            continue

        elif line_lower == "tags (spanish)" or line_lower.startswith("lista de tags"):
            if current_section:
                save_section_content(data, current_section, section_content)

            current_section = "tags"
            section_content = {"es": "", "en": ""}

            i += 1
            # Capturar contenido hasta "Tags (English)" o nueva sección
            start_index = i
            while i < len(lines) and not lines[i].lower() == "tags (english)" and not is_new_section(lines[i].lower()):
                i += 1

            # Guardar contenido
            if i > start_index:
                section_content["es"] = "\n".join(lines[start_index:i])

            # Si el siguiente es "Tags (English)", procesarlo
            if i < len(lines) and lines[i].lower() == "tags (english)":
                i += 1
                start_index = i
                while i < len(lines) and not is_new_section(lines[i].lower()):
                    i += 1

                if i > start_index:
                    section_content["en"] = "\n".join(lines[start_index:i])

            continue

        elif line_lower == "tags (english)":
            if current_section != "tags":
                if current_section:
                    save_section_content(data, current_section, section_content)
                current_section = "tags"
                section_content = {"es": "", "en": ""}

            i += 1
            # Capturar contenido hasta la siguiente sección
            start_index = i
            while i < len(lines) and not is_new_section(lines[i].lower()):
                i += 1

            # Guardar contenido
            if i > start_index:
                section_content["en"] = "\n".join(lines[start_index:i])

            continue

        elif line_lower == "pinned comment (spanish)" or line_lower.startswith("comentario") or line_lower.startswith("pinned comment"):
            if current_section:
                save_section_content(data, current_section, section_content)

            current_section = "pinned_comment"
            section_content = {"es": "", "en": ""}

            # Procesar directamente si incluye el idioma
            if line_lower == "pinned comment (spanish)":
                i += 1
                start_index = i
                while i < len(lines) and not lines[i].lower() == "pinned comment (english)" and not is_new_section(lines[i].lower()):
                    i += 1

                if i > start_index:
                    section_content["es"] = "\n".join(lines[start_index:i])

                # Si el siguiente es "Pinned Comment (English)", procesarlo
                if i < len(lines) and lines[i].lower() == "pinned comment (english)":
                    i += 1
                    start_index = i
                    while i < len(lines) and not is_new_section(lines[i].lower()):
                        i += 1

                    if i > start_index:
                        section_content["en"] = "\n".join(lines[start_index:i])

                continue
            else:
                i += 1

        elif line_lower == "pinned comment (english)":
            if current_section != "pinned_comment":
                if current_section:
                    save_section_content(data, current_section, section_content)
                current_section = "pinned_comment"
                section_content = {"es": "", "en": ""}

            i += 1
            start_index = i
            while i < len(lines) and not is_new_section(lines[i].lower()):
                i += 1

            if i > start_index:
                section_content["en"] = "\n".join(lines[start_index:i])

            continue

        elif line_lower == "tiktok description (spanish)" or line_lower.startswith("descripción simplificada para tiktok") or line_lower.startswith("descripcion simplificada para tiktok"):
            if current_section:
                save_section_content(data, current_section, section_content)

            current_section = "tiktok"
            section_content = {"es": "", "en": ""}

            if line_lower == "tiktok description (spanish)":
                i += 1
                start_index = i
                while i < len(lines) and not lines[i].lower() == "tiktok description (english)" and not is_new_section(lines[i].lower()):
                    i += 1

                if i > start_index:
                    section_content["es"] = "\n".join(lines[start_index:i])

                if i < len(lines) and lines[i].lower() == "tiktok description (english)":
                    i += 1
                    start_index = i
                    while i < len(lines) and not is_new_section(lines[i].lower()):
                        i += 1

                    if i > start_index:
                        section_content["en"] = "\n".join(lines[start_index:i])

                continue
            else:
                i += 1

        elif line_lower == "tiktok description (english)":
            if current_section != "tiktok":
                if current_section:
                    save_section_content(data, current_section, section_content)
                current_section = "tiktok"
                section_content = {"es": "", "en": ""}

            i += 1
            start_index = i
            while i < len(lines) and not is_new_section(lines[i].lower()):
                i += 1

            if i > start_index:
                section_content["en"] = "\n".join(lines[start_index:i])

            continue

        elif line_lower == "x post (spanish)" or line_lower.startswith("post para x") or line_lower.startswith("descripción para x"):
            if current_section:
                save_section_content(data, current_section, section_content)

            current_section = "twitter"
            section_content = {"es": "", "en": ""}

            if line_lower == "x post (spanish)":
                i += 1
                start_index = i
                while i < len(lines) and not lines[i].lower() == "x post (english)" and not is_new_section(lines[i].lower()):
                    i += 1

                if i > start_index:
                    section_content["es"] = "\n".join(lines[start_index:i])

                if i < len(lines) and lines[i].lower() == "x post (english)":
                    i += 1
                    start_index = i
                    while i < len(lines) and not is_new_section(lines[i].lower()):
                        i += 1

                    if i > start_index:
                        section_content["en"] = "\n".join(lines[start_index:i])

                continue
            else:
                i += 1

        elif line_lower == "x post (english)":
            if current_section != "twitter":
                if current_section:
                    save_section_content(data, current_section, section_content)
                current_section = "twitter"
                section_content = {"es": "", "en": ""}

            i += 1
            start_index = i
            while i < len(lines) and not is_new_section(lines[i].lower()):
                i += 1

            if i > start_index:
                section_content["en"] = "\n".join(lines[start_index:i])

            continue

        elif line_lower == "facebook post (spanish)" or line_lower.startswith("descripción para un post en facebook") or line_lower.startswith("descripcion para un post en facebook"):
            if current_section:
                save_section_content(data, current_section, section_content)

            current_section = "facebook"
            section_content = {"es": "", "en": ""}

            if line_lower == "facebook post (spanish)":
                i += 1
                start_index = i
                while i < len(lines) and not lines[i].lower() == "facebook post (english)" and not is_new_section(lines[i].lower()):
                    i += 1

                if i > start_index:
                    section_content["es"] = "\n".join(lines[start_index:i])

                if i < len(lines) and lines[i].lower() == "facebook post (english)":
                    i += 1
                    start_index = i
                    while i < len(lines) and not is_new_section(lines[i].lower()):
                        i += 1

                    if i > start_index:
                        section_content["en"] = "\n".join(lines[start_index:i])

                continue
            else:
                i += 1

        elif line_lower == "facebook post (english)":
            if current_section != "facebook":
                if current_section:
                    save_section_content(data, current_section, section_content)
                current_section = "facebook"
                section_content = {"es": "", "en": ""}

            i += 1
            start_index = i
            while i < len(lines) and not is_new_section(lines[i].lower()):
                i += 1

            if i > start_index:
                section_content["en"] = "\n".join(lines[start_index:i])

            continue

        # Detectar marcadores de idioma dentro de una sección
        elif current_section and (line_lower == "español:" or line_lower.startswith("español:")):
            # Extraer contenido que puede estar en la misma línea
            content_after_marker = line[line.lower().find("español:") + 8:].strip()

            # Buscar el contenido en español hasta el siguiente marcador de idioma o sección
            start_index = i + 1
            while start_index < len(lines) and not lines[start_index].lower().startswith("ingles:") and \
                  not lines[start_index].lower().startswith("inglés:") and not is_new_section(lines[start_index].lower()):
                start_index += 1

            # Solo agregar el contenido después del marcador si hay
            if content_after_marker:
                if start_index > i + 1:
                    section_content["es"] = content_after_marker + "\n" + "\n".join(lines[i+1:start_index])
                else:
                    section_content["es"] = content_after_marker
            else:
                if start_index > i + 1:
                    section_content["es"] = "\n".join(lines[i+1:start_index])

            i = start_index

        elif current_section and (line_lower.startswith("ingles:") or line_lower.startswith("inglés:")):
            # Extraer contenido que puede estar en la misma línea
            marker = "ingles:" if "ingles:" in line_lower else "inglés:"
            content_after_marker = line[line.lower().find(marker) + len(marker):].strip()

            # Buscar el contenido en inglés hasta la siguiente sección
            start_index = i + 1
            while start_index < len(lines) and not is_new_section(lines[start_index].lower()):
                start_index += 1

            # Solo agregar el contenido después del marcador si hay
            if content_after_marker:
                if start_index > i + 1:
                    section_content["en"] = content_after_marker + "\n" + "\n".join(lines[i+1:start_index])
                else:
                    section_content["en"] = content_after_marker
            else:
                if start_index > i + 1:
                    section_content["en"] = "\n".join(lines[i+1:start_index])

            i = start_index

        else:
            i += 1

    # Guardar la última sección procesada
    if current_section:
        save_section_content(data, current_section, section_content)

    # Derivar tags a partir de tagsListEs si existe
    if data["tagsListEs"]:
        # Intentar encontrar una separación por comas
        tags_text = data["tagsListEs"]
        if "," in tags_text:
            # Limitar a solo los 3 primeros tags
            all_tags = [tag.strip() for tag in tags_text.split(',') if tag.strip()]
            data["tags"] = all_tags[:3]  # Tomar solo los primeros 3
        else:
            # Si no hay comas, usar el texto completo como un solo tag
            data["tags"] = [tags_text.strip()][:1]  # Máximo 1 tag si no hay comas

    return data

def is_new_section(line):
    """Determina si una línea marca el inicio de una nueva sección"""
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

def save_section_content(data, section, content):
    """Guarda el contenido en el diccionario de datos según la sección"""
    if section == "teleprompter":
        data["teleprompterEs"] = content.get("es", "")
        data["teleprompterEn"] = content.get("en", "")
    elif section == "video_description":
        data["videoDescriptionEs"] = content.get("es", "")
        data["videoDescriptionEn"] = content.get("en", "")
    elif section == "tags":
        data["tagsListEs"] = content.get("es", "")
        data["tagsListEn"] = content.get("en", "")
    elif section == "pinned_comment":
        data["pinnedCommentEs"] = content.get("es", "")
        data["pinnedCommentEn"] = content.get("en", "")
    elif section == "tiktok":
        data["tiktokDescriptionEs"] = content.get("es", "")
        data["tiktokDescriptionEn"] = content.get("en", "")
    elif section == "twitter":
        data["twitterPostEs"] = content.get("es", "")
        data["twitterPostEn"] = content.get("en", "")
    elif section == "facebook":
        data["facebookDescriptionEs"] = content.get("es", "")
        data["facebookDescriptionEn"] = content.get("en", "")

def generate_curl_command(parsed_data, api_url):
    payload = {
        "title": parsed_data.get("title", "Título no especificado"),
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

    # Escape single quotes in string values for bash compatibility when -d '...' is used
    for key, value in payload.items():
        if isinstance(value, str):
            payload[key] = value.replace("'", "'\\''") # Bash escape: ' -> '\''

    json_payload_str = json.dumps(payload, indent=2, ensure_ascii=False)

    # The entire -d argument is wrapped in single quotes.
    # JSON strings use double quotes. Single quotes *within* the JSON values were handled above.
    curl_command = f"curl -X POST {api_url} \\\n  -H \"Content-Type: application/json\" \\\n  -d '{json_payload_str}'"

    return curl_command

# --- Main execution ---
if __name__ == "__main__":
    api_url = "http://localhost:3000/api/contents" # Or your actual API endpoint

    print("Pega el texto completo de Word aquí (Ctrl+D o Ctrl+Z y Enter para finalizar en Unix/Windows):")
    word_text_input = []
    while True:
        try:
            line = input()
            word_text_input.append(line)
        except EOFError:
            break

    full_text = "\n".join(word_text_input)

    if not full_text.strip():
        print("\nNo se ingresó texto. Usando texto de ejemplo para demostración.")
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
