AFRAME.registerComponent('size-change', {
    init() {
        this.bindMethods();
        this.el.sceneEl.addEventListener('sliderchanged', this.onSliderChanged);
    },
    bindMethods: function() {
        this.onSliderChanged = this.onSliderChanged.bind(this);
    },
    onSliderChanged(e) {
        const scale = e.detail.value;
        this.el.object3D.scale.set(scale, scale, scale);
    }
})