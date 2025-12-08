import { PaymentPage as PaymentClient } from "@/components/payment/payment"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function PaymentPage() {
  return (
    <SidebarProvider>
			<AppSidebar variant="inset" />
			<SidebarInset>
				<SiteHeader />
				<div className="container mx-auto py-10">
         <PaymentClient />
        </div>
			</SidebarInset>
		</SidebarProvider>
  )
}
