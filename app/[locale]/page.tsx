import { ParticleTextEffect } from "@/components/particle-text-effect";
import { Button } from "@/components/ui/button"
import { CardStack, CardStackItem } from "@/components/ui/card-stack";
import { useTranslations } from "next-intl";


const HomePage = () => {
  const t = useTranslations('HomePage');
  const items: CardStackItem[] = [
    {
      id: 1,
      title: "Ajay Rahul - CEO, Game Designer",
      description: "Strategic leader with a vision for innovative game experiences and company growth",
      imageSrc: "/team/ajay_rahul.webp",
      href: "https://www.ruixen.com/",
    },
    {
      id: 2,
      title: "Shekinah Florance - Full-Stack Developer",
      description: "Where beauty meets functionality",
      imageSrc: "/team/sekinah.webp",
      href: "https://www.ruixen.com/",
    },
    {
      id: 3,
      title: "Balasundar B - Junior Developer",
      description: "Where beauty meets functionality",
      imageSrc: "/team/balasundar.webp",
      href: "https://www.ruixen.com/",
    },
    {
      id: 4,
      title: "Renin Oliver - Creative Editor",
      description: "Unleash the true potential of the road",
      imageSrc: "/team/renin_oliver.webp",
      href: "https://www.ruixen.com/",
    },
    {
      id: 5,
      title: "Jegan - 3D Artist",
      description: "Built with passion, driven by excellence",
      imageSrc: "/team/jegan.webp",
      href: "https://www.ruixen.com/",
    },
    {
      id: 6,
      title: "Vignesh - 3D Artist",
      description: "Innovation that moves you forward",
      imageSrc: "/team/vignesh.webp",
      href: "https://www.ruixen.com/",
    },
    {
      id: 7,
      title: "Abinanth K - Concept Artist",
      description: "Innovation that moves you forward",
      imageSrc: "/team/abinanth.webp",
      href: "https://www.ruixen.com/",
    },
    {
      id: 8,
      title: "Ajay Chandru - Test Engineer",
      description: "Innovation that moves you forward",
      imageSrc: "/team/ajay_chandru.webp",
      href: "https://www.ruixen.com/",
    },
    {
      id: 9,
      title: "Mahesh Krishnan - Technical Artist",
      description: "Innovation that moves you forward",
      imageSrc: "/team/mahesh_krishnan.webp",
      href: "https://www.ruixen.com/",
    },
  ];
  return (
    <div className="h-screen overflow-x-hidden">


      <div className="">
        <div className="mx-auto w-full p-8">
          <CardStack
            items={items}
            initialIndex={0}
            autoAdvance
            intervalMs={2000}
            pauseOnHover
            showDots
          />
        </div>
      </div>
      <div className="absolute top-10 left-10">

        <h1>{t('title')}</h1>
      </div>
    </div>
  )
}

export default HomePage