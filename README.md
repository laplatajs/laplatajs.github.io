# LaPlataJS 

## Repositorio de laplatajs.github.io

## Herramientas

### Jekyll
Para generar el sitio estamos utilizando [Jekyll](http://jekyllrb.com/docs) que es el motor por defecto de Github Pages.

Para instalar Jekyll seguir los pasos desde [instalacion](http://jekyllrb.com/docs/installation/) 

### Sass
Jekyll soporta sass (no compass, ni algun otro sass framework), pero es mas que suficiente por ahora.

## Testing Local
Jekyll es una herramienta que nos permite hacer muchas cosas, pero que al final genera un sitio estatico. Para poder testear nuestros cambios solo hace falta tener Jekyll instalado y seguir los siguientes pasos:

1. Clonar el repo
2. Ejecutar `jekyll serve` en el root del repositorio que acabamos de clonar.
3. Por defecto se publica en `http:\\localhost:4000`


## Organizacion y Estructura

### Layouts. Includes. Sass.
Para cada Layout tenemos definido su propio css. Dentro de `resources/css` vamos a encontrar los correspondientes archivos `.scss`. Estos archivos van a generar las correspondientes versiones en css. 
Para ser incluidos en la version final, en cada layout definimos la inclusion del head pasandole una variable correspondiente al nombre del layout:

```
    {% include head.html section="main" %}
```

### Posts
Dentro de la carpeta `_posts` organizamos los archivos agrupandolos por categoria. Asi, `_posts/main` contiene los posts que vamos a mostrar dentro del layout main.

## Secciones
Cada Seccion (Link en la barra de navegacion) esta contenida en una carpeta con el mismo nombre. Esta carpeta contiene el index.html de la seccion.

### Index
El index se encuentra conformado por el layout main, su correspondiente main.scss y dentro de `_posts/main` los posts correspondientes a cada seccion.

### Meetups
Dentro de `/meetups` tenemos el index.html. El layout es meetups y su correspondiente meetups.scss.
Para cada meetup creamos una entrada en `_posts/meetups` con la fecha y nombre de la meetup. Luego dentro de la carpeta `_posts/meetups/talks` vamos a crear las entradas para cada charla. **Deben coincidir las fechas** para que se listen dentro de la meetup.

Por ahora las entradas no contienen mas que meta-data. Falta definir un poco el formato de cada pagina de meetup.

### Participa
TBD

### Sponsors
TBD

### Staff
TBD

### Noticias
TBD
