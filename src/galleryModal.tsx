import {
  Module,
  customModule,
  Container,
  ControlElement,
  customElements,
  Styles,
  CarouselSlider,
  Modal,
  Icon,
  Image,
  application
} from '@ijstech/components'
import { carouselItemStyle, modalStyle } from './index.css'
import { IImage, IImageGallery } from './interface'
const Theme = Styles.Theme.ThemeVars

interface ScomImageGalleryModalElement extends ControlElement {
  images?: IImage[]
  activeSlide?: number
  onSlideChange?: (index: number) => void;
}

interface IImageGalleryMd extends IImageGallery {
  activeSlide?: number
}

interface IPoint {
  x: number;
  y: number;
}

const verticalPadding = 0;
const horizontalPadding = 0;
const animationDuration = 300;
const maxZoom = 4;
const minZoom = 0.5;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['i-scom-image-gallery--modal']: ScomImageGalleryModalElement
    }
  }
}

@customModule
@customElements('i-scom-image-gallery--modal')
export default class ScomImageGalleryModal extends Module {
  private _data: IImageGalleryMd
  private zoom: number = 1
  private lastTap: number = 0
  private inAnimation: boolean = false
  private isMousedown: boolean = false;
  private initialOffset: IPoint = { x: 0, y: 0 }
  private offset: IPoint = { x: 0, y: 0 }
  private isDoubleTap: boolean = false
  private lastCenter: IPoint | null = null;
  private lastDist: number = 1;
  private _initialOffsetSetup: boolean = false;

  private currentEl: Image
  private mdGallery: Modal
  private imagesSlider: CarouselSlider
  private btnPrev: Icon
  private btnNext: Icon
  public onSlideChange: (index: number) => void;

  constructor(parent?: Container, options?: any) {
    super(parent, options)
    this.onNext = this.onNext.bind(this)
    this.onPrev = this.onPrev.bind(this)
  }

  init() {
    super.init()
    const images = this.getAttribute('images', true)
    const activeSlide = this.getAttribute('activeSlide', true, 0)
    if (images) this.setData({ images, activeSlide })
  }

  static async create(
    options?: ScomImageGalleryModalElement,
    parent?: Container
  ) {
    let self = new this(parent, options)
    await self.ready()
    return self
  }

  get images() {
    return this._data.images
  }
  set images(value: IImage[]) {
    this._data.images = value
  }

  get activeSlide(): number {
    return this._data.activeSlide ?? 0
  }
  set activeSlide(value: number) {
    this._data.activeSlide = value ?? 0
  }

  getData() {
    return this._data
  }

  setData(value: IImageGalleryMd) {
    this._data = value
    this.renderUI()
  }

  private renderUI() {
    this.imagesSlider.items = [...this._data.images].map((item) => {
      return {
        controls: [
          <i-vstack
            height='100%'
            width={'100%'}
            horizontalAlignment='center'
            verticalAlignment='center'
            overflow='hidden'
            position='relative'
          >
            <i-image
              display='block'
              width={'100%'}
              height={'auto'}
              maxHeight={'100vh'}
              url={item.url}
            ></i-image>
          </i-vstack>,
        ],
      }
    }) as any
    this.imagesSlider.activeSlide = this.activeSlide
    this.updateControls()
  }

  private onNext() {
    if (!this._data.images) return
    this.imagesSlider.next()
    this.updateControls()
  }

  private onPrev() {
    if (!this._data.images) return
    this.imagesSlider.prev()
    this.updateControls()
  }

  private updateControls() {
    this.btnNext.visible =
      this.imagesSlider.activeSlide < this._data.images.length - 1
    this.btnPrev.visible = this.imagesSlider.activeSlide > 0
  }

  private onCloseClicked() {
    this.mdGallery.visible = false
  }

  onShowModal() {
    this.mdGallery.visible = true
  }

  onOpenModal() {
    this.imagesSlider.activeSlide = this.activeSlide
    this.updateControls()
    application.EventBus.dispatch('IMAGE_GALLERY_VIEW_IMAGE', this.mdGallery);
  }

  onCloseModal() {
    const found = location.hash.match(/\/photo\/\d+$/);
    if (found) {
      if (history.length > 1) {
        history.back();
      } else {
        const url = found.input.substring(0, found.index);
        history.replaceState(null, null, url);
      }
    }
    this.imagesSlider.activeSlide = 0
    this.zoomOut();
  }

