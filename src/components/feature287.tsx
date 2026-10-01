import React from "react";
import { cn } from "cn";

import { GlowingStarsBackgroundCard } from "@/components/ui/glowing-stars";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Feature287Card {
  title: string;
  description: string;
  href: string;
  /** Photo de la carte ; sans elle, l'illustration à étoiles du block. */
  image?: { src: string; alt: string };
}

interface Feature287Props {
  heading: string;
  subheading?: string;
  /** Emplacement libre entre le titre et les cartes, pour des onglets par exemple. */
  tabs?: React.ReactNode;
  cards: Feature287Card[];
  button: { text: string; url: string };
  /** Mention sous le carrousel, pour l'attribution des fonds de carte par exemple. */
  attribution?: React.ReactNode;
  className?: string;
}
type Props = Partial<Feature287Props>;

const defaultProps: Feature287Props = {
  heading: "The Production Ready Blocks",
  subheading: "for your Next Project",
  cards: [
    { title: "June Collection", description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Commodi.", href: "#" },
    { title: "Summer Essentials", description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Commodi.", href: "#" },
    { title: "Premium Bundle", description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Commodi.", href: "#" },
    { title: "New Arrivals", description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Commodi.", href: "#" },
  ],
  button: { text: "View All Collections", url: "#" },
};

const Feature287 = (props: Props) => {
  const { heading, subheading, tabs, cards, button, attribution, className } = {
    ...defaultProps,
    ...props,
  };
  return (
    <section
      className={cn(
        "dark overflow-hidden bg-background py-32 text-foreground",
        className,
      )}
    >
      <div className="container flex w-full flex-col items-center justify-center px-4">
        <h2 className="relative mt-4 w-full max-w-7xl py-2 text-4xl font-semibold tracking-tighter lg:text-5xl">
          {heading}
          {subheading ? (
            <>
              <br />
              <span className="text-muted-foreground">{subheading}</span>
            </>
          ) : null}
        </h2>
        {tabs ? <div className="mt-8 w-full max-w-7xl">{tabs}</div> : null}
        <Carousel opts={{ align: "start" }} className="mt-10 w-full max-w-7xl">
          <CarouselContent className="-ml-3">
            {cards.map((card) => (
              <CarouselItem
                key={card.href}
                className="basis-[78%] pl-3 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <a
                  href={card.href}
                  className="flex h-full flex-col rounded-3xl bg-muted/60 p-4 transition-colors hover:bg-muted"
                >
                  {card.image ? (
                    <div className="relative h-55 overflow-hidden rounded-xl">
                      <img
                        src={card.image.src}
                        alt={card.image.alt}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                      {/* Dégradé du fond de la carte vers l'image, pour que le plan clair se fonde dans la tuile sombre. */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent via-55% to-transparent" />
                    </div>
                  ) : (
                    <GlowingStarsBackgroundCard className="h-55 max-w-full border-none !bg-muted-foreground" />
                  )}

                  <div className="mt-3 flex items-center justify-start gap-3">
                    <h3 className="text-xl font-semibold tracking-tighter">
                      {card.title}
                    </h3>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
                    {card.description}
                  </div>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">{attribution}</p>
            <div className="flex gap-2">
              <CarouselPrevious aria-label="Villes précédentes" className="static translate-x-0 translate-y-0" />
              <CarouselNext aria-label="Villes suivantes" className="static translate-x-0 translate-y-0" />
            </div>
          </div>
        </Carousel>

        <Button
          className="mt-10 h-10 rounded-full bg-brand !px-5 text-brand-foreground hover:bg-brand-hover"
          render={<a href={button.url} />}
          nativeButton={false}
        >
          {button.text}
        </Button>
      </div>
    </section>
  );
};

export { Feature287 };
