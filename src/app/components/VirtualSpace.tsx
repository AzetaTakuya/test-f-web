// components/StartPage.js
"use client";
import React, { useRef, useEffect, useState, useMemo, RefObject  } from "react";
import { useSearchParams } from "next/navigation";
import * as THREE from "three";
import { Object3D } from 'three';
import { Canvas, useThree, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF, useProgress } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Environment, SpotLight, Text } from "@react-three/drei";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import { SpotLight as ThreeSpotLight } from "three";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import { TextureLoader } from 'three/src/loaders/TextureLoader.js';


interface ModelProps {
  basePath: string;
  onProgress: (progress: number) => void;
  isClick0: boolean;
  isClick1: boolean;
  setClick0: React.Dispatch<React.SetStateAction<boolean>>;
  setClick1: React.Dispatch<React.SetStateAction<boolean>>;
}
const Model: React.FC<ModelProps> = ({ basePath, onProgress, isClick0, isClick1, setClick0, setClick1 }) => {
    const size = 586824;

    const modelLink0Ref = useRef<Object3D | null>(null);
    const modelLink1Ref = useRef<Object3D | null>(null);
    const [rotationCompleted, setRotationCompleted] = useState(false);

    const gltf = useLoader(GLTFLoader, `${basePath}/room-compression5.glb`, undefined, (xhr) => {
            const percentage = parseFloat(((xhr.loaded) / (size) * 100).toFixed(0));
            onProgress(percentage);
        }
    )
    const logo = useLoader(TextureLoader, `${basePath}/logo_FDA.svg`);
    const poster0 = useLoader(TextureLoader, `${basePath}/art_fes-80.jpg`);
    const poster1 = useLoader(TextureLoader, `${basePath}/art_joron-80.jpg`);


   
    const [transition, setTransition] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);


    useEffect(() => {
      if (gltf) {
        const modelLink0 = gltf.scene.getObjectByName('link0-door');
        const modelLink1 = gltf.scene.getObjectByName('link1-door');
        if (modelLink0) {
          modelLink0Ref.current = modelLink0;
        }
        if(modelLink1){
          modelLink1Ref.current = modelLink1;
        }
      }
    }, [gltf]);

    useEffect(() => {
      if (transition) {
        timerRef.current = setTimeout(() => {
          console.log("トランジションクリア！！！");
          setTransition(false);
          if(modelLink0Ref.current)
            modelLink0Ref.current.rotation.y = 0;
          if(modelLink1Ref.current)
            modelLink1Ref.current.rotation.y = 0;
        }, 2000);
        return () => {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            setClick0(false);
            setClick1(false);
          }
        };
      }
    }, [transition]);
  

    useFrame(() => {
      if(transition) {
        return;
      }
      if (isClick0 && modelLink0Ref.current) {
        const rotationSpeed = 0.05;
        const targetRotation = -120 * (Math.PI / 180);
        if (modelLink0Ref.current.rotation.y > targetRotation) {
          modelLink0Ref.current.rotation.y -= rotationSpeed;
        } else {
          modelLink0Ref.current.rotation.y = targetRotation; 
          setTransition(true);
          setClick0(false);
        }
      }

      if (isClick1 && modelLink1Ref.current) {
        const rotationSpeed = 0.05;
        const targetRotation = -120 * (Math.PI / 180);
        if (modelLink1Ref.current.rotation.y > targetRotation) {
          modelLink1Ref.current.rotation.y -= rotationSpeed;
        } else {
          modelLink1Ref.current.rotation.y = targetRotation; 
          setTransition(true);
          setClick1(false);
        }
      }
    });

    return (
      <>
        <primitive object={gltf.scene} />
        <mesh position={[-3.683, 0, -4.85]} rotation={[Math.PI / 180, 0, 0]}>
          <planeGeometry args={[181 / 130, 54 / 130]} />
          <meshBasicMaterial map={logo} transparent={true} />
        </mesh>
        <mesh position={[-4.95, 0, 0]} rotation={[0 , Math.PI / 180 * 90, 0]}>
          <planeGeometry args={[2048 / 400, 1152 / 400]} />
          <meshStandardMaterial map={poster0} transparent={true} />
        </mesh>
        <mesh position={[4.95, 0, 0]} rotation={[0 , Math.PI / 180 * -90, 0]}>
          <planeGeometry args={[2048 / 400, 1152 / 400]} />
          <meshStandardMaterial map={poster1} transparent={true} />
        </mesh>
      </>
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

type BoxProps = JSX.IntrinsicElements["mesh"] & { 
  index: string; 
  setClick: React.Dispatch<React.SetStateAction<boolean>>;
};
const Box = ({ index, setClick, ...props }: BoxProps) => {
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  const searchParams = useSearchParams();
  const query = "link" + index;
  const url = searchParams.get(query);

  const onClick = () => {
    setClick(true);
    setTimeout(() => {
      if (url) {
        // window.open(url, "_self");
        if(window.top)window.top.location.href = url;
      } else {
        console.error("URL is null");
      }
    }, 1000);
    
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

const TransitionBox = ({ index, setClick, ...props }: BoxProps) => {
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  const searchParams = useSearchParams();
  const query = "link" + index;
  const url = searchParams.get(query);

  const onClick = () => {
    if (url) {
      // window.open(url, "_self");
      if(window.top)window.top.location.href = url;
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
      <boxGeometry args={[0.1, 1152 / 400, 2048 / 400]} />
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
    // console.log(perspectiveCamera.fov);

    perspectiveCamera.updateProjectionMatrix();
  }, [aspect, camera]);

  return <></>;
};

const CustomOrbitControls: React.FC = () => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const autoRotateTimeout = useRef<number | undefined>();
  const autoRotateSpeedRef = useRef(-2);

  useEffect(() => {
    const startAutoRotate = () => {
      if (controlsRef.current) {
        controlsRef.current.autoRotate = true;
        controlsRef.current.autoRotateSpeed = autoRotateSpeedRef.current;
        // controlsRef.current.update();
      }
    };
  
    const stopAutoRotate = () => {
      if (controlsRef.current) {
        controlsRef.current.autoRotate = false;
        // controlsRef.current.update();
      }
      if (autoRotateTimeout.current) {
        clearTimeout(autoRotateTimeout.current);
      }
      autoRotateTimeout.current = window.setTimeout(startAutoRotate, 3000);
    };

    if (controlsRef.current) {
      controlsRef.current.addEventListener('start', stopAutoRotate);
      controlsRef.current.addEventListener('end', stopAutoRotate);
      
    }
    autoRotateTimeout.current = window.setTimeout(startAutoRotate, 2000);

    return () => {
      if (controlsRef.current) {
        controlsRef.current.removeEventListener('start', stopAutoRotate);
        controlsRef.current.removeEventListener('end', stopAutoRotate);
      }
      if (autoRotateTimeout.current) {
        clearTimeout(autoRotateTimeout.current);
      }
    };
  }, [controlsRef]);

  useFrame(() => {
    if (controlsRef.current) {
      const azimuthAngle = controlsRef.current.getAzimuthalAngle();
      const maxAzimuth = +95 * (Math.PI / 180);
      const minAzimuth = -95 * (Math.PI / 180);

      if (azimuthAngle >= maxAzimuth || azimuthAngle <= minAzimuth) {
        autoRotateSpeedRef.current = -autoRotateSpeedRef.current;
        controlsRef.current.autoRotateSpeed = autoRotateSpeedRef.current;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={false}
      enablePan={false}
      maxAzimuthAngle={+95 * (Math.PI / 180)}
      minAzimuthAngle={-95 * (Math.PI / 180)}
      maxPolarAngle={90 * (Math.PI / 180)}
      minPolarAngle={90 * (Math.PI / 180)}
      autoRotate={false}
      autoRotateSpeed={autoRotateSpeedRef.current}
      enableDamping={false}
      rotateSpeed={-1}
    />
  );
};


interface VirtualSpaceProps {
  basePath: string;
  onProgress: (progress: number) => void;
}
const VirtualSpace: React.FC<VirtualSpaceProps> = ({ basePath, onProgress }) => {
  const [backgroundColor, setBackgroundColor] = useState("hsl(0, 0%, 100%)");
  const [boxClick0, setBoxClick0] = useState(false);
  const [boxClick1, setBoxClick1] = useState(false);
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
        <ambientLight intensity={2.5} />
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
          position={[-4.1, 2.1, 0]}
          targetPosition={[0, -1, 0]}
          color="white"
          angle={1}
          penumbra={0.1}
          intensity={1}
          distance={0}
        />
        <CustomSpotLight
          position={[4.1, 2.1, 0]}
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

        <Model basePath={basePath} onProgress={onProgress} isClick0={boxClick0} isClick1={boxClick1} setClick0={setBoxClick0} setClick1={setBoxClick1}/>
        <CustomOrbitControls />
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
          position={[-1 - 0.3, 0.1, -4.799]}
          fontSize={0.2}
          color="white"
          font={`${basePath}/NotoSansJP-Regular.ttf`}
        />
        <VerticalText
          text="市民作品展"
          position={[1 - 0.3, 0.1, -4.799]}
          fontSize={0.2}
          color="white"
          font={`${basePath}/NotoSansJP-Regular.ttf`}
        />
        <Box position={[-1, -0.7, -5 + 0.15]} index={"0"} setClick={setBoxClick0}/>
        <Box position={[1, -0.7, -5 + 0.15]} index={"1"} setClick={setBoxClick1}/>
        <TransitionBox position={[-4.95, 0, 0]} index={"2"} setClick={setBoxClick0} />
        <TransitionBox position={[4.95, 0, 0]} index={"3"} setClick={setBoxClick0} />
      </Canvas>
    </div>
  );
};

export default VirtualSpace;
