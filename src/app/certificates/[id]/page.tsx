import { getCertificateById } from "@/lib/data"
import { CertificateTemplate } from "@/components/certificate/certificate-template"
import { CertificateViewer } from "@/components/certificate/certificate-viewer"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle } from "lucide-react"

type CertificatePageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function CertificatePage({ params }: CertificatePageProps) {
  const { id } = await params
  const certificate = await getCertificateById(id)

  if (!certificate) {
    return (
      <div className="container py-20 flex justify-center">
        <Alert variant="destructive" className="w-full max-w-md bg-white">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Certificate Not Found</AlertTitle>
          <AlertDescription>
            The certificate ID is invalid or the certificate does not exist.
          </AlertDescription>
        </Alert>
      </div>
    )
  }
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:9002');
  const certificateUrl = `${baseUrl}/certificates/${certificate.id}`; // In a real app, use env var for domain
  // const certificateUrl = `${window.location.origin}/certificates/${certificate.id}`; // In a real app, use env var for domain

  return (
    <div className="container py-12 space-y-8 overflow-hidden max-h-[calc(100vh-8rem)] sm:max-h-none">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Certificate Validation</h1>
        <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">
          <CheckCircle className="mr-2 h-4 w-4" />
          This is a Valid Certificate
        </Badge>
      </div>
      <CertificateViewer certificate={certificate as any} certificateUrl={certificateUrl} />
    </div>
  )
}

// Enable dynamic rendering for this page
export const dynamic = 'force-dynamic';