  _handleMouseDown(
    event: PointerEvent | MouseEvent | TouchEvent,
    stopPropagation?: boolean
  ): boolean {
    this.isMousedown = true;
    if (event instanceof TouchEvent) {
      const target = event.target as HTMLElement
      this.currentEl = target.closest('i-image') as Image
      this.setupInitialOffset();
      this.initialOffset = {
        x: event.touches[0].pageX,
        y: event.touches[0].pageY
      }
      // this.detectDoubleTap(event);
    }
    return true
  }

  _handleMouseMove(
    event: PointerEvent | MouseEvent | TouchEvent,
    stopPropagation?: boolean
  ): boolean {
    if (!this.isMousedown) return;
    if (event instanceof TouchEvent) {
      const target = event.target as HTMLElement
      this.currentEl = target.closest('i-image') as Image
      if (this.currentEl) {
        const result = this.handleZoom(event);
        if (result) return;
      }
    }
    return true
  }

  _handleMouseUp(
    event: PointerEvent | MouseEvent | TouchEvent,
    stopPropagation?: boolean
  ): boolean {
    this.isMousedown = false;
    if (this.zoom > 1) return;
    this.lastDist = 0;
    this.lastCenter = null;
    this.zoomOut();
    return true
  }

  private handleZoom(event: TouchEvent) {
    event.preventDefault();
    if (event.touches.length > 1) {
      this.setupInitialOffset();
      const [touch1, touch2] = event.touches;
      const p1: IPoint = {
        x: touch1.pageX,
        y: touch1.pageY,
      };
      const p2: IPoint = {
        x: touch2.pageX,
        y: touch2.pageY,
      };

      if (!this.lastCenter) {
        this.lastCenter = this.getCenter(p1, p2);
        return;
      }
      const newCenter = this.getCenter(p1, p2);
      const dist = this.getDistance(p1, p2);

      if (!this.lastDist) {
        this.lastDist = dist;
      }

      this.scale(dist / this.lastDist, newCenter);

      this.lastDist = dist;
      this.lastCenter = newCenter;
    }
    else if (this.zoom > 1) {
      this.handleDrag(event);
    } else {
      return;
    }
  
    return true;
  }

  private handleDrag(event: TouchEvent) {
    const deltaX = (this.initialOffset.x - event.touches[0].pageX);
    const deltaY = (this.initialOffset.y - event.touches[0].pageY);
    this.addOffset({
      x: deltaX,
      y: deltaY
    });
    this.initialOffset = {
      x: event.touches[0].pageX,
      y: event.touches[0].pageY
    }
    this.updateImage();
  }

  private getDistance(p1: IPoint, p2: IPoint): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  private getCenter(p1: IPoint, p2: IPoint): IPoint {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  }

  // private detectDoubleTap(event: TouchEvent) {
  //   const curTime = new Date().getTime()
  //   const tapLen = curTime - this.lastTap
  //   if (tapLen < 500 && tapLen > 0) {
  //     this.handleDoubleTap(event)
  //     // event.preventDefault();
  //   } else {
  //     this.isDoubleTap = false;
  //   }
  //   this.lastTap = curTime
  // }

  private scale(scale: number, center: IPoint) {
    const oldZoom = this.zoom;
    this.zoom *= scale
    this.zoom = Math.max(minZoom, Math.min(maxZoom, this.zoom))
    const _scale = this.zoom / oldZoom;
    this.addOffset({
      x: (_scale - 1) * (center.x + this.offset.x),
      y: (_scale - 1) * (center.y + this.offset.y)
    });
    this.updateImage();
  }

  private animateFn(duration: number, framefn: any) {
    const startTime = new Date().getTime();
    const renderFrame = function () {
      if (!this.inAnimation) {
        return;
      }
      const frameTime = new Date().getTime() - startTime;
      let progress = frameTime / duration;
      if (frameTime >= duration) {
        framefn(1);
        this.inAnimation = false;
        this.updateImage();
      } else {
        progress = -Math.cos(progress * Math.PI) / 2 + 0.5;
        framefn(progress);
        this.updateImage();
        requestAnimationFrame(renderFrame);
      }
    }.bind(this);
    this.inAnimation = true;
    requestAnimationFrame(renderFrame);
  }

