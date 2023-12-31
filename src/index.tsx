import {
  Module,
  customModule,
  IDataSchema,
  Container,
  ControlElement,
  customElements,
  IUISchema,
  CardLayout,
  Control,
  VStack,
  Panel
} from '@ijstech/components'
import ScomImageGalleryModal from './galleryModal'
import { IImage, IImageGallery } from './interface';

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
  private _data: IImageGallery

  private mdImages: ScomImageGalleryModal
  private gridImages: CardLayout
  private pnlGallery: VStack
  private pnlRatio: Panel;
  private _currHash: string;

  tag: any = {}

  constructor(parent?: Container, options?: any) {
    super(parent, options)
  }

  init() {
    super.init()
    this._currHash = location.hash;
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
    return this._data.images
  }
  set images(value: IImage[]) {
    this._data.images = value
  }

  get hash() {
    return this._data.hash;
  }
  set hash(value: string) {
    this._data.hash = value;
  }

  get selectedImage() {
    return this.mdImages.activeSlide;
  }
  set selectedImage(index: number) {
    this.mdImages.activeSlide = index;
    this.mdImages.onShowModal();
  }

  private getData() {
    return this._data
  }

  private setData(value: IImageGallery) {
    const { selectedImage, ...rest } = value;
    this._data = rest;
    this.renderUI()
    if (selectedImage != null) this.selectedImage = selectedImage;
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
            background={{color: `url(${image.url}) center center / cover no-repeat`}}
            display="block"
            stack={{grow: '1'}}
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
          this.pnlRatio.padding = {bottom: `${heightPercent}%`};
        }
      }
    }
  }

  private selectImage(index: number) {
    this.selectedImage = index;
    history.pushState(null, null, `${this.hash || this._currHash}/photo/${index + 1}`);
  }

  private onSlideChange(index: number) {
    history.replaceState(null, null, `${this.hash || this._currHash}/photo/${index + 1}`);
  }

  getConfigurators() {
    return [
      {
        name: 'Builder Configurator',
        target: 'Builders',
        getActions: () => {
          return this._getActions('Builders')
        },
        getData: this.getData.bind(this),
        setData: this.setData.bind(this),
        getTag: this.getTag.bind(this),
        setTag: this.setTag.bind(this),
      },
      {
        name: 'Emdedder Configurator',
        target: 'Embedders',
        getData: this.getData.bind(this),
        setData: this.setData.bind(this),
        getTag: this.getTag.bind(this),
        setTag: this.setTag.bind(this),
      },
      {
        name: 'Editor',
        target: 'Editor',
        getActions: () => {
          return this._getActions('Editor')
        },
        getData: this.getData.bind(this),
        setData: this.setData.bind(this),
        getTag: this.getTag.bind(this),
        setTag: this.setTag.bind(this),
      },
    ]
  }

  private _getActions(target?: string) {
    return [
      {
        name: 'Widget Settings',
        icon: 'edit',
        ...this.getWidgetSchemas(),
      },
    ]
  }

  private getWidgetSchemas(): any {
    const propertiesSchema: IDataSchema = {
      type: 'object',
      properties: {
        pt: {
          title: 'Top',
          type: 'number',
        },
        pb: {
          title: 'Bottom',
          type: 'number',
        },
        pl: {
          title: 'Left',
          type: 'number',
        },
        pr: {
          title: 'Right',
          type: 'number',
        }
      },
    }
    const themesSchema: IUISchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'HorizontalLayout',
          elements: [
            {
              type: 'Group',
              label: 'Padding (px)',
              elements: [
                {
                  type: 'VerticalLayout',
                  elements: [
                    {
                      type: 'HorizontalLayout',
                      elements: [
                        {
                          type: 'Control',
                          scope: '#/properties/pt',
                        },
                        {
                          type: 'Control',
                          scope: '#/properties/pb',
                        },
                        {
                          type: 'Control',
                          scope: '#/properties/pl',
                        },
                        {
                          type: 'Control',
                          scope: '#/properties/pr',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        }
      ],
    }
    return {
      userInputDataSchema: propertiesSchema,
      userInputUISchema: themesSchema,
    }
  }

  private getTag() {
    return this.tag
  }

  private async setTag(value: any) {
    this.tag = value
    const { width, border } = this.tag
    if (this.pnlGallery) {
      this.pnlGallery.width = width
      this.pnlGallery.height = 'auto'
      if (border) {
        this.pnlGallery.border = border;
      }8
    }
  }

  render() {
    return (
      <i-vstack
        id="pnlGallery"
        border={{radius: 'inherit'}}
        width={'100%'}
        overflow={'hidden'}
        position='relative'
      >
        <i-panel
          id="pnlRatio"
          width="100%" height={'100%'}
          padding={{bottom: '56.25%'}}
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
            border={{radius: 'inherit'}}
            gap={{column: 2, row: 2}}
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
