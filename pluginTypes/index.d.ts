/// <amd-module name="@scom/scom-image-gallery/index.css.ts" />
declare module "@scom/scom-image-gallery/index.css.ts" {
    export const modalStyle: string;
    export const getTransformStyle: (value: string, origin: string) => string;
}
/// <amd-module name="@scom/scom-image-gallery/interface.ts" />
declare module "@scom/scom-image-gallery/interface.ts" {
    export interface IImage {
        url: string;
    }
    export interface IImageGallery {
        images: IImage[];
        hash?: string;
        selectedImage?: number;
    }
}
/// <amd-module name="@scom/scom-image-gallery/galleryModal.tsx" />
declare module "@scom/scom-image-gallery/galleryModal.tsx" {
    import { Module, Container, ControlElement } from '@ijstech/components';
    import { IImage, IImageGallery } from "@scom/scom-image-gallery/interface.ts";
    interface ScomImageGalleryModalElement extends ControlElement {
        images?: IImage[];
        activeSlide?: number;
        onSlideChange?: (index: number) => void;
    }
    interface IImageGalleryMd extends IImageGallery {
        activeSlide?: number;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-image-gallery--modal']: ScomImageGalleryModalElement;
            }
        }
    }
    export default class ScomImageGalleryModal extends Module {
        private _data;
        private zoom;
        private lastTap;
        private inAnimation;
        private isMousedown;
        private initialOffset;
        private offset;
        private isDoubleTap;
        private lastCenter;
        private lastDist;
        private _initialOffsetSetup;
        private currentEl;
        private mdGallery;
        private imagesSlider;
        private btnPrev;
        private btnNext;
        onSlideChange: (index: number) => void;
        constructor(parent?: Container, options?: any);
        init(): void;
        static create(options?: ScomImageGalleryModalElement, parent?: Container): Promise<ScomImageGalleryModal>;
        get images(): IImage[];
        set images(value: IImage[]);
        get activeSlide(): number;
        set activeSlide(value: number);
        getData(): IImageGalleryMd;
        setData(value: IImageGalleryMd): void;
        private renderUI;
        private onNext;
        private onPrev;
        private updateControls;
        private onCloseClicked;
        onShowModal(): void;
        onOpenModal(): void;
        onCloseModal(): void;
        _handleMouseDown(event: PointerEvent | MouseEvent | TouchEvent, stopPropagation?: boolean): boolean;
        _handleMouseMove(event: PointerEvent | MouseEvent | TouchEvent, stopPropagation?: boolean): boolean;
        _handleMouseUp(event: PointerEvent | MouseEvent | TouchEvent, stopPropagation?: boolean): boolean;
        private handleZoom;
        private handleDrag;
        private getDistance;
        private getCenter;
        private scale;
        private addOffset;
        private updateImage;
        private removeTargetStyle;
        private setTargetStyle;
        private sanitizeOffset;
        private getInitialZoomFactor;
        private setupInitialOffset;
        private computeInitialOffset;
        private onSwipeEnd;
        private zoomOut;
        private handleSlideChange;
        disconnectedCallback(): void;
        render(): any;
    }
}
/// <amd-module name="@scom/scom-image-gallery" />
declare module "@scom/scom-image-gallery" {
    import { Module, Container, ControlElement } from '@ijstech/components';
    import { IImage } from "@scom/scom-image-gallery/interface.ts";
    interface ScomImageGalleryElement extends ControlElement {
        lazyLoad?: boolean;
        images: IImage[];
        hash?: string;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-image-gallery']: ScomImageGalleryElement;
            }
        }
    }
    export default class ScomImageGallery extends Module {
        private _data;
        private mdImages;
        private gridImages;
        private pnlGallery;
        private pnlRatio;
        private _currHash;
        tag: any;
        constructor(parent?: Container, options?: any);
        init(): void;
        static create(options?: ScomImageGalleryElement, parent?: Container): Promise<ScomImageGallery>;
        get images(): IImage[];
        set images(value: IImage[]);
        get hash(): string;
        set hash(value: string);
        get selectedImage(): number;
        set selectedImage(index: number);
        private getData;
        private setData;
        private renderUI;
        private selectImage;
        private onSlideChange;
        getConfigurators(): ({
            name: string;
            target: string;
            getActions: () => any[];
            getData: any;
            setData: any;
            getTag: any;
            setTag: any;
        } | {
            name: string;
            target: string;
            getData: any;
            setData: any;
            getTag: any;
            setTag: any;
            getActions?: undefined;
        })[];
        private _getActions;
        private getWidgetSchemas;
        private getTag;
        private setTag;
        render(): any;
    }
}