  private addOffset(offset: IPoint) {
    this.offset = {
      x: this.offset.x + offset.x,
      y: this.offset.y + offset.y
    };
  }

  // private handleDoubleTap(event: TouchEvent) {
  //   let center = {
  //     x: event.touches[0].pageX,
  //     y: event.touches[0].pageY
  //   };
  //   const zoomFactor = this.zoom > 1 ? 1 : 2;
  //   const startZoomFactor = this.zoom;
  //   if (startZoomFactor > zoomFactor) {
  //     center = this.getCurrentZoomCenter();
  //   }
  //   this.isDoubleTap = true;
  //   const self = this;
  //   const updateProgress = function(progress: number) {
  //     const newZoom = startZoomFactor + progress * (zoomFactor - startZoomFactor);
  //     self.scale(newZoom / self.zoom, center);
  //   }
  //   this.animateFn(animationDuration, updateProgress);
  // }

  // private getCurrentZoomCenter() {
  //   const offsetLeft = this.offset.x - this.initialOffset.x
  //   const centerX = -1 * this.offset.x - offsetLeft / (1 / this.zoom - 1)
  //   const offsetTop = this.offset.y - this.initialOffset.y
  //   const centerY = -1 * this.offset.y - offsetTop / (1 / this.zoom - 1)
  //   return {
  //     x: centerX,
  //     y: centerY
  //   }
  // }

  private updateImage() {
    if (!this.currentEl) return;
    this.offset = this.sanitizeOffset({...this.offset});
    const zoomFactor = this.getInitialZoomFactor() * this.zoom;
    const offsetX = -this.offset.x / zoomFactor;
    const offsetY = -this.offset.y / zoomFactor;
    const translate = 'translate(' + offsetX + 'px,' + offsetY + 'px)';
    const scale = `scale(${this.zoom})`;
    const img = this.currentEl.querySelector('img');
    if (img) img.style.transform = `${scale} ${translate}`
  }

  private sanitizeOffset(offset: IPoint) {
    if (!this.currentEl) return offset
    const img = this.currentEl.querySelector('img');
    const elWidth = img.offsetWidth * this.getInitialZoomFactor() * this.zoom;
    const elHeight = img.offsetHeight * this.getInitialZoomFactor() * this.zoom;
    const maxX = elWidth - this.currentEl.offsetWidth + horizontalPadding;
    const maxY = elHeight - this.currentEl.offsetHeight + verticalPadding;
    const maxOffsetX = Math.max(maxX, 0);
    const maxOffsetY = Math.max(maxY, 0);
    const minOffsetX = Math.min(maxX, 0) - horizontalPadding;
    const minOffsetY = Math.min(maxY, 0) - verticalPadding;

    return {
      x: Math.min(Math.max(offset.x, minOffsetX), maxOffsetX),
      y: Math.min(Math.max(offset.y, minOffsetY), maxOffsetY)
    }
  }

  private getInitialZoomFactor() {
    if (!this.currentEl) return 1;
    const img = this.currentEl.querySelector('img');
    const xZoomFactor = this.currentEl.offsetWidth / img.offsetWidth
    const yZoomFactor = this.currentEl.offsetHeight / img.offsetHeight
    return Math.min(xZoomFactor, yZoomFactor)
  }

  private setupInitialOffset() {
    if (this._initialOffsetSetup) {
      return
    }
    this._initialOffsetSetup = true
    this.computeInitialOffset()
    this.offset.x = this.initialOffset.x
    this.offset.y = this.initialOffset.y
  }

  private computeInitialOffset() {
    if (!this.currentEl) return;
    const img = this.currentEl.querySelector('img');
    this.initialOffset = {
      x:
        -Math.abs(
          img.offsetWidth * this.getInitialZoomFactor() -
            this.currentEl.offsetWidth
        ) / 2,
      y:
        -Math.abs(
          img.offsetHeight * this.getInitialZoomFactor() -
            this.currentEl.offsetHeight
        ) / 2,
    }
  }

  private onSwipeEnd(isSwiping: boolean) {
    if (isSwiping) this.zoomOut();
    this.updateControls();
  }

