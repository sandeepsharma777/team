import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 md:grid-cols-3 gap-4",
        className
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}: {
  name: string;
  className?: string;
  background?: ReactNode;
  Icon: any;
  description: string;
  href: string;
  cta: string;
}) => (
  <div
    key={name}
    className={cn(
      "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-[#22e873]/50 hover:shadow-[0_0_30px_rgba(34,232,115,0.15)]",
      className
    )}
  >
    <div>{background}</div>
    <div className="z-10 flex flex-col gap-2 transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-[#22e873] shadow-md mb-2">
        <Icon className="h-6 w-6 transition-all duration-300 group-hover:scale-110 text-[#22e873]" />
      </div>
      <h3 className="text-lg font-bold text-white tracking-tight">
        {name}
      </h3>
      <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
    </div>

    <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
      <Button variant="ghost" asChild size="sm" className="px-0 hover:bg-transparent text-[#22e873] hover:text-[#4ade80] font-semibold text-xs flex items-center gap-1.5">
        <Link to={href}>
          {cta}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  </div>
);

export { BentoCard, BentoGrid };
