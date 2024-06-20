import VirtualSpace from '@/app/components/VirtualSpace';
import Link from 'next/link'

import nextConfig from "../../next.config.mjs";
const BASE_PATH = nextConfig.basePath || "";

export default function Home() {
  return (
    
    <main className={`mx-auto nax-w-[1960px] bg-white`}>
      <div className="">
        <div>
          <VirtualSpace basePath={BASE_PATH} />
        </div>
      </div>
    </main>
  );
}