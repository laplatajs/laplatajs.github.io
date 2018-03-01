---
title: 'Extensiones Nativas: ¿Dónde empezar?'
category: blog
layout: post
author:
    name: Beto Moretti
    github: betomoretti
    twitter: btomoretti
---

> En este artículo vamos a ver los conceptos más importantes del mundo de las extensión nativas en node.js. Luego, les voy a mostrar con un ejemplo práctico cómo construir nuestra primer extensión nativa. Finalmente, podrán encontrar algo de lectura recomendada para seguir aprendiendo.

## Intro

En términos simples podemos decir que una extensión nativa es un conjunto de lógica implementada en C++ la cual puede ser invocada desde código JavaScript.

Lo interesante en este punto es aclarar cómo funciona node.js y cuales son las partes involucradas en dicha tecnología. Es importante tener en claro por qué podemos hablar de dos lenguajes (JavaScript y C++) todo bajo el contexto de node.js.

A mi me gusta explicarlo de la siguiente manera:

* JavaScript: Es el lenguaje en el que programamos.
* V8: es el motor de ejecución de código javascript.
* libuv: es una libreria implementada en C que nos va dar la posibilidad de realizar ejecución asíncrona.

Ahora, ¿en qué parte de toda esta historia entran las extensiones nativas? Voy a elegir escritura/lectura a disco como ejemplo. Ni JavaScript ni V8 nos proveen acceso a disco. Libuv solo nos da asincronismo. Pero con node.js podemos hacerlo, ¿cierto? Este es el punto donde las extensiones nativas entran en juego. El módulo `fs` está implementado usando C++ (que si cuenta con acceso a disco) y eventualmente expone métodos (entre ellos, writeFile y readFile) los cuales son invocados desde JavaScript.

![Relacion entre JS, extensiones nativas y libuv](/resources/blog/js-native-libuv.svg)

Habiendo aclarado esto, podemos empezar a dar nuestros primeros pasos con una extensión nativa. Veamos las herramientas que necesitamos.

## Conceptos

### Archivo binding.gyp

En este archivo vamos a indicar cómo compilar nuestra extensión. Una de las principales cosas que tenemos que definir es qué archivos van a ser compilados y como se va a llamar el binario final. Tiene una estructura tipo JSON, y las claves para configurar esto son sources y target respectivamente. 

### Node-gyp [[link](https://github.com/nodejs/node-gyp)]

Es la herramienta que nos va a permitir compilar nuestra extensión nativa. Está implementada en node y viene con npm lo cual nos va a permitir usarlo cuando corremos el comando npm install. Al ejecutarlo, detecta el archivo binding.gyp incluido en la carpeta raíz de nuestro proyecto y así compila la extensión nativa. 

También nos permite crear builds de tipo release (por defecto) o debug. Como resultado, un archivo binario de extensión `.node` va a quedar en una carpeta release o debug, dependiendo de cómo se haya configurado.

### Bindings [[link](https://github.com/TooTallNate/node-bindings)]

Es un paquete node.js el cual nos permite exportar nuestra extensión nativa desde nuestro código JavaScript. Esta herramienta se encarga de buscar, ya sea en build o release, la extensión nativa por nosotros.

### N-API [[link](https://nodejs.org/api/n-api.html)]

Es una API en C que nos permite interactuar con nuestro motor de ejecución de una manera completamente abstracta. A mi parecer es el resultado de una evolución, la cual tiene como objetivo portar node a distintas arquitecturas.

N-API nos provee estabilidad y compatibilidad entre las distintas versiones de node. Es decir, si compilo mi extensión nativa para la versión 8.1 de node, no la necesito compilar nuevamente para la versión 8.6 o para la versión 9.3. Es decir, la vida de las personas que mantienen node.js y extensiones nativas que no son parte del core de node.js va a ser, indudablemente, más sencilla. 

