import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform float uBaseOpacity;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    // Faint Fresnel edge glow
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
    
    // Slow color blending
    float blend = sin(uTime * 0.15) * 0.5 + 0.5;
    vec3 color = mix(uColor1, uColor2, blend);
    
    // Ultra-faint minimalist transparency (Fresnel edge glow + base wireframe opacity)
    float alpha = fresnel * 0.25 + uBaseOpacity;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

const GlowSphere = ({ 
  sphereTarget, 
  scaleMultiplier = 1.0, 
  offsetX = 0, 
  offsetY = 0, 
  offsetZ = 0, 
  yDriftMultiplier = 1.0,
  opacityMultiplier = 1.0,
  speedMultiplier = 1.0,
  floatAmplitude = 0.0,
  floatFrequency = 1.0,
  showHeart = false
}) => {
  const meshRef = useRef();
  const materialRef = useRef();

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color('#94a3b8') }, // slate gray
    uColor2: { value: new THREE.Color('#64748b') }, // darker slate gray
    uBaseOpacity: { value: 0.28 * opacityMultiplier }, // increased base opacity for bolder lines
  }), [opacityMultiplier]);

  const heartGeometry = useMemo(() => {
    if (!showHeart) return null;
    const shape = new THREE.Shape();
    // Centered symmetric outer heart shape (clockwise winding)
    shape.moveTo(0, 0.5);
    shape.bezierCurveTo(-0.5, 1.0, -1.0, 0.6, -1.0, 0.1);
    shape.bezierCurveTo(-1.0, -0.4, -0.6, -0.8, 0, -1.3);
    shape.bezierCurveTo(0.6, -0.8, 1.0, -0.4, 1.0, 0.1);
    shape.bezierCurveTo(1.0, 0.6, 0.5, 1.0, 0, 0.5);

    // Inner heart shape hole (opposite winding: counter-clockwise)
    const holePath = new THREE.Path();
    const s = 0.8; // thickness scale factor
    holePath.moveTo(0, 0.5 * s);
    holePath.bezierCurveTo(0.5 * s, 1.0 * s, 1.0 * s, 0.6 * s, 1.0 * s, 0.1 * s);
    holePath.bezierCurveTo(1.0 * s, -0.4 * s, 0.6 * s, -0.8 * s, 0, -1.3 * s);
    holePath.bezierCurveTo(-0.6 * s, -0.8 * s, -1.0 * s, -0.4 * s, -1.0 * s, 0.1 * s);
    holePath.bezierCurveTo(-1.0 * s, 0.6 * s, -0.5 * s, 1.0 * s, 0, 0.5 * s);
    shape.holes.push(holePath);

    const extrudeSettings = {
      depth: 0.4,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.06,
      bevelThickness: 0.06
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center(); // Center the geometry's local coordinate origin
    return geometry;
  }, [showHeart]);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speedMultiplier;
    
    // Read GSAP target values from the ref
    const targetScale = sphereTarget.current.scale * scaleMultiplier;
    const targetY = sphereTarget.current.yPos; // scroll offset (drift)
    const targetRotX = sphereTarget.current.rotationX;
    const targetRotY = sphereTarget.current.rotationY;
    
    // Mouse parallax (diminishes as scale/depth gets smaller)
    const mouseX = state.pointer.x * 0.8 * targetScale;
    const mouseY = state.pointer.y * 0.6 * targetScale;
    
    // Zero-gravity float offset (gravity-like physical bobbing)
    const floatY = Math.sin(state.clock.elapsedTime * floatFrequency) * floatAmplitude;
    
    if (meshRef.current) {
      // Smoothly lerp towards target scale, position, and rotation
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.08)
      );
      
      // Calculate position using static x/z and scroll-animated y with parallax factors + float offset
      meshRef.current.position.x = THREE.MathUtils.lerp(
        meshRef.current.position.x, 
        offsetX + mouseX, 
        0.08
      );
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y, 
        offsetY + (targetY * yDriftMultiplier) + floatY + mouseY, 
        0.08
      );
      meshRef.current.position.z = THREE.MathUtils.lerp(
        meshRef.current.position.z, 
        offsetZ, 
        0.08
      );
      
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        targetRotX + t * 0.04 + mouseY * 0.15,
        0.08
      );
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        targetRotY + t * 0.06 + mouseX * 0.15,
        0.08
      );
    }
    
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = t;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Outer Wireframe Sphere */}
      <mesh>
        <icosahedronGeometry args={[1.8, 4]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          wireframe
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Centered Inner 3D Heart (Opaque Hollow Outline) */}
      {showHeart && heartGeometry && (
        <mesh geometry={heartGeometry} scale={0.8}>
          <meshPhongMaterial 
            color="#111111" 
            specular="#ffffff"
            shininess={100}
          />
        </mesh>
      )}
    </group>
  );
};

