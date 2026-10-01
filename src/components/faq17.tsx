"use client";

import { ArrowUpRight } from "lucide-react";
import { cn } from "cn";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
interface FaqItem {
  question: string;
  answer: string;
}

interface ProfileInfo {
  name: string;
  title: string;
  image: string;
}

interface Faq17Props {
  heading?: string;
  profileInfo?: ProfileInfo;
  contactSection?: {
    title: string;
    description: string;
    linkText: string;
    linkUrl?: string;
    className?: string;
  };
  items?: FaqItem[];
  showBottomButtons?: boolean;
  className?: string;
}

const Faq17 = ({
  heading = "FAQ",
  profileInfo = {
    name: "Sarah Johnson",
    title: "Customer Success Manager",
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp",
  },
  contactSection = {
    title: "Still have questions?",
    description:
      "Can't find what you're looking for? Our team is here to help! Whether you need clarification, have a specific question, or want to learn more about our services, we'd love to hear from you. Let's get you the answers you need.",
    linkText: "Contact us",
  },
  items = [
    {
      question: "What services do you offer?",
      answer:
        "We provide a comprehensive range of services tailored to meet your needs. From consultation and planning to implementation and ongoing support, our team is equipped to handle projects of all sizes. Contact us for a detailed overview of our offerings.",
    },
    {
      question: "How do I get started?",
      answer:
        "Getting started is easy! Simply reach out to us through our contact form or give us a call. We'll schedule a consultation to discuss your needs, answer any questions, and create a customized plan that works best for you and your timeline.",
    },
    {
      question: "What are your pricing options?",
      answer:
        "Our pricing is flexible and depends on the scope of your project and specific requirements. We offer various packages to accommodate different budgets and needs. We're happy to provide a detailed quote after understanding your project requirements.",
    },
    {
      question: "Do you offer support after completion?",
      answer:
        "Absolutely! We believe in building long-term relationships with our clients. We provide ongoing support, maintenance, and are always available to help with any questions or additional needs that may arise after project completion.",
    },
    {
      question: "What makes you different from competitors?",
      answer:
        "We pride ourselves on our personalized approach, attention to detail, and commitment to customer satisfaction. Our experienced team combines expertise with creativity to deliver exceptional results. We focus on understanding your unique needs and exceeding your expectations.",
    },
  ],
  className,
}: Faq17Props) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12 xl:grid-cols-12 xl:gap-16">
          <div className="flex flex-col justify-between lg:col-span-2 xl:col-span-4">
            <div>
              <div className="mb-8 flex items-start gap-3 sm:gap-4 lg:mb-12">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl sm:h-16 sm:w-16">
                  <img
                    src={profileInfo.image}
                    alt={profileInfo.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="mb-1 text-lg leading-tight font-semibold sm:text-xl">
                    {profileInfo.name}
                  </p>
                  <p className="text-sm sm:text-base">{profileInfo.title}</p>
                </div>
              </div>

              <div className="space-y-4 lg:space-y-6">
                <h3 className="text-lg leading-tight font-semibold sm:text-xl">
                  {contactSection.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {contactSection.description}
                </p>
              </div>
            </div>
            <div className="py-4">
              <a
                href={contactSection.linkUrl ?? "#"}
                className="group flex h-auto p-0 text-start text-base font-medium transition-colors hover:bg-transparent hover:text-teal sm:text-xl"
              >
                <span className="border-b-2 border-border pb-0.5 transition-colors group-hover:border-teal">
                  {contactSection.linkText}
                </span>
                <ArrowUpRight className="ml-1 h-6 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-3 xl:col-span-8">
            <div className="mb-8 md:text-center lg:mb-16 lg:text-left">
              <h2 className="text-4xl leading-none font-medium tracking-tight sm:text-6xl">
                {heading}
              </h2>
            </div>
            <div className="max-w-none">
              <Accordion defaultValue={["item-0"]} className="space-y-0">
                {items.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className={cn(
                      "border-0",
                      index !== items.length - 1 && "border-b border-border",
                    )}
                  >
                    <AccordionTrigger className="justify-between py-6 text-left text-lg font-semibold hover:no-underline sm:text-xl lg:py-8 lg:text-xl">
                      <span className="pr-4">{item.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-0 pr-8 pb-6 text-sm leading-relaxed text-muted-foreground sm:text-base lg:pb-8">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Faq17 };