Al momento de escribir este post, N-API se encuentra en [estado experimental](https://nodejs.org/docs/latest/api/n-api.html#n_api_n_api).

### Node addon API [[link](https://github.com/nodejs/node-addon-api)]

Este es un módulo node.js que provee una implementación en C++ de N-API, lo que nos permite usar las ventajas del lenguaje. Además, brinda compatibilidad hacia atrás con versiones de node.js que no implementan N-API.

## Primeros Pasos

> Nota: Este ejemplo se realizó usando la versión 9.3.0 de node.js

Para iniciarnos en el mundo de las extensiones nativas, vamos hacer el clásico ejemplo de hello world. La idea de esto es no cargar el ejemplo de lógica extra y solo mostrar el mínimo código indispensable que necesitamos para conseguir un primer “pantallazo” de cómo sería implementar una extensión nativa. Comenzamos iniciando npm para poder instalar las dependencias necesarias del proyecto:

```bash
npm init
```

Luego, necesitamos instalar node-addon-api y bindings:

```bash
npm i node-addon-api bindings
```

Ahora necesitamos crear el archivo que va a contener nuestro [código C++](https://gist.github.com/betomoretti/90788e123bf8a55118bebddac5024fda#file-hello_world-cc). 

Este archivo tiene tres partes fundamentales que las vamos a mencionar desde el final del archivo hacia el principio:

* [NODE_API_MODULE](https://gist.github.com/betomoretti/90788e123bf8a55118bebddac5024fda#file-hello_world-cc-L14): Como primer argumento recibe el nombre de nuestra extensión, y como segundo argumento recibe el nombre de la función que va a inicializarla 
* [init](https://gist.github.com/betomoretti/90788e123bf8a55118bebddac5024fda#file-hello_world-cc-L10): Es la función que inicializa nuestra extensión nativa. En esta función debemos exportar las funciones que implementamos en nuestra extensión que van a ser invocadas desde JavaScript. Para esto, seteamos al objeto exports una clave con el nombre de la función que queremos exponer y la función en sí que se va a ejecutar. Dicha función debe retornar el objeto exports.
* [SayHi](https://gist.github.com/betomoretti/90788e123bf8a55118bebddac5024fda#file-hello_world-cc-L3): Es la función que se va a ejecutar cuando la invoquemos desde JS.

Después, el [archivo binding.gyp](https://gist.github.com/betomoretti/90788e123bf8a55118bebddac5024fda#file-binding-gyp) que va a contener la configuración de nuestra extensión nativa.

Finalmente, el [archivo JavaScript](https://gist.github.com/betomoretti/90788e123bf8a55118bebddac5024fda#file-index-js) de ejemplo, que va a requerir la extensión y eventualmente utilizarla.

Ahora debemos compilar nuestra extensión ejecutando npm install y ejecutar el archivo que la usa.

![Compilar y ejecutar extension nativa demo](/resources/blog/hello-world.gif)

### ¿Qué había antes de N-API?

Conocer el contexto y la historia me parece interesante ya que nos va a permitir encontrar mucha documentación y ejemplos de extensiones nativas.

La idea es que N-API eventualmente reemplace NAN. ¿NAN? Sí, _Native Abstractions for Node.js_. NAN es una librería implementada en C++ la cual nos permite abstraernos de la API del V8, pero a diferencia de N-API, no nos permite abstraernos del V8 en sí.

En las nuevas releases de node.js, puede que haya cambios en el V8 los cuales podrían romper nuestra extensión nativa. Acá es donde entra NAN, evitando que nuestra extensión rompa entre los cambios del V8.

## ¿Dónde seguir?

Saber que NAN existe nos permite utilizar sus ejemplos y documentación para seguir entendiendo mas acerca del mundo de las extensiones nativas. Digamos que es un buen complemento a nuestro aprendizaje de NAPI.

* Ejemplos de NAPI se pueden encontrar en: https://github.com/nodejs/node/tree/master/test/addons-NAPI
* Ejemplos de node-addon-api se pueden encontrar en el siguiente repo: https://github.com/nodejs/abi-stable-node-addon-examples
* Otra buena fuente de código son los tests: https://github.com/nodejs/node-addon-api/tree/master/test
* Para entender mas de extensiones nativas en sí: https://nodeaddons.com/

## Conclusión

Aprender acerca de extensiones nativas me ayudó a entender cómo funciona node.js y cómo está compuesto. Hay más de un caso de uso para esto, desde mejoras de performance, integraciones con librerías implementadas en C/C++ hasta incluso soporte para código _legacy_. En resumen, es una excelente forma de conocer más sobre los _internals_ de node.js.

¡Los invito a involucrarse! Cualquier consulta pueden preguntar en el slack de [LaPlataJS](http://laplatajs.slack.com/) ([slackin](http://laplatajs.herokuapp.com/)). Eso es todo y hasta el próximo artículo.