const BackgroundBot = ({ isMobile = false, reduceMotion = false }) => {
  const sphereTarget = useRef({
    scale: 1.0,
    xPos: 0.0,
    yPos: isMobile ? 1.0 : 2.0, // initial vertical scroll drift offset
    rotationX: 0.0,
    rotationY: 0.0,
  });

  useEffect(() => {
    // Reset target to initial state to ensure clean GSAP start values on recalculation/resize
    sphereTarget.current.scale = 1.0;
    sphereTarget.current.xPos = 0.0;
    sphereTarget.current.yPos = isMobile ? 1.0 : 2.0;
    sphereTarget.current.rotationX = 0.0;
    sphereTarget.current.rotationY = 0.0;

    // Timeline to transition properties based on body scroll (scrub enabled)
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.0, // synchronized with the scrollbar, reverses automatically on scroll up
        invalidateOnRefresh: true, // handles recalculated scroll positions cleanly
      },
    });

    // Single tween to transition yPos (subtle vertical drift) and rotation over the entire scroll height
    tl.to(sphereTarget.current, {
      yPos: isMobile ? -1.0 : -2.0, // drifts down dynamically
      rotationX: Math.PI * 1.5,
      rotationY: Math.PI * 3.0,
      ease: 'sine.inOut',
    });

    return () => {
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      tl.kill();
    };
  }, [isMobile]);

  // Sphere 1 (Main - Large - FIXED): position.set(3.0, 0, -3)
  const x1 = isMobile ? 0.7 : 3.0;
  const y1 = 0.0;
  const z1 = -3.0;

  // Sphere 2 (Mid-size - Top Left): position.set(-3.0, 1.8, -7.0)
  const x2 = isMobile ? -0.8 : -3.0;
  const y2 = isMobile ? 0.8 : 1.8;
  const z2 = -7.0;

  // Sphere 3 (Smaller - Mid Left): position.set(-8, -1, -12)
  const x3 = isMobile ? -2.2 : -8.0;
  const y3 = isMobile ? -0.4 : -1.0;
  const z3 = -12.0;

  // Sphere 4 (Smallest - Bottom Left): position.set(-5, -5, -10)
  const x4 = isMobile ? -1.3 : -5.0;
  const y4 = isMobile ? -2.0 : -5.0;
  const z4 = -10.0;

  // Always render the spheres to avoid breaking/removing elements
  return (
    <div className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden z-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={isMobile ? 1 : Math.min(window.devicePixelRatio, 1.5)}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        {/* Soft studio lights to illuminate the inner 3D Standard Material heart */}
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />
        <pointLight position={[-5, 5, 2]} intensity={1.0} />

        {/* Sphere 1: Main (Large - Restored & FIXED), z = -3, moves very slightly on scroll */}
        <GlowSphere 
          sphereTarget={sphereTarget}
          scaleMultiplier={isMobile ? 1.2 : 1.85}
          offsetX={x1}
          offsetY={y1}
          offsetZ={z1}
          yDriftMultiplier={0.2} // moves very slightly on scroll
          opacityMultiplier={1.0}
          speedMultiplier={1.0}
          floatAmplitude={0.0} // FIXED - no floating bounce
          showHeart
        />
        
        {/* Sphere 2: Mid-Small, z = -6, moves slower on scroll + bobs with gravity float */}
        <GlowSphere 
          sphereTarget={sphereTarget} 
          scaleMultiplier={isMobile ? 0.55 : 0.75} 
          offsetX={x2} 
          offsetY={y2} 
          offsetZ={z2}
          yDriftMultiplier={0.15} // slower scroll movement
          opacityMultiplier={0.5} // fainter
          speedMultiplier={0.85}
          floatAmplitude={0.35} // gravity-like floating amplitude
          floatFrequency={0.65}
        />
        
        {/* Sphere 3: Smaller, z = -9, moves even slower + bobs with gravity float */}
        <GlowSphere 
          sphereTarget={sphereTarget} 
          scaleMultiplier={isMobile ? 0.4 : 0.55} 
          offsetX={x3} 
          offsetY={y3} 
          offsetZ={z3}
          yDriftMultiplier={0.1} // even slower scroll movement
          opacityMultiplier={0.35} // even fainter
          speedMultiplier={1.15}
          floatAmplitude={0.28} // gravity-like floating amplitude
          floatFrequency={0.48}
        />

        {/* Sphere 4: Smallest, z = -12, moves slowest + bobs with gravity float */}
        <GlowSphere 
          sphereTarget={sphereTarget} 
          scaleMultiplier={isMobile ? 0.25 : 0.35} 
          offsetX={x4} 
          offsetY={y4} 
          offsetZ={z4}
          yDriftMultiplier={0.05} // slowest scroll movement
          opacityMultiplier={0.25} // faintest
          speedMultiplier={1.3}
          floatAmplitude={0.22} // gravity-like floating amplitude
          floatFrequency={0.85}
        />
      </Canvas>
    </div>
  );
};

export default BackgroundBot;
