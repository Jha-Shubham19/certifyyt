"use client"

import { useRef, useState } from "react"
import type { Certificate } from "@/lib/types"
import { toJpeg } from "html-to-image"
import { CertificateTemplate } from "./certificate-template"
import { Button } from "../ui/button"
import { Download, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type CertificateViewerProps = {
  certificate: Certificate
  certificateUrl: string
}

export function CertificateViewer({ certificate, certificateUrl }: CertificateViewerProps) {
  const { toast } = useToast()
  const certificateRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = async () => {
    if (!certificateRef.current) return

    setIsLoading(true)
    const reenableSheets: CSSStyleSheet[] = []
    try {
      Array.from(document.styleSheets).forEach((sheet) => {
        try {
          const href = (sheet as CSSStyleSheet).href
          if (!href) return
          const sheetOrigin = new URL(href, window.location.href).origin
          if (sheetOrigin !== window.location.origin) {
            ;(sheet as CSSStyleSheet).disabled = true
            reenableSheets.push(sheet as CSSStyleSheet)
          }
        } catch { /* noop */ }
      })

      const dataUrl = await toJpeg(certificateRef.current, { quality: 0.95, pixelRatio: 2, cacheBust: true, skipFonts: true })

      reenableSheets.forEach((s) => { try { s.disabled = false } catch { /* noop */ } })
      const link = document.createElement("a")
      link.download = `CertifyYT-Certificate-${certificate.id.slice(0, 8)}.jpg`
      link.href = dataUrl
      link.click()

      toast({
        title: "Certificate Downloaded!",
        description: "Your certificate image has been saved.",
      })
    } catch (error) {
      console.error("Certificate download failed", error)
      toast({
        title: "Download Failed",
        description: "Could not generate the certificate image. Please try again.",
        variant: "destructive",
      })
    } finally {
      reenableSheets.forEach((s) => { try { s.disabled = false } catch { /* noop */ } })
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 overflow-hidden max-h-[calc(80vh-8rem)] sm:max-h-none w-full">
      <div className="flex justify-center">
        <Button onClick={handleDownload} disabled={isLoading} size="lg">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download Certificate
        </Button>
      </div>
      <div className="flex justify-center scale-[.40] xs:scale-50 sm:scale-75 md:scale-90 lg:scale-100 origin-top p-2 w-auto object-contain">
        <div ref={certificateRef}>
          <CertificateTemplate certificate={certificate} certificateUrl={certificateUrl} />
        </div>
      </div>
    </div>
  )
}


