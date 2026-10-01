"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import React, { useActionState, useState } from "react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
interface Avatar {
  image: string;
  alt?: string;
  avatarClassName: string;
  className?: string;
  delay?: number;
}

const BookADemo2Avatar = ({
  image,
  alt,
  avatarClassName,
  className,
  delay,
}: Avatar) => {
  return (
    <div className={cn("relative", className)}>
      <motion.div
        animate={{
          x: [0, 10, 10, 0, 0],
          y: [0, 0, -10, -10, 0],
        }}
        transition={{
          duration: 10,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
          delay: delay ?? 0,
        }}
        className={cn(
          "relative size-14 rounded-full border-2 p-[1px]",
          avatarClassName,
        )}
      >
        <img
          src={image}
          alt={alt ?? ""}
          className="size-full rounded-full object-cover"
        />
      </motion.div>
    </div>
  );
};

interface Description {
  text: string;
  hyperlink: string;
  url: string;
}

interface Header {
  heading: string;
  description: Description;
  avatars: Avatar[];
}

const BookADemo2Header = ({ heading, description, avatars }: Header) => {
  return (
    <div className="relative flex w-full max-w-2xl flex-col items-center gap-4 text-center">
      <h2 className="text-4xl font-semibold sm:text-5xl md:text-6xl">
        {heading}
      </h2>

      <p className="font-medium text-muted-foreground sm:text-lg md:text-xl">
        <span>{description.text.split(description.hyperlink)[0]}</span>
        <span className="text-foreground">
          <a href={description.url} className="underline">
            {description.hyperlink}
          </a>
        </span>
        <span>{description.text.split(description.hyperlink)[1]}</span>
      </p>

      {avatars.length >= 2 && (
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          <BookADemo2Avatar
            className="absolute bottom-full left-full"
            {...avatars[0]}
          />
          <BookADemo2Avatar
            className="absolute top-full right-full"
            delay={1}
            {...avatars[1]}
          />
        </div>
      )}
    </div>
  );
};

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

const FormGroup = ({ children, className }: FormGroupProps) => {
  return <div className={cn("flex flex-col gap-2", className)}>{children}</div>;
};

export type EtatFormulaire = { ok: boolean; message: string } | null;
export type ActionFormulaire = (
  etat: EtatFormulaire,
  donnees: FormData,
) => Promise<EtatFormulaire>;

const ORGANISMES = [
  ["ordre", "Ordre départemental"],
  ["ecole", "École ou université"],
  ["syndicat", "Syndicat ou association"],
  ["editeur", "Éditeur de logiciel"],
  ["autre", "Autre"],
] as const;

const FONCTIONS = [
  ["dentiste", "Chirurgien-dentiste"],
  ["prothesiste", "Prothésiste dentaire"],
  ["direction", "Direction ou administration"],
  ["enseignement", "Enseignement"],
  ["autre", "Autre"],
] as const;

