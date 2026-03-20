type ColorSchemeImgProps = Omit<
  React.ComponentProps<'img'>,
  'src' | 'width' | 'height' | 'alt'
> & {
  lightSrc: string
  darkSrc?: string
  width: number
  height: number
  alt: string
}

function ColorSchemeImg({
  lightSrc,
  darkSrc,
  width,
  height,
  alt,
  loading = 'lazy',
  ...props
}: ColorSchemeImgProps) {
  return (
    <picture key={`${lightSrc}-${darkSrc}`}>
      <source
        media="(prefers-color-scheme: dark)"
        srcSet={darkSrc ?? lightSrc}
      />
      <source media="(prefers-color-scheme: light)" srcSet={lightSrc} />
      <img
        {...props}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
      />
    </picture>
  )
}

export { ColorSchemeImg }
