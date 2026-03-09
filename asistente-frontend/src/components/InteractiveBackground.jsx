import React, { useRef, useEffect, useCallback } from 'react';

/**
 * Fondo interactivo animado con partículas flotantes
 * Las partículas reaccionan suavemente al movimiento del mouse
 * Diseñado para ser elegante y no intrusivo
 */
function InteractiveBackground() {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const particlesRef = useRef([]);
    const animFrameRef = useRef(null);

    // Configuración de partículas
    const PARTICLE_COUNT = 45;
    const MOUSE_RADIUS = 180;

    const createParticle = useCallback((width, height) => {
        const types = ['circle', 'heart', 'chat', 'star'];
        const type = types[Math.floor(Math.random() * types.length)];
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            baseX: 0,
            baseY: 0,
            size: Math.random() * 18 + 8,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3 - 0.15, // Tendencia a subir
            opacity: Math.random() * 0.18 + 0.10,
            baseOpacity: 0,
            type,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.008,
            // Color en HSL para variedad en azules/violetas/rosas
            hue: Math.random() * 60 + 210, // 210–270 (azul a violeta)
            saturation: Math.random() * 30 + 50,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * 0.015 + 0.005,
        };
    }, []);

    // Dibujar las diferentes formas
    const drawHeart = (ctx, x, y, size) => {
        ctx.beginPath();
        const s = size * 0.5;
        ctx.moveTo(x, y + s * 0.3);
        ctx.bezierCurveTo(x, y - s * 0.4, x - s, y - s * 0.4, x - s, y + s * 0.1);
        ctx.bezierCurveTo(x - s, y + s * 0.6, x, y + s, x, y + s);
        ctx.bezierCurveTo(x, y + s, x + s, y + s * 0.6, x + s, y + s * 0.1);
        ctx.bezierCurveTo(x + s, y - s * 0.4, x, y - s * 0.4, x, y + s * 0.3);
        ctx.fill();
    };

    const drawChat = (ctx, x, y, size) => {
        const w = size * 1.4;
        const h = size * 0.9;
        const r = size * 0.35;
        ctx.beginPath();
        ctx.moveTo(x - w / 2 + r, y - h / 2);
        ctx.lineTo(x + w / 2 - r, y - h / 2);
        ctx.quadraticCurveTo(x + w / 2, y - h / 2, x + w / 2, y - h / 2 + r);
        ctx.lineTo(x + w / 2, y + h / 2 - r);
        ctx.quadraticCurveTo(x + w / 2, y + h / 2, x + w / 2 - r, y + h / 2);
        ctx.lineTo(x - w / 4, y + h / 2);
        ctx.lineTo(x - w / 3, y + h / 2 + size * 0.35);
        ctx.lineTo(x - w / 6, y + h / 2);
        ctx.lineTo(x - w / 2 + r, y + h / 2);
        ctx.quadraticCurveTo(x - w / 2, y + h / 2, x - w / 2, y + h / 2 - r);
        ctx.lineTo(x - w / 2, y - h / 2 + r);
        ctx.quadraticCurveTo(x - w / 2, y - h / 2, x - w / 2 + r, y - h / 2);
        ctx.fill();
        // Líneas de texto dentro de la burbuja
        ctx.globalAlpha *= 0.5;
        const lineY = y - h * 0.15;
        ctx.fillRect(x - w * 0.3, lineY, w * 0.5, size * 0.08);
        ctx.fillRect(x - w * 0.3, lineY + size * 0.2, w * 0.35, size * 0.08);
    };

    const drawStar = (ctx, x, y, size) => {
        ctx.beginPath();
        const spikes = 5;
        const outerR = size * 0.55;
        const innerR = size * 0.25;
        for (let i = 0; i < spikes * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const angle = (Math.PI * i) / spikes - Math.PI / 2;
            const px = x + Math.cos(angle) * r;
            const py = y + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        resize();

        // Inicializar partículas
        particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => {
            const p = createParticle(width, height);
            p.baseX = p.x;
            p.baseY = p.y;
            p.baseOpacity = p.opacity;
            return p;
        });

        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -1000, y: -1000 };
        };

        const handleTouchMove = (e) => {
            if (e.touches.length > 0) {
                mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Gradiente de fondo sutil
            const grad = ctx.createRadialGradient(
                width * 0.3, height * 0.3, 0,
                width * 0.3, height * 0.3, width * 0.7
            );
            grad.addColorStop(0, 'rgba(219, 234, 254, 0.3)'); // blue-100
            grad.addColorStop(1, 'rgba(240, 245, 255, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);

            const grad2 = ctx.createRadialGradient(
                width * 0.75, height * 0.7, 0,
                width * 0.75, height * 0.7, width * 0.5
            );
            grad2.addColorStop(0, 'rgba(224, 231, 255, 0.25)'); // indigo-100
            grad2.addColorStop(1, 'rgba(240, 245, 255, 0)');
            ctx.fillStyle = grad2;
            ctx.fillRect(0, 0, width, height);

            const mouse = mouseRef.current;

            particlesRef.current.forEach((p) => {
                // Actualizar posición
                p.x += p.speedX;
                p.y += p.speedY;
                p.rotation += p.rotationSpeed;
                p.pulse += p.pulseSpeed;

                // Efecto de pulso suave
                const pulseFactor = 1 + Math.sin(p.pulse) * 0.15;

                // Reacción al mouse
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < MOUSE_RADIUS) {
                    const force = (1 - dist / MOUSE_RADIUS) * 0.8;
                    p.x += dx * force * 0.02;
                    p.y += dy * force * 0.02;
                    // Brillar más cerca del mouse
                    p.opacity = Math.min(p.baseOpacity + force * 0.25, 0.45);
                } else {
                    // Volver gradualmente a la opacidad base
                    p.opacity += (p.baseOpacity - p.opacity) * 0.02;
                }

                // Wrap around de bordes con margen
                const margin = 50;
                if (p.x < -margin) p.x = width + margin;
                if (p.x > width + margin) p.x = -margin;
                if (p.y < -margin) p.y = height + margin;
                if (p.y > height + margin) p.y = -margin;

                // Dibujar partícula
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.globalAlpha = p.opacity * pulseFactor;

                const color = `hsla(${p.hue}, ${p.saturation}%, 60%, 1)`;
                ctx.fillStyle = color;

                const currentSize = p.size * pulseFactor;

                switch (p.type) {
                    case 'circle':
                        ctx.beginPath();
                        ctx.arc(0, 0, currentSize * 0.5, 0, Math.PI * 2);
                        ctx.fill();
                        // Anillo exterior
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 1;
                        ctx.globalAlpha *= 0.5;
                        ctx.beginPath();
                        ctx.arc(0, 0, currentSize * 0.75, 0, Math.PI * 2);
                        ctx.stroke();
                        break;
                    case 'heart':
                        drawHeart(ctx, 0, 0, currentSize);
                        break;
                    case 'chat':
                        drawChat(ctx, 0, 0, currentSize);
                        break;
                    case 'star':
                        drawStar(ctx, 0, 0, currentSize);
                        break;
                }

                ctx.restore();
            });

            // Líneas de conexión entre partículas cercanas
            ctx.strokeStyle = 'rgba(147, 197, 253, 0.08)'; // blue-300
            ctx.lineWidth = 1;
            for (let i = 0; i < particlesRef.current.length; i++) {
                for (let j = i + 1; j < particlesRef.current.length; j++) {
                    const a = particlesRef.current[i];
                    const b = particlesRef.current[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 200) {
                        ctx.globalAlpha = (1 - dist / 200) * 0.12;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }

            animFrameRef.current = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('touchmove', handleTouchMove, { passive: true });

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('touchmove', handleTouchMove);
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
        };
    }, [createParticle]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
            aria-hidden="true"
        />
    );
}

export default InteractiveBackground;
