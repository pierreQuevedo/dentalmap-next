import { ArrowUpRight } from "lucide-react";
import { cn } from "cn";

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

interface CtaImageBackgroundProps {
  heading: string;
  description: string;
  image: Image;
  buttons: {
    primary: Button;
    secondary?: Button;
  };
  className?: string;
}

type Props = Partial<CtaImageBackgroundProps>;

const defaultProps: CtaImageBackgroundProps = {
  heading: "Call to Action",
  description: "Try our service free for 7 days. No credit card required.",
  image: {
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/full-width-backgrounds/andrew-kliatskyi-uBg4k82xnI4-unsplash.jpg",
    alt: "Sunlight through trees above a green forest valley",
  },
  buttons: {
    primary: {
      text: "Start free trial",
      url: "https://www.shadcnblocks.com",
    },
    secondary: {
      text: "Request a demo",
      url: "https://www.shadcnblocks.com",
    },
  },
};

const Cta42 = (props: Props) => {
  const { heading, description, image, buttons, className } = {
    ...defaultProps,
    ...props,
  };

  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="relative h-[300px] overflow-hidden rounded-lg md:h-[500px]">
          <img
            src={image.src}
            alt={image.alt}
            className="h-full w-full object-cover"
          />
          <div
            aria-hidden
            // Ombre intérieure en ardoise : un halo qui fonce les bords de la carte et ramène l'œil au centre.
            className="pointer-events-none absolute inset-0 z-1 bg-[radial-gradient(ellipse_86%_80%_at_50%_50%,rgb(0_0_0/0.56),rgb(0_0_0/0.24)_44%,rgb(0_0_0/0.1)_58%,transparent_84%),linear-gradient(rgb(0_0_0/0.1),rgb(0_0_0/0.1))] [box-shadow:inset_0_0_140px_30px_color-mix(in_oklch,var(--color-ardoise)_90%,transparent)]"
          />
          <div className="absolute inset-0 z-2 mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-6 p-6 text-center text-white">
            <h2 className="mx-auto max-w-3xl text-2xl font-semibold tracking-tight text-balance md:text-5xl">
              {heading}
            </h2>
            <p className="max-w-5xl text-base font-medium text-white/90 md:text-lg">
              {description}
            </p>
            <Button
              size="lg"
              className="bg-background text-foreground hover:bg-background/90"
              render={<a href={buttons.primary.url} />}
              nativeButton={false}
            >
              {buttons.primary.text}
              <ArrowUpRight className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Cta42 };