const BookADemo2ContactForm = ({ action }: { action?: ActionFormulaire }) => {
  const [etat, soumettre, enCours] = useActionState<EtatFormulaire, FormData>(
    action ?? (async () => null),
    null,
  );
  return (
    <div className="border-b p-8 lg:border-r lg:border-b-0">
      <form action={soumettre} className="grid grid-cols-2 gap-x-3 gap-y-6">
        <FormGroup className="col-span-2 sm:col-span-1">
          <Label htmlFor="partenaire-prenom">Prénom</Label>
          <Input id="partenaire-prenom" name="prenom" type="text" autoComplete="given-name" required />
        </FormGroup>
        <FormGroup className="col-span-2 sm:col-span-1">
          <Label htmlFor="partenaire-nom">Nom</Label>
          <Input id="partenaire-nom" name="nom" type="text" autoComplete="family-name" required />
        </FormGroup>
        <FormGroup className="col-span-2">
          <Label htmlFor="partenaire-email">Adresse électronique</Label>
          <Input id="partenaire-email" name="email" type="email" autoComplete="email" placeholder="prenom.nom@organisme.fr" required />
        </FormGroup>
        <FormGroup className="col-span-2 sm:col-span-1">
          <Label htmlFor="partenaire-organisme">Type d’organisme</Label>
          <Select name="organisme" required>
            <SelectTrigger id="partenaire-organisme" aria-label="Type d’organisme" className="w-full">
              <SelectValue placeholder="Choisir" />
            </SelectTrigger>
            <SelectContent>
              {ORGANISMES.map(([valeur, libelle]) => (
                <SelectItem key={valeur} value={valeur}>{libelle}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormGroup>
        <FormGroup className="col-span-2 sm:col-span-1">
          <Label htmlFor="partenaire-fonction">Votre fonction</Label>
          <Select name="fonction" required>
            <SelectTrigger id="partenaire-fonction" aria-label="Votre fonction" className="w-full">
              <SelectValue placeholder="Choisir" />
            </SelectTrigger>
            <SelectContent>
              {FONCTIONS.map(([valeur, libelle]) => (
                <SelectItem key={valeur} value={valeur}>{libelle}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormGroup>
        <FormGroup className="col-span-2">
          <Label htmlFor="partenaire-message">Votre projet</Label>
          <Textarea
            id="partenaire-message"
            name="message"
            placeholder="Qui vous êtes, ce que vous souhaitez partager ou relayer, et ce que vous attendez de DentalMap."
            // Hauteur fixe : la zone de texte défile au lieu de grandir, sans
            // quoi tout le bloc bougeait à chaque ligne saisie.
            className="h-32 field-sizing-fixed resize-none overflow-y-auto"
            required
          />
        </FormGroup>
        <Button
          type="submit"
          className="col-span-2 bg-teal text-white hover:bg-teal"
          size="lg"
          disabled={enCours}
        >
          {enCours ? "Envoi en cours…" : "Envoyer ma demande"} <ArrowRight />
        </Button>
        {etat && (
          <p
            role="status"
            className={cn("col-span-2 text-sm", etat.ok ? "text-foreground" : "text-destructive")}
          >
            {etat.message}
          </p>
        )}
      </form>
    </div>
  );
};

interface Author {
  name: string;
  designation: string;
  profilePicture: string;
}

interface Quote {
  fullQuote: string;
  highlightedWords: string[];
}

interface Testimonial {
  companyLogo?: string;
  quote: Quote;
  author: Author;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}

const BookADemo2Testimonials = ({ testimonials }: TestimonialsProps) => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  return (
    <div className="relative flex h-full p-8">
      <div className="absolute top-8 right-8 flex items-center gap-2">
        <Button
          size="sm"
          aria-label="Précédent"
          className="bg-brand text-brand-foreground hover:bg-brand-hover"
          onClick={() =>
            setActiveTestimonial(
              (activeTestimonial + testimonials.length - 1) %
                testimonials.length,
            )
          }
        >
          <ArrowLeft />
        </Button>
        <Button
          size="sm"
          aria-label="Suivant"
          className="bg-brand text-brand-foreground hover:bg-brand-hover"
          onClick={() =>
            setActiveTestimonial((activeTestimonial + 1) % testimonials.length)
          }
        >
          <ArrowRight />
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {testimonials.map((testimonial, index) => {
          if (index !== activeTestimonial) return null;

          return (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              key={`testimonial-${index}`}
              className="flex h-full flex-col justify-between gap-12"
            >
              <div className="flex items-center gap-3">
                {testimonial.companyLogo && (
                  <img
                    src={testimonial.companyLogo}
                    alt={`${testimonial.author.name} company logo`}
                    className="h-6 w-auto object-contain brightness-0 md:h-8 dark:invert"
                  />
                )}
              </div>

              <div className="space-y-6">
                <blockquote className="leading-snug text-muted-foreground sm:text-lg lg:max-w-md">
                  {testimonial.quote.fullQuote
                    .split(" ")
                    .map((word, wordIndex) => {
                      const isHighlighted =
                        testimonial.quote.highlightedWords.some((highlighted) =>
                          word
                            .toLowerCase()
                            .includes(highlighted.toLowerCase()),
                        );
                      return (
                        <span
                          key={wordIndex}
                          className={
                            isHighlighted ? "font-medium text-foreground" : ""
                          }
                        >
                          {word}{" "}
                        </span>
                      );
                    })}
                </blockquote>

                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.author.profilePicture}
                    alt={testimonial.author.name}
                    className="size-9 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-sm font-medium">
                      {testimonial.author.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.author.designation}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

interface Footer {
  heading: string;
  logos: string[];
}

const BookADemo2Footer = ({ heading, logos }: Footer) => {
  if (logos.length === 0) return null;
  return (
    <div className="flex w-full max-w-6xl flex-col items-center gap-14 text-center">
      <h3 className="text-sm font-medium text-muted-foreground">{heading}</h3>
      <div className="flex w-full flex-wrap items-center justify-center gap-10 md:grid md:grid-cols-5">
        {logos.map((logo, index) => {
          return (
            <img
              key={`bookademo2-footer-logo-${index}`}
              src={logo}
              alt={`logo ${index + 1}`}
              className={cn(
                "h-6 place-self-center object-contain brightness-0 md:h-8 dark:invert",
                index > 5 && "hidden md:block",
              )}
            />
          );
        })}
      </div>
    </div>
  );
};

interface BookADemo2Props {
  className?: string;
  header: Header;
  testimonials: Testimonial[];
  footer: Footer;
  action?: ActionFormulaire;
}

const BookADemo2 = ({
  action,
  header = {
    heading: "Schedule a demo",
    description: {
      text: "Book a demo to explore our development platform and discover how it can accelerate your team's productivity. If you have technical questions, feel free to reach out to our team.",
      hyperlink: "reach out to our team",
      url: "https://shadcnblocks.com",
    },
    avatars: [
      {
        image:
          "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/portraits/christian-buehner-DItYlc26zVI-unsplash 1.jpg",
        avatarClassName: "border-foreground",
      },
      {
        image:
          "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/portraits/christian-buehner-DItYlc26zVI-unsplash 1.jpg",
        avatarClassName: "border-muted-foreground",
      },
    ],
  },
  testimonials = [
    {
      companyLogo:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-1.svg",
      quote: {
        fullQuote:
          "This platform has revolutionized our development workflow. The productivity gains have been incredible.",
        highlightedWords: [
          "revolutionized",
          "productivity",
          "gains",
          "incredible",
        ],
      },
      author: {
        name: "Alex Chen",
        designation: "Lead Developer",
        profilePicture:
          "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/portraits/alexander-hipp-iEEBWgY_6lA-unsplash.jpg",
      },
    },
    {
      companyLogo:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-2.svg",
      quote: {
        fullQuote:
          "The integration was seamless and our team was up and running in minutes. Game changer for our startup.",
        highlightedWords: ["seamless", "minutes", "Game", "changer"],
      },
      author: {
        name: "Marcus Rodriguez",
        designation: "CTO",
        profilePicture:
          "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/portraits/christian-buehner-DItYlc26zVI-unsplash 1.jpg",
      },
    },
    {
      companyLogo:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-3.svg",
      quote: {
        fullQuote:
          "We've reduced our development time by 40% since implementing this solution. Highly recommend it.",
        highlightedWords: ["reduced", "40%", "Highly", "recommend"],
      },
      author: {
        name: "Emily Watson",
        designation: "Engineering Manager",
        profilePicture:
          "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/portraits/good-faces-xmSWVeGEnJw-unsplash.jpg",
      },
    },
    {
      companyLogo:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-4.svg",
      quote: {
        fullQuote:
          "The developer experience is outstanding. Our team adoption was instant and the learning curve was minimal.",
        highlightedWords: ["outstanding", "instant", "minimal"],
      },
      author: {
        name: "David Kim",
        designation: "Senior Developer",
        profilePicture:
          "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/portraits/joseph-gonzalez-iFgRcqHznqg-unsplash.jpg",
      },
    },
    {
      companyLogo:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-5.svg",
      quote: {
        fullQuote:
          "We've seen a 60% improvement in our deployment frequency since switching to this platform. Absolutely game-changing.",
        highlightedWords: ["60%", "improvement", "game-changing"],
      },
      author: {
        name: "Lisa Thompson",
        designation: "DevOps Engineer",
        profilePicture:
          "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/portraits/michael-dam-mEZ3PoFGs_k-unsplash.jpg",
      },
    },
    {
      companyLogo:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-6.svg",
      quote: {
        fullQuote:
          "The collaboration features have transformed how our remote team works together. It's like having the whole team in one room.",
        highlightedWords: ["transformed", "collaboration", "together"],
      },
      author: {
        name: "James Wilson",
        designation: "Product Manager",
        profilePicture:
          "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/portraits/nima-motaghian-nejad-_omdf_EgRUo-unsplash.jpg",
      },
    },
  ],
  footer = {
    heading: "Trusted by development teams worldwide",
    logos: [
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-1.svg",
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-2.svg",
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-3.svg",
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-4.svg",
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-5.svg",
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-6.svg",
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-7.svg",
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-8.svg",
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-9.svg",
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-10.svg",
    ],
  },
  className,
}: BookADemo2Props) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="flex flex-col items-center gap-12 lg:gap-24">
          <BookADemo2Header {...header} />
          <div className="grid max-w-6xl grid-cols-1 rounded-lg border lg:grid-cols-2">
            <BookADemo2ContactForm action={action} />
            <BookADemo2Testimonials testimonials={testimonials} />
          </div>
          <BookADemo2Footer {...footer} />
        </div>
      </div>
    </section>
  );
};

export { BookADemo2 };
