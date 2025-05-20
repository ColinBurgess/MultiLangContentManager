import json
import sys
import os

# Add parent directory to path to import the module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from wordexporter import parse_word_text, generate_curl_command

# El texto complejo proporcionado por el usuario
complex_text = """Trump + AI? The $500 Billion Stargate Project that Will Change EVERYTHING 🚀

Spanish:
Can you imagine half a trillion dollars invested in artificial intelligence? And not only that, what if I told you that this project is directly related to Donald Trump's return to the White House? Well, hold on tight, because what I'm going to tell you today will change the AI landscape forever.

Hey there! I'm Colin from The IT Guy, and I'm going to tell you about the Stargate Project, if that name sounds familiar to me too, a mega investment of 500 billion dollars in artificial intelligence infrastructure in the United States. But what's most interesting is how this project is linked to Donald Trump's return as president.

Although Elon Musk commented on X that he believes they don't have the money to do it…..the Stargate Project is already underway in Texas and plans to expand across the country. This megaproject is a historic collaboration between tech giants like OpenAI, SoftBank, Oracle, Microsoft, and NVIDIA. But what makes it unique is that it was announced by Trump on his second day as president, highlighting his intention to position the United States as a world leader in artificial intelligence.

English:
[English version of the content]

Description (Spanish)
🌌 ¿500 mil millones de dólares en IA y el regreso de Trump?
 Descubre el ambicioso Proyecto Stargate, una mega inversión en inteligencia artificial que podría cambiar el panorama tecnológico de EE. UU. y el mundo. Este proyecto, anunciado por Donald Trump en su segundo día como presidente, busca posicionar a Estados Unidos como líder global en IA, enfrentando la competencia de China. ¿Es esta la clave para el futuro de la tecnología? 🤔
🔍 En este video, exploramos:
La colaboración histórica entre OpenAI, SoftBank, Oracle, Microsoft y NVIDIA.
Los riesgos de eliminar regulaciones en IA.
El impacto global de Stargate en la competencia tecnológica.
💬 ¿Qué opinas? ¿Es este el futuro de la innovación o un riesgo ético? ¡Déjame tu comentario!
📲 Sígueme en mis redes sociales para más contenido:
X: https://x.com/diaitigai
YouTube: https://www.youtube.com/@diaitigai9856
Facebook: https://www.facebook.com/diaitigai
Medium: https://medium.com/@colin.moreno.burgess
 🎶 Música creada por mí usando Suno: https://suno.com/invite/@diaitigai9599
#InteligenciaArtificial #ProyectoStargate #DonaldTrump #Tecnología #IA

Description (English)
🌌 $500 Billion in AI & Trump's Comeback?
 Discover the ambitious Stargate Project, a massive investment in artificial intelligence that could reshape the technological landscape of the U.S. and the world. Announced by Donald Trump on his second day as president, this project aims to position the U.S. as a global AI leader, competing with China. Is this the key to the future of technology? 🤔
🔍 In this video, we explore:
The historic collaboration between OpenAI, SoftBank, Oracle, Microsoft, and NVIDIA.
The risks of removing AI regulations.
The global impact of Stargate on technological competition.
💬 What do you think? Is this the future of innovation or an ethical risk? Let me know in the comments!
📲 Follow me on my social media for more content:
X: https://x.com/diaitigai
YouTube: https://www.youtube.com/@diaitigai9856
Facebook: https://www.facebook.com/diaitigai
Medium: https://medium.com/@colin.moreno.burgess
 🎶 Music created by me using Suno: https://suno.com/invite/@diaitigai9599
#ArtificialIntelligence #StargateProject #DonaldTrump #Technology #AI

Tags (Spanish)
inteligencia artificial, proyecto stargate, donald trump y la IA, inversión en IA, tecnología en Estados Unidos, competencia tecnológica con China, OpenAI y SoftBank, NVIDIA y Microsoft, regulación de la IA, futuro de la inteligencia artificial, innovación tecnológica, IA en medicina y sostenibilidad, liderazgo tecnológico de EE. UU.
Tags (English)
artificial intelligence, stargate project, donald trump and AI, AI investment, technology in the United States, tech competition with China, OpenAI and SoftBank, NVIDIA and Microsoft, AI regulation, future of artificial intelligence, technological innovation, AI in medicine and sustainability, U.S. tech leadership

Pinned Comment (Spanish)
🌌 ¿Qué opinas del Proyecto Stargate? ¿Es esta la clave para el liderazgo tecnológico de EE. UU. o un riesgo ético? ¡Déjame tu opinión en los comentarios!

Pinned Comment (English)
🌌 What do you think about the Stargate Project? Is this the key to U.S. tech leadership or an ethical risk? Let me know your thoughts in the comments!

TikTok Description (Spanish)
🌌 ¿500 mil millones en IA y el regreso de Trump? Descubre el Proyecto Stargate y su impacto en la tecnología global. 🚀 #InteligenciaArtificial #IA #Tecnología #Trump #Stargate

TikTok Description (English)
🌌 $500 billion in AI & Trump's comeback? Discover the Stargate Project and its global tech impact. 🚀 #ArtificialIntelligence #AI #Technology #Trump #Stargate

X Post (Spanish)
🌌 ¿500 mil millones en IA y el regreso de Trump? Descubre el Proyecto Stargate y su impacto en la tecnología global. 🚀 #IA #Tecnología #Trump

X Post (English)
🌌 $500 billion in AI & Trump's comeback? Discover the Stargate Project and its global tech impact. 🚀 #AI #Technology #Trump

Facebook Post (Spanish)
🌌 ¿500 mil millones en IA y el regreso de Trump?
 El Proyecto Stargate podría cambiar el panorama tecnológico global. Descubre cómo esta mega inversión busca posicionar a EE. UU. como líder en inteligencia artificial. 🚀
#InteligenciaArtificial #IA #Tecnología #Trump #Stargate

Facebook Post (English)
🌌 $500 Billion in AI & Trump's Comeback?
 The Stargate Project could reshape the global tech landscape. Discover how this massive investment aims to position the U.S. as a leader in artificial intelligence. 🚀
#ArtificialIntelligence #AI #Technology #Trump #Stargate"""

