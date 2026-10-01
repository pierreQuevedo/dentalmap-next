import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Stat {
  value: string;
  label: string;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Stats9Props {
  label: string;
  heading: string;
  description: string;
  stats: Stat[];
  features: Feature[];
  className?: string;
}
type Props = Partial<Stats9Props>;

const iconeParDefaut = (src: string) => (
  <img src={src} alt="" className="size-12" />
);

const defaultProps: Stats9Props = {
  label: "Features",
  heading: "Transform Your Digital Experience Today Together",
  description:
    "Leverage cutting-edge technology to streamline your workflow and unlock new possibilities in the digital landscape.",
  stats: [
    { value: "2.5M +", label: "Users Served" },
    { value: "99.9%", label: "Uptime" },
    { value: "4.8", label: "User Score" },
  ],
  features: [
    {
      icon: iconeParDefaut("https://deifkwefumgah.cloudfront.net/shadcnblocks/block/block-1.svg"),
      title: "Cloud Integration",
      description: "Seamless cloud solutions for modern business needs",
    },
    {
      icon: iconeParDefaut("https://deifkwefumgah.cloudfront.net/shadcnblocks/block/block-2.svg"),
      title: "24/7 Monitoring",
      description: "Round-the-clock system monitoring and support",
    },
    {
      icon: iconeParDefaut("https://deifkwefumgah.cloudfront.net/shadcnblocks/block/block-3.svg"),
      title: "AI-Powered Tools",
      description: "Advanced machine learning algorithms delivering intelligent insights",
    },
    {
      icon: iconeParDefaut("https://deifkwefumgah.cloudfront.net/shadcnblocks/block/block-4.svg"),
      title: "Enterprise Security",
      description: "Military-grade encryption and advanced threat protection",
    },
  ],
};

const Stats9 = (props: Props) => {
  const { label, heading, description, stats, features, className } = {
    ...defaultProps,
    ...props,
  };
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
            <div className="flex flex-col items-center gap-3 text-center lg:items-start lg:text-left">
              <Badge
                variant="outline"
                className="flex w-fit items-center gap-1"
              >
                {label}
              </Badge>
              <h2 className="mb-5 text-4xl font-semibold text-pretty">{heading}</h2>
              <p className="text-muted-foreground">{description}</p>
            </div>
            <div className="mt-12 flex justify-center gap-7 lg:justify-start">
              {stats.map((stat, index) => (
                <div key={stat.label} className="contents">
                  {index > 0 && <Separator orientation="vertical" className="h-auto" />}
                  <div className="flex flex-col gap-1.5">
                    <p className="text-2xl font-bold tabular-nums text-foreground sm:text-3xl">
                      {stat.value}
                    </p>
                    <p className="text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-2.5 text-left sm:grid-cols-2 sm:text-center lg:text-left">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-center gap-5 rounded-lg border border-border bg-muted p-6 sm:flex-col sm:items-start sm:p-7"
              >
                <span className="mx-0 flex size-12 shrink-0 items-center justify-center text-foreground sm:mx-auto lg:mx-0">
                  {feature.icon}
                </span>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-foreground sm:text-base">
                    {feature.title}
                  </p>
                  <p className="text-sm text-muted-foreground sm:text-base">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { Stats9 };
