"use client"

import { useRef, useState, useEffect } from "react"
import type { Certificate } from "@/lib/types"
import { toJpeg } from "html-to-image"
import { CertificateTemplate } from "./certificate-template"
import { Button } from "../ui/button"
import { Download, Loader2, PartyPopper } from "lucide-react"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { saveCertificate } from "@/lib/certificates-client"

type CertificateDisplayProps = {
  videoTitle: string
  score: number
  certificateId?: string
}

export function CertificateDisplay({ videoTitle, score, certificateId }: CertificateDisplayProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter();
  const [userName, setUserName] = useState(user?.displayName ?? "")
  const [isLoading, setIsLoading] = useState(false)
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const certificateRef = useRef<HTMLDivElement>(null)
  
  const [isCertificateSaved, setIsCertificateSaved] = useState(false);

  useEffect(() => {
    if (certificate && !isCertificateSaved) {
      const saveCert = async () => {
        try {
          await saveCertificate(certificate);
          setIsCertificateSaved(true);
        } catch (error) {
          console.error("Failed to save certificate", error);
          toast({
            title: "Save Failed",
            description: "There was an error saving your certificate progress.",
            variant: "destructive",
          });
        }
      };
      saveCert();
    }
  }, [certificate, isCertificateSaved, toast]);


  const handleGenerateCertificate = () => {
    if (!userName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter the name to appear on the certificate.",
        variant: "destructive",
      })
      return
    }

    // On secure flow, certificate is already created on the server.
    // We only construct the local view model to render the preview and enable download.
    const newCertificate: Certificate = {
      id: certificateId || "",
      userId: user?.uid ?? "anonymous",
      userName: userName.trim(),
      videoTitle: videoTitle,
      issueDate: new Date().toISOString(),
      score: score,
    }
    setCertificate(newCertificate)
  }

  const handleDownload = async () => {
    if (!certificateRef.current || !certificate) return

    setIsLoading(true)
    const reenableSheets: CSSStyleSheet[] = []
    try {
      // Temporarily disable cross-origin stylesheets without touching cssRules
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

      // Re-enable the stylesheets we disabled
      reenableSheets.forEach((s) => { try { s.disabled = false } catch { /* noop */ } })
      const link = document.createElement("a")
      link.download = `CertifyYT-Certificate-${certificate.id.slice(0, 8)}.jpg`
      link.href = dataUrl
      link.click()

      toast({
        title: "Certificate Downloaded!",
        description: "Congratulations! Your certificate is now saved.",
      })
      
      // Redirect to dashboard after a short delay
      setTimeout(() => router.push('/dashboard'), 2000);

    } catch (error) {
      console.error("oops, something went wrong!", error)
      toast({
        title: "Download Failed",
        description: "Could not generate the certificate image. Please try again.",
        variant: "destructive",
      })
    } finally {
      // Always re-enable stylesheets even when errors occur
      reenableSheets.forEach((s) => { try { s.disabled = false } catch { /* noop */ } })
      setIsLoading(false)
    }
  }

  if (certificate) {
    const certificateUrl = `${window.location.origin}/certificates/${certificate.id}`
    return (
      <div className="space-y-6 overflow-hidden max-h-[calc(80vh-8rem)] sm:max-h-none">
        <div className="flex justify-center">
            <Button onClick={handleDownload} disabled={isLoading || !isCertificateSaved} size="lg">
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Download className="mr-2 h-4 w-4" />
            )}
            Download Certificate
            </Button>
        </div>
          <div className="flex justify-center scale-[.30] custom-sc-xs:scale-[0.35] custom-sc-sm:scale-[0.40] sm:scale-75 md:scale-90 lg:scale-100 origin-top px-2">
          <div ref={certificateRef}>
             <CertificateTemplate certificate={certificate} certificateUrl={certificateUrl} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="text-center">
        <PartyPopper className="w-12 h-12 mx-auto text-green-500" />
        <CardTitle>Congratulations! You Passed!</CardTitle>
        <CardDescription>
          Enter your full name as you want it to appear on the certificate.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="e.g. Sahil Jadhav"
          />
        </div>
        <Button onClick={handleGenerateCertificate} className="w-full">
          Generate Certificate
        </Button>
      </CardContent>
    </Card>
  )
}
