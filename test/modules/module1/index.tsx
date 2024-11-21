import { Module, customModule, Container, Styles } from '@ijstech/components';
import ScomImageGallery from '@scom/scom-image-gallery';
import ScomWidgetTest from '@scom/scom-widget-test';
const Theme = Styles.Theme.ThemeVars;

@customModule
export default class Module1 extends Module {
    private imageGallery: ScomImageGallery;
    private widgetModule: ScomWidgetTest;
    private _images: any[] = [];

    constructor(parent?: Container, options?: any) {
        super(parent, options);
        this._images = [
            {
                url: 'https://pbs.twimg.com/media/GAA8FWKXEAAfjD5?format=jpg&name=large'
            },
            {
                url: 'https://pbs.twimg.com/media/GAA8GkIWkAAPrZQ?format=jpg&name=large'
            },
            {
                url: 'https://pbs.twimg.com/media/GAA8EIVXsAAaSM1?format=jpg&name=large'
            },
            {
                url: "https://c7.staticflickr.com/9/8569/28941134686_d57273d933_b.jpg"
            },
            {
                url: "https://c5.staticflickr.com/9/8768/28941110956_b05ab588c1_b.jpg"
            }
        ];
    }

    private async onShowConfig() {
        const editor = this.imageGallery.getConfigurators().find(v => v.target === 'Editor');
        const widgetData = await editor.getData();
        if (!this.widgetModule) {
            this.widgetModule = await ScomWidgetTest.create({
                widgetName: 'scom-image-gallery',
                onConfirm: (data: any, tag: any) => {
                    editor.setData(data);
                    editor.setTag(tag);
                    this.widgetModule.closeModal();
                }
            });
        }
        this.widgetModule.openModal({
            width: '90%',
            maxWidth: '90rem',
            minHeight: 400,
            padding: { top: 0, bottom: 0, left: 0, right: 0 },
            closeOnBackdropClick: true,
            closeIcon: null
        });
        this.widgetModule.show(widgetData);
    }

    init() {
        super.init();
    }

    render() {
        return <i-panel width="100%">
            <i-vstack
                verticalAlignment="center"
                margin={{ top: '1rem', left: 'auto', right: 'auto' }}
                padding={{ left: '1rem', right: '1rem' }}
                gap="1rem"
                width={600}
                maxWidth="100%"
            >
                <i-button caption="Config" onClick={this.onShowConfig} width={160} padding={{ top: 5, bottom: 5 }} margin={{ left: 'auto', right: 20 }} font={{ color: '#fff' }} />
                <i-scom-image-gallery
                    id="imageGallery"
                    images={this._images}
                    width={500}
                    border={{ radius: '1rem', width: '1px', style: 'solid', color: Theme.divider }}
                ></i-scom-image-gallery>
            </i-vstack>
        </i-panel>
    }
}