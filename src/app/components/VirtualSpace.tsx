// components/StartPage.js
"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Environment, SpotLight } from "@react-three/drei";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import { SpotLight as ThreeSpotLight } from "three";
import { EffectComposer, N8AO } from "@react-three/postprocessing";


interface ModelProps {
    basePath: string;
  }
const Model: React.FC<ModelProps> = ({ basePath }) => {
  const { scene } = useGLTF(`${basePath}/room.glb`);
  return <primitive object={scene} />;
};

interface AreaLightProps {
  position?: [number, number, number];
  lookAt?: [number, number, number];
  width?: number;
  height?: number;
}
const AreaLight: React.FC<AreaLightProps> = ({
  position = [0, 0, 0],
  lookAt = [0, 0, 0],
  width = 16,
  height = 0.1,
}) => {
  const { scene } = useThree();

  React.useEffect(() => {
    const rectLight = new THREE.RectAreaLight(0xffffff, 10, width, height);
    rectLight.position.set(...position);
    rectLight.lookAt(...lookAt);

    scene.add(rectLight);

    const helper = new RectAreaLightHelper(rectLight);
    rectLight.add(helper);

    return () => {
      scene.remove(rectLight);
    };
  }, [scene, position, lookAt, width, height]);

  return null;
};

interface CustomSpotLightProps {
  position: [number, number, number];
  targetPosition: [number, number, number];
  color: string | number;
  angle: number;
  penumbra: number;
  intensity: number;
  distance: number;
}
const CustomSpotLight: React.FC<CustomSpotLightProps> = ({
  position,
  targetPosition,
  color,
  angle,
  penumbra,
  intensity,
  distance,
}) => {
  const spotlightRef = useRef<ThreeSpotLight>(null);

  useEffect(() => {
    if (spotlightRef.current) {
      spotlightRef.current.target = new THREE.Object3D();
      spotlightRef.current.target.position.set(...targetPosition);
      spotlightRef.current.target.updateMatrixWorld();
      spotlightRef.current.add(spotlightRef.current.target);
    }
  }, [targetPosition]);

  return (
    <SpotLight
      ref={spotlightRef}
      position={position}
      angle={angle}
      penumbra={penumbra}
      intensity={intensity}
      distance={distance}
      castShadow
      color={color}
    />
  );
};

interface VirtualSpaceProps {
    basePath: string;
  }
const VirtualSpace: React.FC<ModelProps> = ({ basePath }) => {
  const [backgroundColor, setBackgroundColor] = useState("hsl(270, 50%, 50%)");

  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor }}>
      <Canvas camera={{ fov: 40 }}>
        <ambientLight intensity={3} />
        {/* <directionalLight intensity={3} position={[5, 5, -5]} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024}/> */}
        <Environment preset="night" />
        <AreaLight
          position={[0, 2.19, -4.6]}
          lookAt={[0, 10, -4.6]}
          width={9}
          height={0.1}
        />
        <AreaLight
          position={[0, 2.19, 4.6]}
          lookAt={[0, 10, 4.6]}
          width={9}
          height={0.1}
        />
        <AreaLight
          position={[-4.6, 2.19, 0]}
          lookAt={[-4.6, 10, 0]}
          width={0.1}
          height={9}
        />
        <AreaLight
          position={[4.6, 2.19, 0]}
          lookAt={[4.6, 10, 0]}
          width={0.1}
          height={9}
        />
        <CustomSpotLight
          position={[0, 2.1, -4.1]}
          targetPosition={[0, -1, 0]}
          color="white"
          angle={1}
          penumbra={0.1}
          intensity={1}
          distance={0}
        />
        {/* <pointLight position={[-1.5, 0, -1.5]} intensity={0} color={0xffffff} /> */}
        {/* <pointLight position={[1.5, 0, -1.5]} intensity={0} color={0xffffff} /> */}
        {/* <pointLight position={[-1.5, 0, 1.5]} intensity={0} color={0xffffff} /> */}
        {/* <pointLight position={[1.5, 0, 1.5]} intensity={0} color={0xffffff} /> */}
        <CustomSpotLight
          position={[-1.5, 2.5, -1.5]}
          targetPosition={[0, -1, 0]}
          color="white"
          angle={1.35}
          penumbra={0.1}
          intensity={1}
          distance={0}
        />
        <CustomSpotLight
          position={[1.5, 2.5, -1.5]}
          targetPosition={[0, -1, 0]}
          color="white"
          angle={1.35}
          penumbra={0.1}
          intensity={1}
          distance={0}
        />
        <CustomSpotLight
          position={[-1.5, 2.5, 1.5]}
          targetPosition={[0, -1, 0]}
          color="white"
          angle={1.35}
          penumbra={0.1}
          intensity={1}
          distance={0}
        />
        <CustomSpotLight
          position={[1.5, 2.5, 1.5]}
          targetPosition={[0, -1, 0]}
          color="white"
          angle={1.35}
          penumbra={0.1}
          intensity={1}
          distance={0}
        />

        <Model basePath={basePath}/>
        <OrbitControls
          maxAzimuthAngle={+120 * (Math.PI / 180)}
          minAzimuthAngle={-120 * (Math.PI / 180)}
          maxPolarAngle={90 * (Math.PI / 180)}
          minPolarAngle={90 * (Math.PI / 180)}
        />
        <EffectComposer>
          <N8AO
            color={"gray"}
            aoRadius={1}
            intensity={1}
            distanceFalloff={1}
            quality="low"
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default VirtualSpace;
