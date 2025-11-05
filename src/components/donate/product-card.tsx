import { ShoppingCartIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/donate";
import { formatCurrency } from "@/lib/price";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-card backdrop-blur">
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
      </div>
      {product.highlight ? (
        <span className="absolute right-6 top-6 inline-flex rounded-full border border-primary/40 bg-primary/20 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-primary">
          {product.highlight}
        </span>
      ) : null}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-white">{product.name}</h3>
        <p className="text-lg font-semibold text-primary">{formatCurrency(product.price)}</p>
      </div>
      <p className="mt-4 text-sm text-white/70">{product.description}</p>
      <div className="mt-auto pt-6">
        <Button className="w-full gap-2 bg-gradient-to-r from-primary to-purple-500">
          <ShoppingCartIcon className="h-4 w-4" />
          Купить через EasyDonate
        </Button>
      </div>
    </div>
  );
}
