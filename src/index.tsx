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
} from '@ijstech/components'
import ScomImageGalleryModal from './galleryModal'
import { IImage, IImageGallery } from './interface';

interface ScomImageGalleryElement extends ControlElement {
  lazyLoad?: boolean;
  images: IImage[];
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

  private mdImages: ScomImageGalleryModal;
  private gridImages: CardLayout

  tag: any = {}

  constructor(parent?: Container, options?: any) {
    super(parent, options)
  }

  init() {
    super.init()
    this.setTag({ width: '100%', height: 'auto' })
    const lazyLoad = this.getAttribute('lazyLoad', true, false)
    if (!lazyLoad) {
      const images = this.getAttribute('images', true)
      if (images) this.setData({ images })
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

  private getData() {
    return this._data
  }

  private setData(value: IImageGallery) {
    this._data = value
    this.renderUI()
  }

  private renderUI() {
    this.mdImages.setData({ images: this.images, activeSlide: 0 });
    this.gridImages.clearInnerHTML();
    const length = this.images.length;
    this.gridImages.columnsPerRow = length > 1 ? 2 : 1;
    for (let i = 0; i < this.gridImages.columnsPerRow; i++) {
      const wrapper = <i-vstack gap={2}></i-vstack>;
      this.gridImages.appendChild(wrapper);
    }
    for (let i = 0; i < length; i++) {
      const wrapperIndex = i % this.gridImages.columnsPerRow;
      const wrapper = this.gridImages.children[wrapperIndex] as Control;
      const image = this.images[i];
      if (wrapper) {
        wrapper.appendChild(
          <i-image
            display="block"
            stack={{grow: '1'}}
            width={'100%'} height={'100%'}
            url={image.url}
            cursor='pointer'
            objectFit='cover'
            onClick={() => this.onImageSelected(i)}
          ></i-image>
        );
      }
    }
  }

  private onImageSelected(index: number) {
    this.mdImages.onShowModal(index);
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
    // TODO: update tag
  }

  render() {
    return (
      <i-panel>
        <i-card-layout
          id="gridImages"
          width={'100%'} height={'100%'}
          gap={{column: 2, row: 2}}
        ></i-card-layout>
        <i-scom-image-gallery--modal
          id="mdImages"
        ></i-scom-image-gallery--modal>
      </i-panel>
    )
  }
}
