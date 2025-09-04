"use client"

import { useEffect, useState } from "react"
import QRCode from "qrcode"
import Image from "next/image"
import { Skeleton } from "../ui/skeleton"

type QRCodeDisplayProps = {
  value: string
  size?: number
}

export function QRCodeDisplay({ value, size = 100 }: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)

  useEffect(() => {
    if (value) {
      QRCode.toDataURL(value, {
        errorCorrectionLevel: "H",
        margin: 2,
        color: {
          dark: "#0a1931",
          light: "#0000", // Transparent background
        },
      })
        .then(url => {
          setQrCodeUrl(url)
        })
        .catch(err => {
          console.error(err)
        })
    }
  }, [value])

  if (!qrCodeUrl) {
    return <Skeleton className="h-[100px] w-[100px]" style={{ height: size, width: size }} />
  }

  return (
    <Image
      src={qrCodeUrl}
      alt="QR Code"
      width={size}
      height={size}
      className="rounded-lg"
    />
  )
}
