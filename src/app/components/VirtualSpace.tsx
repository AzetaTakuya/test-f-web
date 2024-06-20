// components/StartPage.js
"use client";
import React, { useRef, useEffect, useState, useMemo, RefObject  } from "react";
import { useSearchParams } from "next/navigation";
import * as THREE from "three";
import { Canvas, useThree, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF, useProgress } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Environment, SpotLight, Text } from "@react-three/drei";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import { SpotLight as ThreeSpotLight } from "three";
import { EffectComposer, N8AO } from "@react-three/postprocessing";

interface ModelProps {
  basePath: string;
  onProgress: (progress: number) => void;
}
const Model: React.FC<ModelProps> = ({ basePath, onProgress }) => {
    const url = `${basePath}/room.glb`;
    const size = 61473688;

    const gltf = useLoader(GLTFLoader, `${basePath}/room.glb`, undefined, (xhr) => {
            const percentage = parseFloat(((xhr.loaded) / (size) * 100).toFixed(0));
            onProgress(percentage);

        }
    )

    return (
        <primitive object={gltf.scene} />
    );
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

interface VerticalTextProps {
  text: string;
  position: [number, number, number];
  fontSize: number;
  color: string | number;
  font: string;
}
const VerticalText: React.FC<VerticalTextProps> = ({
  text,
  position,
  fontSize,
  color,
  font,
}) => {
  const characters = text.split("");
  return (
    <>
      {characters.map((char, index) => (
        <Text
          key={index}
          position={[position[0], position[1] - index * fontSize, position[2]]}
          fontSize={fontSize}
          color={color}
          font={font}
        >
          {char}
        </Text>
      ))}
    </>
  );
};

type BoxProps = JSX.IntrinsicElements["mesh"] & { index: string };
const Box = ({ index, ...props }: BoxProps) => {
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  const searchParams = useSearchParams();
  const query = "link" + index;
  const url = searchParams.get(query);

  const onClick = () => {
    if (url) {
      window.open(url, "_self");
    } else {
      console.error("URL is null");
    }
  };
  const handlePointerOver = (event: any) => {
    setHover(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (event: any) => {
    setHover(false);
    document.body.style.cursor = "default";
  };

  return (
    <mesh
      {...props}
      onClick={onClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <boxGeometry args={[1.4, 2.5, 0.1]} />
      <meshStandardMaterial
        color={active ? "red" : hovered ? "blue" : "transparent"}
        opacity={active || hovered ? 0.2 : 0}
        transparent
      />
    </mesh>
  );
};

interface ResizeHandlerProps {
  containerRef: RefObject<HTMLDivElement>;
  setAspect: React.Dispatch<React.SetStateAction<number>>;
}
const ResizeHandler: React.FC<ResizeHandlerProps> = ({ containerRef, setAspect }) => {

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        const aspect = Math.min(width / height, 1);
        setAspect(aspect);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
  }, [containerRef, setAspect]);

  return <></>;
};
interface SceneProps {
  aspect: number;
}

const Scene: React.FC<SceneProps> = ({ aspect }) => {
  const { camera } = useThree();
  useEffect(() => {
    const perspectiveCamera = camera as THREE.PerspectiveCamera;
    perspectiveCamera.fov = Math.min(40 / aspect, 90);
    console.log(perspectiveCamera.fov);

    perspectiveCamera.updateProjectionMatrix();
  }, [aspect, camera]);

  return <></>;
};



interface VirtualSpaceProps {
  basePath: string;
  onProgress: (progress: number) => void;
}
const VirtualSpace: React.FC<ModelProps> = ({ basePath, onProgress }) => {
  const [backgroundColor, setBackgroundColor] = useState("hsl(0, 0%, 100%)");

  const { progress } = useProgress();

  useEffect(() => {
    if(progress >= 100){
        onProgress(101);
    }
  }, [progress, onProgress]);

  const containerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
  const [aspect, setAspect] = useState(1);

  return (
    <div ref={containerRef} style={{ width: "100vw", height: "100vh", backgroundColor }}>
      <ResizeHandler containerRef={containerRef} setAspect={setAspect} />
      <Canvas camera={{ fov: 40 }}>
        <Scene aspect={aspect} />
        <ambientLight intensity={3} />
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

        <Model basePath={basePath} onProgress={onProgress} />
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
        <VerticalText
          text="浮世絵デジタル美術展"
          position={[-1 - 0.3, 0.1, -4.75]}
          fontSize={0.2}
          color="white"
          font={`${basePath}/NotoSansJP-Regular.ttf`}
        />
        <VerticalText
          text="市民作品展"
          position={[1 - 0.3, 0.1, -4.75]}
          fontSize={0.2}
          color="white"
          font={`${basePath}/NotoSansJP-Regular.ttf`}
        />
        <Box position={[-1, -0.7, -5 + 0.15]} index={"0"} />
        <Box position={[1, -0.7, -5 + 0.15]} index={"1"} />
      </Canvas>
    </div>
  );
};

export default VirtualSpace;
