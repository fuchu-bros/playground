AFRAME.registerComponent('hide-on-enter-ar', {
    init() {
        const self = this;
        this.el.sceneEl.addEventListener('enter-vr', () => {
            if (self.el.scenEl.is('ar-mode')) {
                self.el.object3D.visible = false;
            }
        });
        this.el.sceneEl.addEventListener('exit-vr', () => {
            self.el.object3D.visible = true;
        });
    }
});