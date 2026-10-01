import { MoveRight } from "lucide-react";
import { cn } from "cn";

import {
  Marquee,
  MarqueeContent,
  MarqueeItem,
} from "@/components/kibo-ui/marquee";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Image {
  src: string;
  alt: string;
  srcDark?: string;
}
interface Button {
  text: string;
  url: string;
  icon?: React.ReactNode;
}
interface Buttons {
  primary?: Button;
  secondary?: Button;
}
interface Badge {
  text: string;
  announcement?: string;
  url?: string;
}
interface Logo {
  src: string;
  alt: string;
  srcDark?: string;
  className?: string;
}

interface HeroFullscreenProps {
  className?: string;
  /** Photo de fond ; facultative quand `background` fournit un décor composé. */
  backgroundImage?: Image;
  /** Décor rendu sous le contenu, à la place ou par-dessus la photo. */
  background?: React.ReactNode;
  heading: string;
  buttons?: Buttons;
  /** Rendu à la place du bouton principal quand il n'y en a pas, un formulaire par exemple. */
  action?: React.ReactNode;
  badge?: Badge | string;
  logos?: Logo[];
  logosLabel?: string;
}

interface Hero140Props extends HeroFullscreenProps {}
type Props = Partial<Hero140Props>;

const defaultProps: Hero140Props = {
  backgroundImage: {
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/fullscreen/andrew-kliatskyi-HHK2xGa6vJo-unsplash.jpg",
    alt: "Full-bleed background",
  },
  heading: "Introducing the world's best marketing software.",
  buttons: {
    primary: {
      text: "Get Started",
      url: "#",
    },
  },
  badge: {
    text: "New",
    announcement: "Check Out Our New Projects",
    url: "#",
  },
  logosLabel: "Empowering brilliant teams to create greatness",
  logos: [
    {
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/logos/fictional-company-logo-white-1.svg",
      alt: "Company logo 1",
    },
    {
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/logos/fictional-company-logo-white-2.svg",
      alt: "Company logo 2",
    },
    {
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/logos/fictional-company-logo-white-3.svg",
      alt: "Company logo 3",
    },
    {
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/logos/fictional-company-logo-white-4.svg",
      alt: "Company logo 4",
    },
    {
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/logos/fictional-company-logo-white-5.svg",
      alt: "Company logo 5",
    },
    {
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/logos/fictional-company-logo-white-6.svg",
      alt: "Company logo 6",
    },
    {
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/logos/fictional-company-logo-white-7.svg",
      alt: "Company logo 7",
    },
    {
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/logos/fictional-company-logo-white-8.svg",
      alt: "Company logo 8",
    },
    {
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/logos/fictional-company-logo-white-9.svg",
      alt: "Company logo 9",
    },
    {
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/logos/fictional-company-logo-white-10.svg",
      alt: "Company logo 10",
    },
  ],
};

const MAX_LOGOS = 20;

const Hero140 = (props: Props) => {
  const {
    backgroundImage,
    background,
    badge,
    heading,
    buttons,
    action,
    logos,
    logosLabel,
    className,
  } = {
    ...defaultProps,
    ...props,
  };

  const logoRow = (logos ?? []).slice(0, MAX_LOGOS);
  const badgeData = typeof badge === "string" ? { text: badge } : badge;

  return (
    <section
      style={backgroundImage && !background ? { backgroundImage: `url('${backgroundImage.src}')` } : undefined}
      className={cn(
        "dark relative min-h-svh w-full bg-cover bg-top-left bg-no-repeat",
        className,
      )}
    >
      {background}
      <div className="relative z-10 container flex min-h-[inherit] w-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center py-16">
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 md:max-w-4xl lg:max-w-5xl">
            {badgeData?.text && (
              <div className="pb-2">
                {/* Un seul fond : la capsule extérieure, floutée ; le badge lui-même reste transparent. */}
                <div className="flex w-fit items-center gap-4 rounded-full border border-white/10 bg-black/30 px-4 py-2 backdrop-blur-sm">
                  <Badge className="rounded-full bg-transparent px-1 text-xs leading-none! font-medium text-white/90 md:text-sm">
                    {badgeData.text}
                  </Badge>
                  {badgeData.announcement && (
                    <a
                      href={badgeData.url ?? "#"}
                      className="group flex w-fit items-center gap-2 text-xs font-medium text-white/60 md:text-sm"
                    >
                      <p className="group-hover:text-white/80 group-hover:underline">
                        {badgeData.announcement}
                      </p>
                      <MoveRight className="h-3.5 w-3.5 stroke-white/60 transition group-hover:stroke-white/80" />
                    </a>
                  )}
                </div>
              </div>
            )}
            <h1 className="max-w-4xl text-center text-4xl leading-tight font-normal text-foreground md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight">
              {heading}
            </h1>
            {buttons?.primary ? (
              <Button
                className="block h-fit w-fit rounded-full bg-brand px-9 py-3 text-sm font-bold text-brand-foreground hover:bg-brand-hover"
                render={<a href={buttons.primary.url} />}
                nativeButton={false}
              >
                {buttons.primary.text}
              </Button>
            ) : (
              action
            )}
          </div>
        </div>
        {(logosLabel || logoRow.length > 0) && (
          <div className="w-full shrink-0 pb-6 md:pb-8">
            {logosLabel && (
              <p className="mb-8 text-center text-base font-medium text-foreground/60">
                {logosLabel}
              </p>
            )}
            {logoRow.length > 0 && (
              <Marquee className="relative w-full mask-[linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
                <MarqueeContent>
                  {logoRow.map((logo, index) => (
                    <MarqueeItem key={`${logo.src}-${index}`}>
                      <img
                        src={logo.src}
                        alt={logo.alt}
                        className={cn(
                          "mx-8 h-7 w-auto object-contain object-center md:h-8",
                          logo.className,
                        )}
                      />
                    </MarqueeItem>
                  ))}
                </MarqueeContent>
              </Marquee>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export { Hero140 };