  private zoomOut() {
    this.zoom = 1;
    for (let item of this.imagesSlider.items) {
      const control = (item as any).controls[0];
      const image = control?.querySelector('img');
      if (image) {
        image.style.transform = `scale(1) translate(0px, 0px)`;
      }
    }
    this.currentEl = null;
  }

  private handleSlideChange(index: number) {
    if (this.onSlideChange) this.onSlideChange(index);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback()
  }

  render() {
    return (
      <i-modal
        id='mdGallery'
        showBackdrop={true}
        width={'100vw'}
        height={'100vh'}
        padding={{ top: 0, right: 0, bottom: 0, left: 0 }}
        overflow={'hidden'}
        onOpen={this.onOpenModal} 
        onClose={this.onCloseModal}
      >
        <i-panel width={'100vw'} height={'100vh'} class={modalStyle}>
          <i-vstack
            verticalAlignment='space-between'
            horizontalAlignment='start'
            height={'50%'}
            padding={{ right: '0.75rem', left: '0.75rem' }}
            position={'absolute'}
            left='0px'
            top='0px'
            zIndex={100}
          >
            <i-icon
              border={{ radius: '50%' }}
              padding={{
                top: '0.5rem',
                right: '0.5rem',
                bottom: '0.5rem',
                left: '0.5rem',
              }}
              name='times'
              fill={Theme.text.primary}
              width='2.25rem'
              height='2.25rem'
              background={{ color: Theme.background.modal }}
              cursor='pointer'
              margin={{ top: '0.75rem' }}
              class='hovered-icon'
              onClick={() => this.onCloseClicked()}
            ></i-icon>
            <i-icon
              id='btnPrev'
              border={{ radius: '50%' }}
              padding={{
                top: '0.5rem',
                right: '0.5rem',
                bottom: '0.5rem',
                left: '0.5rem',
              }}
              name='arrow-left'
              fill={Theme.text.primary}
              width='2.25rem'
              height='2.25rem'
              background={{ color: Theme.background.modal }}
              cursor='pointer'
              class='hovered-icon'
              mediaQueries={[
                {
                  maxWidth: '768px',
                  properties: { visible: false },
                },
              ]}
              onClick={this.onPrev}
            ></i-icon>
          </i-vstack>
          <i-carousel-slider
            id='imagesSlider'
            maxWidth={'75%'}
            width={'100%'}
            height='100%'
            margin={{ left: 'auto', right: 'auto' }}
            indicators={false}
            autoplay={false}
            swipe={true}
            onSwipeEnd={this.onSwipeEnd}
            mediaQueries={[
              {
                maxWidth: '768px',
                properties: { maxWidth: '100%', indicators: true },
              },
            ]}
            class={carouselItemStyle}
            onSlideChange={this.handleSlideChange}
          ></i-carousel-slider>
          <i-vstack
            verticalAlignment='space-between'
            horizontalAlignment='end'
            height={'50%'}
            padding={{ right: '0.75rem', left: '0.75rem' }}
            position={'absolute'}
            right='0px'
            top='0px'
            zIndex={100}
          >
            <i-icon
              opacity={0}
              border={{ radius: '50%' }}
              padding={{
                top: '0.5rem',
                right: '0.5rem',
                bottom: '0.5rem',
                left: '0.5rem',
              }}
              name='angle-double-right'
              fill={Theme.text.primary}
              width='2.25rem'
              height='2.25rem'
              background={{ color: Theme.background.modal }}
              cursor='pointer'
              class='hovered-icon'
              margin={{ top: '0.75rem' }}
            ></i-icon>
            <i-icon
              id='btnNext'
              border={{ radius: '50%' }}
              padding={{
                top: '0.5rem',
                right: '0.5rem',
                bottom: '0.5rem',
                left: '0.5rem',
              }}
              name='arrow-right'
              fill={Theme.text.primary}
              width='2.25rem'
              height='2.25rem'
              background={{ color: Theme.background.modal }}
              cursor='pointer'
              class='hovered-icon'
              mediaQueries={[
                {
                  maxWidth: '768px',
                  properties: { visible: false },
                },
              ]}
              onClick={this.onNext}
            ></i-icon>
          </i-vstack>
        </i-panel>
      </i-modal>
    )
  }
}
