---
title: 'Entrevista con Anna (@addaleax)'
category: interview
layout: post
author:
    name: Anna
    github: addaleax
    twitter: addaleax
---


> ¡Bienvenidxs queridxs lectorxs! En esta oportunidad LaPlataJS inaugura su sección de entrevistas.  
La idea de estas entrevistas es que la comunidad latina tenga la oportunidad de conocer a aquellxs que estan __pusheando__ JS hacia adelante.  
Para nuestra primer entrevista, vamos a concentrarnos en el core de Node.js y todo lo que esta ocurriendo alrededor del nuevo soporte a N-API (que paso a tener estado estable en la flamante versión de Node.js v10).  
Y para lograr comprender de primera mano lo que esta sucediendo en el core de Node.js, decidimos consultar a una de las desarrolladoras que mas lo conoce, con ustedes, Anna, aka @addaleax. 


## INTRO 

### Q1: Hi Anna, could you introduce yourself  and tell us about your participation in the NodeJS community?  
### LaPlataJS (LPJS): Hola Anna, podrias presentarte y contarnos un poco acerca de tu participación en la comunidad Node.js.  

Anna: Hi everyone! I’m Anna (usually “addaleax” on the Internets), and I’m currently one of the most active Node.js core contributors, and mostly focused on the native side of things – right now, those areas are N-API, the new HTTP/2 implementation, internal streams APIs, and (hopefully) better embedder support and a Worker implementation for Node.js. I’m also a math grad student in Düsseldorf, Germany.

