import Image from 'next/image'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <span className={className}>
      <Image src="/images/logo.png" alt="Grant Pathway" width={156} height={56} priority />
    </span>
  )
}
