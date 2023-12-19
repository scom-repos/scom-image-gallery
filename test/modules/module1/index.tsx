import { Module, customModule, Container, Styles } from '@ijstech/components';
import ScomImageGallery from '@scom/scom-image-gallery';
const Theme = Styles.Theme.ThemeVars;

@customModule
export default class Module1 extends Module {
    private el: ScomImageGallery
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
            }
        ];
    }

    init() {
        super.init();
    }

    render() {
        return <i-panel>
            <i-hstack id="mainStack" margin={{top: '1rem', left: '1rem'}} gap="2rem">
                <i-scom-image-gallery
                    images={this._images}
                    width={'400px'}
                    height={'auto'}
                    border={{width: '1px', style: 'solid', color: Theme.divider}}
                ></i-scom-image-gallery>
            </i-hstack>
        </i-panel>
    }
}