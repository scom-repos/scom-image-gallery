var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@scom/scom-image-gallery/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.gridStyle = exports.modalStyle = void 0;
    const Theme = components_1.Styles.Theme.ThemeVars;
    exports.modalStyle = components_1.Styles.style({
        $nest: {
            '.hovered-icon': {
                transition: 'background 0.2s ease-in-out',
                $nest: {
                    '&:hover': {
                        background: `${Theme.action.hoverBackground} !important`
                    }
                }
            }
        }
    });
    exports.gridStyle = components_1.Styles.style({
        $nest: {}
    });
});
define("@scom/scom-image-gallery/interface.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("@scom/scom-image-gallery/galleryModal.tsx", ["require", "exports", "@ijstech/components", "@scom/scom-image-gallery/index.css.ts"], function (require, exports, components_2, index_css_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_2.Styles.Theme.ThemeVars;
    let ScomImageGalleryModal = class ScomImageGalleryModal extends components_2.Module {
        constructor(parent, options) {
            super(parent, options);
            this.onNext = this.onNext.bind(this);
            this.onPrev = this.onPrev.bind(this);
        }
        init() {
            super.init();
            const images = this.getAttribute('images', true);
            const activeSlide = this.getAttribute('activeSlide', true, 0);
            if (images)
                this.setData({ images, activeSlide });
        }
        static async create(options, parent) {
            let self = new this(parent, options);
            await self.ready();
            return self;
        }
        get images() {
            return this._data.images;
        }
        set images(value) {
            this._data.images = value;
        }
        get activeSlide() {
            return this._data.activeSlide ?? 0;
        }
        set activeSlide(value) {
            this._data.activeSlide = value ?? 0;
        }
        getData() {
            return this._data;
        }
        setData(value) {
            this._data = value;
            this.renderUI();
        }
        renderUI() {
            this.imagesSlider.items = [...this._data.images].map((item) => {
                return {
                    controls: [
                        this.$render("i-vstack", { height: "100%", width: '100%', verticalAlignment: 'center', horizontalAlignment: 'center', overflow: "hidden" },
                            this.$render("i-image", { display: "block", width: '100%', height: 'auto', maxHeight: '100vh', url: item.url, overflow: "hidden" }))
                    ],
                };
            });
            this.imagesSlider.activeSlide = this.activeSlide;
            this.updateControls();
        }
        onNext() {
            if (!this._data.images)
                return;
            this.imagesSlider.next();
            this.updateControls();
        }
        onPrev() {
            if (!this._data.images)
                return;
            this.imagesSlider.prev();
            this.updateControls();
        }
        updateControls() {
            this.btnNext.visible = this.imagesSlider.activeSlide < this._data.images.length - 1;
            this.btnPrev.visible = this.imagesSlider.activeSlide > 0;
        }
        onClose() {
            this.mdGallery.visible = false;
            this.imagesSlider.activeSlide = 0;
            this.updateControls();
        }
        onExpand() {
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
            return (this.$render("i-modal", { id: "mdGallery", showBackdrop: true, width: '100vw', height: '100vh', padding: { top: 0, right: 0, bottom: 0, left: 0 }, overflow: 'hidden', onOpen: this.onOpenModal },
                this.$render("i-panel", { width: '100vw', height: '100vh', class: index_css_1.modalStyle },
                    this.$render("i-vstack", { verticalAlignment: 'space-between', horizontalAlignment: 'start', height: '50%', padding: { right: '0.75rem', left: '0.75rem' }, position: 'absolute', left: "0px", top: "0px", zIndex: 100 },
                        this.$render("i-icon", { border: { radius: '50%' }, padding: { top: '0.5rem', right: '0.5rem', bottom: '0.5rem', left: '0.5rem' }, name: 'times', fill: Theme.text.primary, width: '2.25rem', height: '2.25rem', background: { color: Theme.background.modal }, cursor: 'pointer', margin: { top: '0.75rem' }, class: "hovered-icon", onClick: this.onClose }),
                        this.$render("i-icon", { id: "btnPrev", border: { radius: '50%' }, padding: { top: '0.5rem', right: '0.5rem', bottom: '0.5rem', left: '0.5rem' }, name: 'arrow-left', fill: Theme.text.primary, width: '2.25rem', height: '2.25rem', background: { color: Theme.background.modal }, cursor: 'pointer', class: "hovered-icon", onClick: this.onPrev })),
                    this.$render("i-carousel-slider", { id: 'imagesSlider', maxWidth: '75%', width: '100%', height: '100%', margin: { left: 'auto', right: 'auto' }, indicators: false, autoplay: false, swipe: true, mediaQueries: [
                            {
                                maxWidth: '768px',
                                properties: { maxWidth: '100%' },
                            }
                        ] }),
                    this.$render("i-vstack", { verticalAlignment: 'space-between', horizontalAlignment: 'end', height: '50%', padding: { right: '0.75rem', left: '0.75rem' }, position: 'absolute', right: "0px", top: "0px", zIndex: 100 },
                        this.$render("i-icon", { opacity: 0, border: { radius: '50%' }, padding: { top: '0.5rem', right: '0.5rem', bottom: '0.5rem', left: '0.5rem' }, name: "angle-double-right", fill: Theme.text.primary, width: '2.25rem', height: '2.25rem', background: { color: Theme.background.modal }, cursor: 'pointer', class: "hovered-icon", margin: { top: '0.75rem' }, onClick: this.onExpand }),
                        this.$render("i-icon", { id: "btnNext", border: { radius: '50%' }, padding: { top: '0.5rem', right: '0.5rem', bottom: '0.5rem', left: '0.5rem' }, name: 'arrow-right', fill: Theme.text.primary, width: '2.25rem', height: '2.25rem', background: { color: Theme.background.modal }, cursor: 'pointer', class: "hovered-icon", onClick: this.onNext })))));
        }
    };
    ScomImageGalleryModal = __decorate([
        components_2.customModule,
        (0, components_2.customElements)('i-scom-image-gallery--modal')
    ], ScomImageGalleryModal);
    exports.default = ScomImageGalleryModal;
});
define("@scom/scom-image-gallery", ["require", "exports", "@ijstech/components", "@scom/scom-image-gallery/index.css.ts"], function (require, exports, components_3, index_css_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let ScomImageGallery = class ScomImageGallery extends components_3.Module {
        constructor(parent, options) {
            super(parent, options);
            this.tag = {};
        }
        init() {
            super.init();
            this.setTag({ width: '100%', height: 'auto' });
            const lazyLoad = this.getAttribute('lazyLoad', true, false);
            if (!lazyLoad) {
                const images = this.getAttribute('images', true);
                if (images)
                    this.setData({ images });
            }
        }
        static async create(options, parent) {
            let self = new this(parent, options);
            await self.ready();
            return self;
        }
        get images() {
            return this._data.images;
        }
        set images(value) {
            this._data.images = value;
        }
        getData() {
            return this._data;
        }
        setData(value) {
            this._data = value;
            this.renderUI();
        }
        renderUI() {
            this.mdImages.setData({ images: this.images, activeSlide: 0 });
            this.gridImages.clearInnerHTML();
            const length = this.images.length;
            this.gridImages.columnsPerRow = length > 1 ? 2 : 1;
            for (let i = 0; i < this.gridImages.columnsPerRow; i++) {
                const wrapper = this.$render("i-vstack", { gap: 2, position: 'relative' });
                this.gridImages.appendChild(wrapper);
            }
            for (let i = 0; i < length; i++) {
                const wrapperIndex = i % this.gridImages.columnsPerRow;
                const wrapper = this.gridImages.children[wrapperIndex];
                const image = this.images[i];
                if (wrapper) {
                    wrapper.appendChild(this.$render("i-panel", { background: { color: `url(${image.url}) center center / cover no-repeat` }, display: "block", stack: { grow: '1' }, width: '100%', height: '100%', cursor: 'pointer', onClick: () => this.onImageSelected(i) }));
                }
            }
        }
        onImageSelected(index) {
            this.mdImages.activeSlide = index;
            this.mdImages.onShowModal();
        }
        getConfigurators() {
            return [
                {
                    name: 'Builder Configurator',
                    target: 'Builders',
                    getActions: () => {
                        return this._getActions('Builders');
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
                        return this._getActions('Editor');
                    },
                    getData: this.getData.bind(this),
                    setData: this.setData.bind(this),
                    getTag: this.getTag.bind(this),
                    setTag: this.setTag.bind(this),
                },
            ];
        }
        _getActions(target) {
            return [
                {
                    name: 'Widget Settings',
                    icon: 'edit',
                    ...this.getWidgetSchemas(),
                },
            ];
        }
        getWidgetSchemas() {
            const propertiesSchema = {
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
            };
            const themesSchema = {
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
            };
            return {
                userInputDataSchema: propertiesSchema,
                userInputUISchema: themesSchema,
            };
        }
        getTag() {
            return this.tag;
        }
        async setTag(value) {
            this.tag = value;
            const { width, border } = this.tag;
            if (this.pnlGallery) {
                this.pnlGallery.width = width;
                this.pnlGallery.height = 'auto';
                if (border) {
                    this.pnlGallery.border = border;
                }
            }
        }
        render() {
            return (this.$render("i-vstack", { id: "pnlGallery", border: { radius: 'inherit' }, width: '100%', minWidth: 300, overflow: 'hidden', position: 'relative' },
                this.$render("i-panel", { padding: { bottom: '56.25%' }, width: "100%" }),
                this.$render("i-panel", { position: 'absolute', width: '100%', height: '100%', top: "0px", left: "0px", overflow: 'hidden' },
                    this.$render("i-card-layout", { id: "gridImages", width: '100%', height: '100%', border: { radius: 'inherit' }, gap: { column: 2, row: 2 }, class: index_css_2.gridStyle }),
                    this.$render("i-scom-image-gallery--modal", { id: "mdImages" }))));
        }
    };
    ScomImageGallery = __decorate([
        components_3.customModule,
        (0, components_3.customElements)('i-scom-image-gallery')
    ], ScomImageGallery);
    exports.default = ScomImageGallery;
});
