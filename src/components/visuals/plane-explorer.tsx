"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";

const planes = {
  sagittal: {
    name: "Sagittal",
    description: "Separates the body into right and left portions.",
    color: "#648e9c",
  },
  frontal: {
    name: "Frontal",
    description:
      "Separates the body into front (anterior) and back (posterior) portions.",
    color: "#ad7759",
  },
  transverse: {
    name: "Transverse",
    description: "Separates the body into upper and lower portions.",
    color: "#7e9159",
  },
};
type Plane = keyof typeof planes;
type Controller = {
  setPlane: (plane: Plane) => void;
  rotate: (direction: number) => void;
  reset: () => void;
};

function FlatDiagram({ plane }: { plane: Plane }) {
  return (
    <svg
      viewBox="0 0 280 300"
      role="img"
      aria-label={planes[plane].name + " plane: " + planes[plane].description}
      className="plane-flat-diagram"
    >
      <g fill="#c5d1bb" stroke="#718363" strokeWidth="2">
        <circle cx="140" cy="52" r="22" />
        <path d="M118 84Q140 74 162 84L177 165L161 174L157 263H140L133 182L124 263H107L115 172L101 165Z" />
        <path d="M117 88L86 163L99 168L129 104M162 88L191 163L178 168L150 104" />
      </g>
      <g
        fill={planes[plane].color}
        fillOpacity=".36"
        stroke={planes[plane].color}
        strokeWidth="2"
      >
        {plane === "sagittal" ? (
          <path d="M140 20L171 39V282L140 264Z" />
        ) : plane === "frontal" ? (
          <path d="M75 25H205V278H75Z" />
        ) : (
          <path d="M63 145L170 128L219 167L104 190Z" />
        )}
      </g>
      <text x="140" y="295" textAnchor="middle" fill="#53664a" fontSize="11">
        Simplified front view
      </text>
    </svg>
  );
}

