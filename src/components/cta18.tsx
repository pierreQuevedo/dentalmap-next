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
interface Buttons {
  primary?: Button;
  secondary?: Button;
}

interface CtaSideImageProps {
  heading: string;
  description: string;
  image: Image;
  buttons?: Buttons;
  className?: string;
}

interface Cta18Props extends CtaSideImageProps {}
type Props = Partial<Cta18Props>;

const defaultProps: Cta18Props = {
  heading: "Call to Action",
  description:
    "Get access to our collection of pre-built blocks and components today.",
  image: {
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/images/1-16x9.jpg",
    alt: "Call to Action",
  },
  buttons: {
    primary: {
      text: "Get Access",
      url: "https://shadcnblocks.com",
    },
    secondary: {
      text: "Schedule a Demo",
      url: "https://shadcnblocks.com",
    },
  },
};

const Cta18 = (props: Props) => {
  const { heading, description, image, buttons, className } = {
    ...defaultProps,
    ...props,
  };

  return (
    <section className={cn("py-32", className)}>
      <div className="container overflow-hidden">
        <div className="relative mx-auto flex max-w-5xl flex-col justify-between gap-6 overflow-hidden rounded-xl border bg-muted/50 md:flex-row">
          <div className="max-w-xl self-center p-6 md:p-12">
            <h2 className="text-3xl font-semibold md:text-4xl">{heading}</h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              {description}
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              {buttons?.primary && (
                <Button
                  className="bg-brand text-brand-foreground hover:bg-brand-hover"
                  render={<a href={buttons.primary.url} rel="noopener" />}
                  nativeButton={false}
                >
                  {buttons.primary.text}
                  {buttons.primary.icon}
                </Button>
              )}
              {buttons?.secondary && (
                <Button
                  variant="outline"
                  render={<a href={buttons.secondary.url} />}
                  nativeButton={false}
                >
                  {buttons.secondary.text}
                  {buttons.secondary.icon}
                </Button>
              )}
            </div>
          </div>
          <div className="relative ml-6 max-h-96 md:mt-8 md:ml-0">
            <img
              src={image.src}
              alt={image.alt}
              className="z-10 aspect-video h-full w-full rounded-tl-xl border-t border-l object-cover pt-3.5 pl-3.5 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export { Cta18 };
