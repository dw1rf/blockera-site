import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { AuditLogList } from "@/components/admin/audit-log";
import { OrdersTable, type OrdersTableOrder } from "@/components/admin/orders-table";
import { ProductManager, type ProductManagerProduct } from "@/components/admin/product-manager";
import { authOptions } from "@/lib/auth";
import { buildOrderSummary, type OrderWithRelations } from "@/lib/order-utils";
import { prisma } from "@/lib/prisma";
import { seedProductsIfEmpty } from "@/lib/product-seed";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/sign-in?callbackUrl=/admin");
  }

  const adminUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, role: true } });
  if (!adminUser || adminUser.role !== "ADMIN") {
    redirect("/auth/sign-in?callbackUrl=/admin");
  }

  await seedProductsIfEmpty();

  const [products, orders, logs] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: { name: true, price: true }
        },
        user: {
          select: { email: true }
        },
        payment: true
      }
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        user: {
          select: { email: true, id: true }
        }
      }
    })
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-16">
      <div className="space-y-3">
        <span className="text-xs uppercase tracking-[0.4em] text-primary">Панель управления</span>
        <h1 className="text-3xl font-semibold uppercase tracking-[0.2em] text-white md:text-4xl">
          Управление донат-магазином
        </h1>
        <p className="text-sm text-white/60">
          Добро пожаловать, {session.user.email}. Здесь вы можете следить за товарами, заказами и журналом аудита.
        </p>
      </div>

      <div className="grid gap-8">
        <ProductManager
          initialProducts={products.map((product) => ({
            ...product,
            category: product.category as ProductManagerProduct["category"],
            status: product.status as ProductManagerProduct["status"],
            createdAt: product.createdAt.toISOString()
          }))}
        />
        <OrdersTable
          initialOrders={orders.map((order) => ({
            ...order,
            status: order.status as OrdersTableOrder["status"],
            createdAt: order.createdAt.toISOString()
          }))}
          initialSummary={buildOrderSummary(orders as OrderWithRelations[])}
        />
        <AuditLogList
          initialLogs={logs.map((log) => ({
            ...log,
            createdAt: log.createdAt.toISOString(),
            metadata: log.metadata ? JSON.parse(log.metadata) : null
          }))}
        />
      </div>
    </div>
  );
}
