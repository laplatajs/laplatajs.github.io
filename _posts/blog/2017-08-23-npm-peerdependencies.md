---
title: npm peerDependencies
category: blog
layout: post
author:
    name: Maximiliano Fierro
    github: elmasse
    twitter: elmasse
---

Hace unas semanas arranque un proyecto nuevo. Decidí darle una oportunidad a tener **peerDependencies**. Ya lo había hecho antes y no funcionó. Pero esta vez me puse a investigar un poco más. Este post viene a cubrir un poco lo que hice a modo de “notas” para mi pero tambien puede que le sirva a alguien más.

## Un poco de contexto

El proyecto es un generador de sitios estáticos basado en **Next.js** (`next`). `next` tiene como peerDependencies `react` y `react-dom`. Esto significa que si quiero usar `next` en mi proyecto entonces voy a necesitar instalar también esas dependencias. 
Mi proyecto sigue esas dependencias pero agrega `next` a esa lista. Basicamente para usar `nextein` necesitamos instalar:

```bash
npm i -S next react react-dom nextein@beta
```
El problema surgió cuando quise armar un módulo en otro repositorio para usarlo de prueba / ejemplos. ¿Cómo hacemos para usar un módulo en desarrollo en otro proyecto? ¿Cuáles son los posibles problemas con los que me voy a encontrar? Eso es un poco lo que vamos a ver a continuación.

## peerDependencies

Comencemos por lo básico. 

**¿Qué son las peerDependencies?** - Se preguntarán.

¡Que buena pregunta Mario! - En algunos casos, es deseable expresar que nuestro paquete tiene compatibilidad con una librería o herramienta pero no necesariamente requiere una versión específica como parte de sus dependencias. Es el caso por ejemplo, de un plugin (vean la [documentacion de npm](https://docs.npmjs.com/files/package.json#peerdependencies)). 


## Usando peerDependencies en desarrollo

Ahora viene la parte complicada. Tenemos algunas alternativas sobre cómo desarrollar y probar nuestro código en contexto. No hablo de unit tests o tests en general. Estamos queriendo usar el código en algunos ejemplos. O en otro módulo.

La opción inicial y más bien por defecto podría ser usar `npm link`. De esta manera podemos trabajar con los dos módulos al mismo tiempo. No?. _Bueno, no. O casi._

Varias cosas a tener en cuenta:

* npm (desde la versión 3 en adelante) no instala las peerDependencies.
* `npm link` es básicamente un symlink. Esto va a causar que en este escenario las dependencias no se resuelvan como se podría esperar.

## Problemas con npm link y peerDependencies

Como mencione antes, `npm link` es un symlink. El problema con esto es como se resuelven las dependencias con npm.

Vamos a nombrar a nuestro plugin/librería `mi-lib` y a nuestro módulo donde vamos a probarlo `mi-host`. Ahora, en `mi-host` tengo que declarar la dependencia a `mi-lib` (que se va a resolver con `npm link`) y tambien instalar las peerDependencies de `mi-lib`.

```bash
> cd mi-lib
> npm install
> npm link
```

```bash
> cd mi-host
> npm install
> npm link mi-lib
```

Supongamos que tenemos ambos módulos en el mismo directorio `proyectos`. La estructura, a grandes rasgos, queda de la siguiente forma:

```
- proyectos
  |- mi-lib
    |- node_modules
    |- package.json
  |- mi-host
    |- node_modules
      |- mi-lib (symlink)
    |- package.json
```

Esto va a generar que el node_modules de `mi-host` contenga las peerDependencies de `mi-lib`. Pero recuerden que `mi-lib` es un symlink! Cuando quiera ejecutar código en `mi-lib` de una de esas peerDependencies no lo va a encontrar porque están en distintos paths.

## Alternativas / Soluciones
Googleando, StackOverfloweando, y algo mas, fui encontrando distintas soluciones que vamos a ver a continuación.

### node --preserve-symlinks
A partir de node 6.3 podemos pasarle un parametro a node para que preserve los symlinks a la hora de resolver los módulos/dependencias. [Documentaci&oacute;n de node](https://nodejs.org/api/cli.html#cli_preserve_symlinks)

#### Pros

* Es simple. Solo necesitamos agregar un parámetro al script de ejecución.

#### Cons

* Si no podemos cambiar el script de ejecución, o no depende directamente de ejecutar el código con el CLI de node esta solución no nos sirve.

### Instalar las peerDependencies en mi-lib
En este caso, que parece ser el más “future proof”, vamos instalar _la misma version de las peerDependencies_ que usamos en `mi-host`. Esto es, si por ejemplo, nuestro `package.json` contiene:

```json
{
  “name”: `mi-lib`,

  “peerDependencies”: {
      “react”: “^15.6”
  }
}
```

Y el npm install resuelve react a 15.6.1 cuando lo instalamos en `mi-host` entonces vamos a instalar react@15.6.1 en `mi-lib`. Lo recomendable es instalar esa versión como dependencia de desarrollo (devDependencies) 

```bash
> cd mi-lib
> npm i -S react@15.6.1
```

Con esto nos aseguramos que el node_modules de nuestro `mi-lib` contenga exactamente la misma versión de react que la que usamos en `mi-host`.

#### Pros

* Es una solución que funciona en un **99%** de los casos. No agrega overhead al desarrollo de final de `mi-host` ni de `mi-lib`. 

#### Cons

* Requiere mantenimiento de `mi-lib` para asegurarse que usamos la misma versión de peerDependencies que en `mi-host`.
* Hay al menos **un caso particular donde esta solución no funciona**: Si alguna de nuestras _peerDependencies_ contiene un módulo con una instancia, un Singleton por ejemplo (_vean como funciona el router de `next`_ ) no es una solución viable ya que en este caso vamos a tener la misma versión del módulo pero **no la misma instancia**

### Monorepos (lerna)
Si no están familiarizados con [lerna](https://lernajs.io) (o monorepos) la idea es que nos permite tener muchos módulos en desarrollo bajo el mismo repositorio. Lerna se encarga de hacer el trabajo de `npm link`. No hay symlinks. Las dependencias la maneja lerna y hace el desarrollo más sencillo.

Para solucionar el problema anterior lerna nos provee de una solución interesante. Tiene una funcionalidad que nos permite “hoistear” dependencias. Esto es, usar un node_modules en común en un nivel superior.

Un repositorio con lerna tiene una estructura similar a esta:,

```
repo
 |- lerna.json
 |- package.json
 |- packages
     |- mi-lib
     |- mi-host
```

Para poder lograr el hoisting de los módulos tenemos que decirle a lerna que haga el bootstrap con esta opción habilitada. Para eso podemos pasarlo por parámetro:

```bash
lerna bootstrap --hoist
```

O bien lo agregamos como parte de la configuración en el lerna.json

```json
{
  "lerna": "2.0.0",
  "packages": [
    "packages/*"
  ],
  "commands": {
    "bootstrap": {
      "hoist": true
    }
  }
}
```

#### Pros

* No dependemos de `npm link`, ni de symlinks. Los módulos se desarrollan de manera transparente a sí usamos módulos locales o de npm.

#### Cons

* Todo el repositorio depende del formato de lerna. Y nuestro código queda enterrado en un directorio “packages” haciendo el repositorio un poco más grande de lo necesario.


## Resumiendo

Hay varias formas de resolver este problema. Seguramente hay mas formas dando vueltas. Esta es una peque&ntilde;a rese&ntilde;a sobre los escenarios que pude explorar personalmente y los problemas con los que me encontr&eacute; en cada uno.

> La soluci&oacute;n m&aacute;s simple debe ser la correcta.