export function PlaneExplorer() {
  const [plane, setPlane] = useState<Plane>("sagittal");
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">(
    "loading",
  );
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<Controller | null>(null);
  const selected = useRef<Plane>("sagittal");

  useEffect(() => {
    selected.current = plane;
    controller.current?.setPlane(plane);
  }, [plane]);

  useEffect(() => {
    let cancelled = false;
    let dispose = () => {};
    // Only opening the explorer requests the Three.js chunk.
    import("three")
      .then((THREE) => {
        if (cancelled || !host.current) return;
        const container = host.current;
        const canvas = document.createElement("canvas");
        // Probe without a renderer to avoid logging errors on unsupported devices.
        const gl = canvas.getContext("webgl2", {
          antialias: true,
          alpha: true,
          powerPreference: "low-power",
        });
        if (!gl) {
          setStatus("fallback");
          return;
        }
        const renderer = new THREE.WebGLRenderer({
          canvas,
          context: gl,
          antialias: true,
          alpha: true,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor(0xf2f4eb, 1);
        canvas.setAttribute("aria-hidden", "true");
        container.appendChild(canvas);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
        camera.position.set(0, 0.15, 6.3);
        camera.lookAt(0, 0, 0);
        scene.add(new THREE.HemisphereLight(0xffffff, 0x66785a, 2.6));
        const light = new THREE.DirectionalLight(0xffffff, 2);
        light.position.set(3, 4, 5);
        scene.add(light);
        const model = new THREE.Group();
        scene.add(model);
        model.rotation.set(-0.12, -0.48, 0);
        const bodyMaterial = new THREE.MeshStandardMaterial({
          color: 0xc1cdb2,
          roughness: 0.8,
        });
        const geometries: InstanceType<typeof THREE.BufferGeometry>[] = [];
        function ellipsoid(
          x: number,
          y: number,
          z: number,
          sx: number,
          sy: number,
          sz: number,
        ) {
          const geometry = new THREE.SphereGeometry(1, 24, 16);
          geometries.push(geometry);
          const mesh = new THREE.Mesh(geometry, bodyMaterial);
          mesh.position.set(x, y, z);
          mesh.scale.set(sx, sy, sz);
          model.add(mesh);
          return mesh;
        }
        ellipsoid(0, 1.15, 0, 0.22, 0.27, 0.21);
        ellipsoid(0, 1.12, 0.21, 0.045, 0.06, 0.075); // Front marker.
        ellipsoid(0, 0.8, 0, 0.12, 0.18, 0.12);
        ellipsoid(0, 0.28, 0, 0.37, 0.55, 0.2);
        ellipsoid(0, -0.27, 0, 0.32, 0.25, 0.2);
        for (const side of [-1, 1]) {
          const arm = ellipsoid(side * 0.47, 0.13, 0, 0.1, 0.52, 0.1);
          arm.rotation.z = side * 0.23;
          ellipsoid(side * 0.57, -0.36, 0, 0.085, 0.13, 0.06);
          ellipsoid(side * 0.17, -0.88, 0, 0.13, 0.55, 0.14);
          ellipsoid(side * 0.17, -1.39, 0.07, 0.13, 0.09, 0.23);
        }
        const planeGeometry = new THREE.PlaneGeometry(2.05, 3.12);
        geometries.push(planeGeometry);
        const planeMaterial = new THREE.MeshBasicMaterial({
          color: planes.sagittal.color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.36,
          depthWrite: false,
        });
        const sheet = new THREE.Mesh(planeGeometry, planeMaterial);
        const edgesGeometry = new THREE.EdgesGeometry(planeGeometry);
        geometries.push(edgesGeometry);
        const edgeMaterial = new THREE.LineBasicMaterial({
          color: planes.sagittal.color,
        });
        sheet.add(new THREE.LineSegments(edgesGeometry, edgeMaterial));
        model.add(sheet);
        let frame = 0;
        let disposed = false;
        function draw() {
          if (frame || disposed || document.hidden) return;
          frame = requestAnimationFrame(() => {
            frame = 0;
            if (!disposed) renderer.render(scene, camera);
          });
        }
        function showPlane(value: Plane) {
          sheet.rotation.set(0, value === "sagittal" ? Math.PI / 2 : 0, 0);
          sheet.scale.set(1, 1, 1);
          if (value === "transverse") {
            sheet.rotation.set(Math.PI / 2, 0, 0);
            sheet.scale.y = 0.66;
          }
          planeMaterial.color.set(planes[value].color);
          edgeMaterial.color.set(planes[value].color);
          draw();
        }
        controller.current = {
          setPlane: showPlane,
          rotate: (direction) => {
            model.rotation.y += direction * 0.3;
            draw();
          },
          reset: () => {
            model.rotation.set(-0.12, -0.48, 0);
            draw();
          },
        };
        const resize = new ResizeObserver(() => {
          const { width, height } = container.getBoundingClientRect();
          if (!width || !height) return;
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          draw();
        });
        resize.observe(container);
        let drag: { id: number; x: number; y: number } | null = null;
        const down = (event: PointerEvent) => {
          drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
          canvas.setPointerCapture(event.pointerId);
        };
        const move = (event: PointerEvent) => {
          if (!drag || drag.id !== event.pointerId) return;
          model.rotation.y += (event.clientX - drag.x) * 0.008;
          model.rotation.x = Math.max(
            -0.6,
            Math.min(0.6, model.rotation.x + (event.clientY - drag.y) * 0.006),
          );
          drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
          draw();
        };
        const up = () => {
          drag = null;
        };
        const lost = (event: Event) => {
          event.preventDefault();
          controller.current = null;
          setStatus("fallback");
        };
        canvas.addEventListener("pointerdown", down);
        canvas.addEventListener("pointermove", move);
        canvas.addEventListener("pointerup", up);
        canvas.addEventListener("pointercancel", up);
        canvas.addEventListener("webglcontextlost", lost);
        document.addEventListener("visibilitychange", draw);
        dispose = () => {
          disposed = true;
          cancelAnimationFrame(frame);
          resize.disconnect();
          document.removeEventListener("visibilitychange", draw);
          canvas.removeEventListener("pointerdown", down);
          canvas.removeEventListener("pointermove", move);
          canvas.removeEventListener("pointerup", up);
          canvas.removeEventListener("pointercancel", up);
          canvas.removeEventListener("webglcontextlost", lost);
          geometries.forEach((geometry) => geometry.dispose());
          bodyMaterial.dispose();
          planeMaterial.dispose();
          edgeMaterial.dispose();
          renderer.dispose();
          renderer.forceContextLoss();
          canvas.remove();
          controller.current = null;
        };
        showPlane(selected.current);
        setStatus("ready");
      })
      .catch(() => {
        dispose();
        if (!cancelled) setStatus("fallback");
      });
    return () => {
      cancelled = true;
      dispose();
    };
  }, []);

  return (
    <div className="plane-explorer" data-renderer={status}>
      <fieldset className="plane-switch">
        <legend>Choose a body plane</legend>
        {(Object.keys(planes) as Plane[]).map((value) => (
          <label key={value}>
            <input
              type="radio"
              name="body-plane"
              checked={plane === value}
              onChange={() => setPlane(value)}
            />
            <span>{planes[value].name}</span>
          </label>
        ))}
      </fieldset>
      <div className="plane-stage">
        <div ref={host} className="plane-canvas" hidden={status !== "ready"} />
        {status !== "ready" && <FlatDiagram plane={plane} />}
        <span className="plane-stage-label">
          SIMPLIFIED MODEL · NOT TO SCALE
        </span>
      </div>
      <p className="plane-description" aria-live="polite">
        <strong>{planes[plane].name} plane.</strong> {planes[plane].description}
      </p>
      <div className="plane-controls">
        <Button
          variant="outline"
          size="sm"
          disabled={status !== "ready"}
          onClick={() => controller.current?.rotate(-1)}
          aria-label="Rotate model left"
        >
          <ArrowLeft size={15} /> Left
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={status !== "ready"}
          onClick={() => controller.current?.reset()}
        >
          <RotateCcw size={14} /> Reset view
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={status !== "ready"}
          onClick={() => controller.current?.rotate(1)}
          aria-label="Rotate model right"
        >
          Right <ArrowRight size={15} />
        </Button>
      </div>
      <p className="plane-hint" role="status">
        {status === "ready"
          ? "Drag the model to turn it, or use the rotation buttons."
          : status === "loading"
            ? "Preparing the 3D view. You can explore the diagram while it loads."
            : "3D is unavailable here. The diagram and plane descriptions still work."}
      </p>
      <a
        className="lesson-source"
        href="https://openstax.org/books/anatomy-and-physiology-2e/pages/1-6-anatomical-terminology"
        target="_blank"
        rel="noreferrer"
      >
        Source: OpenStax · Anatomical terminology ↗
      </a>
    </div>
  );
}
