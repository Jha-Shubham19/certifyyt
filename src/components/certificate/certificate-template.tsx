import type { Certificate } from "@/lib/types"
import { Award, BrainCircuit } from "lucide-react"
import { QRCodeDisplay } from "../shared/qr-code-display"
import CertifyYTLogo from "../shared/certifyyt-logo"

type CertificateTemplateProps = {
  certificate: Certificate
  certificateUrl: string
}

export const CertificateTemplate = ({
  certificate,
  certificateUrl,
}: CertificateTemplateProps) => {
  return (
    
    <div className="aspect-[1.414/1] w-[800px] bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 p-6 border-4 border-primary/20 shadow-2xl flex flex-col font-serif text-slate-800">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {/* <BrainCircuit className="w-12 h-12 text-primary" /> */}
          <CertifyYTLogo className="w-12 h-12 text-primary" />
          <h1 className="text-2xl font-bold tracking-wider text-primary">CertifyYT</h1>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600">Certificate ID</p>
          <p className="text-xs font-mono">{certificate.id}</p>
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center text-center my-2">
        <h2 className="text-xl font-medium text-slate-600 tracking-widest uppercase">
          Certificate of Completion
        </h2>
        <div className="my-2">
          <Award className="w-24 h-24 text-blue-500" strokeWidth={1} />
        </div>
        <p className="text-lg text-slate-600">This certifies that</p>
        <h3 className="text-5xl font-bold my-4 text-primary tracking-wide">
          {certificate.userName}
        </h3>
        <p className="text-lg text-slate-600">
          has successfully completed the course and assessment for
        </p>
        <h4 className="text-2xl font-semibold mt-2 max-w-2xl">
          {certificate.videoTitle}
        </h4>
        <p className="mt-2 text-lg text-slate-600">with a score of <span className="font-bold">{certificate.score}%</span></p>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <p className="font-semibold">{new Date(certificate.issueDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</p>
          <p className="text-sm text-slate-600 border-t-2 border-muted-foreground pt-1 mt-1">Issue Date</p>
        </div>
        <div className="flex flex-col items-center">
          <QRCodeDisplay value={certificateUrl} size={90} />
          <p className="text-xs mt-1 text-slate-600 font-sans">Scan to verify</p>
        </div>
        <div>
          {/* <p className="font-semibold text-right">The CertifyYT Team</p> */}
            <img src="/signature_crop.svg"
            alt="QR Code"
            width={150}
            height={150}
            className="rounded-lg"
          />
          <p className="text-sm text-slate-600 border-t-2 border-muted-foreground pt-1 mt-1">Authority</p>
        </div>
      </div>
    </div>
  )
}
