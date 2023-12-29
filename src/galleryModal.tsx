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
  Image
} from '@ijstech/components'
import { carouselItemStyle, modalStyle } from './index.css'
import { IImage, IImageGallery } from './interface'
const Theme = Styles.Theme.ThemeVars

interface ScomImageGalleryModalElement extends ControlElement {
  images?: IImage[]
  activeSlide?: number
}

interface IImageGalleryMd extends IImageGallery {
  activeSlide?: number
}

interface IPoint {
  x: number;
  y: number;
}

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
  private initialOffset: IPoint = { x: 0, y: 0 };
  private offset: IPoint = { x: 0, y: 0 };

  private currentEl: Image
  private mdGallery: Modal
  private imagesSlider: CarouselSlider
  private btnPrev: Icon
  private btnNext: Icon

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
            verticalAlignment='center'
            horizontalAlignment='center'
            overflow='hidden'
            position='relative'
          >
            <i-image
              display='block'
              width={'100%'}
              height={'auto'}
              maxHeight={'100vh'}
              url={item.url}
              // overflow="hidden"
            ></i-image>
          </i-vstack>,
        ],
      }
    }) as any
    this.imagesSlider.activeSlide = this.activeSlide
    this.updateControls()
    // this.imagesSlider.addEventListener('mousewheel', (e: WheelEvent) => this.handleMouseWheel(e));
  }

  // private handleMouseWheel(event: WheelEvent) {
  //   event.preventDefault()
  //   const target = event.target as HTMLElement
  //   this.currentEl = target.closest('i-image') as Image
  //   this.container = this.currentEl?.parentElement as Control
  //   this.isMousedown = false;

  //   this.zoom += (-event.deltaY / 4);
  //   if (this.zoom < 0.5) { this.zoom = 0.5; }
  //   if (this.zoom > 3) { this.zoom = 3; }
  //   this.offset = { x: 0, y: 0 };
  //   if (this.currentEl) this.updateImage();
  // }

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

  private onClose() {
    this.mdGallery.visible = false
    this.imagesSlider.activeSlide = 0
    this.updateControls()
  }

  onShowModal() {
    this.mdGallery.visible = true
  }

  onOpenModal() {
    this.imagesSlider.activeSlide = this.activeSlide
    this.updateControls()
  }

  onCloseModal() {
    this.mdGallery.visible = false
  }

  _handleMouseDown(
    event: PointerEvent | MouseEvent | TouchEvent,
    stopPropagation?: boolean
  ): boolean {
    this.isMousedown = true;
    if (event instanceof TouchEvent) {
      const target = event.target as HTMLElement
      this.currentEl = target.closest('i-image') as Image
      if (!this.currentEl) return false;
      this.initialOffset = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      }
      this.detectDoubleTap(event);
    }
    return true
  }

  _handleMouseMove(
    event: PointerEvent | MouseEvent | TouchEvent,
    stopPropagation?: boolean
  ): boolean {
    if (!this.isMousedown) return;
    if (event instanceof TouchEvent && this.currentEl && this.zoom > 1) {
      const deltaX = (this.initialOffset.x - event.touches[0].clientX);
      const deltaY = (this.initialOffset.y - event.touches[0].clientY);
      this.addOffset({ x: deltaX, y: deltaY });
      this.initialOffset = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      }
      this.updateImage();
      return;
    }

    return true
  }

  _handleMouseUp(
    event: PointerEvent | MouseEvent | TouchEvent,
    stopPropagation?: boolean
  ): boolean {
    this.isMousedown = false;
    if (this.zoom > 1) return;
    return true
  }

  private detectDoubleTap(event: TouchEvent) {
    const curTime = new Date().getTime()
    const tapLen = curTime - this.lastTap
    if (tapLen < 500 && tapLen > 0) {
      this.handleDoubleTap(event)
      event.preventDefault();
    }
    this.lastTap = curTime
  }

  private scale(scale: number, center: IPoint) {
    const oldZoom = this.zoom;
    this.zoom *= scale
    this.zoom = Math.max(0.5, Math.min(3.0, this.zoom))
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

  private handleDoubleTap(event: TouchEvent) {
    let center = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
    const zoomFactor = this.zoom > 1 ? 1 : 2;
    const startZoomFactor = this.zoom;
    if (startZoomFactor > zoomFactor) {
      center = this.getCurrentZoomCenter();
    }

    const self = this;
    const updateProgress = function(progress: number) {
      const newZoom = startZoomFactor + progress * (zoomFactor - startZoomFactor);
      self.scale(newZoom / self.zoom, center);
    }
    this.animateFn(300, updateProgress);
  }

  private getCurrentZoomCenter() {
    const offsetLeft = this.offset.x - this.initialOffset.x
    const centerX = -1 * this.offset.x - offsetLeft / (1 / this.zoom - 1)
    const offsetTop = this.offset.y - this.initialOffset.y
    const centerY = -1 * this.offset.y - offsetTop / (1 / this.zoom - 1)
    return {
      x: centerX,
      y: centerY,
    }
  }

  private updateImage() {
    this.boundPan();
    const offsetX = -this.offset.x / this.zoom;
    const offsetY = -this.offset.y / this.zoom;
    const translate = 'translate(' + offsetX + 'px,' + offsetY + 'px)';
    const scale = 'scale(' + this.zoom + ', ' + this.zoom + ')';
    if (this.currentEl) {
      this.currentEl.style.webkitTransform = translate;
      this.currentEl.style.transform = translate;
      const img = this.currentEl.querySelector('img');
      if (img) img.style.transform = scale;
    }
  }

  private boundPan() {
    const padding = 50 * this.zoom;
    const imageWidth = this.currentEl.offsetWidth * this.zoom;
    const imageHeight = this.currentEl.offsetHeight * this.zoom;
    if ((this.offset.x - padding) < -imageWidth) {
      this.offset.x = -imageWidth + padding;
    }

    if ((this.offset.x + padding) > imageWidth) {
      this.offset.x = imageWidth - padding;
    }

    if ((this.offset.y - padding) < -imageHeight) {
      this.offset.y = -imageHeight + padding;
     }
 
     if ((this.offset.y + padding) > imageHeight) {
       this.offset.y = imageHeight - padding;
     }
  }

  private onSwipeEnd(isSwiping: boolean) {
    if (isSwiping && this.currentEl) {
      this.zoom = 1;
      this.initialOffset = { x: 0, y: 0 };
      this.offset = { x: 0, y: 0 };
      this.currentEl.style.transform = 'translate(' + 0 + 'px,' + 0 + 'px)'
      const img = this.currentEl.querySelector('img')
      if (img) {
        img.style.transform = 'scale(' + this.zoom + ', ' + this.zoom + ')'
      }
      this.currentEl = null;
    }
    this.updateControls();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback()
    // this.imagesSlider.removeEventListener('mousewheel', (e: WheelEvent) =>
    //   this.handleMouseWheel(e)
    // )
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
              onClick={this.onClose}
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
