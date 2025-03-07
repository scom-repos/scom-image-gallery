export interface IImage {
  url: string;
  link?: string;
}

export interface IImageGallery {
  images: IImage[];
  hash?: string;
  selectedImage?: number;
  columnsPerRow?: number;
}
