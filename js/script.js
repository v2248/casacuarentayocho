const TOOGLE_BUTTON = document.getElementById("toggle-theme-btn");

TOOGLE_BUTTON.addEventListener("click", function() {
    document.body.classList.toggle("dark-theme");
});

/* =========================================
   CASA 48 — WELCOME MOUSE EFFECT
========================================= */

(() => {

    const section = document.querySelector(
        '#welcome-c48'
    );

    if (!section) return;

    // Evitar inicializar dos veces

    if (section.dataset.blocksReady === 'true') {
        return;
    }

    section.dataset.blocksReady = 'true';


    /* =====================================
       DUPLICAR CAPA TIPOGRÁFICA
    ====================================== */

    const base = section.querySelector(
        '.welcome-layer--base'
    );

    const reveal = base.cloneNode(true);

    reveal.classList.remove(
        'welcome-layer--base'
    );

    reveal.classList.add(
        'welcome-layer--reveal'
    );

    reveal.setAttribute('aria-hidden', 'true');

    section.appendChild(reveal);


    /* =====================================
       CONFIGURACIÓN
    ====================================== */

    const blocks = new Map();

    let lastPointer = null;
    let isOver = false;
    let blockSize = 80;

    // Duración de cada bloque
    const holdTime = 900;

    // Máximo de bloques visibles
    const maxBlocks = 36;


    /* =====================================
       CREAR BLOQUE
    ====================================== */

    function addBlock(x, y) {

        const column = Math.floor(x / blockSize);
        const row = Math.floor(y / blockSize);

        const key = `${column}:${row}`;

        blocks.delete(key);

        blocks.set(
            key,
            performance.now() + holdTime
        );

        while (blocks.size > maxBlocks) {

            const oldest = blocks.keys().next().value;

            blocks.delete(oldest);
        }
    }


    /* =====================================
       MOSTRAR BLOQUES
    ====================================== */

    function drawBlocks() {

        const now = performance.now();

        // Eliminar bloques expirados

        for (const [key, expiry] of blocks) {

            if (expiry < now) {
                blocks.delete(key);
            }
        }

        // Ocultar completamente la capa
        // gris cuando no haya bloques

        if (blocks.size === 0) {

            const emptyMask =
                'linear-gradient(transparent,transparent)';

            reveal.style.maskImage = emptyMask;
            reveal.style.webkitMaskImage = emptyMask;

            return;
        }

        const positions = [...blocks.keys()].map(
            key => key.split(':').map(Number)
        );

        const images = positions.map(
            () => 'linear-gradient(#000,#000)'
        );

        const maskPositions = positions.map(
            ([x, y]) =>
                `${x * blockSize}px ${y * blockSize}px`
        );

        const sizes = positions.map(
            () => `${blockSize}px ${blockSize}px`
        );

        const imageValue = images.join(',');
        const positionValue = maskPositions.join(',');
        const sizeValue = sizes.join(',');

        reveal.style.maskImage = imageValue;
        reveal.style.webkitMaskImage = imageValue;

        reveal.style.maskPosition = positionValue;
        reveal.style.webkitMaskPosition = positionValue;

        reveal.style.maskSize = sizeValue;
        reveal.style.webkitMaskSize = sizeValue;

        reveal.style.maskRepeat = 'no-repeat';
        reveal.style.webkitMaskRepeat = 'no-repeat';
    }


    /* =====================================
       MOVIMIENTO DEL MOUSE
    ====================================== */

    section.addEventListener('pointerenter', () => {

        isOver = true;
        lastPointer = null;

    });

    section.addEventListener('pointermove', (event) => {

        if (
            event.pointerType === 'touch' &&
            event.buttons === 0
        ) {
            return;
        }

        isOver = true;

        const rect = section.getBoundingClientRect();

        // Tamaño proporcional al ancho

        blockSize = Math.max(
            48,
            Math.min(
                110,
                Math.round(rect.width * 0.055)
            )
        );

        const point = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };

        // Rellenar los espacios entre
        // movimientos rápidos del cursor

        if (lastPointer) {

            const distance = Math.hypot(
                point.x - lastPointer.x,
                point.y - lastPointer.y
            );

            const steps = Math.min(
                25,
                Math.max(
                    1,
                    Math.ceil(distance / (blockSize * 0.45))
                )
            );

            for (let i = 1; i <= steps; i++) {

                const t = i / steps;

                const x = lastPointer.x +
                    (point.x - lastPointer.x) * t;

                const y = lastPointer.y +
                    (point.y - lastPointer.y) * t;

                addBlock(x, y);
            }

        } else {

            addBlock(point.x, point.y);
        }

        lastPointer = point;

        drawBlocks();
    });


    /* =====================================
       SALIR DE LA SECCIÓN
    ====================================== */

    section.addEventListener('pointerleave', () => {

        isOver = false;
        lastPointer = null;

    });


    /* =====================================
       ACTUALIZAR LOS BLOQUES
    ====================================== */

    window.setInterval(() => {

        if (!isOver && blocks.size === 0) {
            return;
        }

        if (isOver && lastPointer) {

            addBlock(
                lastPointer.x,
                lastPointer.y
            );
        }

        drawBlocks();

    }, 90);

})();