# Procesar el texto
parsed_data = parse_word_text(complex_text)

# Imprimir el resultado en formato JSON
print(json.dumps(parsed_data, indent=2, ensure_ascii=False))

# Verificar que todos los campos esperados estén presentes
expected_fields = [
    "title",
    "teleprompterEs",
    "teleprompterEn",
    "videoDescriptionEs",
    "videoDescriptionEn",
    "tagsListEs",
    "tagsListEn",
    "pinnedCommentEs",
    "pinnedCommentEn",
    "tiktokDescriptionEs",
    "tiktokDescriptionEn",
    "twitterPostEs",
    "twitterPostEn",
    "facebookDescriptionEs",
    "facebookDescriptionEn",
    "tags"
]

# Verificar que el contenido sea correcto
print("\nVerificación de contenido:")
for field in expected_fields:
    if field in parsed_data:
        content = parsed_data[field]
        if isinstance(content, str):
            preview = content[:50] + "..." if len(content) > 50 else content
            print(f"{field}: ✓ ({len(content)} caracteres) '{preview}'")
        else:
            print(f"{field}: ✓ ({len(content)} elementos)")
    else:
        print(f"{field}: ✗ (falta)")

# Generar comando cURL
curl_command = generate_curl_command(parsed_data, 'http://localhost:3000/api/contents')

# Imprimir el comando cURL generado (solo las primeras líneas)
print("\nComando cURL generado (primeras líneas):")
curl_lines = curl_command.split('\n')
print('\n'.join(curl_lines[:5]) + "\n...")