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
            this.zoom = 1;
            this.lastTap = 0;
            this.inAnimation = false;
            this.isMousedown = false;
            this.initialOffset = { x: 0, y: 0 };
            this.offset = { x: 0, y: 0 };
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
                        this.$render("i-vstack", { height: '100%', width: '100%', verticalAlignment: 'center', horizontalAlignment: 'center', overflow: 'hidden' },
                            this.$render("i-image", { display: 'block', width: '100%', height: 'auto', maxHeight: '100vh', url: item.url })),
                    ],
                };
            });
            this.imagesSlider.activeSlide = this.activeSlide;
            this.updateControls();
            // this.imagesSlider.addEventListener('mousewheel', (e: WheelEvent) => this.handleMouseWheel(e));
        }
        // private handleMouseWheel(event: WheelEvent) {
        //   event.preventDefault()
        //   const target = event.target as HTMLElement
        //   this.currentEl = target.closest('i-image') as Image
        //   this.container = this.currentEl?.parentElement as Control
        //   this.isMousedown = false;
        //   this.zoom += (-event.deltaY / 4);
        //   if (this.zoom < 0.5) { this.zoom = 0.5; }
        //   if (this.zoom > 3) { this.zoom = 3; }
        //   this.offset = { x: 0, y: 0 };
        //   if (this.currentEl) this.updateImage();
        // }
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
            this.btnNext.visible =
                this.imagesSlider.activeSlide < this._data.images.length - 1;
            this.btnPrev.visible = this.imagesSlider.activeSlide > 0;
        }
        onClose() {
            this.mdGallery.visible = false;
            this.imagesSlider.activeSlide = 0;
            this.updateControls();
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
        _handleMouseDown(event, stopPropagation) {
            this.isMousedown = true;
            if (event instanceof TouchEvent) {
                const target = event.target;
                this.currentEl = target.closest('i-image');
                if (!this.currentEl)
                    return false;
                this.initialOffset = {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY
                };
                this.detectDoubleTap(event);
            }
            return true;
        }
        _handleMouseMove(event, stopPropagation) {
            if (!this.isMousedown)
                return;
            if (event instanceof TouchEvent && this.currentEl && this.zoom > 1) {
                const deltaX = (this.initialOffset.x - event.touches[0].clientX);
                const deltaY = (this.initialOffset.y - event.touches[0].clientY);
                this.addOffset({ x: deltaX, y: deltaY });
                this.initialOffset = {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY
                };
                this.updateImage();
                return;
            }
            return true;
        }
        _handleMouseUp(event, stopPropagation) {
            this.isMousedown = false;
            if (this.zoom > 1)
                return;
            return true;
        }
        detectDoubleTap(event) {
            const curTime = new Date().getTime();
            const tapLen = curTime - this.lastTap;
            if (tapLen < 500 && tapLen > 0) {
                this.handleDoubleTap(event);
                event.preventDefault();
            }
            this.lastTap = curTime;
        }
        scale(scale, center) {
            this.zoom *= scale;
            this.zoom = Math.max(0.5, Math.min(3.0, this.zoom));
            this.offset = { x: 0, y: 0 };
        }
        animateFn(duration, framefn) {
            const startTime = new Date().getTime();
            const renderFrame = function () {
                if (!this.inAnimation) {
                    return;
                }
                const frameTime = new Date().getTime() - startTime;
                let progress = frameTime / duration;
                if (frameTime >= duration) {
                    framefn(1);
                    this.inAnimation = false;
                    this.updateImage();
                }
                else {
                    progress = -Math.cos(progress * Math.PI) / 2 + 0.5;
                    framefn(progress);
                    this.updateImage();
                    requestAnimationFrame(renderFrame);
                }
            }.bind(this);
            this.inAnimation = true;
            requestAnimationFrame(renderFrame);
        }
        addOffset(offset) {
            this.offset = {
                x: this.offset.x + offset.x,
                y: this.offset.y + offset.y
            };
        }
        handleDoubleTap(event) {
            let center = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
            const zoomFactor = this.zoom > 1 ? 1 : 2;
            const startZoomFactor = this.zoom;
            if (startZoomFactor > zoomFactor) {
                center = this.getCurrentZoomCenter();
            }
            const self = this;
            const updateProgress = function (progress) {
                const newZoom = startZoomFactor + progress * (zoomFactor - startZoomFactor);
                self.scale(newZoom / self.zoom, center);
            };
            this.animateFn(300, updateProgress);
        }
        getCurrentZoomCenter() {
            const offsetLeft = this.offset.x - this.initialOffset.x;
            const centerX = -1 * this.offset.x - offsetLeft / (1 / this.zoom - 1);
            const offsetTop = this.offset.y - this.initialOffset.y;
            const centerY = -1 * this.offset.y - offsetTop / (1 / this.zoom - 1);
            return {
                x: centerX,
                y: centerY,
            };
        }
        updateImage() {
            this.boundPan();
            const offsetX = -this.offset.x / this.zoom;
            const offsetY = -this.offset.y / this.zoom;
            const translate3d = 'translate3d(' + offsetX + 'px,' + offsetY + 'px, 0px)';
            const scale3d = 'scale3d(' + this.zoom + ', ' + this.zoom + ', 1)';
            if (this.currentEl) {
                this.currentEl.style.webkitTransform = translate3d;
                this.currentEl.style.transform = translate3d;
                const img = this.currentEl.querySelector('img');
                if (img)
                    img.style.transform = scale3d;
            }
        }
        boundPan() {
            const padding = 50 * this.zoom;
            const imageWidth = this.currentEl.offsetWidth * this.zoom;
            const imageHeight = this.currentEl.offsetHeight * this.zoom;
            if ((this.offset.x - padding) < -imageWidth) {
                this.offset.x = -imageWidth + padding;
            }
            if ((this.offset.x + padding) > imageWidth) {
                this.offset.x = imageWidth - padding;
            }
            if ((this.offset.y - padding) < -imageHeight) {
                this.offset.y = -imageHeight + padding;
            }
            if ((this.offset.y + padding) > imageHeight) {
                this.offset.y = imageHeight - padding;
            }
        }
        onSwipeEnd(isSwiping) {
            if (isSwiping && this.currentEl) {
                this.zoom = 1;
                this.initialOffset = { x: 0, y: 0 };
                this.offset = { x: 0, y: 0 };
                this.currentEl.style.transform = 'translate3d(' + 0 + 'px,' + 0 + 'px, 0px)';
                const img = this.currentEl.querySelector('img');
                if (img) {
                    img.style.transform = 'scale3d(' + this.zoom + ', ' + this.zoom + ', 1) ';
                }
                this.currentEl = null;
            }
            this.updateControls();
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            // this.imagesSlider.removeEventListener('mousewheel', (e: WheelEvent) =>
            //   this.handleMouseWheel(e)
            // )
        }
        render() {
            return (this.$render("i-modal", { id: 'mdGallery', showBackdrop: true, width: '100vw', height: '100vh', padding: { top: 0, right: 0, bottom: 0, left: 0 }, overflow: 'hidden', onOpen: this.onOpenModal },
                this.$render("i-panel", { width: '100vw', height: '100vh', class: index_css_1.modalStyle },
                    this.$render("i-vstack", { verticalAlignment: 'space-between', horizontalAlignment: 'start', height: '50%', padding: { right: '0.75rem', left: '0.75rem' }, position: 'absolute', left: '0px', top: '0px', zIndex: 100 },
                        this.$render("i-icon", { border: { radius: '50%' }, padding: {
                                top: '0.5rem',
                                right: '0.5rem',
                                bottom: '0.5rem',
                                left: '0.5rem',
                            }, name: 'times', fill: Theme.text.primary, width: '2.25rem', height: '2.25rem', background: { color: Theme.background.modal }, cursor: 'pointer', margin: { top: '0.75rem' }, class: 'hovered-icon', onClick: this.onClose }),
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
                        ] }),
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
            return (this.$render("i-vstack", { id: "pnlGallery", border: { radius: 'inherit' }, width: '100%', overflow: 'hidden', position: 'relative' },
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
