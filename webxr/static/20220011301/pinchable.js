AFRAME.registerComponent('pinchable', {
    schema: {
        pinchDistance: {default: 0.1}
    },
    init() {
        const sceneEl = this.el.sceneEl;
        this.worldPosition = new THREE.Vector3();
        this.bindMethods();
        this.pinched = false;

        sceneEl.addEventListener('pinchstarted', this.onPinchStarted);
        sceneEl.addEventListener('pinchended', this.onPinchEnded);
        sceneEl.addEventListener('pinchmoved', this.onPinchMoved);
    },
    bindMethods() {
        this.onPinchStarted = this.onPinchStarted.bind(this);
        this.onPinchEnded = this.onPinchEnded.bind(this);
        this.onPinchMoved = this.onPinchMoved.bind(this);
    },
    onPinchStarted(e) {
        const pinchDistance = this.calculatePinchDistance(e.detail.position);
        if (pinchDistance < this.data.pinchDistance) {
            this.el.emit('pinchedstarted');
            this.pinched = true;
        }
    },
    calculatePinchDistance(pinchWorldPosition) {
        const el = this.el;
        const worldPosition = this.worldPosition;
        let pinchDistance;

        worldPosition.copy(el.object3D.position);
        el.object3D.parent.updateMatrixWorld();
        el.object3D.parent.localToWorld(worldPosition);

        pinchDistance = worldPosition.distanceTo(pinchWorldPosition);

        return pinchDistance;
    },
    onPinchEnded(e) {
        if (this.pinched) {
            this.pinched = false;
            this.el.emit('pinchedended');
        }
    },
    onPinchMoved(e) {
        const el = this.el;
        const pinchDistance = this.calculatePinchDistance(e.detail.position);
        if (!this.pinched) return;
        if (pinchDistance < this.data.pinchDistance) {
            el.emit('pinchedmoved', e.detail);
        } else {
            this.pinched = false;
            el.emit('pinchedended');
        }
    }
});