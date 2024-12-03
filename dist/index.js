var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@scom/scom-image-gallery/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getTransformStyle = exports.modalStyle = void 0;
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
    const getTransformStyle = (value, origin) => {
        return components_1.Styles.style({
            transform: `${value} !important`,
            transformOrigin: `${origin} !important`
        });
    };
    exports.getTransformStyle = getTransformStyle;
});
define("@scom/scom-image-gallery/interface.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("@scom/scom-image-gallery/galleryModal.tsx", ["require", "exports", "@ijstech/components", "@scom/scom-image-gallery/index.css.ts"], function (require, exports, components_2, index_css_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_2.Styles.Theme.ThemeVars;
    const verticalPadding = 0;
    const horizontalPadding = 0;
    const animationDuration = 300;
    const maxZoom = 4;
    const minZoom = 0.5;
    let ScomImageGalleryModal = class ScomImageGalleryModal extends components_2.Module {
        constructor(parent, options) {
            super(parent, options);
            this._data = {
                images: []
            };
            this.zoom = 1;
            this.isMousedown = false;
            this.initialOffset = { x: 0, y: 0 };
            this.offset = { x: 0, y: 0 };
            this.lastCenter = null;
            this.lastDist = 0;
            this._initialOffsetSetup = false;
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
            return this._data.images || [];
        }
        set images(value) {
            this._data.images = value || [];
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
            this.imagesSlider.items = [...this.images].map((item) => {
                return {
                    controls: [
                        this.$render("i-vstack", { height: '100%', width: '100%', horizontalAlignment: 'center', verticalAlignment: 'center', overflow: 'hidden', position: 'relative' },
                            this.$render("i-image", { display: 'block', width: '100%', height: 'auto', maxHeight: '100vh', url: item.url })),
                    ],
                };
            });
            this.imagesSlider.activeSlide = this.activeSlide;
            this.updateControls();
        }
        onNext() {
            if (!this.images.length)
                return;
            this.imagesSlider.next();
            this.updateControls();
        }
        onPrev() {
            if (!this.images.length)
                return;
            this.imagesSlider.prev();
            this.updateControls();
        }
        updateControls() {
            this.btnNext.visible =
                this.imagesSlider.activeSlide < this.images.length - 1;
            this.btnPrev.visible = this.imagesSlider.activeSlide > 0;
        }
        onCloseClicked() {
            this.mdGallery.visible = false;
        }
        onShowModal() {
            this.mdGallery.visible = true;
        }
        onOpenModal() {
            this.imagesSlider.activeSlide = this.activeSlide;
            this.updateControls();
            components_2.application.EventBus.dispatch('IMAGE_GALLERY_VIEW_IMAGE', this.mdGallery);
        }
        onCloseModal() {
            const found = location.hash.match(/\/photo\/\d+$/);
            if (found) {
                if (history.length > 1) {
                    history.back();
                }
                else {
                    const url = found.input.substring(0, found.index);
                    history.replaceState(null, null, url);
                }
            }
            this.imagesSlider.activeSlide = 0;
            this.zoomOut();
        }
        _handleMouseDown(event, stopPropagation) {
            this.isMousedown = true;
            if (event instanceof TouchEvent) {
                const target = event.target;
                this.currentEl = target.closest('i-image');
                this.setupInitialOffset();
                this.initialOffset = {
                    x: event.touches[0].pageX,
                    y: event.touches[0].pageY
                };
                // this.detectDoubleTap(event);
            }
            return true;
        }
        _handleMouseMove(event, stopPropagation) {
            if (!this.isMousedown)
                return;
            if (event instanceof TouchEvent) {
                const target = event.target;
                this.currentEl = target.closest('i-image');
                if (this.currentEl) {
                    const result = this.handleZoom(event);
                    if (result)
                        return;
                }
            }
            return true;
        }
        _handleMouseUp(event, stopPropagation) {
            this.isMousedown = false;
            if (this.zoom > 1)
                return;
            this.lastDist = 0;
            this.lastCenter = null;
            this.zoomOut();
            return true;
        }
        handleZoom(event) {
            event.preventDefault();
            if (event.touches.length > 1) {
                this.setupInitialOffset();
                const [touch1, touch2] = event.touches;
                const p1 = {
                    x: touch1.pageX,
                    y: touch1.pageY,
                };
                const p2 = {
                    x: touch2.pageX,
                    y: touch2.pageY,
                };
                if (!this.lastCenter) {
                    this.lastCenter = this.getCenter(p1, p2);
                    return;
                }
                const newCenter = this.getCenter(p1, p2);
                const dist = this.getDistance(p1, p2);
                if (!this.lastDist) {
                    this.lastDist = dist;
                }
                // const parentHeight = this.currentEl?.offsetHeight;
                // const value = this.lastDist === 1 && parentHeight ? 1 + dist / parentHeight : dist / this.lastDist;
                this.scale(dist / this.lastDist, newCenter);
                this.lastDist = dist;
                this.lastCenter = newCenter;
            }
            else if (this.zoom > 1) {
                this.handleDrag(event);
            }
            else {
                return;
            }
            return true;
        }
        handleDrag(event) {
            const deltaX = (this.initialOffset.x - event.touches[0].pageX);
            const deltaY = (this.initialOffset.y - event.touches[0].pageY);
            this.addOffset({
                x: deltaX,
                y: deltaY
            });
            this.initialOffset = {
                x: event.touches[0].pageX,
                y: event.touches[0].pageY
            };
            this.updateImage('drag');
        }
        getDistance(p1, p2) {
            return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        }
        getCenter(p1, p2) {
            return {
                x: (p1.x + p2.x) / 2,
                y: (p1.y + p2.y) / 2,
            };
        }
        scale(scale, center) {
            const oldZoom = this.zoom;
            this.zoom *= scale;
            this.zoom = Math.max(minZoom, Math.min(maxZoom, this.zoom));
            const _scale = this.zoom / oldZoom;
            this.addOffset({
                x: (_scale - 1) * (center.x + this.offset.x),
                y: (_scale - 1) * (center.y + this.offset.y)
            });
            this.updateImage('zoom');
        }
        addOffset(offset) {
            this.offset = {
                x: this.offset.x + offset.x,
                y: this.offset.y + offset.y
            };
        }
        updateImage(interaction) {
            if (!this.currentEl)
                return;
            this.offset = this.sanitizeOffset({ ...this.offset });
            const zoomFactor = this.getInitialZoomFactor() * this.zoom;
            const offsetX = -this.offset.x / zoomFactor;
            const offsetY = -this.offset.y / zoomFactor;
            const image = this.currentEl.querySelector('img');
            if (image) {
                const translate = `translate(${offsetX}px, ${offsetY}px)`;
                const scale = `scale(${this.zoom})`;
                const transform = interaction === 'drag' ? `${scale} ${translate}` : `${translate} ${scale}`;
                const origin = interaction === 'drag' ? '0% 0%' : `${-offsetX / 2}px ${-offsetY / 2}px`;
                const styleClass = (0, index_css_1.getTransformStyle)(transform, origin);
                this.setTargetStyle(image, 'transform', styleClass);
            }
        }
        removeTargetStyle(target, propertyName) {
            const style = this.propertyClassMap[propertyName];
            if (style)
                target.classList.remove(style);
        }
        setTargetStyle(target, propertyName, value) {
            this.removeTargetStyle(target, propertyName);
            if (value) {
                this.propertyClassMap[propertyName] = value;
                target.classList.add(value);
            }
        }
        sanitizeOffset(offset) {
            if (!this.currentEl)
                return offset;
            const img = this.currentEl.querySelector('img');
            const elWidth = img.offsetWidth * this.getInitialZoomFactor() * this.zoom;
            const elHeight = img.offsetHeight * this.getInitialZoomFactor() * this.zoom;
            const maxX = elWidth - this.currentEl.offsetWidth + horizontalPadding;
            const maxY = elHeight - this.currentEl.offsetHeight + verticalPadding;
            const maxOffsetX = Math.max(maxX, 0);
            const maxOffsetY = Math.max(maxY, 0);
            const minOffsetX = Math.min(maxX, 0) - horizontalPadding;
            const minOffsetY = Math.min(maxY, 0) - verticalPadding;
            return {
                x: Math.min(Math.max(offset.x, minOffsetX), maxOffsetX),
                y: Math.min(Math.max(offset.y, minOffsetY), maxOffsetY)
            };
        }
        getInitialZoomFactor() {
            if (!this.currentEl)
                return 1;
            const img = this.currentEl.querySelector('img');
            const xZoomFactor = this.currentEl.offsetWidth / img.offsetWidth;
            const yZoomFactor = this.currentEl.offsetHeight / img.offsetHeight;
            return Math.min(xZoomFactor, yZoomFactor);
        }
        setupInitialOffset() {
            if (this._initialOffsetSetup) {
                return;
            }
            this._initialOffsetSetup = true;
            this.computeInitialOffset();
            this.offset.x = this.initialOffset.x;
            this.offset.y = this.initialOffset.y;
        }
        computeInitialOffset() {
            if (!this.currentEl)
                return;
            const img = this.currentEl.querySelector('img');
            this.initialOffset = {
                x: -Math.abs(img.offsetWidth * this.getInitialZoomFactor() -
                    this.currentEl.offsetWidth) / 2,
                y: -Math.abs(img.offsetHeight * this.getInitialZoomFactor() -
                    this.currentEl.offsetHeight) / 2,
            };
        }
        onSwipeEnd(isSwiping) {
            if (isSwiping)
                this.zoomOut();
            this.updateControls();
        }
        zoomOut() {
            this.zoom = 1;
            for (let item of this.imagesSlider.items) {
                const control = item.controls[0];
                const image = control?.querySelector('img');
                if (image) {
                    this.removeTargetStyle(image, 'transform');
                }
            }
            this.currentEl = null;
        }
        handleSlideChange(index) {
            if (this.onSlideChange)
                this.onSlideChange(index);
        }
        disconnectedCallback() {
            super.disconnectedCallback();
        }
        render() {
            return (this.$render("i-modal", { id: 'mdGallery', showBackdrop: true, width: '100vw', height: '100vh', padding: { top: 0, right: 0, bottom: 0, left: 0 }, overflow: 'hidden', onOpen: this.onOpenModal, onClose: this.onCloseModal },
                this.$render("i-panel", { width: '100vw', height: '100vh', class: index_css_1.modalStyle },
                    this.$render("i-vstack", { verticalAlignment: 'space-between', horizontalAlignment: 'start', height: '50%', padding: { right: '0.75rem', left: '0.75rem' }, position: 'absolute', left: '0px', top: '0px', zIndex: 100 },
                        this.$render("i-icon", { border: { radius: '50%' }, padding: {
                                top: '0.5rem',
                                right: '0.5rem',
                                bottom: '0.5rem',
                                left: '0.5rem',
                            }, name: 'times', fill: Theme.text.primary, width: '2.25rem', height: '2.25rem', background: { color: Theme.background.modal }, cursor: 'pointer', margin: { top: '0.75rem' }, class: 'hovered-icon', onClick: () => this.onCloseClicked() }),
                        this.$render("i-icon", { id: 'btnPrev', border: { radius: '50%' }, padding: {
                                top: '0.5rem',
                                right: '0.5rem',
                                bottom: '0.5rem',
                                left: '0.5rem',
                            }, name: 'arrow-left', fill: Theme.text.primary, width: '2.25rem', height: '2.25rem', background: { color: Theme.background.modal }, cursor: 'pointer', class: 'hovered-icon', mediaQueries: [
                                {
                                    maxWidth: '768px',
                                    properties: { visible: false },
                                },
                            ], onClick: this.onPrev })),
                    this.$render("i-carousel-slider", { id: 'imagesSlider', maxWidth: '75%', width: '100%', height: '100%', margin: { left: 'auto', right: 'auto' }, indicators: false, autoplay: false, swipe: true, onSwipeEnd: this.onSwipeEnd, mediaQueries: [
                            {
                                maxWidth: '768px',
                                properties: { maxWidth: '100%', indicators: true },
                            },
                        ], onSlideChange: this.handleSlideChange }),
                    this.$render("i-vstack", { verticalAlignment: 'space-between', horizontalAlignment: 'end', height: '50%', padding: { right: '0.75rem', left: '0.75rem' }, position: 'absolute', right: '0px', top: '0px', zIndex: 100 },
                        this.$render("i-icon", { opacity: 0, border: { radius: '50%' }, padding: {
                                top: '0.5rem',
                                right: '0.5rem',
                                bottom: '0.5rem',
                                left: '0.5rem',
                            }, name: 'angle-double-right', fill: Theme.text.primary, width: '2.25rem', height: '2.25rem', background: { color: Theme.background.modal }, cursor: 'pointer', class: 'hovered-icon', margin: { top: '0.75rem' } }),
                        this.$render("i-icon", { id: 'btnNext', border: { radius: '50%' }, padding: {
                                top: '0.5rem',
                                right: '0.5rem',
                                bottom: '0.5rem',
                                left: '0.5rem',
                            }, name: 'arrow-right', fill: Theme.text.primary, width: '2.25rem', height: '2.25rem', background: { color: Theme.background.modal }, cursor: 'pointer', class: 'hovered-icon', mediaQueries: [
                                {
                                    maxWidth: '768px',
                                    properties: { visible: false },
                                },
                            ], onClick: this.onNext })))));
        }
    };
    ScomImageGalleryModal = __decorate([
        components_2.customModule,
        (0, components_2.customElements)('i-scom-image-gallery--modal')
    ], ScomImageGalleryModal);
    exports.default = ScomImageGalleryModal;
});
define("@scom/scom-image-gallery/model.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Model = void 0;
    class Model {
        constructor(module, options) {
            this.options = {
                updateWidget: (selectedImage) => { },
                updateWidgetTag: (value) => { }
            };
            this._data = { images: [] };
            this.module = module;
            this._currHash = location.hash;
            this.options = options;
        }
        get images() {
            return this._data.images || [];
        }
        set images(value) {
            this._data.images = value || [];
        }
        get hash() {
            return this._data.hash || this._currHash;
        }
        set hash(value) {
            this._data.hash = value;
        }
        getData() {
            return this._data;
        }
        async setData(value) {
            const { selectedImage, ...rest } = value;
            this._data = rest;
            this.options.updateWidget(selectedImage);
        }
        getTag() {
            return this.module.tag;
        }
        async setTag(value) {
            this.module.tag = value;
            this.options.updateWidgetTag(value);
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
                }
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
            };
            const themesSchema = {
                type: 'VerticalLayout',
                elements: [
                    {
                        type: 'Control',
                        scope: '#/properties/images'
                    }
                ],
            };
            return {
                userInputDataSchema: propertiesSchema,
                userInputUISchema: themesSchema,
            };
        }
    }
    exports.Model = Model;
});
define("@scom/scom-image-gallery", ["require", "exports", "@ijstech/components", "@scom/scom-image-gallery/model.ts"], function (require, exports, components_3, model_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let ScomImageGallery = class ScomImageGallery extends components_3.Module {
        constructor(parent, options) {
            super(parent, options);
            this.tag = {};
            this.initModel();
        }
        init() {
            super.init();
            this.setTag({ width: '100%', height: 'auto' });
            const lazyLoad = this.getAttribute('lazyLoad', true, false);
            if (!lazyLoad) {
                const images = this.getAttribute('images', true);
                const hash = this.getAttribute('hash', true);
                const selectedImage = this.getAttribute('selectedImage', true);
                let data = {};
                if (images)
                    data.images = images;
                if (hash)
                    data.hash = hash;
                this.setData(data);
                if (selectedImage != null)
                    this.selectedImage = selectedImage;
            }
        }
        static async create(options, parent) {
            let self = new this(parent, options);
            await self.ready();
            return self;
        }
        get images() {
            return this.model.images;
        }
        set images(value) {
            this.model.images = value;
        }
        get hash() {
            return this.model.hash;
        }
        set hash(value) {
            this.model.hash = value;
        }
        get selectedImage() {
            return this.mdImages.activeSlide;
        }
        set selectedImage(index) {
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
        setData(value) {
            this.model.setData(value);
        }
        getTag() {
            return this.tag;
        }
        async setTag(value) {
            this.model.setData(value);
        }
        initModel() {
            if (!this.model) {
                this.model = new model_1.Model(this, {
                    updateWidget: this.updateWidget.bind(this),
                    updateWidgetTag: this.updateWidgetTag.bind(this)
                });
            }
        }
        updateWidget(selectedImage) {
            this.renderUI();
            if (selectedImage != null)
                this.selectedImage = selectedImage;
        }
        updateWidgetTag() {
            const { width, border } = this.tag;
            if (this.pnlGallery) {
                this.pnlGallery.width = width;
                this.pnlGallery.height = 'auto';
                if (border) {
                    this.pnlGallery.border = border;
                }
            }
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
                    wrapper.append(this.$render("i-panel", { background: { color: `url(${image.url}) center center / cover no-repeat` }, display: "block", stack: { grow: '1' }, width: '100%', height: 'auto', cursor: 'pointer', onClick: () => this.selectImage(i) }));
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
                };
            }
        }
        selectImage(index) {
            this.selectedImage = index;
            history.pushState(null, null, `${this.hash}/photo/${index + 1}`);
        }
        onSlideChange(index) {
            history.replaceState(null, null, `${this.hash}/photo/${index + 1}`);
        }
        render() {
            return (this.$render("i-vstack", { id: "pnlGallery", border: { radius: 'inherit' }, width: '100%', overflow: 'hidden', position: 'relative' },
                this.$render("i-panel", { id: "pnlRatio", width: "100%", height: '100%', padding: { bottom: '56.25%' } }),
                this.$render("i-panel", { position: 'absolute', width: '100%', height: '100%', top: "0px", left: "0px", overflow: 'hidden' },
                    this.$render("i-card-layout", { id: "gridImages", width: '100%', height: '100%', border: { radius: 'inherit' }, gap: { column: 2, row: 2 } }),
                    this.$render("i-scom-image-gallery--modal", { id: "mdImages", onSlideChange: this.onSlideChange }))));
        }
    };
    ScomImageGallery = __decorate([
        components_3.customModule,
        (0, components_3.customElements)('i-scom-image-gallery')
    ], ScomImageGallery);
    exports.default = ScomImageGallery;
});
