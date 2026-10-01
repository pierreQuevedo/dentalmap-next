"use client";

import { motion, useInView } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "cn";

// Custom hook to get previous value
const usePrevious = <T,>(value: T): T | undefined => {
  const [prev, setPrev] = useState<T | undefined>(undefined);
  const ref = useRef(value);

  useEffect(() => {
    setPrev(ref.current);
    ref.current = value;
  }, [value]);

  return prev;
};

interface ProcessStep {
  step: string;
  title: string;
  image: string;
  description: string;
}

interface Process2Props {
  heading: string;
  description: string;
  steps: ProcessStep[];
  link: { text: string; url: string };
  className?: string;
}
type Props = Partial<Process2Props>;

const defaultProps: Process2Props = {
  heading: "Our Process",
  description:
    "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Maxime amet dolorem eum est voluptatem id repellendus ut laborum laboriosam debitis.",
  link: { text: "Get in touch", url: "#" },
  steps: [
    {
      step: "01",
      title: "Discover & Research",
      image:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/guri4/img11.png",
      description:
        "We begin by understanding your business goals, target audience, and current challenges. This phase involves research, analysis, and strategic planning to identify opportunities.",
    },
    {
      step: "02",
      title: "Strategy & Planning",
      image:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/guri4/img12.png",
      description:
        "Based on our findings, we develop a comprehensive strategy that aligns with your objectives. This includes defining the approach, timeline, and key milestones for success.",
    },
    {
      step: "03",
      title: "Execute & Develop",
      image:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/guri4/img10.png",
      description:
        "We bring the strategy to life through careful implementation and development. Our team works collaboratively to ensure every detail meets your requirements and standards.",
    },
    {
      step: "04",
      title: "Optimize & Improve",
      image:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/guri4/img9.png",
      description:
        "We continuously monitor performance and gather feedback to refine and improve the solution. This iterative process ensures long-term success and growth.",
    },
  ],
};

const Process2 = (props: Props) => {
  const { heading, description, steps, link, className } = {
    ...defaultProps,
    ...props,
  };
  const process = steps;

  const [active, setActive] = useState<number>(0);
  const previousActive = usePrevious(active);

  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-20">
          <div className="top-10 h-fit w-fit gap-3 space-y-7 py-8 lg:sticky lg:top-20 lg:flex lg:h-[calc(100svh-5rem)] lg:flex-col lg:justify-center">
            <h2 className="relative w-fit text-5xl font-semibold tracking-tight lg:text-7xl">
              {heading}
            </h2>
            <p className="text-base text-muted-foreground">{description}</p>
            <div className="relative h-90 overflow-hidden border">
              {previousActive !== undefined && (
                <div className="absolute top-0 h-full w-full">
                  <img
                    src={process[previousActive].image}
                    className="h-full w-full object-cover"
                    alt=""
                  />
                </div>
              )}
              <motion.div
                initial={{ clipPath: "inset(100% 100% 0% 0%)" }}
                animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                key={active}
                transition={{
                  type: "spring",
                  stiffness: 150,
                  damping: 20,
                }}
                className="h-full w-full"
              >
                <img
                  src={process[active].image}
                  className="h-full w-full object-cover"
                  alt=""
                />
              </motion.div>
            </div>
            {/* Même lien que « Nous écrire » dans la FAQ : souligné, flèche, teal au survol. */}
            <a
              href={link.url}
              className="group flex h-auto w-fit p-0 text-start text-base font-medium transition-colors hover:text-teal sm:text-xl"
            >
              <span className="border-b-2 border-border pb-0.5 transition-colors group-hover:border-teal">
                {link.text}
              </span>
              <ArrowUpRight className="ml-1 h-6 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
          <ul className="relativew-full lg:pl-22">
            {process.map((step, index) => (
              <ProcessCard
                key={index}
                step={step}
                index={index}
                setActive={setActive}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

const ProcessCard = ({
  step,
  index,
  setActive,
}: {
  step: {
    step: string;
    title: string;
    image: string;
    description: string;
  };
  index: number;
  setActive: (index: number) => void;
}) => {
  // Observé : le numéro de l'étape, et non l'étape entière. Les marges
  // réduisent la zone d'observation à la ligne médiane de l'écran : l'image
  // change au moment précis où le chiffre passe au centre.
  const ref = useRef<HTMLDivElement>(null);

  const itemInView = useInView(ref, {
    amount: 0,
    margin: "-50% 0px -50% 0px",
  });

  useEffect(() => {
    if (itemInView) {
      setActive(index);
    }
  }, [itemInView, index, setActive]);

  return (
    <li
      key={index}
      className="relative flex flex-col justify-between gap-12 border-b py-8 lg:py-16"
    >
      <div ref={ref} className="flex w-fit items-center justify-center px-4 py-1 text-9xl tracking-tighter">
        0{index + 1}
      </div>
      <div>
        <h3 className="mb-4 text-2xl font-semibold tracking-tighter lg:text-3xl">
          {step.title}
        </h3>
        <p className="text-muted-foreground">{step.description}</p>
      </div>
    </li>
  );
};

export { Process2 };
