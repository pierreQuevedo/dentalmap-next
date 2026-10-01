"use client";

import type React from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { cn } from "cn";

import { Card } from "@/components/ui/card";
interface Blog31Props {
  title: string;
  header: {
    /** Étiquette de la première colonne ; sans elle, la colonne disparaît. */
    label?: string;
    mainLine1: string;
    mainLine2?: string;
    sideNote: React.ReactNode;
  };
  blogs: {
    id: string;
    url: string;
    image: string;
    title: string;
    description: string;
    topNote?: string;
  }[];
  className?: string;
}

const Blog31 = ({
  title = "Knowledge Hub.",
  header = {
    label: "Blog",
    mainLine1:
      "Practical knowledge on design, technology, and digital innovation ",
    mainLine2: "to help your brand thrive.",
    sideNote:
      "From creative storytelling to engineering solutions discover strategies that drive real impact.",
  },
  blogs = [
    {
      id: "01",
      url: "https://shadcnblocks.com",
      topNote: "Feb 5, 2025",
      title: "The Rise of AI-Powered Design Tools",
      description:
        "How artificial intelligence is transforming creative workflows and making design more accessible.",
      image:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-1.svg",
    },
    {
      id: "02",
      url: "https://shadcnblocks.com",
      topNote: "Jan 22, 2025",
      title: "Sustainable Design in the Digital Age",
      description:
        "Why eco-conscious practices in digital products matter for the future of technology.",
      image:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-1.svg",
    },
    {
      id: "03",
      url: "https://shadcnblocks.com",
      topNote: "Jan 15, 2025",
      title: "Building Trust Through Transparent Branding",
      description:
        "Brands that embrace honesty and clarity are the ones earning lasting loyalty.",
      image:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-2.svg",
    },
    {
      id: "04",
      url: "https://shadcnblocks.com",
      topNote: "Dec 28, 2024",
      title: "Minimalism in Web Design: Timeless or Tired?",
      description:
        "Examining whether minimalism still holds power in 2025 or if brands are moving toward richer visuals.",
      image:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-3.svg",
    },
    {
      id: "05",
      url: "https://shadcnblocks.com",
      topNote: "Nov 8, 2024",
      title: "The Future of Motion in UX",
      description:
        "Micro-interactions and motion design are shaping how users experience digital platforms.",
      image:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-4.svg",
    },
    {
      id: "06",
      url: "https://shadcnblocks.com",
      topNote: "Sep 20, 2024",
      title: "Why Accessibility is a Competitive Advantage",
      description:
        "Making products accessible isn’t just inclusive, it’s smart business strategy.",
      image:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-5.svg",
    },
    {
      id: "07",
      url: "https://shadcnblocks.com",
      topNote: "May 14, 2024",
      title: "Custom Photography vs. Stock Images",
      description:
        "Which approach gives your brand the edge in a crowded digital space?",
      image:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-6.svg",
    },
  ],
  className,
}: Blog31Props) => {
  return (
    <section className={cn("bg-muted p-8 pt-24 pb-24", className)}>
      {/* Même gouttière que le block de la section « Explorer l'annuaire », pour aligner les deux. */}
      <div className="container px-4">
        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-5xl font-bold md:text-7xl"
        >
          {title}
        </motion.h2>

        {/* About intro row */}
        <div className="mt-12 flex flex-col gap-8 md:flex-row md:items-end md:gap-12">
          {/* Label */}
          {header.label && (
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex-[0.5]"
            >
              <p className="flex items-center gap-2 text-sm font-bold">
                <Plus size={20} className="rounded-full bg-teal p-0.5 text-white" />
                {header.label}
              </p>
            </motion.div>
          )}

          {/* Intro text */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex-[2] -space-x-8 text-lg"
          >
            {/* Les deux segments coulent dans le même paragraphe à toutes les tailles. */}
            <p className="indent-8 text-2xl font-medium md:text-3xl">
              <span className="">{header.mainLine1}</span>
              <span className="text-muted-foreground">{header.mainLine2}</span>
            </p>
          </motion.div>
          {/* Side note */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="flex flex-[1] text-sm text-muted-foreground md:justify-end"
          >
            {header.sideNote}
          </motion.div>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
          {blogs.map((blog, id) =>
            id === 0 ? (
              <Card
                key={id}
                className="min-h-[30rem] rounded-xl border-0 bg-background py-0 pt-0 shadow-none md:min-h-[32rem] xl:col-span-2"
              >
                <a href={blog.url} className="block h-full">
                  <div className="relative h-full w-full overflow-hidden rounded-xl">
                    <motion.img
                      src={blog.image}
                      alt={blog.title}
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="aspect-[4/3] h-full w-full bg-gradient-to-b from-black/10 to-black/50 object-cover"
                    />
                    {/* Hauteur minimale et non fixe, contenu calé en bas : le texte ne déborde plus du retrait. */}
                    <div className="absolute bottom-0 flex min-h-1/2 w-full flex-col justify-end gap-5 bg-gradient-to-b from-black/0 via-black/10 via-black/30 via-black/60 to-black/95 p-6 text-secondary md:p-10">
                      <span className="text-xs">{blog.topNote}</span>
                      <h3 className="text-xl font-semibold md:text-3xl">
                        {blog.title}
                      </h3>
                      <p className="text-sm md:text-base">{blog.description}</p>
                    </div>
                  </div>
                </a>
              </Card>
            ) : (
              <Card
                key={id}
                // Sur mobile, sans image, la carte prend la hauteur de son texte.
                className="col-span-1 rounded-xl border-0 p-0 shadow-none md:min-h-[32rem]"
              >
                <a href={blog.url} className="block h-full p-2 md:p-8">
                  <div className="flex h-full w-full flex-col justify-between gap-6 md:gap-12">
                    {/* Pas d'image sur les cartes secondaires : seule la première la porte. */}
                    <div className="flex w-full justify-end">
                      <p className="flex items-center gap-2 p-4 text-sm font-bold md:p-2">
                        <Plus
                          size={20}
                          className="rounded-full bg-teal p-0.5 text-white"
                        />
                      </p>
                    </div>
                    <div className="flex flex-col gap-6 p-4 md:p-2">
                      <span className="text-xs text-muted-foreground">
                        {blog.topNote}
                      </span>
                      <h3 className="text-base font-medium md:text-xl">
                        {blog.title}
                      </h3>
                      <p className="text-xs text-muted-foreground md:text-base">
                        {blog.description}
                      </p>
                    </div>
                  </div>
                </a>
              </Card>
            ),
          )}
        </div>
      </div>
    </section>
  );
};

export { Blog31 };
