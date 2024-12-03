import { IUISchema, Module } from '@ijstech/components';
import { IImage, IImageGallery } from './interface';

interface IModelOptions {
  updateWidget: (selectedImage: number) => void;
  updateWidgetTag: (value: any) => void;
}

export class Model {
  private module: Module;
  private options: IModelOptions = {
    updateWidget: (selectedImage: number) => { },
    updateWidgetTag: (value: any) => { }
  };
  private _data: IImageGallery = { images: [] };
  private _currHash: string;

  constructor(module: Module, options: IModelOptions) {
    this.module = module;
    this._currHash = location.hash;
    this.options = options;
  }

  get images() {
    return this._data.images || []
  }
  set images(value: IImage[]) {
    this._data.images = value || []
  }

  get hash() {
    return this._data.hash || this._currHash;
  }
  set hash(value: string) {
    this._data.hash = value;
  }

  getData() {
    return this._data;
  }

  async setData(value: IImageGallery) {
    const { selectedImage, ...rest } = value;
    this._data = rest;
    this.options.updateWidget(selectedImage);
  }

  getTag() {
    return this.module.tag;
  }

  async setTag(value: any) {
    this.module.tag = value;
    this.options.updateWidgetTag(value);
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
      }
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

  private getWidgetSchemas() {
    const propertiesSchema = {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          required: true,
          items: {
            type: 'object',
            properties: {
              url: {
                title: 'URL',
                type: 'string',
                required: true
              }
            }
          }
        }
      },
    }
    const themesSchema: IUISchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/images'
        }
      ],
    }
    return {
      userInputDataSchema: propertiesSchema,
      userInputUISchema: themesSchema,
    }
  }
}
