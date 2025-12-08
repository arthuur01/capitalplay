"use client"

import { Pricing4 } from "@/components/pricing-card";
import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { PrivateRoute } from "@/components/PrivateRoute"


export default function AssinaturasPage(){
   return( 
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
          <Pricing4 />
      </SidebarInset>
    </SidebarProvider>
   )
}