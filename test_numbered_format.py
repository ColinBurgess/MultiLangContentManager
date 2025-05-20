import json
from parser.wordexporter import parse_word_text, generate_curl_command

# Ejemplo del nuevo formato numerado
test_input = """1. Script de Teleprompter (Inglés)
Imagine if the next revolution in programming doesn't come from a new language, but from an AI that learns from your own mistakes? Well, buckle up, because OpenAI just bought Windsurf for $3 billion, and this could change everything!

OpenAI, the brains behind ChatGPT, has made a bold move by acquiring Windsurf, a sophisticated code editor that uses artificial intelligence to help you program at lightning speed. But why spend so much on an editor when they already have AIs that generate code?

The key is in the data. When you use ChatGPT to program, OpenAI only sees your question and the answer it gives you. But what really matters is what you do next: how you correct, adapt, or improve that code. That's pure gold for training better models!

With Windsurf, OpenAI can see that entire process. This way, they can understand why their AI fails and how humans fix it. This is vital to keep from falling behind rivals like Anthropic or Microsoft with GitHub Copilot, who are stepping hard in 2025.

The most interesting thing about Windsurf is its Cascade system, which can write code, execute commands, and debug problems using models like GPT-4o. In addition, its Supercomplete function predicts complete intentions instead of suggesting line by line. Some companies claim to have seen productivity increases of up to 92%, although it remains to be seen if this is confirmed on a large scale.

And it's not just about the data. It's also about the money. Now OpenAI sells its API, but with Windsurf they can offer the complete combo: editor plus AI, all in-house, without intermediaries. More control, more revenue.

Personally, I believe that AI programming can be a very useful tool, as long as it is used carefully. Establishing checkpoints and performing constant tests are essential precautions. I think Windsurf, with OpenAI's touch, could be a great ally if used responsibly.

What do you think? Does this purchase make sense, and moreover, for that amount? Leave me a comment and don't forget to like and subscribe to my channel for more news on technology and artificial intelligence. I'm Colin, this has been The IT Guy, and I'll see you next time.

2. Título Atractivo (SEO)
Español: 💸 OpenAI COMPRA Windsurf: ¿El Futuro de la Programación con IA?
Inglés: 💸 OpenAI BUYS Windsurf: The Future of AI-Powered Programming?

3. Descripción para YouTube (Español)
🚨 ¡Noticia BOMBA en el mundo de la IA! 🚨 OpenAI, los creadores de ChatGPT, acaban de adquirir Windsurf por ¡3.000 millones de dólares! 🤯 ¿Es este el futuro de la programación asistida por IA? 🤔

En este video, analizamos a fondo:

💸 Por qué OpenAI ha hecho esta compra millonaria.
🤖 Qué es Windsurf y cómo su IA puede revolucionar la forma en que programamos.
📈 Si realmente veremos aumentos de productividad del 92% como afirman algunas empresas.
🔮 Mi opinión sobre si esta compra tiene sentido y cómo afectará a los programadores.
¡No te pierdas este análisis en profundidad! 👇

🔗 Sígueme en mis redes sociales:

X: https://x.com/diaitigai
YouTube: https://www.youtube.com/@diaitigai9856
Facebook: https://www.facebook.com/diaitigai
Medium: https://medium.com/@colin.moreno.burgess
🎶 Música creada por mí usando Suno: https://suno.com/invite/@diaitigai9599
#OpenAI #Windsurf #IA #InteligenciaArtificial #Programacion #ChatGPT #TheITGuy #NoticiasIA #Tecnologia #Innovacion #AnalisisIA

4. Descripción para YouTube (Inglés)
🚨 BREAKING NEWS in the AI world! 🚨 OpenAI, the creators of ChatGPT, have just acquired Windsurf for a whopping $3 billion! 🤯 Is this the future of AI-assisted programming? 🤔

In this video, we analyze in depth:

💸 Why OpenAI made this multi-million dollar purchase.
🤖 What is Windsurf and how its AI can revolutionize the way we program.
📈 Whether we will really see productivity increases of 92% as some companies claim.
🔮 My opinion on whether this purchase makes sense and how it will affect programmers.
Don't miss this in-depth analysis! 👇

🔗 Follow me on my social networks:

X: https://x.com/diaitigai
YouTube: https://www.youtube.com/@diaitigai9856
Facebook: https://www.facebook.com/diaitigai
Medium: https://medium.com/@colin.moreno.burgess
🎶 Music created by me using Suno: https://suno.com/invite/@diaitigai9599
#OpenAI #Windsurf #AI #ArtificialIntelligence #Programming #ChatGPT #TheITGuy #AINews #Technology #Innovation #AIAnalysis

5. Tags para YouTube (Español)
OpenAI, Windsurf, IA, Inteligencia Artificial, programación, ChatGPT, The IT Guy, noticias IA, tecnología, innovación, análisis IA, futuro de la programación, editores de código IA, compra de OpenAI, Varun Mohan, Douglas Chen, sistema Cascade, Supercomplete, GPT-4o, Microsoft GitHub Copilot, Anthropic, programacion asistida por IA, programacion con inteligencia artificial, programacion con IA

6. Tags para YouTube (Inglés)
OpenAI, Windsurf, AI, Artificial Intelligence, programming, ChatGPT, The IT Guy, AI news, technology, innovation, AI analysis, future of programming, AI code editors, OpenAI purchase, Varun Mohan, Douglas Chen, Cascade system, Supercomplete, GPT-4o, Microsoft GitHub Copilot, Anthropic, AI assisted programming, programming with artificial intelligence, programming with AI

7. Comentario para Pinear (Español)
¡Hola a todos! 👋 En este video analizamos la compra de Windsurf por OpenAI. ¿Crees que esta adquisición cambiará la forma en que programamos? ¡Déjame tu opinión en los comentarios! 👇 Y no olvides suscribirte para más contenido sobre IA y tecnología. 😉

8. Comentario para Pinear (Inglés)
Hey everyone! 👋 In this video, we analyze OpenAI's purchase of Windsurf. Do you think this acquisition will change the way we program? Leave your opinion in the comments! 👇 And don't forget to subscribe for more content on AI and technology. 😉

9. Descripción para TikTok (Español)
OpenAI compra Windsurf por 3.000 millones 💸 ¿El futuro de la programación con IA? 🤔 #OpenAI #Windsurf #IA #Programacion #TheITGuy

10. Descripción para TikTok (Inglés)
OpenAI buys Windsurf for $3 billion 💸 The future of AI programming? 🤔 #OpenAI #Windsurf #AI #Programming #TheITGuy

11. Descripción para X (Español)
¡OpenAI compra Windsurf por 3.000 millones! 💸 ¿Revolucionará la programación con IA? 🤔 Analizamos el impacto en mi nuevo video. ¡No te lo pierdas! #OpenAI #Windsurf #IA

12. Descripción para X (Inglés)
OpenAI buys Windsurf for $3 billion! 💸 Will it revolutionize AI programming? 🤔 We analyze the impact in my new video. Don't miss it! #OpenAI #Windsurf #AI

13. Descripción para Facebook (Español)
🚨 ¡Noticia de última hora! 🚨 OpenAI, los creadores de ChatGPT, han adquirido Windsurf por 3.000 millones de dólares. ¿Qué significa esto para el futuro de la programación con IA? 🤔 Descúbrelo en mi nuevo video. ¡Comparte tu opinión! #OpenAI #Windsurf #IA #InteligenciaArtificial #Programacion

14. Descripción para Facebook (Inglés)
🚨 Breaking news! 🚨 OpenAI, the creators of ChatGPT, have acquired Windsurf for $3 billion. What does this mean for the future of AI programming? 🤔 Find out in my new video. Share your opinion! #OpenAI #Windsurf #AI #ArtificialIntelligence #Programming"""

