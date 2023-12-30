export interface IImage {
  url: string;
}

export interface IImageGallery {
  images: IImage[];
  hash?: string;
  selectedImage?: number;
}
