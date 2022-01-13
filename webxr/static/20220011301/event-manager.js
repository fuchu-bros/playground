AFRAME.registerComponent('event-manager', {
    init() {
        this.bindMethods();

        this.boxGeometryEl = document.querySelector('#boxGeometry');
        this.sphereGeometryEl = document.querySelector('#sphereGeometry');
        this.torusGeometryEl = document.querySelector('#torusGeometry');

        this.boxButtonEl = document.querySelector('#boxButton');
        this.sphereButtonEl = document.querySelector('#sphereButton');
        this.torusButtonEl = document.querySelector('#torusButton');
        this.darkModebuttonEl = document.querySelector('#darkModeButton');

        this.buttonToGeometry = {
            boxButton: this.boxGeometryEl,
            sphereButton: this.sphereGeometryEl,
            torusButton: this.torusGeometryEl
        };

        this.boxButtonEl.addEventListener('click', this.onClick);
        this.sphereButtonEl.addEventListener('click', this.onClick);
        this.torusButtonEl.addEventListener('click', this.onClick);
        this.darkModebuttonEl.addEventListener('click', this.onClick);
        this.boxButtonEl.addState('pressed');
    },
    bindMethods() {
        this.onClick = this.onClick.bind(this);
    },
    onClick(e) {
        const targetEl = e.target;
        if (
            targetEl === this.boxButtonEl ||
            targetEl === this.sphereButtonEl ||
            targetEl === this.torusButtonEl
        ) {
            this.boxButtonEl.removeState('pressed');
            this.sphereButtonEl.removeState('pressed');
            this.torusButtonEl.removeState('pressed');
            this.boxGeometryEl.object3D.visible = false;
            this.sphereGeometryEl.object3D.visible = false;
            this.torusGeometryEl.object3D.visible = false;
            this.buttonToGeometry[targetEl.id].object3D.visible = true;
        }

        if (targetEl === this.darkModebuttonEl) {
            if (this.el.sceneEl.is('starry')) {
                targetEl.setAttribute('button', 'label', 'Dark Mode');
                this.el.sceneEl.setAttribute('environment', {preset: 'default'});
                this.el.sceneEl.removeState('starry');
            } else {
                targetEl.setAttribute('button', 'label', 'Light Mode');
                this.el.sceneEl.setAttribute('environment', {preset: 'starry'});
                this.el.sceneEl.addState('starry');
            }
        } else {
            targetEl.addState('pressed');
        }
    }
})