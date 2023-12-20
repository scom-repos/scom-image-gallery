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
} from '@ijstech/components'
import { modalStyle } from './index.css'
import { IImage, IImageGallery } from './interface'
const Theme = Styles.Theme.ThemeVars

interface ScomImageGalleryModalElement extends ControlElement {
  images?: IImage[]
  activeSlide?: number
}

interface IImageGalleryMd extends IImageGallery {
  activeSlide?: number
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

  static async create(options?: ScomImageGalleryModalElement, parent?: Container) {
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
    return this._data.activeSlide ?? 0;
  }
  set activeSlide(value: number) {
    this._data.activeSlide = value ?? 0;
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
            height="100%" width={'100%'}
            verticalAlignment='center'
            horizontalAlignment='center'
            overflow="hidden"
          >
            <i-image
              display="block"
              width={'100%'} height={'auto'}
              maxHeight={'100vh'}
              url={item.url}
              overflow="hidden"
            ></i-image>
          </i-vstack>
        ],
      };
    }) as any;
    this.imagesSlider.activeSlide = this.activeSlide;
    this.updateControls();
  }

  private onNext() {
    if (!this._data.images) return;
    this.imagesSlider.next();
    this.updateControls();
  }

  private onPrev() {
    if (!this._data.images) return;
    this.imagesSlider.prev();
    this.updateControls();
  }

  private updateControls() {
    this.btnNext.visible = this.imagesSlider.activeSlide < this._data.images.length - 1;
    this.btnPrev.visible = this.imagesSlider.activeSlide > 0;
  }

  private onClose() {
    this.mdGallery.visible = false;
    this.imagesSlider.activeSlide = 0;
    this.updateControls();
  }

  private onExpand() {
  }

  onShowModal() {
    this.mdGallery.visible = true;
  }

  onOpenModal() {
    this.imagesSlider.activeSlide = this.activeSlide;
    this.updateControls();
  }

  onCloseModal() {
    this.mdGallery.visible = false;
  }

  render() {
    return (
      <i-modal
        id="mdGallery"
        showBackdrop={true}
        width={'100vw'} height={'100vh'}
        padding={{top: 0, right: 0, bottom: 0, left: 0}}
        overflow={'hidden'}
        onOpen={this.onOpenModal}
      >
        <i-panel width={'100vw'} height={'100vh'} class={modalStyle}>
          <i-vstack
            verticalAlignment='space-between'
            horizontalAlignment='start'
            height={'50%'}
            padding={{right: '0.75rem', left: '0.75rem'}}
            position={'absolute'}
            left="0px" top="0px" zIndex={100}
          >
            <i-icon
              border={{radius: '50%'}}
              padding={{top: '0.5rem', right: '0.5rem', bottom: '0.5rem', left: '0.5rem'}}
              name='times'
              fill={Theme.text.primary}
              width='2.25rem' height='2.25rem'
              background={{color: Theme.background.modal}}
              cursor='pointer'
              margin={{top: '0.75rem'}}
              class="hovered-icon"
              onClick={this.onClose}
            ></i-icon>
            <i-icon
              id="btnPrev"
              border={{radius: '50%'}}
              padding={{top: '0.5rem', right: '0.5rem', bottom: '0.5rem', left: '0.5rem'}}
              name='arrow-left'
              fill={Theme.text.primary}
              width='2.25rem' height='2.25rem'
              background={{color: Theme.background.modal}}
              cursor='pointer'
              class="hovered-icon"
              onClick={this.onPrev}
            ></i-icon>
          </i-vstack>
          <i-carousel-slider
            id='imagesSlider'
            maxWidth={'75%'}
            width={'100%'}
            height='100%'
            margin={{left: 'auto', right: 'auto'}}
            indicators={false}
            autoplay={false}
            swipe={true}
            mediaQueries={[
              {
                maxWidth: '768px',
                properties: { maxWidth: '100%' },
              }
            ]}
          ></i-carousel-slider>
          <i-vstack
            verticalAlignment='space-between'
            horizontalAlignment='end'
            height={'50%'}
            padding={{right: '0.75rem', left: '0.75rem'}}
            position={'absolute'}
            right="0px" top="0px" zIndex={100}
          >
            <i-icon
              opacity={0}
              border={{radius: '50%'}}
              padding={{top: '0.5rem', right: '0.5rem', bottom: '0.5rem', left: '0.5rem'}}
              name="angle-double-right"
              fill={Theme.text.primary}
              width='2.25rem' height='2.25rem'
              background={{color: Theme.background.modal}}
              cursor='pointer'
              class="hovered-icon"
              margin={{top: '0.75rem'}}
              onClick={this.onExpand}
            ></i-icon>
            <i-icon
              id="btnNext"
              border={{radius: '50%'}}
              padding={{top: '0.5rem', right: '0.5rem', bottom: '0.5rem', left: '0.5rem'}}
              name='arrow-right'
              fill={Theme.text.primary}
              width='2.25rem' height='2.25rem'
              background={{color: Theme.background.modal}}
              cursor='pointer'
              class="hovered-icon"
              onClick={this.onNext}
            ></i-icon>
          </i-vstack>
        </i-panel>
      </i-modal>
    )
  }
}
