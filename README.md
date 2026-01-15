# Tetonor Diario 


**Tetonor Diario** es un elegante juego de rompecabezas matemático diario que desafía tu capacidad de cálculo, lógica y deducción. Inspirado en acertijos numéricos clásicos, Tetonor ofrece una experiencia premium con un diseño moderno y minimalista.

##  Características

-    **Puzle Diario**: Un nuevo desafío cada día generado con una semilla única.
-    **Lienzo de Notas (Scratchpad)**: Dibuja y haz anotaciones directamente sobre la pantalla para ayudarte a resolver el puzle.
-    **Guardado Automático**: Tu progreso se guarda localmente para que puedas retomar la partida en cualquier momento.
-    **Estadísticas**: Realiza un seguimiento de tus juegos jugados, rachas de victorias y tu historial de los últimos 7 días.
-    **Totalmente Responsivo**: Disfruta de una experiencia fluida tanto en escritorio como en dispositivos móviles.

##  Cómo Jugar

El objetivo es completar todas las operaciones en el tablero utilizando los números del inventario.

### Las Reglas de Oro

1.  **Regla de Oro**: Por cada par de números que **multipliquen** un resultado, ese mismo par debe **sumar** otro resultado en otra casilla del tablero.
2.  **Equilibrio**: Debe haber exactamente el mismo número de operaciones de suma (+) que de multiplicación (x).
3.  **Inventario Completo**: Cada número del inventario se utiliza exactamente **dos veces** en el tablero.
4.  **Adivina los Secretos**: Algunos números aparecen como **?**. Son números del inventario que están ocultos y debes descubrir.

### Controles
-   **Arrastrar y Soltar**: Mueve los números desde el inventario inferior a los huecos vacíos del tablero.
-   **Cambiar Operador**: Haz clic en el símbolo central de cualquier celda (+, x o ?) para alternar entre suma y multiplicación.
-   **Modo Dibujo**: Activa el icono del lápiz (✎) para abrir el lienzo de notas lateral.

## Instalación y Desarrollo

Tetonor está construido con tecnologías web puras (Vanilla HTML, CSS y JS). No requiere de frameworks pesados ni pasos de compilación complejos.

1.  Clona el repositorio:
    ```bash
    git clone https://github.com/alvaroddiaz/tetonorgame.git
    ```
2.  Abre el archivo `index.html` en tu navegador o utiliza un servidor local como `Live Server` en VS Code.

## Estructura del Proyecto

```text
tetonor_game/
├── assets/          # Imágenes y recursos visuales
├── js/              # Lógica del juego dividida en módulos
│   ├── game-logic.js    # Generación y validación de puzles
│   ├── ui-manager.js    # Gestión de la interfaz y eventos
│   ├── persistence.js   # Manejo de LocalStorage y estadísticas
│   ├── scratchpad.js    # Lógica del lienzo de notas
│   └── utils.js         # Funciones de apoyo
├── style.css        # Estilos premium y diseño responsivo
├── index.html       # Estructura principal
└── app.js           # Punto de entrada de la aplicación
```

## Apóyanos

Si disfrutas de Tetonor, considera apoyarme invitándome a un café:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/alvaroddiaz)

---

Creado con ❤️ por [Alvaro Diaz](https://github.com/alvaroddiaz).