**[ES] Anna**:  Hola! Soy Anna (tambien me conocen como "addaleax") y actualmente soy una de las contribuyentes mas activas al core de Node.js y usualmente enfocada en el lado "nativo de las cosas", esto es: N-API, la nueva implementación de HTTP/2, APIs internas para streams y posiblemente, un mejor soporte para Node.js embedders (como electron) y una implementación para [Workers](https://github.com/nodejs/node/pull/20876).
Tambien soy una estudiante graduada en Matemáticas, en Düsseldorf, Alemania.

## ABOUT N-API / SOBRE N-API

### Q2: Which were the main motivations to migrate from NAN to NAPI?  
### LPJS: ¿Cuales fueron los principales motivos para migrar de NAN a N-API?

Anna: Nan is a nice idea, and definitely made sense in its time, but it has a few shortcomings.

For one, it only abstracts differences between different versions of the V8 API – parts that aren’t different still end up being included directly from the V8 API. So, what you end up with is actually a mix of the V8 API and Nan’s extra layer on top of it. The V8 API, and in particular its ways of error handling, are somewhat unconventional and hard to keep track of for most C++ programmers. Also, its documentation for V8’s embedder API has originally been written with a particular type of developer in mind – that is, professional Chromium developers, since those were for a long time the only primary consumers.

Also, the old APIs are not “ABI-stable” – something that is very hard to achieve with a normal C++ API anyway. What this means in practice is that you have to re-compile all native addons in your node_modules folder when you’re changing your major Node.js version (e.g. from Node 8 to Node 10), even if you just switch the version for testing.

N-API is different because it provides a full abstraction layer for most JS concepts as a C API, so it doesn’t have those issues – it has its own, well-documented error handling mechanism, and in theory you only ever need to compile a native addon once, from where on it will keep working. Also, because it is a C API, it’s a lot easier to write native addons in other languages like Rust, or really any other compiled language.

**[ES] Anna**: NAN es una idea interesante que tuvo sentido en su momento pero que tambien tuvo algunos defectos.

Para comenzar, NAN solo abstrae diferencias entre los cambios de versiones de la API de V8 (el engine por defecto de Node.js). Todo lo que no cambia se incluye de igual manera. El resultado termina siendo una combinación de la API que provee V8 junto a una capa extra que agrega NAN encima de esta API. A esto hay que agregarle cuestiones como el manejo de errores en V8, que ciertamente no es del todo claro para la mayoria de los desarrolladores C++ y se hace dificil de seguir y mantener entre versiones. A todo esto se suma el hecho de que la documentación de V8 para la `embedder API` fue escrita, originalmente, teniendo en cuenta a un tipo en particular de desarrollador: expertos en el desarrollo de Chromium (ya que esos fueron sus principales consumidores por mucho tiempo).

Por otra parte, algunas APIs no eran "ABI estable" (esto era algo realmente dificil de conseguir) y en la práctica, significa que el desarrollador tenia que re-compilar todas las extensiones nativas cuando hacia un cambio mayor de version de node, por ejemplo pasar de Node.js v8 a v10.

Lo que hace diferente a N-API es que provee una abstracción completa sobre el *engine* JS (eg V8) desde el punto de vista de todo el código C/C++, de esta forma evita los problemas antes mencionados; esto es, códigos de errores claros y bien documentados y teóricamente, solo es necesario compilar una extensión nativa una sola vez. Ademas, al ser una API escrita en C, hace q sea mas directo desarrollar extensiones nativas en otros lenguajes como Rust o cualquier otro lenguaje compilado.

### Q3: Which is your current contribution to the N-API project?  
### LPJS: ¿Cuál es tu contribución actual al proyecto N-API?

Anna: Honestly, it’s been a while since I contributed to the N-API code itself. Since the API has been brought out of experimental, I have been more involved on the review side of things.

My last contribution was adding a helper function that lets you get a reference to the current libuv event loop in N-API, to make it easier to use libuv code in N-API addons. That happened becauses I needed it for [node-ffi-napi](https://github.com/node-ffi-napi/node-ffi-napi), a N-API port of the ffi module – something that I hope solves a lot of the issues with native addons anyway.

**[ES] Anna**: Para ser honesta, ya paso un tiempo de mi ultima contribución al código de N-API per se. Al dejar de ser experimental, he estado mas involucrada haciendo *code reviews*.

Mi ultima contribución fue agregar una función helper que permite obtener una referencia al evento actual del `event loop` desde `libuv`. Esto hace mas fácil usar código `libuv` en extensiones nativas. Este desarrollo fue motivado por otro proyecto en el que estaba colaborando, [node-ffi-napi](https://github.com/node-ffi-napi/node-ffi-napi), la versión de `ffi` (foreign function interface) para N-API, y que espero pueda ser util para resolver muchos problemas relacionados con extensiones nativas.

### Q4: Why do you think we should be interested in N-API?  
### LPJS: ¿Por qué deberíamos prestarle atención a N-API?

Anna: That really depends on what kind of Node.js developer you are. Most of the time, you don’t really need to or want to care about native addons when you’re writing Node.js code. There are only a few common use cases – either you need to do something you can’t do otherwise with Node.js (e.g. OS-specific code), or you have a part of your program that is written in another language, or you need to run a part of your application really, really fast, and even WASM isn’t quite fast enough for you. For example, if you want to use compression formats other than gzip, such as bzip2 or xz, or you want to use some special, fancy cryptographic hash function, you would typically go this route. Or maybe you just want to play around, and see how far you can get with writing native addons for Node.js – with [N-API’s C++ wrapper](https://github.com/nodejs/node-addon-api), that is getting a lot easier now.

If any of these apply to you, you should be excited about N-API, because your developer experience will get a lot better.

**[ES] Anna**: Eso depende del tipo de desarrollador/a Node.js que seas. La mayor parte del tiempo no vas a necesitar pensar en extensiones nativas. Algunos casos de uso comunes pueden ser: desarrollar una feature que no puede hacerse con Node.js (e.g: especifica al SO), usar código existente escrito en otro lenguaje o tal vez necesitas correr una parte de tu sistema muy, *muy* rápido (donde incluso WASM no te serviría). Por ejemplo, queres hacer uso de algun tipo de compresión en tu proyecto, distinto a `gzip`, como puede ser `bzip2` o `xz`. O tal vez queres usar alguna función criptográfica de hash. O tal vez queres jugar un poco y ver hasta donde podes llegar, con [N-API’s C++ wrapper](https://github.com/nodejs/node-addon-api) se vuelve mucho mas fácil.

Si alguno de estos es tu caso, entonces N-API va a mejorar tu experiencia de *uso* como desarrollador/a.

### Q5: Which are the pros and cons of V8 abstraction?  
### LPJS: ¿Cuáles son las ventajas y desventajas de tener una capa de abstracción de `V8`?

Anna: I think I already talked a lot about the pros, but a small contra is that an extra layer of abstraction comes with a small bit of overhead. In practice, that doesn’t seem to be much of an issue, but I guess we’ll have to wait how this turns out.

Also, the API isn’t quite as complete as the V8 API – but I think we’re at a point where it’s enough to port 99 % of all native addons over to N-API.

**[ES] Anna**: Creo que ya he mencionado varias de las ventajas (i.e: mejor manejo de errores, se reduce la necesidad de re-compilar extensiones entre cambios de versión de Node.js, mas casos de uso; por mencionar algunas). Respecto a las desventajas, podemos tener un poco de `overhead` al agregar una nueva capa de abstracción. En la práctica esto no debería ser un problema pero veremos como se desarrolla.

Ademas, hay que tener en cuenta que N-API no tiene un nivel de completitud 1-1 con la API de V8. Pero aun así, creo que estamos OK para migrar el 99% de todas las extensiones nativas a N-API.

### Q6: From your point of view, what can you say about the impact of N-API in the evolution of NodeJS?  
### LPJS: Desde tu punto de vista, ¿qué podes decir acerca del impacto que puede tener N-API sobre la evolución de Node.js?

Anna: Honestly, that’s hard to tell for me at this point. N-API has only come out of experimental status a short time ago, which is an important feature for people who want to start using it in real-world applications. I really do think that this is making it easier for people to write native code for Node.js. Also, the ability to integrate with other languages more easily is hopefully going to open up a few new avenues for us!

**[ES] Anna**: Es algo difícil de contestar en este momento. N-API acaba de dejar el estado `experimental` para ser `estable` lo cual es un logro importante para que la gente empiece a usarla en aplicaciones del *mundo real*. Lo que si creo es que esto va a hacer mas fácil la vida de las personas que escriben extensiones nativas para Node.js. Ademas, se abre la puerta para integrarse con otros lenguajes mas fácilmente, ¡lo que abre nuevos caminos!

### Q7: If you had to give some advice to someone who wants to start contributing to NAPI, what would you say?  
### LPJS: Si tuvieras que dar algún consejo para alguien que quiere empezar a contribuir en N-API, ¿cuál sería?

Anna: This is a tricky question – N-API is no longer experimental, and its purpose is to provide stability, so it’s not really possible to change the existing API anymore.

A nice starting point might be looking at open issues regarding N-API on GitHub, but honestly, I would recommend to try and port existing native addons to N-API or write new ones and see into what issues you run. That way, you’ll get a good feeling for where more contributions are actually helpful and needed.

**[ES] Anna**: Esta es una pregunta tramposa, N-API ya dejo de ser experimental y su objetivo es proveer estabilidad, por lo que no es posible cambiar su API.

Un buen punto de partida puede ser chequear los issues abiertos relacionados a N-API en GitHub, aunque honestamente, recomendaría intentar portar una extensión nativa a N-API o escribir una de cero y ver a que problemas te enfrentas. De esta forma, vas a ganar una mejor comprensión de *qué* se necesita y como podes contribuir.

## ABOUT NODE.JS / SOBRE NODE.JS

### Q8: Are you contributing to other NodeJS project/working-group? If yes, which one? What can you tell us about your objectives on this project/working-group?  
### LPJS: ¿Estas colaborando con algún otro proyecto o *working group* en el ecosistema de Node.js? Si es así, ¿cual es? Y que podrías decirnos sobre tus objetivos en este proyecto.

Anna: I’m not actually involved in a lot of formal working groups in the context of Node.js, no… My work is spread out a little more over the place. As I mentioned, I’ve been putting some work into the C++ side of the HTTP/2 implementation, and right now, I’m mostly working on improving internal streams code for performance and maintainability, and getting Worker support into Node.js.

**[ES] Anna**: No estoy muy involucrada con algún *working group*. Mi trabajo esta mas esparcido entre diferentes partes del core. Como mencione antes, estuve contribuyendo al lado C++ de la implementación de HTTP/2 y actualmente estoy mejorando aspectos de mantenibilidad y performance del sistema de streams mientras busco incorporar soporte para Workers dentro de Node.js.

### Q9: Ok, now let’s go back to the past and talk a bit about how you got started  with Node.js. When and how did you start contributing to NodeJS? And looking back, how do you believe that process was? What do you think about initiatives like the mentorship program (https://github.com/nodejs/mentorship)?  
### LPJS: Ok, tomemos un momento para ir al pasado y charlar un poco sobre tus primeros pasos con Node.js. ¿Cuándo y como arrancaste a contribuir en Node.js? Y mirando hacia atras, ¿cómo crees que fue ese proceso? ¿Qué opinas de iniciativas recientes como el [programa de mentoreo](https://github.com/nodejs/mentorship)?

Anna: That was a while back, in 2015 – I was working on a web app that used Node.js in its backend, and I was debugging some typechecking issues. At some point, I was faced with the choice of either spending a lot of time going through my code, or building Node.js and adding typechecks for the problem myself – I did the latter, and though, I might as well just submit this patch that I wrote, maybe it helps somebody else. That was a good point to start, and my next few patches were based around the zlib module, because I was familiar with the C code for it, and one or two fixes for bugs that I caught by using Node’s master branch for my development machine.

I am really glad I got into Node.js, and for the most part it’s been a very good experience for me, but one thing that’s been hard and that’s still hard is the time investment that it takes. Watching the nodejs/node repository and having a general awareness over all that’s happening is hard even for people who work on Node.js full-time. We’ve been approaching that by moving towards GitHub teams for individual groups (e.g. @nodejs/buffer, @nodejs/crypto), most of which are open for anybody to join, but it’s still just a major pain point for us.

**[ES] Anna**: Todo comenzó allá por 2015. Me encontraba trabajando en una aplicación web usando Node.js en su backend y estaba *debuggeando* unos problemas relacionados con chequeo de tipos. En algún punto me dije, o recorro todo el código de esta app buscando una solución o agrego el soporte que necesito a Node.js. Hice esto ultimo y luego pensé, "podría subir este parche que escribí, tal vez le sirve a alguien mas". Ese fue un buen punto de partida. Luego, mis siguientes parches vinieron por el lado del modulo `zlib`. Conocía el código en C de `zlib` y así pude colaborar con algunos *fixes* para bugs que me había encontrado mientras trabajaba usando el código que estaba en la rama `master` de Node.js.

Estoy muy contenta por haberme involucrado con Node.js y la mayor parte del tiempo puedo decir que fue una buena experiencia para mi. Pero hay una cosa que fue y sigue siendo difícil y es la inversión de tiempo que requiere. Seguir el trabajo en el repositorio `nodejs/node` y tener un conocimiento general sobre todo lo que esta pasando es complicado incluso para la gente que trabaja tiempo completo en Node.js. Para intentar mejorar un poco eso, nos movimos a equipos en GitHub para cada grupo (e.g: @nodejs/buffer, @nodejs/crypto), la mayoría son abiertos para que cualquiera se sume; pero aun así sigue siendo difícil mantener un conocimiento general de lo que pasa con Node.js.

## ABOUT COMMUNITY / SOBRE LA COMUNIDAD

### Q10: We are reaching our final question Anna! We want to say thank you for your time and somehow let you know the importance of having a core contributor like you speaking to the Node.js LATAM community. It’s really encouraging for us!
So, back to our final question, Are you contributing to some local community? If so, how much time are you doing it? If not, have you had the chance in the past? What is your relation with your local community/meetup?  
### LPJS: ¡Estamos llegando al final de la entrevista Anna! Queremos agradecerte por tu tiempo y hacerte saber de alguna forma que contar con un *core-contributor* como vos hablando a la comunidad LATAM es muy importante. ¡Es muy motivador para nosotrxs!
Entonces, volviendo a nuestra pregunta final, ¿estas contribuyendo con alguna comunidad local? Si es así, ¿cuál es tu dedicación? En caso contrario, ¿tuviste la chance de hacerlo en el pasado? ¿Cuál es tu relación con las meetups y comunidades locales?

Anna: I’m glad I got the chance to talk about this and maybe give a few people some more insight into what’s happening with Node.js!

Unfortunately, no, I’m not involved much in local activities. We did hold 3 NodeSchool sessions here in Düsseldorf last year, but without somebody with the time and resources to organize it, that’s hard to keep up. I’d really like to mentor again at the one in Amsterdam, though – it’s not that far away, it’s a really nice city and I did enjoy it a lot the last time!

**[ES] Anna**: Estoy muy contenta por tener esta oportunidad para hablar sobre este tema (N-API) y poder dar algunos detalles sobre lo que esta pasando con Node.js!

Respecto a las meetups. Desafortunadamente no. No estoy muy involucrada con las actividades locales. El año pasado organizamos 3 NodeSchool aquí en Düsseldorf, pero sin tener alguien que cuente con el tiempo y recursos para organizar estos eventos es muy difícil de mantener en el tiempo. Me gustaría volver a mentorear como aquella vez en Amsterdam. No es muy lejos y es una ciudad muy agradable y disfrute mucho mi ultima vez port allá.

___

A big thanks Anna! If you want to add some last words about anything you are very welcome! :)  
LPJS: Nuevamente, ¡muchas gracias Anna! Si queres agregar un ultimo mensaje es bienvenido :)

Anna: That’s tricky … I guess it would be awesome if people were to go and give Node.js 10 a try – it’s still very fresh and might contain some bugs we don’t know about yet. Cheers!

**[ES] Anna**: No es fácil... Pero creo que sería genial si la gente comienza a probar Node.js v10. Está recién salido y podrian haber algunos bugs que aun no conozcamos. ¡Saludos!
