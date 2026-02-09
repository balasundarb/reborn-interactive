import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl";

const HomePage = () => {
  const t = useTranslations('HomePage');
  return (
    <div className="h-screen flex flex-col gap-4 justify-center items-center">HomePage
      <h1>{t('title')}</h1>
      <Button>This is a text button</Button>
    </div>
  )
}

export default HomePage