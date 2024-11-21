import {
  Module,
  customModule,
  Container,
  ControlElement,
  customElements,
  CardLayout,
  Control,
  VStack,
  Panel
} from '@ijstech/components'
import ScomImageGalleryModal from './galleryModal'
import { IImage, IImageGallery } from './interface';
import { Model } from './model';

interface ScomImageGalleryElement extends ControlElement {
  lazyLoad?: boolean;
  images: IImage[];
  hash?: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['i-scom-image-gallery']: ScomImageGalleryElement
    }
  }
}

@customModule
@customElements('i-scom-image-gallery')
export default class ScomImageGallery extends Module {
  private model: Model;

  private mdImages: ScomImageGalleryModal
  private gridImages: CardLayout
  private pnlGallery: VStack
  private pnlRatio: Panel;

  tag: any = {}

  constructor(parent?: Container, options?: any) {
    super(parent, options);
    this.initModel();
  }

  init() {
    super.init()
    this.setTag({ width: '100%', height: 'auto' })
    const lazyLoad = this.getAttribute('lazyLoad', true, false)
    if (!lazyLoad) {
      const images = this.getAttribute('images', true)
      const hash = this.getAttribute('hash', true)
      const selectedImage = this.getAttribute('selectedImage', true)
      let data: any = {};
      if (images) data.images = images;
      if (hash) data.hash = hash;
      this.setData(data)
      if (selectedImage != null) this.selectedImage = selectedImage;
    }
  }

  static async create(options?: ScomImageGalleryElement, parent?: Container) {
    let self = new this(parent, options)
    await self.ready()
    return self
  }

  get images() {
    return this.model.images;
  }
  set images(value: IImage[]) {
    this.model.images = value;
  }

  get hash() {
    return this.model.hash;
  }
  set hash(value: string) {
    this.model.hash = value;
  }

  get selectedImage() {
    return this.mdImages.activeSlide;
  }
  set selectedImage(index: number) {
    this.mdImages.activeSlide = index;
    this.mdImages.onShowModal();
  }

  getConfigurators() {
    this.initModel();
    return this.model.getConfigurators();
  }

  getData() {
    return this.model.getData();
  }

  private setData(value: IImageGallery) {
    this.model.setData(value);
  }

  getTag() {
    return this.tag;
  }

  private async setTag(value: any) {
    this.model.setData(value);
  }

  private initModel() {
    if (!this.model) {
      this.model = new Model(this, {
        updateWidget: this.updateWidget.bind(this),
        updateWidgetTag: this.updateWidgetTag.bind(this)
      });
    }
  }

  private updateWidget(selectedImage: number) {
    this.renderUI();
    if (selectedImage != null) this.selectedImage = selectedImage;
  }

  private updateWidgetTag() {
    const { width, border } = this.tag;
    if (this.pnlGallery) {
      this.pnlGallery.width = width;
      this.pnlGallery.height = 'auto';
      if (border) {
        this.pnlGallery.border = border;
      }
    }
  }

  private renderUI() {
    this.mdImages.setData({ images: this.images, activeSlide: 0 });
    this.gridImages.clearInnerHTML();
    const length = this.images.length;
    this.gridImages.columnsPerRow = length > 1 ? 2 : 1;
    for (let i = 0; i < this.gridImages.columnsPerRow; i++) {
      const wrapper = <i-vstack gap={2} position='relative'></i-vstack>;
      this.gridImages.appendChild(wrapper);
    }
    for (let i = 0; i < length; i++) {
      const wrapperIndex = i % this.gridImages.columnsPerRow;
      const wrapper = this.gridImages.children[wrapperIndex] as Control;
      const image = this.images[i];
      if (wrapper) {
        wrapper.append(
          <i-panel
            background={{ color: `url(${image.url}) center center / cover no-repeat` }}
            display="block"
            stack={{ grow: '1' }}
            width={'100%'} height={'auto'}
            cursor='pointer'
            onClick={() => this.selectImage(i)}
          ></i-panel>
        );
      }
    }

    if (this.gridImages.columnsPerRow === 1 && this.images?.length) {
      const imgEl = new Image();
      imgEl.src = this.images[0].url;
      imgEl.onload = () => {
        const heightPercent = (imgEl.height * 100) / imgEl.width;
        if (!isNaN(heightPercent)) {
          this.pnlRatio.padding = { bottom: `${heightPercent}%` };
        }
      }
    }
  }

  private selectImage(index: number) {
    this.selectedImage = index;
    history.pushState(null, null, `${this.hash}/photo/${index + 1}`);
  }

  private onSlideChange(index: number) {
    history.replaceState(null, null, `${this.hash}/photo/${index + 1}`);
  }

  render() {
    return (
      <i-vstack
        id="pnlGallery"
        border={{ radius: 'inherit' }}
        width={'100%'}
        overflow={'hidden'}
        position='relative'
      >
        <i-panel
          id="pnlRatio"
          width="100%" height={'100%'}
          padding={{ bottom: '56.25%' }}
        ></i-panel>
        <i-panel
          position='absolute'
          width={'100%'} height={'100%'}
          top="0px" left="0px"
          overflow={'hidden'}
        >
          <i-card-layout
            id="gridImages"
            width={'100%'} height={'100%'}
            border={{ radius: 'inherit' }}
            gap={{ column: 2, row: 2 }}
          ></i-card-layout>
          <i-scom-image-gallery--modal
            id="mdImages"
            onSlideChange={this.onSlideChange}
          />
        </i-panel>
      </i-vstack>
    )
  }
}
