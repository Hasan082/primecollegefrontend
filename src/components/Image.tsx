import React from "react";

type ApiImage = {
  small?: string;
  medium?: string;
  large?: string;
  original?: string;
};

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  image: ApiImage;
  alt?: string;
}

export const Image = ({ image, alt = "", ...props }: Props) => {
  if (!image || Object.keys(image).length === 0) return null;
  const srcSet = [
    image.small && `${image.small} 100w`,
    image.medium && `${image.medium} 200w`,
    image.large && `${image.large} 400w`,
    image.original && `${image.original} 800w`,
  ]
    .filter(Boolean)
    .join(", ");

  const src =
    image.medium || image.large || image.small || image.original || "";

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes="(max-width: 640px) 100px, (max-width: 1024px) 200px, 400px"
      alt={alt}
      loading="lazy"
      {...props}
    />
  );
};