print("Probando el parser con el nuevo formato numerado")
print("=" * 50)

# Añadir teleprompter en español (mencionado que se introducirá después)
teleprompter_es = """Imagina si la próxima revolución en programación no viene de un nuevo lenguaje, sino de una IA que aprende de tus errores. Prepárate, porque OpenAI acaba de comprar Windsurf por 3.000 millones de dólares, ¡y esto podría cambiar todo!

OpenAI, los creadores de ChatGPT, ha hecho un movimiento audaz al adquirir Windsurf, un sofisticado editor de código que utiliza inteligencia artificial para ayudarte a programar a velocidad récord. Pero, ¿por qué gastar tanto en un editor cuando ya tienen IAs que generan código?

La clave está en los datos. Cuando usas ChatGPT para programar, OpenAI solo ve tu pregunta y la respuesta que te da. Pero lo que realmente importa es lo que haces después: cómo corriges, adaptas o mejoras ese código. ¡Eso es oro puro para entrenar mejores modelos!

Con Windsurf, OpenAI puede ver todo ese proceso. Así pueden entender por qué falla su IA y cómo los humanos lo arreglan. Esto es vital para no quedarse atrás frente a rivales como Anthropic o Microsoft con GitHub Copilot, que están pisando fuerte en 2025.

Lo más interesante de Windsurf es su sistema Cascade, que puede escribir código, ejecutar comandos y depurar problemas usando modelos como GPT-4o. Además, su función Supercomplete predice intenciones completas en lugar de sugerir línea por línea. Algunas empresas afirman haber visto aumentos de productividad de hasta un 92%, aunque está por verse si esto se confirma a gran escala.

Y no se trata solo de los datos. También es por el dinero. Ahora OpenAI vende su API, pero con Windsurf pueden ofrecer el combo completo: editor más IA, todo en casa, sin intermediarios. Más control, más ingresos.

Personalmente, creo que la programación con IA puede ser una herramienta muy útil, siempre que se use con precaución. Establecer puntos de control y realizar pruebas constantes son precauciones esenciales. Pienso que Windsurf, con el toque de OpenAI, podría ser un gran aliado si se usa responsablemente.

¿Qué opinas? ¿Tiene sentido esta compra, y además, por esa cantidad? Déjame tu comentario y no olvides dar like y suscribirte a mi canal para más noticias sobre tecnología e inteligencia artificial. Soy Colin, esto ha sido The IT Guy, y nos vemos en el próximo video."""

# Analizar el texto con el parser
parsed_data = parse_word_text(test_input)

# Agregar manualmente el teleprompter en español
parsed_data["teleprompterEs"] = teleprompter_es

# Imprimir el resultado en formato JSON
print("\nDatos parseados:")
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
api_url = "http://localhost:3000/api/contents"
curl_command = generate_curl_command(parsed_data, api_url)

# Imprimir el comando cURL generado (solo las primeras líneas)
print("\nComando cURL generado (primeras líneas):")
curl_lines = curl_command.split('\n')
print('\n'.join(curl_lines[:5]) + "\n...")