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
import { splitValue } from './utils';

interface ScomImageGalleryElement extends ControlElement {
  lazyLoad?: boolean;
  images: IImage[];
  hash?: string;
  columnsPerRow?: number;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['i-scom-image-gallery']: ScomImageGalleryElement
    }
  }
}

@customModule
@customElements('i-scom-image-gallery', {
  icon: 'stop',
  props: {
    images: {
      type: 'array',
      default: []
    },
    hash: {
      type: 'string',
      default: ''
    },
    columnsPerRow: {
      type: 'number'
    },
    data: {
      type: 'object'
    }
  },
  className: 'ScomImageGallery',
  events: {},
  dataSchema: {
    type: 'object',
    properties: {
      images: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            link: {
              type: 'string',
              required: false
            },
            url: {
              type: 'string'
            }
          }
        },
      },
      hash: {
        type: 'string',
        required: false
      },
      columnsPerRow: {
        type: 'number',
        required: false
      }
    }
  }
})
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
      const tag = this.getAttribute('tag', true)
      if (tag) this.setTag(tag);
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

  get columnsPerRow() {
    return this.model.columnsPerRow;
  }
  set columnsPerRow(value: number) {
    this.model.columnsPerRow = value;
  }

  get selectedImage() {
    return this.mdImages.activeSlide;
  }
  set selectedImage(index: number) {
    const image = this.images[index];
    if (image?.link) {
      window.open(image.link, '_blank');
    } else {
      this.mdImages.activeSlide = index;
      this.mdImages.onShowModal();
    }
  }

  get data() {
    return this.model.data;
  }

  set data(value: IImageGallery) {
    console.log('set data', value);
    this.model.data = value;
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
    this.model.setTag(value);
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
    const { width, border, maxWidth, margin, gap } = this.tag;
    if (this.pnlGallery) {
      this.pnlGallery.width = width;
      this.pnlGallery.height = 'auto';
      if (maxWidth !== undefined) {
        this.pnlGallery.maxWidth = maxWidth;
        if (width === undefined) {
          this.pnlGallery.width = maxWidth;
        }
      }
      if (margin) {
        this.pnlGallery.margin = margin;
      }
      if (border) {
        this.pnlGallery.border = border;
      }
    }

    if (this.gridImages && gap) {
      this.gridImages.gap = gap;
    }
  }

  private renderUI() {
    const {image: imageStyles, gap} = this.tag;
    this.mdImages.setData({ images: this.images, activeSlide: 0 });
    this.gridImages.clearInnerHTML();
    const length = this.images.length;
    this.gridImages.columnsPerRow = this.columnsPerRow || (length > 1 ? 2 : 1);

    for (let i = 0; i < this.gridImages.columnsPerRow; i++) {
      const wrapper = <i-vstack gap={gap?.row || 2} position='relative'></i-vstack>;
      this.gridImages.appendChild(wrapper);
    }

    const hasImageStyle = imageStyles?.width || imageStyles?.height;

    for (let i = 0; i < length; i++) {
      const wrapperIndex = i % this.gridImages.columnsPerRow;
      const wrapper = this.gridImages.children[wrapperIndex] as Control;
      const image = this.images[i];
      if (wrapper) {
        wrapper.append(
          <i-panel
            background={{ color: `url(${image.url}) center center / cover no-repeat` }}
            display="block"
            stack={hasImageStyle ? undefined : { grow: '1' }}
            width={imageStyles?.width || '100%'} height={imageStyles?.height || 'auto'}
            cursor='pointer'
            onClick={() => this.selectImage(i)}
          ></i-panel>
        );
      }
    }

    if (imageStyles?.height) {
      // TODO: fix
      const rows = this.gridImages?.children?.[0]?.children?.length;
      const height = splitValue(imageStyles.height);
      const space = splitValue(gap?.row || 2);

      this.pnlGallery.maxHeight = (height.value * rows + space.value) + (height.unit || space.unit);
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
    if (this.designMode) return;
    this.selectedImage = index;
    const image = this.images[index];
    if (!image?.link) {
      history.pushState(null, null, `${this.hash}/photo/${index + 1}`);
    }
  }

  private onSlideChange(index: number) {
    if (this.designMode) return;
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
